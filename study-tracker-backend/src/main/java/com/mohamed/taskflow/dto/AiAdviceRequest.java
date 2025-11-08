package com.mohamed.taskflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiAdviceRequest {
    
    @NotBlank(message = "Subject is required")
    private String subject;
    
    @NotNull(message = "Mark is required")
    private Double mark;
}
