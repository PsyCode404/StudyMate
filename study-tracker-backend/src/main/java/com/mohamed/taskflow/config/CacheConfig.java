package com.mohamed.taskflow.config;

import com.mohamed.taskflow.dto.LeaderboardResponse;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Simple in-memory cache configuration for leaderboard data
 * Uses ConcurrentHashMap with TTL-based expiration
 * 
 * Note: For production with multiple instances, consider Redis or Caffeine
 */
@Configuration
@EnableScheduling
public class CacheConfig {
    
    /**
     * Cache entry with TTL
     */
    public static class CacheEntry {
        private final LeaderboardResponse data;
        private final Instant expiresAt;
        
        public CacheEntry(LeaderboardResponse data, long ttlMillis) {
            this.data = data;
            this.expiresAt = Instant.now().plusMillis(ttlMillis);
        }
        
        public boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }
        
        public LeaderboardResponse getData() {
            return data;
        }
    }
    
    /**
     * In-memory cache storage
     * Key format: "period|subject|limit|page|anonymize"
     */
    private static final Map<String, CacheEntry> leaderboardCache = new ConcurrentHashMap<>();
    
    /**
     * Cache TTL: 5 minutes (300,000 milliseconds)
     */
    public static final long CACHE_TTL_MILLIS = 5 * 60 * 1000;
    
    /**
     * Get cached leaderboard response
     */
    public LeaderboardResponse get(String key) {
        CacheEntry entry = leaderboardCache.get(key);
        if (entry != null && !entry.isExpired()) {
            return entry.getData();
        }
        // Remove expired entry
        if (entry != null) {
            leaderboardCache.remove(key);
        }
        return null;
    }
    
    /**
     * Put leaderboard response in cache
     */
    public void put(String key, LeaderboardResponse response) {
        leaderboardCache.put(key, new CacheEntry(response, CACHE_TTL_MILLIS));
    }
    
    /**
     * Generate cache key for leaderboard queries
     * Format: "period|subject|limit|page|anonymize"
     */
    public static String generateCacheKey(
            String period, 
            String subject, 
            Integer limit, 
            Integer page, 
            Boolean anonymize) {
        
        return String.format("%s|%s|%d|%d|%b",
            period != null ? period : "all",
            subject != null ? subject : "all",
            limit != null ? limit : 10,
            page != null ? page : 1,
            anonymize != null ? anonymize : false
        );
    }
    
    /**
     * Cleanup expired cache entries every 10 minutes
     */
    @Scheduled(fixedRate = 10 * 60 * 1000)
    public void cleanupExpiredEntries() {
        leaderboardCache.entrySet().removeIf(entry -> entry.getValue().isExpired());
    }
    
    /**
     * Clear all cache entries (for testing or manual invalidation)
     */
    public void clearCache() {
        leaderboardCache.clear();
    }
    
    /**
     * Get cache statistics
     */
    public Map<String, Object> getCacheStats() {
        return Map.of(
            "size", leaderboardCache.size(),
            "ttlMinutes", CACHE_TTL_MILLIS / 60000
        );
    }
}
