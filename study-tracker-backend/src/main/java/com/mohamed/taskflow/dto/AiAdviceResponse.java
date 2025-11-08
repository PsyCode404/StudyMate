package com.mohamed.taskflow.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiAdviceResponse {
    
    private String message;
    private Integer sessionCount;
    private Integer totalMinutes;
}
