package com.mohamed.taskflow.repository;

import com.mohamed.taskflow.model.StudyLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface StudyLogRepository extends MongoRepository<StudyLog, String> {
    
    // User-specific queries
    List<StudyLog> findByUserId(String userId);
    
    List<StudyLog> findByUserIdAndSubject(String userId, String subject);
    
    List<StudyLog> findByUserIdAndDate(String userId, LocalDate date);
    
    List<StudyLog> findByUserIdAndDateBetween(String userId, LocalDate start, LocalDate end);
    
    // Legacy methods (keep for backward compatibility, but prefer user-specific ones)
    List<StudyLog> findBySubject(String subject);
    
    List<StudyLog> findByDate(LocalDate date);
    
    List<StudyLog> findByDateBetween(LocalDate start, LocalDate end);
}
