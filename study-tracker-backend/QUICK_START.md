# 🚀 Quick Start Guide - Study Tracker API

## ⚡ Get Started in 3 Steps

### Step 1: Start MongoDB
```bash
# Windows (if MongoDB is installed as a service)
net start MongoDB

# Or if you need to start it manually
mongod --dbpath "C:\data\db"
```

### Step 2: Run the Application
```bash
# Navigate to project directory
cd "c:\Users\LENOVO\OneDrive\Desktop\3LM\framework tp\taskflow"

# Run with Maven
mvn spring-boot:run
```

### Step 3: Test the API
```bash
# Create your first study log
curl -X POST http://localhost:8080/api/logs ^
  -H "Content-Type: application/json" ^
  -d "{\"subject\":\"Mathematics\",\"topic\":\"Algebra\",\"duration\":60,\"date\":\"2025-10-12\",\"notes\":\"First session\"}"

# Get all logs
curl http://localhost:8080/api/logs
```

---

## 📚 What Was Built

Your **Study Tracker REST API** includes:

### ✅ **7 REST Endpoints**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/logs` | GET | Get all study logs |
| `/api/logs/{id}` | GET | Get one log by ID |
| `/api/logs` | POST | Create a new log |
| `/api/logs/{id}` | PUT | Update a log |
| `/api/logs/{id}` | DELETE | Delete a log |
| `/api/logs/by-subject` | GET | Filter by subject |
| `/api/logs/between` | GET | Query by date range |

### ✅ **Components Created**

```
✅ StudyLog Model       - with validation (@NotBlank, @Positive, @NotNull)
✅ StudyLogRepository   - MongoDB queries (findBySubject, findByDateBetween)
✅ StudyLogService      - Business logic layer
✅ StudyLogController   - REST API endpoints with ResponseEntity
✅ RestExceptionHandler - Validation error handling with field-specific messages
```

### ✅ **Key Features**

- 🔒 **Validation** - All required fields validated with custom error messages
- 🌐 **CORS** - Ready for Angular/React frontends
- 📝 **MongoDB** - Document-based storage with custom queries
- 🎯 **Clean Code** - Lombok annotations, constructor injection, builder pattern
- 📊 **Proper HTTP Codes** - 200 OK, 201 Created, 204 No Content, 400 Bad Request, 404 Not Found

---

## 🧪 Quick Test Examples

### PowerShell (Windows)

```powershell
# Create a log
$body = @{
    subject = "Physics"
    topic = "Mechanics"
    duration = 90
    date = "2025-10-12"
    notes = "Newton's laws"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/logs" -Method Post -Body $body -ContentType "application/json"

# Get all logs
Invoke-RestMethod -Uri "http://localhost:8080/api/logs" -Method Get | ConvertTo-Json -Depth 3
```

### Using Postman

1. **Import these endpoints:**
   - Base URL: `http://localhost:8080`
   - Endpoint: `/api/logs`
   - Methods: GET, POST, PUT, DELETE

2. **Test POST /api/logs**
   ```json
   {
     "subject": "Computer Science",
     "topic": "Algorithms",
     "duration": 120,
     "date": "2025-10-12",
     "notes": "Sorting algorithms"
   }
   ```

---

## 📖 Full Documentation

- **`API_TESTING.md`** - Comprehensive API testing guide with curl commands
- **`PROJECT_SUMMARY.md`** - Complete project structure and implementation details

---

## 🛠️ Configuration

### application.properties
```properties
spring.data.mongodb.uri=mongodb://localhost:27017/taskflow
spring.data.mongodb.database=taskflow
server.port=8080
frontend.origin=http://localhost:4200
```

### Change Port (if 8080 is in use)
```properties
server.port=8081
```

### Change MongoDB Database
```properties
spring.data.mongodb.database=my_study_tracker
```

---

## ✅ Validation Examples

### ✅ Valid Request
```json
{
  "subject": "Mathematics",
  "topic": "Calculus",
  "duration": 120,
  "date": "2025-10-12",
  "notes": "Derivatives and integrals"
}
```
**Response:** `201 Created`

### ❌ Invalid Request (Missing Fields)
```json
{
  "duration": 120
}
```
**Response:** `400 Bad Request`
```json
{
  "timestamp": "2025-10-12T13:00:00",
  "status": 400,
  "errors": {
    "subject": "Subject is required",
    "topic": "Topic is required",
    "date": "Date is required"
  }
}
```

### ❌ Invalid Request (Negative Duration)
```json
{
  "subject": "Math",
  "topic": "Algebra",
  "duration": -10,
  "date": "2025-10-12"
}
```
**Response:** `400 Bad Request`
```json
{
  "timestamp": "2025-10-12T13:00:00",
  "status": 400,
  "errors": {
    "duration": "Duration must be positive"
  }
}
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: MongoTimeoutException: Timed out after 30000 ms
```
**Solution:** Start MongoDB service
```bash
net start MongoDB
# or
mongod --dbpath "C:\data\db"
```

### Port Already in Use
```
Error: Port 8080 is already in use
```
**Solution:** Change port in `application.properties`
```properties
server.port=8081
```

### Validation Not Working
**Solution:** Ensure `spring-boot-starter-validation` is in `pom.xml`

### Lombok Not Working
**Solution:** 
1. Install Lombok plugin in your IDE
2. Enable annotation processing in IDE settings
3. Rebuild project: `mvn clean install`

---

## 🎯 What's Next?

Your API is ready! You can:

1. **Test it** - Use Postman, curl, or the provided test scripts
2. **Connect a frontend** - Angular, React, or Vue (CORS is already configured)
3. **Deploy it** - Docker, AWS, Heroku, etc.
4. **Enhance it** - Add authentication, pagination, statistics, etc.

---

## 📝 Summary

✅ **Spring Boot 3.5.6** + **Java 17** + **MongoDB**  
✅ **Clean Architecture** - Model, Repository, Service, Controller  
✅ **Full CRUD** - Create, Read, Update, Delete operations  
✅ **Validation** - Field-level validation with custom messages  
✅ **Exception Handling** - Centralized error responses  
✅ **CORS Support** - Frontend integration ready  
✅ **Production Ready** - Proper HTTP codes, ResponseEntity, best practices  

**Your Study Tracker API is complete and ready to use! 🎉**

---

## 🆘 Need Help?

- Check `API_TESTING.md` for detailed testing examples
- Check `PROJECT_SUMMARY.md` for full project documentation
- Ensure MongoDB is running on `localhost:27017`
- Verify the application is running on `http://localhost:8080`

Happy coding! 💻✨
