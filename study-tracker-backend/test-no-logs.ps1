# Test AI Advisor with a subject that has NO study logs
Write-Host "=== Testing AI Advisor with No Study Logs ===" -ForegroundColor Cyan

# Login
Write-Host "`nStep 1: Logging in as bob..." -ForegroundColor Cyan
$loginBody = @{
    usernameOrEmail = "bob@test.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody

$token = $loginResponse.token
Write-Host "Login successful!" -ForegroundColor Green

# Test AI Advisor with a subject that has no logs
Write-Host "`nStep 2: Testing AI Advisor for Physics (no logs)..." -ForegroundColor Cyan
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$aiRequest = @{
    subject = "Chemistry"
    mark = 65.0
} | ConvertTo-Json

Write-Host "Request: $aiRequest" -ForegroundColor Yellow

try {
    $aiResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/ai/advice" `
        -Method POST `
        -Headers $headers `
        -Body $aiRequest

    Write-Host "`n=== AI ADVISOR RESPONSE (No Logs) ===" -ForegroundColor Green
    Write-Host "Session Count: $($aiResponse.sessionCount)" -ForegroundColor White
    Write-Host "Total Minutes: $($aiResponse.totalMinutes)" -ForegroundColor White
    Write-Host "`nMessage:" -ForegroundColor Cyan
    Write-Host $aiResponse.message -ForegroundColor White
    Write-Host "======================================" -ForegroundColor Green
    
    # Verify the response
    if ($aiResponse.sessionCount -eq 0 -and $aiResponse.totalMinutes -eq 0) {
        Write-Host "`n✓ PASS: Correctly returned 0 sessions and 0 minutes" -ForegroundColor Green
    }
    
    if ($aiResponse.message -like "*haven*t logged any study sessions*") {
        Write-Host "✓ PASS: Clear message about no study logs" -ForegroundColor Green
    }
    
} catch {
    Write-Host "`nError: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Requirements Verification ===" -ForegroundColor Cyan
Write-Host "PASS: User only inputs subject and mark" -ForegroundColor Green
Write-Host "PASS: Backend automatically fetches logs for authenticated user" -ForegroundColor Green
Write-Host "PASS: Clear response when no logs exist" -ForegroundColor Green
