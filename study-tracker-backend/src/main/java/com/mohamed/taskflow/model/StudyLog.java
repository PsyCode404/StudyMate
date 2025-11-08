package com.mohamed.taskflow.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

@Document(collection = "study_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyLog {
    
    @Id
    private String id;
    
    // userId is set automatically by the service layer from JWT token
    // Not validated here to allow creation without it in the request body
    private String userId;  // Reference to the User who owns this log
    
    @NotBlank(message = "Subject is required")
    private String subject;
    
    @NotBlank(message = "Topic is required")
    private String topic;
    
    @Positive(message = "Duration must be positive")
    private Integer duration; // in minutes
    
    @NotNull(message = "Date is required")
    private LocalDate date;
    
    private String notes;
}