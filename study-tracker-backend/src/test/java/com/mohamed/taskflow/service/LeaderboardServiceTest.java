package com.mohamed.taskflow.service;

import com.mohamed.taskflow.dto.LeaderboardEntry;
import com.mohamed.taskflow.dto.LeaderboardResponse;
import com.mohamed.taskflow.config.CacheConfig;
import com.mohamed.taskflow.model.User;
import com.mohamed.taskflow.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for LeaderboardService
 */
@ExtendWith(MockitoExtension.class)
class LeaderboardServiceTest {
    
    @Mock
    private MongoTemplate mongoTemplate;
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private CacheConfig cacheConfig;
    
    @InjectMocks
    private LeaderboardService leaderboardService;
    
    private List<LeaderboardEntry> mockEntries;
    private List<User> mockUsers;
    
    @BeforeEach
    void setUp() {
        // Setup mock leaderboard entries
        mockEntries = Arrays.asList(
            new LeaderboardEntry("user1", 600L, 10L),
            new LeaderboardEntry("user2", 450L, 9L),
            new LeaderboardEntry("user3", 300L, 5L)
        );
        
        // Setup mock users
        mockUsers = Arrays.asList(
            createUser("user1", "alice"),
            createUser("user2", "bob"),
            createUser("user3", "charlie")
        );
    }
    
    @Test
    void testGetLeaderboard_AllPeriod_Success() {
        // Arrange
        AggregationResults<LeaderboardEntry> mockResults = mock(AggregationResults.class);
        when(mockResults.getMappedResults()).thenReturn(mockEntries);
        when(mongoTemplate.aggregate(any(Aggregation.class), eq("study_logs"), eq(LeaderboardEntry.class)))
            .thenReturn(mockResults);
        when(userRepository.findAllById(anyList())).thenReturn(mockUsers);
        
        // Mock count aggregation
        @SuppressWarnings("unchecked")
        AggregationResults<Map<String, Object>> countResults = mock(AggregationResults.class);
        Map<String, Object> countMap = new HashMap<>();
        countMap.put("count", 3L);
        when(countResults.getUniqueMappedResult()).thenReturn(countMap);
        when(mongoTemplate.aggregate(any(Aggregation.class), eq("study_logs"), eq(Map.class)))
            .thenReturn((AggregationResults) countResults);
        
        // Mock cache miss
        when(cacheConfig.get(anyString())).thenReturn(null);
        
        // Act
        LeaderboardResponse response = leaderboardService.getLeaderboard("all", null, 10, 1, false);
        
        // Assert
        assertNotNull(response);
        assertEquals("all", response.getPeriod());
        assertEquals(10, response.getLimit());
        assertEquals(1, response.getPage());
        assertEquals(3L, response.getTotalUsers());
        assertEquals(3, response.getLeaderboard().size());
        
        // Verify ranks are assigned
        assertEquals(1, response.getLeaderboard().get(0).getRank());
        assertEquals(2, response.getLeaderboard().get(1).getRank());
        assertEquals(3, response.getLeaderboard().get(2).getRank());
        
        // Verify usernames are enriched
        assertEquals("alice", response.getLeaderboard().get(0).getUsername());
        assertEquals("bob", response.getLeaderboard().get(1).getUsername());
        assertEquals("charlie", response.getLeaderboard().get(2).getUsername());
    }
    
