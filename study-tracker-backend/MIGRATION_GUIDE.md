# 🔄 Migration Guide - Adding userId to Existing Data

## ⚠️ Important: Existing Data Migration

If you have existing study logs in your MongoDB database **without** a `userId` field, you need to either:
1. Delete all existing logs (recommended for development)
2. Assign them to a specific user

---

## Option 1: Delete All Existing Logs (Recommended for Dev)

### Using MongoDB Shell:
```bash
mongosh
use studylog
db.study_logs.deleteMany({})
```

### Using MongoDB Compass:
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Select database: `studylog`
4. Select collection: `study_logs`
5. Click "Delete" → "Delete All Documents"

---

## Option 2: Assign Existing Logs to a User

### Step 1: Get a User ID
```bash
mongosh
use studylog
db.users.findOne()
```

Copy the `_id` value (e.g., `"507f1f77bcf86cd799439011"`)

### Step 2: Update All Logs
```bash
db.study_logs.updateMany(
  { userId: { $exists: false } },
  { $set: { userId: "PASTE_USER_ID_HERE" } }
)
```

Replace `PASTE_USER_ID_HERE` with the actual user ID.

---

## Verification

After migration, verify all logs have userId:

```bash
mongosh
use studylog

# Check if any logs are missing userId
db.study_logs.find({ userId: { $exists: false } }).count()
# Should return: 0

# Check a sample log
db.study_logs.findOne()
# Should have userId field
```

---

## ✅ After Migration

1. Restart the backend: `mvn spring-boot:run`
2. Login to the frontend
3. Create a new study log
4. Verify it has the correct userId

---

## 🚨 Troubleshooting

### Error: "User ID is required"
**Cause:** Trying to create a log without userId  
**Solution:** Make sure JWT token is valid and backend is restarted

### Error: "Study log not found"
**Cause:** Trying to access a log that belongs to another user  
**Solution:** This is expected! Users can only see their own logs

### Logs still shared between users
**Cause:** Old logs don't have userId  
**Solution:** Run Option 1 (delete all logs) and create new ones

---

## 📝 Quick Reset Script (PowerShell)

```powershell
# Delete all study logs
mongosh --eval "use studylog; db.study_logs.deleteMany({})"

# Verify deletion
mongosh --eval "use studylog; db.study_logs.count()"
```

---

## 🎯 Recommended Workflow

For **development/testing**:
1. Delete all existing logs
2. Restart backend
3. Register 2 test users (Alice & Bob)
4. Create logs for each user
5. Verify isolation

For **production**:
1. Backup database first!
2. Use Option 2 to assign logs to users
3. Test thoroughly before deploying
