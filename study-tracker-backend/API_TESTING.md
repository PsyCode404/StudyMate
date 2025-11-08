# Study Tracker API - Testing Guide

## Prerequisites
1. Ensure MongoDB is running on `localhost:27017`
2. Start the Spring Boot application: `mvn spring-boot:run`
3. API will be available at: `http://localhost:8080`

---

## API Endpoints

### 1. Create a New Study Log
**POST** `/api/logs`

```bash
curl -X POST http://localhost:8080/api/logs \
  -H "Content-Type: application/json" \
  -d "{
    \"subject\": \"Mathematics\",
    \"topic\": \"Calculus - Derivatives\",
    \"duration\": 120,
    \"date\": \"2025-10-12\",
    \"notes\": \"Covered basic derivative rules and chain rule\"
  }"
```

**Expected Response:** `201 Created`
```json
{
  "id": "67a1b2c3d4e5f6g7h8i9j0k1",
  "subject": "Mathematics",
  "topic": "Calculus - Derivatives",
  "duration": 120,
  "date": "2025-10-12",
  "notes": "Covered basic derivative rules and chain rule"
}
```

---

### 2. Get All Study Logs
**GET** `/api/logs`

```bash
curl -X GET http://localhost:8080/api/logs
```

**Expected Response:** `200 OK`
```json
[
  {
    "id": "67a1b2c3d4e5f6g7h8i9j0k1",
    "subject": "Mathematics",
    "topic": "Calculus - Derivatives",
    "duration": 120,
    "date": "2025-10-12",
    "notes": "Covered basic derivative rules and chain rule"
  }
]
```

---

### 3. Get a Single Study Log by ID
**GET** `/api/logs/{id}`

```bash
curl -X GET http://localhost:8080/api/logs/67a1b2c3d4e5f6g7h8i9j0k1
```

**Expected Response:** `200 OK` or `404 Not Found`

---

### 4. Update a Study Log
**PUT** `/api/logs/{id}`

```bash
curl -X PUT http://localhost:8080/api/logs/67a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Content-Type: application/json" \
  -d "{
    \"subject\": \"Mathematics\",
    \"topic\": \"Calculus - Integrals\",
    \"duration\": 90,
    \"date\": \"2025-10-12\",
    \"notes\": \"Updated topic to integrals\"
  }"
```

**Expected Response:** `200 OK` or `404 Not Found`

---

### 5. Delete a Study Log
**DELETE** `/api/logs/{id}`

```bash
curl -X DELETE http://localhost:8080/api/logs/67a1b2c3d4e5f6g7h8i9j0k1
```

**Expected Response:** `204 No Content` or `404 Not Found`

---

### 6. Find Study Logs by Subject
**GET** `/api/logs/by-subject?subject={subject}`

```bash
curl -X GET "http://localhost:8080/api/logs/by-subject?subject=Mathematics"
```

**Expected Response:** `200 OK`
```json
[
  {
    "id": "67a1b2c3d4e5f6g7h8i9j0k1",
    "subject": "Mathematics",
    "topic": "Calculus - Derivatives",
    "duration": 120,
    "date": "2025-10-12",
    "notes": "Covered basic derivative rules and chain rule"
  }
]
```

---

### 7. Find Study Logs Between Dates
**GET** `/api/logs/between?start={start}&end={end}`

```bash
curl -X GET "http://localhost:8080/api/logs/between?start=2025-10-01&end=2025-10-31"
```

**Expected Response:** `200 OK`
```json
[
  {
    "id": "67a1b2c3d4e5f6g7h8i9j0k1",
    "subject": "Mathematics",
    "topic": "Calculus - Derivatives",
    "duration": 120,
    "date": "2025-10-12",
    "notes": "Covered basic derivative rules and chain rule"
  }
]
```

---

## Validation Error Testing

### Test with Invalid Data (Missing Required Fields)
```bash
curl -X POST http://localhost:8080/api/logs \
  -H "Content-Type: application/json" \
  -d "{
    \"duration\": 120
  }"
```

**Expected Response:** `400 Bad Request`
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

### Test with Negative Duration
```bash
curl -X POST http://localhost:8080/api/logs \
  -H "Content-Type: application/json" \
  -d "{
    \"subject\": \"Math\",
    \"topic\": \"Algebra\",
    \"duration\": -10,
    \"date\": \"2025-10-12\"
  }"
```

