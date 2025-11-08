package com.mohamed.taskflow.service;

import com.mohamed.taskflow.model.StudyLog;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiAdvisorService {
    
    private final StudyLogService studyLogService;
    private final RestTemplate restTemplate;
    
    @Value("${gemini.api.key}")
    private String geminiApiKey;
    
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    
    public String generateAdvice(String userId, String subject, Double mark) {
        // 1. Normalize subject string
        String normalizedSubject = normalizeSubject(subject);
        
        // 2. Get all study logs and filter by normalized subject
        List<StudyLog> allLogs = studyLogService.findAllByUserId(userId);
        List<StudyLog> subjectLogs = allLogs.stream()
                .filter(log -> normalizeSubject(log.getSubject()).equals(normalizedSubject))
                .collect(Collectors.toList());
        
        // 3. Check if no study logs exist for this subject
        if (subjectLogs.isEmpty()) {
            return String.format("You haven't logged any study sessions for %s yet. " +
                    "Start tracking your study time to receive personalized AI-powered advice based on your study patterns!", 
                    subject);
        }
        
        // 4. Calculate study metrics
        int totalSessions = subjectLogs.size();
        int totalMinutes = subjectLogs.stream()
                .mapToInt(StudyLog::getDuration)
                .sum();
        
        double averageSessionLength = totalSessions > 0 ? (double) totalMinutes / totalSessions : 0;
        
        Set<LocalDate> studyDates = subjectLogs.stream()
                .map(StudyLog::getDate)
                .collect(Collectors.toSet());
        int studyDays = studyDates.size();
        
        double consistencyScore = calculateConsistencyScore(studyDates);
        
        // 5. Build prompt for Gemini
        String prompt = buildPrompt(subject, mark, totalSessions, totalMinutes, 
                                    averageSessionLength, consistencyScore);
        
        // 6. Call Gemini API
        String advice = callGeminiApi(prompt);
        
        return advice;
    }
    
    private String normalizeSubject(String subject) {
        if (subject == null) {
            return "";
        }
        return subject.trim().toLowerCase();
    }
    
    private double calculateConsistencyScore(Set<LocalDate> studyDates) {
        if (studyDates.isEmpty()) {
            return 0.0;
        }
        
        if (studyDates.size() == 1) {
            return 1.0;
        }
        
        LocalDate minDate = studyDates.stream().min(LocalDate::compareTo).orElse(LocalDate.now());
        LocalDate maxDate = studyDates.stream().max(LocalDate::compareTo).orElse(LocalDate.now());
        
        long totalDaysSpan = ChronoUnit.DAYS.between(minDate, maxDate) + 1;
        
        if (totalDaysSpan == 0) {
            return 1.0;
        }
        
        return (double) studyDates.size() / totalDaysSpan;
    }
    
    private String buildPrompt(String subject, Double mark, int totalSessions, 
                               int totalMinutes, double averageSessionLength, 
                               double consistencyScore) {
        
        String prompt = """
            You are a friendly and motivating academic coach helping a student in high school (adjust tone and complexity based on mark and context).
            Your job is to analyze their performance in %s (mark: %.2f/20) based on their study data, and write a short, natural, encouraging feedback message.
            
            Study Data:
            - Study sessions: %d
            - Total study time: %d minutes
            - Average session: %.2f minutes
            - Consistency score: %.2f (0-1 scale, higher is better)
            
            Write as if you're speaking directly to the student — friendly, human, supportive.
            Keep it conversational but structured into these sections exactly:
            
            🎯 Your Strengths  
            💡 Growth Opportunities  
            🚀 Action Plan  
            
            Tone guidelines:
            - No robotic or generic phrasing (avoid words like "exceptional understanding" or "apply knowledge with precision").
            - Adapt your tone to the student's level:
              - If mark >= 17 → Encouraging but humble ("You're doing really well, but here's how to push even further.")
              - If mark between 12–16 → Balanced tone ("You're on the right track, and here's how to level up.")
              - If mark < 12 → Supportive and motivating ("Don't stress — you've got solid foundations. Let's focus on fixing a few habits.")
            - Use contractions and natural phrasing ("you're", "let's", "don't") to sound real.
            - Each bullet point should feel personalized and short (1–2 sentences max).
            - Keep advice realistic for a student — avoid vague things like "improve conceptual mastery."
            
            Finally, format it cleanly with Markdown:
            ## 🎯 Your Strengths
            - [2-3 realistic, human-like strengths based on their study patterns and mark]
            
            ## 💡 Growth Opportunities
            - [2 short, practical growth ideas that match their performance level]
            
            ## 🚀 Action Plan
            1. [3 simple, doable next steps the student can start this week]
            
            Avoid long introductions or conclusions. Jump straight to advice.
            """.formatted(subject, mark, totalSessions, totalMinutes, averageSessionLength, consistencyScore);
        
        return prompt;
    }
    
    private String callGeminiApi(String prompt) {
        try {
            // Build request URL (no query parameter needed)
            String url = GEMINI_API_URL;
            
            // Build request body
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> content = new HashMap<>();
            Map<String, String> part = new HashMap<>();
            part.put("text", prompt);
            content.put("parts", new Object[]{part});
            requestBody.put("contents", new Object[]{content});
            
            // Set headers with API key
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-goog-api-key", geminiApiKey);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            // Make API call
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);
            
            // Extract text from response
            if (response != null && response.containsKey("candidates")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (!candidates.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> content1 = (Map<String, Object>) candidates.get(0).get("content");
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content1.get("parts");
                    if (!parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
            
            return "Unable to generate AI advice at this time. Please try again later.";
            
        } catch (Exception e) {
            e.printStackTrace();
            return "Error generating AI advice: " + e.getMessage();
        }
    }
    
    public int getTotalSessions(String userId, String subject) {
        String normalizedSubject = normalizeSubject(subject);
        List<StudyLog> allLogs = studyLogService.findAllByUserId(userId);
        return (int) allLogs.stream()
                .filter(log -> normalizeSubject(log.getSubject()).equals(normalizedSubject))
                .count();
    }
    
    public int getTotalMinutes(String userId, String subject) {
        String normalizedSubject = normalizeSubject(subject);
        List<StudyLog> allLogs = studyLogService.findAllByUserId(userId);
        return allLogs.stream()
                .filter(log -> normalizeSubject(log.getSubject()).equals(normalizedSubject))
                .mapToInt(StudyLog::getDuration)
                .sum();
    }
}
