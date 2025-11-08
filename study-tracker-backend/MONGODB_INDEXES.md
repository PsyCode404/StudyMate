# MongoDB Indexes for Leaderboard Performance

## Required Indexes

To optimize leaderboard queries, create the following indexes on the `study_logs` collection:

### 1. Compound Index: userId + date + subject

This index supports all leaderboard query patterns:
- Filtering by date (period)
- Filtering by subject
- Grouping by userId

```javascript
// MongoDB Shell
db.study_logs.createIndex(
  { userId: 1, date: 1, subject: 1 },
  { name: "idx_leaderboard_query", background: true }
);
```

### 2. Date Index (for period filtering)

```javascript
db.study_logs.createIndex(
  { date: 1 },
  { name: "idx_date", background: true }
);
```

### 3. Subject Index (for subject-specific leaderboards)

```javascript
db.study_logs.createIndex(
  { subject: 1 },
  { name: "idx_subject", background: true }
);
```

### 4. UserId Index (for user-specific queries)

```javascript
db.study_logs.createIndex(
  { userId: 1 },
  { name: "idx_userId", background: true }
);
```

## Index Usage by Query Type

| Query Type | Indexes Used |
|------------|--------------|
| All-time leaderboard | `idx_userId` |
| Weekly/Monthly leaderboard | `idx_leaderboard_query` or `idx_date` + `idx_userId` |
| Subject-specific leaderboard | `idx_leaderboard_query` or `idx_subject` + `idx_userId` |
| Subject + Period leaderboard | `idx_leaderboard_query` |

## Create All Indexes (Batch)

```javascript
// Run in MongoDB Shell
use taskflow;

// Compound index for leaderboard queries
db.study_logs.createIndex(
  { userId: 1, date: 1, subject: 1 },
  { name: "idx_leaderboard_query", background: true }
);

// Individual indexes
db.study_logs.createIndex({ date: 1 }, { name: "idx_date", background: true });
db.study_logs.createIndex({ subject: 1 }, { name: "idx_subject", background: true });
db.study_logs.createIndex({ userId: 1 }, { name: "idx_userId", background: true });

// Verify indexes
db.study_logs.getIndexes();
```

## Spring Boot Index Creation

Alternatively, use Spring Data MongoDB annotations:

```java
@Document(collection = "study_logs")
@CompoundIndexes({
    @CompoundIndex(
        name = "idx_leaderboard_query",
        def = "{'userId': 1, 'date': 1, 'subject': 1}",
        background = true
    )
})
public class StudyLog {
    // ... fields
}
```

## Performance Impact

### Without Indexes
- Query time: 500-2000ms (depending on data size)
- Full collection scan required
- High CPU usage

### With Indexes
- Query time: 10-50ms
- Index scan only
- Minimal CPU usage
- ~20-40x performance improvement

## Index Maintenance

### Check Index Usage

```javascript
// Check index statistics
db.study_logs.aggregate([
  { $indexStats: {} }
]);
```

### Drop Unused Indexes

```javascript
// If an index is not being used
db.study_logs.dropIndex("index_name");
```

### Rebuild Indexes (if needed)

```javascript
// Rebuild all indexes
db.study_logs.reIndex();
```

## Monitoring

### Explain Query Plan

```javascript
// Check if indexes are being used
db.study_logs.explain("executionStats").aggregate([
  { $match: { date: { $gte: ISODate("2024-11-01") } } },
  { $group: { _id: "$userId", total: { $sum: "$duration" } } }
]);
```

Look for:
- `"stage": "IXSCAN"` (good - using index)
- `"stage": "COLLSCAN"` (bad - full collection scan)

## Best Practices

1. **Create indexes before production deployment**
2. **Use `background: true`** to avoid blocking writes
3. **Monitor index size** - shouldn't exceed 10-20% of data size
4. **Test queries** with explain() before and after indexing
5. **Consider index selectivity** - more selective fields first

## Index Size Estimation

```javascript
// Check index sizes
db.study_logs.stats().indexSizes;
```

Expected sizes (for 100k documents):
- `idx_leaderboard_query`: ~5-8 MB
- `idx_date`: ~2-3 MB
- `idx_subject`: ~2-3 MB
- `idx_userId`: ~2-3 MB

Total: ~11-17 MB

## Troubleshooting

### Slow Queries Despite Indexes

1. Check if index is being used:
   ```javascript
   db.study_logs.find({ date: { $gte: ISODate("2024-11-01") } }).explain();
   ```

2. Verify index exists:
   ```javascript
   db.study_logs.getIndexes();
   ```

3. Check index selectivity:
   ```javascript
   db.study_logs.aggregate([
     { $group: { _id: "$subject", count: { $sum: 1 } } },
     { $sort: { count: -1 } }
   ]);
   ```

### Index Not Being Used

Possible reasons:
- Query doesn't match index pattern
- Collection is too small (MongoDB prefers COLLSCAN for small collections)
- Index is corrupted (rebuild with `reIndex()`)
- Query uses operators that can't use indexes (e.g., `$where`)

## Production Checklist

- [ ] All indexes created
- [ ] Indexes verified with `getIndexes()`
- [ ] Query performance tested with `explain()`
- [ ] Index usage monitored
- [ ] Backup strategy includes indexes
- [ ] Index rebuild procedure documented