    @Test
    void testGetLeaderboard_WeekPeriod_Success() {
        // Arrange
        AggregationResults<LeaderboardEntry> mockResults = mock(AggregationResults.class);
        when(mockResults.getMappedResults()).thenReturn(mockEntries);
        when(mongoTemplate.aggregate(any(Aggregation.class), eq("study_logs"), eq(LeaderboardEntry.class)))
            .thenReturn(mockResults);
        when(userRepository.findAllById(anyList())).thenReturn(mockUsers);
        
        @SuppressWarnings("unchecked")
        AggregationResults<Map<String, Object>> countResults = mock(AggregationResults.class);
        Map<String, Object> countMap = new HashMap<>();
        countMap.put("count", 3L);
        when(countResults.getUniqueMappedResult()).thenReturn(countMap);
        when(mongoTemplate.aggregate(any(Aggregation.class), eq("study_logs"), eq(Map.class)))
            .thenReturn((AggregationResults) countResults);
        
        // Mock cache miss
        when(cacheConfig.get(anyString())).thenReturn(null);
        
        // Act
        LeaderboardResponse response = leaderboardService.getLeaderboard("week", null, 10, 1, false);
        
        // Assert
        assertNotNull(response);
        assertEquals("week", response.getPeriod());
        assertEquals(3, response.getLeaderboard().size());
    }
    
    @Test
    void testGetLeaderboard_MonthPeriod_Success() {
        // Arrange
        AggregationResults<LeaderboardEntry> mockResults = mock(AggregationResults.class);
        when(mockResults.getMappedResults()).thenReturn(mockEntries);
        when(mongoTemplate.aggregate(any(Aggregation.class), eq("study_logs"), eq(LeaderboardEntry.class)))
            .thenReturn(mockResults);
        when(userRepository.findAllById(anyList())).thenReturn(mockUsers);
        
        @SuppressWarnings("unchecked")
        AggregationResults<Map<String, Object>> countResults = mock(AggregationResults.class);
        Map<String, Object> countMap = new HashMap<>();
        countMap.put("count", 3L);
        when(countResults.getUniqueMappedResult()).thenReturn(countMap);
        when(mongoTemplate.aggregate(any(Aggregation.class), eq("study_logs"), eq(Map.class)))
            .thenReturn((AggregationResults) countResults);
        
        // Mock cache miss
        when(cacheConfig.get(anyString())).thenReturn(null);
        
        // Act
        LeaderboardResponse response = leaderboardService.getLeaderboard("month", null, 10, 1, false);
        
        // Assert
        assertNotNull(response);
        assertEquals("month", response.getPeriod());
        assertEquals(3, response.getLeaderboard().size());
    }
    
    @Test
    void testGetLeaderboard_WithPagination() {
        // Arrange
        List<LeaderboardEntry> page2Entries = Arrays.asList(
            new LeaderboardEntry("user4", 250L, 4L),
            new LeaderboardEntry("user5", 200L, 3L)
        );
        
        AggregationResults<LeaderboardEntry> mockResults = mock(AggregationResults.class);
        when(mockResults.getMappedResults()).thenReturn(page2Entries);
        when(mongoTemplate.aggregate(any(Aggregation.class), eq("study_logs"), eq(LeaderboardEntry.class)))
            .thenReturn(mockResults);
        when(userRepository.findAllById(anyList())).thenReturn(Collections.emptyList());
        
        @SuppressWarnings("unchecked")
        AggregationResults<Map<String, Object>> countResults = mock(AggregationResults.class);
        Map<String, Object> countMap = new HashMap<>();
        countMap.put("count", 5L);
        when(countResults.getUniqueMappedResult()).thenReturn(countMap);
        when(mongoTemplate.aggregate(any(Aggregation.class), eq("study_logs"), eq(Map.class)))
            .thenReturn((AggregationResults) countResults);
        
        // Mock cache miss
        when(cacheConfig.get(anyString())).thenReturn(null);
        
        // Act
        LeaderboardResponse response = leaderboardService.getLeaderboard("all", null, 3, 2, false);
        
        // Assert
        assertNotNull(response);
        assertEquals(2, response.getPage());
        assertEquals(3, response.getLimit());
        assertEquals(5L, response.getTotalUsers());
        
        // Verify ranks start from 4 (page 2, limit 3)
        assertEquals(4, response.getLeaderboard().get(0).getRank());
        assertEquals(5, response.getLeaderboard().get(1).getRank());
    }
    