**Expected Response:** `400 Bad Request`
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

## Quick Test Script (Bash)

```bash
#!/bin/bash

BASE_URL="http://localhost:8080/api/logs"

echo "1. Creating a study log..."
RESPONSE=$(curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Physics",
    "topic": "Quantum Mechanics",
    "duration": 180,
    "date": "2025-10-12",
    "notes": "Introduction to quantum states"
  }')

echo $RESPONSE
ID=$(echo $RESPONSE | grep -o '"id":"[^"]*' | grep -o '[^"]*$')
echo "Created log with ID: $ID"

echo -e "\n2. Getting all logs..."
curl -s -X GET $BASE_URL | json_pp

echo -e "\n3. Getting log by ID..."
curl -s -X GET $BASE_URL/$ID | json_pp

echo -e "\n4. Updating the log..."
curl -s -X PUT $BASE_URL/$ID \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Physics",
    "topic": "Wave Functions",
    "duration": 200,
    "date": "2025-10-12",
    "notes": "Deep dive into wave functions"
  }' | json_pp

echo -e "\n5. Deleting the log..."
curl -s -X DELETE $BASE_URL/$ID -w "\nHTTP Status: %{http_code}\n"

echo -e "\nAll tests completed!"
```

---

## PowerShell Test Script (Windows)

```powershell
$baseUrl = "http://localhost:8080/api/logs"

Write-Host "1. Creating a study log..." -ForegroundColor Green
$body = @{
    subject = "Computer Science"
    topic = "Data Structures"
    duration = 150
    date = "2025-10-12"
    notes = "Arrays and Linked Lists"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri $baseUrl -Method Post -Body $body -ContentType "application/json"
$id = $response.id
Write-Host "Created log with ID: $id"

Write-Host "`n2. Getting all logs..." -ForegroundColor Green
Invoke-RestMethod -Uri $baseUrl -Method Get | ConvertTo-Json -Depth 3

Write-Host "`n3. Getting log by ID..." -ForegroundColor Green
Invoke-RestMethod -Uri "$baseUrl/$id" -Method Get | ConvertTo-Json

Write-Host "`n4. Updating the log..." -ForegroundColor Green
$updateBody = @{
    subject = "Computer Science"
    topic = "Trees and Graphs"
    duration = 180
    date = "2025-10-12"
    notes = "Binary Trees and Graph Traversal"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/$id" -Method Put -Body $updateBody -ContentType "application/json" | ConvertTo-Json

Write-Host "`n5. Deleting the log..." -ForegroundColor Green
Invoke-RestMethod -Uri "$baseUrl/$id" -Method Delete

Write-Host "`nAll tests completed!" -ForegroundColor Green
```

---

## Using Postman

1. Import the API into Postman
2. Set the base URL: `http://localhost:8080`
3. Create a collection with the following requests:
   - POST Create Log
   - GET All Logs
   - GET Log by ID
   - PUT Update Log
   - DELETE Log
   - GET By Subject
   - GET Between Dates

---

## Common Issues and Solutions

### Issue: MongoDB Connection Error
**Solution:** Ensure MongoDB is running:
```bash
# Windows (if installed as service)
net start MongoDB

# Or start manually
mongod --dbpath "C:\data\db"
```

### Issue: Port 8080 Already in Use
**Solution:** Change the port in `application.properties`:
```properties
server.port=8081
```

### Issue: Validation Not Working
**Solution:** Ensure `spring-boot-starter-validation` is in your `pom.xml`

### Issue: CORS Errors from Frontend
**Solution:** Update `frontend.origin` in `application.properties`:
```properties
frontend.origin=http://localhost:4200
```

---

## Summary

✅ **Created Components:**
- Model: `StudyLog.java` with validation
- Repository: `StudyLogRepository.java` with custom query methods
- Service: `StudyLogService.java` with business logic
- Controller: `StudyLogController.java` with REST endpoints
- Exception Handler: `RestExceptionHandler.java` for validation errors

✅ **Features:**
- Full CRUD operations
- Field validation with custom error messages
- Filter by subject
- Date range queries
- CORS support for Angular frontend
- Clean ResponseEntity responses with proper HTTP status codes

Your Study Tracker API is ready to use! 🚀
