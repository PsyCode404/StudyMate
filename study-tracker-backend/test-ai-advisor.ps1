# Test AI Advisor Endpoint
# Make sure the backend is running on port 8080

# First, login to get JWT token
Write-Host "Step 1: Logging in..." -ForegroundColor Cyan
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"username":"testuser","password":"password123"}'

$token = $loginResponse.token
Write-Host "Login successful! Token: $($token.Substring(0,20))..." -ForegroundColor Green

# Test AI Advisor endpoint
Write-Host "`nStep 2: Testing AI Advisor endpoint..." -ForegroundColor Cyan
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$aiRequest = @{
    subject = "Mathematics"
    mark = 75.5
} | ConvertTo-Json

Write-Host "Request body: $aiRequest" -ForegroundColor Yellow

try {
    $aiResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/ai/advice" `
        -Method POST `
        -Headers $headers `
        -Body $aiRequest

    Write-Host "`nAI Advisor Response:" -ForegroundColor Green
    Write-Host "===================" -ForegroundColor Green
    Write-Host "Message: $($aiResponse.message)" -ForegroundColor White
    Write-Host "Session Count: $($aiResponse.sessionCount)" -ForegroundColor White
    Write-Host "Total Minutes: $($aiResponse.totalMinutes)" -ForegroundColor White
    Write-Host "===================" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
}
