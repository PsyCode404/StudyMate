# Leaderboard API Documentation

## Overview
The Leaderboard API provides study time rankings and statistics for users based on their study logs. It uses MongoDB aggregation pipelines to efficiently compute totals and averages.

## Endpoint

### GET `/api/leaderboard`

Returns a ranked list of users by total study time.

#### Query Parameters

| Parameter | Type    | Required | Default | Description                                    |
|-----------|---------|----------|---------|------------------------------------------------|
| `period`  | String  | No       | `all`   | Time period filter: `all`, `month`, or `week`  |
| `limit`   | Integer | No       | `10`    | Number of users to return (max 100)            |
| `page`    | Integer | No       | `1`     | Page number for pagination                     |

#### Example Requests

```bash
# Get top 10 users of all time
GET /api/leaderboard

# Get top 20 users from the past week
GET /api/leaderboard?period=week&limit=20

# Get page 2 of monthly leaderboard (users 11-20)
GET /api/leaderboard?period=month&limit=10&page=2
```

#### Response Format

```json
{
  "leaderboard": [
    {
      "userId": "507f1f77bcf86cd799439011",
      "username": "alice",
      "totalMinutes": 1250,
      "sessionCount": 25,
      "avgMinutesPerSession": 50.0,
      "rank": 1
    },
    {
      "userId": "507f1f77bcf86cd799439012",
      "username": "bob",
      "totalMinutes": 980,
      "sessionCount": 20,
      "avgMinutesPerSession": 49.0,
      "rank": 2
    }
  ],
  "period": "week",
  "page": 1,
  "limit": 10,
  "totalUsers": 45
}
```

#### Response Fields

| Field                        | Type    | Description                                    |
|------------------------------|---------|------------------------------------------------|
| `leaderboard`                | Array   | List of leaderboard entries                    |
| `leaderboard[].userId`       | String  | User's unique identifier                       |
| `leaderboard[].username`     | String  | User's display name (or anonymized ID)         |
| `leaderboard[].totalMinutes` | Long    | Total study time in minutes                    |
| `leaderboard[].sessionCount` | Long    | Number of study sessions                       |
| `leaderboard[].avgMinutesPerSession` | Double | Average session duration            |
| `leaderboard[].rank`         | Integer | User's rank in the leaderboard                 |
| `period`                     | String  | Time period filter applied                     |
| `page`                       | Integer | Current page number                            |
| `limit`                      | Integer | Number of results per page                     |
| `totalUsers`                 | Long    | Total number of users with study logs          |

#### Status Codes

| Code | Description                                    |
|------|------------------------------------------------|
| 200  | Success - leaderboard data returned            |
| 400  | Bad Request - invalid parameters               |
| 500  | Internal Server Error                          |

## MongoDB Aggregation Pipeline

The leaderboard uses the following MongoDB aggregation stages:

### 1. Match (Optional - for period filtering)
```javascript
{
  $match: {
    date: { $gte: ISODate("2024-11-01T00:00:00Z") }
  }
}
```

### 2. Group by userId
```javascript
{
  $group: {
    _id: "$userId",
    totalMinutes: { $sum: "$duration" },
    sessionCount: { $count: {} }
  }
}
```

### 3. Project and Calculate Average
```javascript
{
  $project: {
    userId: "$_id",
    totalMinutes: 1,
    sessionCount: 1,
    avgMinutesPerSession: {
      $divide: ["$totalMinutes", "$sessionCount"]
    }
  }
}
```

### 4. Sort by Total Minutes
```javascript
{
  $sort: { totalMinutes: -1 }
}
```

### 5. Pagination
```javascript
{
  $skip: 0  // (page - 1) * limit
}
{
  $limit: 10
}
```

## Implementation Details

### Service Layer (`LeaderboardService.java`)

**Key Methods:**
- `getLeaderboard(period, limit, page)` - Main entry point
- `buildLeaderboardAggregation()` - Constructs MongoDB aggregation pipeline
- `getStartDateForPeriod()` - Calculates date range for filtering
- `enrichWithUsernames()` - Joins user data for display names
- `addRanks()` - Assigns rank numbers based on pagination
- `countTotalUsers()` - Counts total users for pagination info

**Features:**
- ✅ Efficient MongoDB aggregation
- ✅ Username enrichment with batch fetching
- ✅ Pagination support
- ✅ Period filtering (all/month/week)
- ✅ Limit validation (max 100)
- ✅ Anonymized fallback for missing usernames

### Controller Layer (`LeaderboardController.java`)

**Features:**
- ✅ Parameter validation
- ✅ Error handling
- ✅ CORS enabled
- ✅ Clear error messages

## Testing

### Unit Tests (`LeaderboardServiceTest.java`)

**Test Coverage:**
- ✅ All period filters (all, week, month)
- ✅ Pagination logic
- ✅ Username enrichment
- ✅ Rank assignment
- ✅ Empty results handling
- ✅ Default parameter values
- ✅ Limit validation (max 100)

### Running Tests

```bash
mvn test -Dtest=LeaderboardServiceTest
```

## Performance Considerations

1. **Indexing**: Ensure indexes on `study_logs.userId` and `study_logs.date` for optimal query performance
2. **Batch Fetching**: Usernames are fetched in a single batch query to minimize database calls
3. **Limit Cap**: Maximum limit of 100 to prevent excessive data transfer
4. **Aggregation**: MongoDB aggregation pipeline runs server-side for efficiency

## Future Enhancements

- [ ] Add subject-specific leaderboards
- [ ] Include consistency score in rankings
- [ ] Add time-of-day activity patterns
- [ ] Support custom date ranges
- [ ] Add leaderboard badges/achievements
- [ ] Cache results for popular queries

## Example Usage in Frontend

```typescript
// Fetch weekly leaderboard
const response = await fetch('/api/leaderboard?period=week&limit=20');
const data = await response.json();

console.log(`Top ${data.leaderboard.length} users this week:`);
data.leaderboard.forEach(entry => {
  console.log(`${entry.rank}. ${entry.username}: ${entry.totalMinutes} min`);
});
```

## Error Handling

### Invalid Period
```json
{
  "leaderboard": null,
  "period": "invalid",
  "page": 1,
  "limit": 10,
  "totalUsers": 0
}
```

### Invalid Limit
```json
{
  "leaderboard": null,
  "period": "all",
  "page": 1,
  "limit": 150,
  "totalUsers": 0
}
```

## Security Notes

- ✅ No authentication required (public leaderboard)
- ✅ User IDs are exposed but usernames can be anonymized
- ✅ CORS enabled for frontend access
- ⚠️ Consider adding authentication if leaderboard should be private
- ⚠️ Consider rate limiting to prevent abuse
