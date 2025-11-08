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
        return String.format("""
            Subject: %s
            Mark: %.2f%%
            Study sessions: %d
            Total study time: %d minutes
            Average session: %.2f minutes
            Consistency: %.2f
            
            Create a friendly, encouraging study advice response with these sections:
            
            ## 🎯 Your Strengths
            - List 2-3 specific things they did well (short bullet points)
            - Be genuine and specific
            
            ## 💡 Growth Opportunities
            - List 2-3 areas to improve (short bullet points)
            - Focus on actionable insights, not criticism
            - No guilt tripping
            
            ## 🚀 Action Plan
            - Provide 3 concrete, specific recommendations
            - Each recommendation should be:
              * One clear action they can take immediately
              * Practical and achievable
              * 1-2 sentences max
            
            Keep the tone:
            - Friendly and encouraging
            - Supportive, not judgmental
            - Motivating and positive
            - Use emojis sparingly for visual organization
            
            Format: Use markdown with clear sections. Keep it concise and scannable.
            """, subject, mark, totalSessions, totalMinutes, averageSessionLength, consistencyScore);
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
