package com.mohamed.taskflow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response wrapper for leaderboard data
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardResponse {
    
    private List<LeaderboardEntry> leaderboard;
    private String period;
    private Integer page;
    private Integer limit;
    private Long totalUsers;
}
