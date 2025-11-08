# Test User-Specific Data Isolation
# Verifies that each user can only see their own study logs

Write-Host "`n=== Testing User-Specific Data Isolation ===" -ForegroundColor Cyan

# Step 1: Register Alice
Write-Host "`n1. Registering Alice..." -ForegroundColor Yellow
try {
    $aliceBody = @{
        username = "alice"
        email = "alice@test.com"
        password = "password123"
    } | ConvertTo-Json
    
    $aliceResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method Post -Body $aliceBody -ContentType "application/json"
    $aliceToken = $aliceResponse.token
    Write-Host "Success: Alice registered!" -ForegroundColor Green
    Write-Host "  Username: $($aliceResponse.user.username)" -ForegroundColor Cyan
    Write-Host "  Token: $($aliceToken.Substring(0, 30))..." -ForegroundColor Cyan
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "Alice already exists, logging in..." -ForegroundColor Yellow
        $loginBody = @{
            usernameOrEmail = "alice"
            password = "password123"
        } | ConvertTo-Json
        $aliceResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
        $aliceToken = $aliceResponse.token
        Write-Host "Success: Alice logged in!" -ForegroundColor Green
    } else {
        Write-Host "Error: Failed to register Alice" -ForegroundColor Red
        exit 1
    }
}

# Step 2: Create study log for Alice
Write-Host "`n2. Creating study log for Alice..." -ForegroundColor Yellow
try {
    $aliceLogBody = @{
        subject = "Mathematics"
        topic = "Calculus"
        duration = 60
        date = "2025-10-19"
        notes = "Alice's calculus study session"
    } | ConvertTo-Json
    
    $aliceHeaders = @{
        Authorization = "Bearer $aliceToken"
    }
    
    $aliceLog = Invoke-RestMethod -Uri "http://localhost:8080/api/logs" -Method Post -Body $aliceLogBody -ContentType "application/json" -Headers $aliceHeaders
    Write-Host "Success: Study log created for Alice!" -ForegroundColor Green
    Write-Host "  Subject: $($aliceLog.subject)" -ForegroundColor Cyan
    Write-Host "  Topic: $($aliceLog.topic)" -ForegroundColor Cyan
    Write-Host "  User ID: $($aliceLog.userId)" -ForegroundColor Cyan
} catch {
    Write-Host "Error: Failed to create log for Alice" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Step 3: Register Bob
Write-Host "`n3. Registering Bob..." -ForegroundColor Yellow
try {
    $bobBody = @{
        username = "bob"
        email = "bob@test.com"
        password = "password123"
    } | ConvertTo-Json
    
    $bobResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method Post -Body $bobBody -ContentType "application/json"
    $bobToken = $bobResponse.token
    Write-Host "Success: Bob registered!" -ForegroundColor Green
    Write-Host "  Username: $($bobResponse.user.username)" -ForegroundColor Cyan
    Write-Host "  Token: $($bobToken.Substring(0, 30))..." -ForegroundColor Cyan
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "Bob already exists, logging in..." -ForegroundColor Yellow
        $loginBody = @{
            usernameOrEmail = "bob"
            password = "password123"
        } | ConvertTo-Json
        $bobResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
        $bobToken = $bobResponse.token
        Write-Host "Success: Bob logged in!" -ForegroundColor Green
    } else {
        Write-Host "Error: Failed to register Bob" -ForegroundColor Red
        exit 1
    }
}

# Step 4: Create study log for Bob
Write-Host "`n4. Creating study log for Bob..." -ForegroundColor Yellow
try {
    $bobLogBody = @{
        subject = "Physics"
        topic = "Mechanics"
        duration = 45
        date = "2025-10-19"
        notes = "Bob's physics study session"
    } | ConvertTo-Json
    
    $bobHeaders = @{
        Authorization = "Bearer $bobToken"
    }
    
    $bobLog = Invoke-RestMethod -Uri "http://localhost:8080/api/logs" -Method Post -Body $bobLogBody -ContentType "application/json" -Headers $bobHeaders
    Write-Host "Success: Study log created for Bob!" -ForegroundColor Green
    Write-Host "  Subject: $($bobLog.subject)" -ForegroundColor Cyan
    Write-Host "  Topic: $($bobLog.topic)" -ForegroundColor Cyan
    Write-Host "  User ID: $($bobLog.userId)" -ForegroundColor Cyan
} catch {
    Write-Host "Error: Failed to create log for Bob" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Step 5: Verify Alice only sees her logs
Write-Host "`n5. Verifying Alice's logs..." -ForegroundColor Yellow
try {
    $aliceHeaders = @{
        Authorization = "Bearer $aliceToken"
    }
    
    $aliceLogs = Invoke-RestMethod -Uri "http://localhost:8080/api/logs" -Method Get -Headers $aliceHeaders
    Write-Host "Alice's logs count: $($aliceLogs.Count)" -ForegroundColor Cyan
    
    foreach ($log in $aliceLogs) {
        Write-Host "  - $($log.subject): $($log.topic) (User: $($log.userId))" -ForegroundColor Cyan
    }
    
    if ($aliceLogs.Count -eq 1 -and $aliceLogs[0].subject -eq "Mathematics") {
        Write-Host "Success: Alice sees only her Mathematics log!" -ForegroundColor Green
    } else {
        Write-Host "Warning: Alice sees unexpected logs!" -ForegroundColor Red
    }
} catch {
    Write-Host "Error: Failed to get Alice's logs" -ForegroundColor Red
}

# Step 6: Verify Bob only sees his logs
Write-Host "`n6. Verifying Bob's logs..." -ForegroundColor Yellow
try {
    $bobHeaders = @{
        Authorization = "Bearer $bobToken"
    }
    
    $bobLogs = Invoke-RestMethod -Uri "http://localhost:8080/api/logs" -Method Get -Headers $bobHeaders
    Write-Host "Bob's logs count: $($bobLogs.Count)" -ForegroundColor Cyan
    
    foreach ($log in $bobLogs) {
        Write-Host "  - $($log.subject): $($log.topic) (User: $($log.userId))" -ForegroundColor Cyan
    }
    
    if ($bobLogs.Count -eq 1 -and $bobLogs[0].subject -eq "Physics") {
        Write-Host "Success: Bob sees only his Physics log!" -ForegroundColor Green
    } else {
        Write-Host "Warning: Bob sees unexpected logs!" -ForegroundColor Red
    }
} catch {
    Write-Host "Error: Failed to get Bob's logs" -ForegroundColor Red
}

# Summary
Write-Host "`n=== Test Summary ===" -ForegroundColor Cyan
Write-Host "If both users see only their own logs, user isolation is working correctly!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Test in the frontend by logging in as Alice and Bob" -ForegroundColor White
Write-Host "2. Verify each user sees only their own data" -ForegroundColor White
Write-Host "3. Test the logout button" -ForegroundColor White
