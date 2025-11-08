package com.mohamed.taskflow.service;

import com.mohamed.taskflow.model.StudyLog;
import com.mohamed.taskflow.repository.StudyLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StudyLogService {
    
    private final StudyLogRepository studyLogRepository;
    
    // User-specific methods
    public List<StudyLog> findAllByUserId(String userId) {
        return studyLogRepository.findByUserId(userId);
    }
    
    public Optional<StudyLog> findByIdAndUserId(String id, String userId) {
        return studyLogRepository.findById(id)
                .filter(log -> log.getUserId().equals(userId));
    }
    
    public StudyLog saveForUser(StudyLog studyLog, String userId) {
        studyLog.setUserId(userId);
        return studyLogRepository.save(studyLog);
    }
    
    public StudyLog updateForUser(String id, StudyLog studyLog, String userId) {
        return studyLogRepository.findById(id)
                .filter(existingLog -> existingLog.getUserId().equals(userId))
                .map(existingLog -> {
                    studyLog.setId(id);
                    studyLog.setUserId(userId);
                    return studyLogRepository.save(studyLog);
                })
                .orElseThrow(() -> new RuntimeException("Study log not found or access denied"));
    }
    
    public void deleteByIdAndUserId(String id, String userId) {
        studyLogRepository.findById(id)
                .filter(log -> log.getUserId().equals(userId))
                .ifPresentOrElse(
                        log -> studyLogRepository.deleteById(id),
                        () -> { throw new RuntimeException("Study log not found or access denied"); }
                );
    }
    
    public List<StudyLog> findBySubjectAndUserId(String subject, String userId) {
        return studyLogRepository.findByUserIdAndSubject(userId, subject);
    }
    
    public List<StudyLog> findBetweenDatesAndUserId(LocalDate start, LocalDate end, String userId) {
        return studyLogRepository.findByUserIdAndDateBetween(userId, start, end);
    }
    
    // Legacy methods (deprecated - kept for backward compatibility)
    @Deprecated
    public List<StudyLog> findAll() {
        return studyLogRepository.findAll();
    }
    
    @Deprecated
    public Optional<StudyLog> findById(String id) {
        return studyLogRepository.findById(id);
    }
    
    @Deprecated
    public StudyLog save(StudyLog studyLog) {
        return studyLogRepository.save(studyLog);
    }
    
    @Deprecated
    public void deleteById(String id) {
        studyLogRepository.deleteById(id);
    }
    
    @Deprecated
    public List<StudyLog> findBySubject(String subject) {
        return studyLogRepository.findBySubject(subject);
    }
    
    @Deprecated
    public List<StudyLog> findBetweenDates(LocalDate start, LocalDate end) {
        return studyLogRepository.findByDateBetween(start, end);
    }
}
