package com.mohamed.taskflow.service;

import com.mohamed.taskflow.config.CacheConfig;
import com.mohamed.taskflow.dto.LeaderboardEntry;
import com.mohamed.taskflow.dto.LeaderboardResponse;
import com.mohamed.taskflow.model.User;
import com.mohamed.taskflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.*;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for leaderboard functionality
 * Aggregates study log data to rank users by total study time
 * 
 * Features:
 * - Subject filtering
 * - In-memory caching with 5-minute TTL
 * - Privacy/anonymization support
 * - Optimized MongoDB aggregation
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LeaderboardService {
    
    private final MongoTemplate mongoTemplate;
    private final UserRepository userRepository;
    private final CacheConfig cacheConfig;
    
    /**
     * Get leaderboard with aggregated study statistics
     * 
     * @param period Filter by time period: "all", "month", "week"
     * @param subject Optional subject filter (null for all subjects)
     * @param limit Number of top users to return
     * @param page Page number for pagination
     * @param anonymize If true, anonymize usernames for privacy
     * @return LeaderboardResponse with ranked users
     */
    public LeaderboardResponse getLeaderboard(
            String period, 
            String subject, 
            Integer limit, 
            Integer page, 
            Boolean anonymize) {
        // Validate and set defaults
        period = period != null ? period.toLowerCase() : "all";
        subject = subject != null && !subject.trim().isEmpty() ? subject.trim() : null;
        limit = limit != null && limit > 0 ? Math.min(limit, 100) : 10;
        page = page != null && page > 0 ? page : 1;
        anonymize = anonymize != null ? anonymize : false;
        
        // Check cache first
        String cacheKey = CacheConfig.generateCacheKey(period, subject, limit, page, anonymize);
        LeaderboardResponse cached = cacheConfig.get(cacheKey);
        if (cached != null) {
            log.debug("Cache hit for key: {}", cacheKey);
            return cached;
        }
        
        log.debug("Cache miss for key: {}", cacheKey);
        
        // Calculate date range based on period
        Date startDate = getStartDateForPeriod(period);
        
        // Build aggregation pipeline with subject filter
        Aggregation aggregation = buildLeaderboardAggregation(startDate, subject, limit, page);
        
        // Execute aggregation
        AggregationResults<LeaderboardEntry> results = mongoTemplate.aggregate(
            aggregation,
            "study_logs",
            LeaderboardEntry.class
        );
        
        List<LeaderboardEntry> entries = results.getMappedResults();
        
        // Enrich with usernames
        enrichWithUsernames(entries, anonymize);
        
        // Add ranks
        addRanks(entries, page, limit);
        
        // Count total users (for pagination info)
        Long totalUsers = countTotalUsers(startDate, subject);
        
        LeaderboardResponse response = new LeaderboardResponse(entries, period, page, limit, totalUsers);
        
        // Cache the response
        cacheConfig.put(cacheKey, response);
        log.debug("Cached response for key: {}", cacheKey);
        
        return response;
    }
    
    /**
     * Build MongoDB aggregation pipeline for leaderboard
     * Optimized with indexed fields: userId, date, subject
     */
    private Aggregation buildLeaderboardAggregation(Date startDate, String subject, Integer limit, Integer page) {
        List<AggregationOperation> operations = new ArrayList<>();
        
        // Stage 1: Match by date range and/or subject if specified
        // Also filter out entries without userId
        Criteria criteria = Criteria.where("userId").ne(null).exists(true);
        if (startDate != null) {
            criteria = criteria.and("date").gte(startDate);
        }
        if (subject != null) {
            criteria = criteria.and("subject").is(subject);
        }
        operations.add(Aggregation.match(criteria));
        
        // Stage 2: Group by userId and calculate totals
        operations.add(Aggregation.group("userId")
            .sum("duration").as("totalMinutes")
            .count().as("sessionCount")
        );
        
        // Stage 3: Project to calculate average and rename _id to userId
        operations.add(Aggregation.project()
            .and("_id").as("userId")
            .and("totalMinutes").as("totalMinutes")
            .and("sessionCount").as("sessionCount")
            .and(ArithmeticOperators.Divide.valueOf("totalMinutes")
                .divideBy("sessionCount")).as("avgMinutesPerSession")
        );
        
        // Stage 4: Sort by totalMinutes descending
        operations.add(Aggregation.sort(Sort.Direction.DESC, "totalMinutes"));
        
        // Stage 5: Pagination - skip
        int skip = (page - 1) * limit;
        if (skip > 0) {
            operations.add(Aggregation.skip((long) skip));
        }
        
        // Stage 6: Limit results
        operations.add(Aggregation.limit(limit));
        
        return Aggregation.newAggregation(operations);
    }
    
    /**
     * Get start date based on period filter
     */
    private Date getStartDateForPeriod(String period) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDateTime;
        
        switch (period) {
            case "week":
                startDateTime = now.minusWeeks(1);
                break;
            case "month":
                startDateTime = now.minusMonths(1);
                break;
            case "all":
            default:
                return null; // No date filter
        }
        
        return Date.from(startDateTime.atZone(ZoneId.systemDefault()).toInstant());
    }
    
    /**
     * Enrich leaderboard entries with usernames from User collection
     * Supports anonymization for privacy
     */
    private void enrichWithUsernames(List<LeaderboardEntry> entries, Boolean anonymize) {
        if (entries.isEmpty()) {
            return;
        }
        
        // Get all user IDs
        List<String> userIds = entries.stream()
            .map(LeaderboardEntry::getUserId)
            .collect(Collectors.toList());
        
        // Fetch users in batch
        List<User> users = userRepository.findAllById(userIds);
        
        // Create userId -> username map
        Map<String, String> userIdToUsername = users.stream()
            .collect(Collectors.toMap(
                User::getId,
                user -> user.getUsername() != null ? user.getUsername() : "User#" + user.getId().substring(0, 8),
                (existing, replacement) -> existing
            ));
        
        // Enrich entries with anonymization support
        entries.forEach(entry -> {
            String username;
            String userId = entry.getUserId();
            
            if (userId == null || userId.isEmpty()) {
                username = "Unknown";
            } else if (anonymize) {
                // Anonymize: User_1234 format
                int startIndex = Math.max(0, userId.length() - 4);
                username = "User_" + userId.substring(startIndex);
            } else {
                username = userIdToUsername.get(userId);
                if (username == null) {
                    int endIndex = Math.min(8, userId.length());
                    username = "Anonymous#" + userId.substring(0, endIndex);
                }
            }
            entry.setUsername(username);
        });
    }
    
    /**
     * Add rank numbers to entries
     */
    private void addRanks(List<LeaderboardEntry> entries, Integer page, Integer limit) {
        int startRank = (page - 1) * limit + 1;
        for (int i = 0; i < entries.size(); i++) {
            entries.get(i).setRank(startRank + i);
        }
    }
    
    /**
     * Count total users with study logs in the period and subject
     */
    private Long countTotalUsers(Date startDate, String subject) {
        List<AggregationOperation> operations = new ArrayList<>();
        
        // Match by date and/or subject if specified
        // Also filter out entries without userId
        Criteria criteria = Criteria.where("userId").ne(null).exists(true);
        if (startDate != null) {
            criteria = criteria.and("date").gte(startDate);
        }
        if (subject != null) {
            criteria = criteria.and("subject").is(subject);
        }
        operations.add(Aggregation.match(criteria));
        
        // Group by userId
        operations.add(Aggregation.group("userId"));
        
        // Count groups
        operations.add(Aggregation.count().as("count"));
        
        Aggregation aggregation = Aggregation.newAggregation(operations);
        
        @SuppressWarnings("unchecked")
        AggregationResults<Map<String, Object>> results = 
            (AggregationResults<Map<String, Object>>) (AggregationResults<?>) mongoTemplate.aggregate(
                aggregation,
                "study_logs",
                Map.class
            );
        
        Map<String, Object> result = results.getUniqueMappedResult();
        return result != null ? ((Number) result.get("count")).longValue() : 0L;
    }
}
