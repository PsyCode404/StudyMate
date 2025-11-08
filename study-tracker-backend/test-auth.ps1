# Test Authentication Endpoints

Write-Host "`n=== Testing Authentication API ===" -ForegroundColor Cyan

# Test 1: Test Endpoint
Write-Host "`n1. Testing /api/auth/test endpoint..." -ForegroundColor Yellow
try {
    $testResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/test"
    Write-Host "✓ Test endpoint working: $testResponse" -ForegroundColor Green
} catch {
    Write-Host "✗ Test endpoint failed: $_" -ForegroundColor Red
}

# Test 2: Login with existing user
Write-Host "`n2. Testing /api/auth/login endpoint..." -ForegroundColor Yellow
try {
    $loginBody = @{
        usernameOrEmail = "testuser"
        password = "password123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host "  User ID: $($loginResponse.user.id)" -ForegroundColor Cyan
    Write-Host "  Username: $($loginResponse.user.username)" -ForegroundColor Cyan
    Write-Host "  Email: $($loginResponse.user.email)" -ForegroundColor Cyan
    Write-Host "  Token: $($loginResponse.token.Substring(0, 50))..." -ForegroundColor Cyan
    
    # Save token for next test
    $global:authToken = $loginResponse.token
    
} catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
}

# Test 3: Register a new user
Write-Host "`n3. Testing /api/auth/register endpoint..." -ForegroundColor Yellow
try {
    $registerBody = @{
        username = "alice"
        email = "alice@example.com"
        password = "alicepass123"
    } | ConvertTo-Json
    
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    
    Write-Host "✓ Registration successful!" -ForegroundColor Green
    Write-Host "  User ID: $($registerResponse.user.id)" -ForegroundColor Cyan
    Write-Host "  Username: $($registerResponse.user.username)" -ForegroundColor Cyan
    Write-Host "  Email: $($registerResponse.user.email)" -ForegroundColor Cyan
    Write-Host "  Token: $($registerResponse.token.Substring(0, 50))..." -ForegroundColor Cyan
    
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "✓ User already exists (expected if running multiple times)" -ForegroundColor Yellow
    } else {
        Write-Host "✗ Registration failed: $_" -ForegroundColor Red
    }
}

# Test 4: Access protected endpoint with token
Write-Host "`n4. Testing protected endpoint with JWT token..." -ForegroundColor Yellow
if ($global:authToken) {
    try {
        $headers = @{
            Authorization = "Bearer $global:authToken"
        }
        $protectedResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/study-logs" -Headers $headers
        Write-Host "Success: Protected endpoint accessible with valid token!" -ForegroundColor Green
        Write-Host "  Response: $protectedResponse" -ForegroundColor Cyan
    } catch {
        Write-Host "Error: Protected endpoint failed: $_" -ForegroundColor Red
    }
} else {
    Write-Host "Skipped (no token available)" -ForegroundColor Gray
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
