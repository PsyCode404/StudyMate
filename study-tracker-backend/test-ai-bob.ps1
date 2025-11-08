# AI Advisor Test with existing user bob@test.com
Write-Host "=== AI Advisor Test with Bob ===" -ForegroundColor Cyan

# Step 1: Login with Bob
Write-Host "`nStep 1: Logging in as bob..." -ForegroundColor Cyan
$loginBody = @{
    usernameOrEmail = "bob@test.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody
    
    $token = $loginResponse.token
    Write-Host "Login successful! Token: $($token.Substring(0,20))..." -ForegroundColor Green
} catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

# Step 2: Add some study logs for Mathematics (if needed)
Write-Host "`nStep 2: Adding study logs for Mathematics..." -ForegroundColor Cyan
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$studyLogs = @(
    @{ subject = "Mathematics"; topic = "Algebra"; duration = 60; date = "2024-11-01"; notes = "Quadratic equations" },
    @{ subject = "mathematics"; topic = "Calculus"; duration = 45; date = "2024-11-02"; notes = "Derivatives" },
    @{ subject = "MATH"; topic = "Geometry"; duration = 90; date = "2024-11-03"; notes = "Triangles" },
    @{ subject = "Math"; topic = "Statistics"; duration = 30; date = "2024-11-05"; notes = "Mean and median" },
    @{ subject = "Mathematics"; topic = "Trigonometry"; duration = 75; date = "2024-11-06"; notes = "Sin, cos, tan" }
)

foreach ($log in $studyLogs) {
    try {
        $logBody = $log | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "http://localhost:8080/api/study-logs" `
            -Method POST `
            -Headers $headers `
            -Body $logBody
        Write-Host "  Added: $($log.topic) - $($log.duration) mins" -ForegroundColor Gray
    } catch {
        Write-Host "  Skipped: $($log.topic) (may already exist)" -ForegroundColor Yellow
    }
}

Write-Host "Study logs ready!" -ForegroundColor Green

# Step 3: Test AI Advisor endpoint
Write-Host "`nStep 3: Testing AI Advisor endpoint..." -ForegroundColor Cyan
$aiRequest = @{
    subject = "Mathematics"
    mark = 75.5
} | ConvertTo-Json

Write-Host "Request: $aiRequest" -ForegroundColor Yellow

try {
    Write-Host "`nCalling AI Advisor API (this may take a few seconds)..." -ForegroundColor Yellow
    $aiResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/ai/advice" `
        -Method POST `
        -Headers $headers `
        -Body $aiRequest

    Write-Host "`n=== AI ADVISOR RESPONSE ===" -ForegroundColor Green
    Write-Host "Session Count: $($aiResponse.sessionCount)" -ForegroundColor White
    Write-Host "Total Minutes: $($aiResponse.totalMinutes)" -ForegroundColor White
    Write-Host "`nAI Advice:" -ForegroundColor Cyan
    Write-Host "---" -ForegroundColor Gray
    Write-Host $aiResponse.message -ForegroundColor White
    Write-Host "---" -ForegroundColor Gray
    Write-Host "`n=== TEST COMPLETED SUCCESSFULLY ===" -ForegroundColor Green
} catch {
    Write-Host "`nError calling AI Advisor: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
