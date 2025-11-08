package com.mohamed.taskflow.controller;

import com.mohamed.taskflow.dto.AiAdviceRequest;
import com.mohamed.taskflow.dto.AiAdviceResponse;
import com.mohamed.taskflow.security.CurrentUser;
import com.mohamed.taskflow.service.AiAdvisorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class AiAdvisorController {
    
    private final AiAdvisorService aiAdvisorService;
    
    @PostMapping("/advice")
    public ResponseEntity<AiAdviceResponse> getAiAdvice(
            @Valid @RequestBody AiAdviceRequest request,
            @CurrentUser String userId) {
        
        // Generate AI advice using Gemini API
        String adviceText = aiAdvisorService.generateAdvice(userId, request.getSubject(), request.getMark());
        
        // Get session count and total minutes
        int sessionCount = aiAdvisorService.getTotalSessions(userId, request.getSubject());
        int totalMinutes = aiAdvisorService.getTotalMinutes(userId, request.getSubject());
        
        // Build response with AI-generated advice
        AiAdviceResponse response = AiAdviceResponse.builder()
                .message(adviceText)
                .sessionCount(sessionCount)
                .totalMinutes(totalMinutes)
                .build();
        
        return ResponseEntity.ok(response);
    }
}
