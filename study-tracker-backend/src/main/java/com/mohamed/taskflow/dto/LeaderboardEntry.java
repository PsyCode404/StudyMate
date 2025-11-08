package com.mohamed.taskflow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for leaderboard entry
 * Represents aggregated study statistics for a user
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardEntry {
    
    private String userId;
    private String username;
    private Long totalMinutes;
    private Long sessionCount;
    private Double avgMinutesPerSession;
    private Integer rank;
    
    public LeaderboardEntry(String userId, Long totalMinutes, Long sessionCount) {
        this.userId = userId;
        this.totalMinutes = totalMinutes;
        this.sessionCount = sessionCount;
        this.avgMinutesPerSession = sessionCount > 0 ? (double) totalMinutes / sessionCount : 0.0;
    }
}