    @Test
    void testGetLeaderboard_EmptyResults() {
        // Arrange
        AggregationResults<LeaderboardEntry> mockResults = mock(AggregationResults.class);
        when(mockResults.getMappedResults()).thenReturn(Collections.emptyList());
        when(mongoTemplate.aggregate(any(Aggregation.class), eq("study_logs"), eq(LeaderboardEntry.class)))
            .thenReturn(mockResults);
        
        @SuppressWarnings("unchecked")
        AggregationResults<Map<String, Object>> countResults = mock(AggregationResults.class);
        when(countResults.getUniqueMappedResult()).thenReturn(null);
        when(mongoTemplate.aggregate(any(Aggregation.class), eq("study_logs"), eq(Map.class)))
            .thenReturn((AggregationResults) countResults);
        
        // Mock cache miss
        when(cacheConfig.get(anyString())).thenReturn(null);
        
        // Act
        LeaderboardResponse response = leaderboardService.getLeaderboard("all", null, 10, 1, false);
        
        // Assert
        assertNotNull(response);
        assertEquals(0, response.getLeaderboard().size());
        assertEquals(0L, response.getTotalUsers());
    }
    
    @Test
    void testGetLeaderboard_DefaultParameters() {
        // Arrange
        AggregationResults<LeaderboardEntry> mockResults = mock(AggregationResults.class);
        when(mockResults.getMappedResults()).thenReturn(mockEntries);
        when(mongoTemplate.aggregate(any(Aggregation.class), eq("study_logs"), eq(LeaderboardEntry.class)))
            .thenReturn(mockResults);
        when(userRepository.findAllById(anyList())).thenReturn(mockUsers);
        
        @SuppressWarnings("unchecked")
        AggregationResults<Map<String, Object>> countResults = mock(AggregationResults.class);
        Map<String, Object> countMap = new HashMap<>();
        countMap.put("count", 3L);
        when(countResults.getUniqueMappedResult()).thenReturn(countMap);
        when(mongoTemplate.aggregate(any(Aggregation.class), eq("study_logs"), eq(Map.class)))
            .thenReturn((AggregationResults) countResults);
        
        // Mock cache miss
        when(cacheConfig.get(anyString())).thenReturn(null);
        
        // Act - pass nulls to test defaults
        LeaderboardResponse response = leaderboardService.getLeaderboard(null, null, null, null, null);
        
        // Assert
        assertNotNull(response);
        assertEquals("all", response.getPeriod());
        assertEquals(10, response.getLimit());
        assertEquals(1, response.getPage());
    }
    
    @Test
    void testGetLeaderboard_LimitExceedsMax() {
        // Arrange
        AggregationResults<LeaderboardEntry> mockResults = mock(AggregationResults.class);
        when(mockResults.getMappedResults()).thenReturn(mockEntries);
        when(mongoTemplate.aggregate(any(Aggregation.class), eq("study_logs"), eq(LeaderboardEntry.class)))
            .thenReturn(mockResults);
        when(userRepository.findAllById(anyList())).thenReturn(mockUsers);
        
        @SuppressWarnings("unchecked")
        AggregationResults<Map<String, Object>> countResults = mock(AggregationResults.class);
        Map<String, Object> countMap = new HashMap<>();
        countMap.put("count", 3L);
        when(countResults.getUniqueMappedResult()).thenReturn(countMap);
        when(mongoTemplate.aggregate(any(Aggregation.class), eq("study_logs"), eq(Map.class)))
            .thenReturn((AggregationResults) countResults);
        
        // Mock cache miss
        when(cacheConfig.get(anyString())).thenReturn(null);
        
        // Act - request limit > 100
        LeaderboardResponse response = leaderboardService.getLeaderboard("all", null, 150, 1, false);
        
        // Assert - should be capped at 100
        assertNotNull(response);
        assertEquals(100, response.getLimit());
    }
    
    // Helper method
    private User createUser(String id, String username) {
        User user = new User();
        user.setId(id);
        user.setUsername(username);
        user.setEmail(username + "@test.com");
        return user;
    }
}
