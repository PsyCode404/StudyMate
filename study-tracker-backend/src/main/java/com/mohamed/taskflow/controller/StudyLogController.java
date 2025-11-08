package com.mohamed.taskflow.controller;

import com.mohamed.taskflow.model.StudyLog;
import com.mohamed.taskflow.security.CurrentUser;
import com.mohamed.taskflow.service.StudyLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "${frontend.origin:http://localhost:4200}")
@RequiredArgsConstructor
public class StudyLogController {
    
    private final StudyLogService studyLogService;
    
    /**
     * GET /api/logs - List all study logs for the current user
     */
    @GetMapping
    public ResponseEntity<List<StudyLog>> getAllStudyLogs(@CurrentUser String userId) {
        List<StudyLog> logs = studyLogService.findAllByUserId(userId);
        return ResponseEntity.ok(logs);
    }
    
    /**
     * GET /api/logs/{id} - Get a single study log by ID (user-specific)
     */
    @GetMapping("/{id}")
    public ResponseEntity<StudyLog> getStudyLogById(
            @PathVariable String id,
            @CurrentUser String userId) {
        return studyLogService.findByIdAndUserId(id, userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * POST /api/logs - Create a new study log for the current user
     */
    @PostMapping
    public ResponseEntity<StudyLog> createStudyLog(
            @Valid @RequestBody StudyLog studyLog,
            @CurrentUser String userId) {
        StudyLog savedLog = studyLogService.saveForUser(studyLog, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedLog);
    }
    
    /**
     * PUT /api/logs/{id} - Update an existing study log (user-specific)
     */
    @PutMapping("/{id}")
    public ResponseEntity<StudyLog> updateStudyLog(
            @PathVariable String id,
            @Valid @RequestBody StudyLog studyLog,
            @CurrentUser String userId) {
        
        try {
            StudyLog updatedLog = studyLogService.updateForUser(id, studyLog, userId);
            return ResponseEntity.ok(updatedLog);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * DELETE /api/logs/{id} - Delete a study log (user-specific)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudyLog(
            @PathVariable String id,
            @CurrentUser String userId) {
        try {
            studyLogService.deleteByIdAndUserId(id, userId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * GET /api/logs/by-subject?subject=... - Find logs by subject (user-specific)
     */
    @GetMapping("/by-subject")
    public ResponseEntity<List<StudyLog>> getStudyLogsBySubject(
            @RequestParam String subject,
            @CurrentUser String userId) {
        List<StudyLog> logs = studyLogService.findBySubjectAndUserId(subject, userId);
        return ResponseEntity.ok(logs);
    }
    
    /**
     * GET /api/logs/between?start=YYYY-MM-DD&end=YYYY-MM-DD - Find logs between dates (user-specific)
     */
    @GetMapping("/between")
    public ResponseEntity<List<StudyLog>> getStudyLogsBetweenDates(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @CurrentUser String userId) {
        
        List<StudyLog> logs = studyLogService.findBetweenDatesAndUserId(start, end, userId);
        return ResponseEntity.ok(logs);
    }
}
