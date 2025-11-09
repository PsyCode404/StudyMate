# Backend API Test Endpoints

## 🌐 Base URL
```
https://study-tracker-backend.azurewebsites.net
```

---

## 📋 Available Endpoints

### 1. Authentication Endpoints

#### Register New User
```http
POST https://study-tracker-backend.azurewebsites.net/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "SecurePass123!"
}
```

**Test with PowerShell:**
```powershell
$body = @{
    username = "testuser"
    email = "test@example.com"
    password = "SecurePass123!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://study-tracker-backend.azurewebsites.net/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

**Test with curl:**
```bash
curl -X POST https://study-tracker-backend.azurewebsites.net/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"SecurePass123!"}'
```

---

#### Login
```http
POST https://study-tracker-backend.azurewebsites.net/api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "SecurePass123!"
}
```

**Test with PowerShell:**
```powershell
$body = @{
    username = "testuser"
    password = "SecurePass123!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://study-tracker-backend.azurewebsites.net/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

---

### 2. Study Log Endpoints

#### Create Study Log (Requires Authentication)
```http
POST https://study-tracker-backend.azurewebsites.net/api/studylogs
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "subject": "Mathematics",
  "duration": 60,
  "date": "2025-11-09"
}
```

#### Get All Study Logs
```http
GET https://study-tracker-backend.azurewebsites.net/api/studylogs
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### 3. Leaderboard Endpoint

#### Get Leaderboard
```http
GET https://study-tracker-backend.azurewebsites.net/api/leaderboard
```

**Test with PowerShell:**
```powershell
Invoke-RestMethod -Uri "https://study-tracker-backend.azurewebsites.net/api/leaderboard" -Method GET
```

---

### 4. AI Advisor Endpoint

#### Get AI Study Advice (Requires Authentication)
```http
POST https://study-tracker-backend.azurewebsites.net/api/ai-advisor/advice
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "question": "How can I improve my study habits?"
}
```

---

## 🧪 Quick Test Script

Save this as `test-backend.ps1`:

```powershell
# Test Backend API
$baseUrl = "https://study-tracker-backend.azurewebsites.net"

Write-Host "Testing Backend API..." -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl" -ForegroundColor Yellow
Write-Host ""

# Test 1: Register User
Write-Host "Test 1: Register User" -ForegroundColor Green
try {
    $registerBody = @{
        username = "testuser_$(Get-Random -Maximum 9999)"
        email = "test$(Get-Random -Maximum 9999)@example.com"
        password = "SecurePass123!"
    } | ConvertTo-Json

    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    Write-Host "✓ Registration successful!" -ForegroundColor Green
    Write-Host "Token: $($registerResponse.token.Substring(0, 20))..." -ForegroundColor Gray
    $token = $registerResponse.token
} catch {
    Write-Host "✗ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Login
Write-Host "Test 2: Login" -ForegroundColor Green
try {
    $loginBody = @{
        username = $registerBody.username
        password = "SecurePass123!"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✓ Login successful!" -ForegroundColor Green
    $token = $loginResponse.token
} catch {
    Write-Host "✗ Login failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Get Leaderboard
Write-Host "Test 3: Get Leaderboard" -ForegroundColor Green
try {
    $leaderboard = Invoke-RestMethod -Uri "$baseUrl/api/leaderboard" -Method GET
    Write-Host "✓ Leaderboard retrieved!" -ForegroundColor Green
    Write-Host "Users: $($leaderboard.Count)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Leaderboard failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Testing complete!" -ForegroundColor Cyan
```

---

## 🔧 Troubleshooting

### Check if backend is running:
```powershell
Invoke-WebRequest -Uri "https://study-tracker-backend.azurewebsites.net" -Method GET
```

### View application logs:
```powershell
az webapp log tail --name study-tracker-backend --resource-group study-tracker-rg
```

### Check app status:
```powershell
az webapp show --name study-tracker-backend --resource-group study-tracker-rg --query "state" --output tsv
```

---

## 📊 Configuration

- **MongoDB:** Connected to Atlas Cloud
- **Gemini API:** Configured ✓
- **CORS:** Configured for `http://localhost:4200`
- **Port:** 8080

---

## 🔐 Security Notes

- All endpoints except `/api/auth/register` and `/api/auth/login` require JWT authentication
- Include the token in the `Authorization` header: `Bearer YOUR_JWT_TOKEN`
- Tokens expire after 30 days (configurable in application.properties)

---

## 📱 Use with Postman

1. Import the base URL: `https://study-tracker-backend.azurewebsites.net`
2. Create a collection for each endpoint group
3. Set up an environment variable for the JWT token
4. Test each endpoint sequentially

---

## ✅ Expected Responses

### Successful Registration:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "testuser",
  "email": "test@example.com"
}
```

### Successful Login:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "testuser"
}
```

### Error Response:
```json
{
  "timestamp": "2025-11-09T15:30:00.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Username already exists"
}
```
