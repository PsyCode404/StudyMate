package com.mohamed.taskflow.controller;

import com.mohamed.taskflow.dto.LeaderboardResponse;
import com.mohamed.taskflow.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for leaderboard endpoints
 * Provides study time rankings and statistics
 */
@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LeaderboardController {
    
    private final LeaderboardService leaderboardService;
    
    /**
     * Get leaderboard ranked by total study time
     * 
     * @param period Time period filter: "all" (default), "month", "week"
     * @param subject Optional subject filter (e.g., "Mathematics")
     * @param limit Number of top users to return (default 10, max 100)
     * @param page Page number for pagination (default 1)
     * @param anonymize If true, anonymize usernames for privacy (default false)
     * @return LeaderboardResponse with ranked users and statistics
     * 
     * Examples:
     * - GET /api/leaderboard?period=week&limit=20&page=1
     * - GET /api/leaderboard?subject=Mathematics&period=month
     * - GET /api/leaderboard?anonymize=true
     */
    @GetMapping
    public ResponseEntity<LeaderboardResponse> getLeaderboard(
            @RequestParam(required = false, defaultValue = "all") String period,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false, defaultValue = "10") Integer limit,
            @RequestParam(required = false, defaultValue = "1") Integer page,
            @RequestParam(required = false, defaultValue = "false") Boolean anonymize) {
        
        try {
            // Validate period parameter
            if (period != null && !period.matches("(?i)all|month|week")) {
                return ResponseEntity.badRequest()
                    .body(new LeaderboardResponse(null, period, page, limit, 0L));
            }
            
            // Validate limit
            if (limit != null && (limit < 1 || limit > 100)) {
                return ResponseEntity.badRequest()
                    .body(new LeaderboardResponse(null, period, page, limit, 0L));
            }
            
            // Validate page
            if (page != null && page < 1) {
                return ResponseEntity.badRequest()
                    .body(new LeaderboardResponse(null, period, page, limit, 0L));
            }
            
            LeaderboardResponse response = leaderboardService.getLeaderboard(period, subject, limit, page, anonymize);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            // Log error and return 500
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(new LeaderboardResponse(null, period, page, limit, 0L));
        }
    }
}
