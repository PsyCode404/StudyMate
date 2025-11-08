# Test AI Advisor with new friendly format
Write-Host "=== Testing New AI Advisor Format ===" -ForegroundColor Cyan

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

# Test AI Advisor with Physics (has 1 session)
Write-Host "`nStep 2: Testing AI Advisor for Physics..." -ForegroundColor Cyan
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$aiRequest = @{
    subject = "Physics"
    mark = 65.0
} | ConvertTo-Json

Write-Host "Calling AI Advisor API (this may take a few seconds)..." -ForegroundColor Yellow

try {
    $aiResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/ai/advice" `
        -Method POST `
        -Headers $headers `
        -Body $aiRequest

    Write-Host "`n=== AI ADVISOR RESPONSE ===" -ForegroundColor Green
    Write-Host "Session Count: $($aiResponse.sessionCount)" -ForegroundColor White
    Write-Host "Total Minutes: $($aiResponse.totalMinutes)" -ForegroundColor White
    Write-Host "`n$($aiResponse.message)" -ForegroundColor White
    Write-Host "`n=== END RESPONSE ===" -ForegroundColor Green
    
} catch {
    Write-Host "`nError: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
