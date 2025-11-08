# Complete AI Advisor Test - Register, Login, Add Study Logs, Test AI
Write-Host "=== AI Advisor Complete Test ===" -ForegroundColor Cyan

# Step 1: Register a new user
Write-Host "`nStep 1: Registering new user..." -ForegroundColor Cyan
$registerBody = @{
    username = "aitest_$(Get-Random -Maximum 10000)"
    email = "aitest$(Get-Random -Maximum 10000)@test.com"
    password = "password123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerBody
    
    $token = $registerResponse.token
    Write-Host "Registration successful! Token: $($token.Substring(0,20))..." -ForegroundColor Green
} catch {
    Write-Host "Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Add some study logs for Mathematics
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
        Write-Host "  Failed to add log: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "Study logs added successfully!" -ForegroundColor Green

# Step 3: Test AI Advisor endpoint
Write-Host "`nStep 3: Testing AI Advisor endpoint..." -ForegroundColor Cyan
$aiRequest = @{
    subject = "Mathematics"
    mark = 75.5
} | ConvertTo-Json

Write-Host "Request: $aiRequest" -ForegroundColor Yellow

try {
    $aiResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/ai/advice" `
        -Method POST `
        -Headers $headers `
        -Body $aiRequest

    Write-Host "`n=== AI ADVISOR RESPONSE ===" -ForegroundColor Green
    Write-Host "Session Count: $($aiResponse.sessionCount)" -ForegroundColor White
    Write-Host "Total Minutes: $($aiResponse.totalMinutes)" -ForegroundColor White
    Write-Host "`nAI Advice:" -ForegroundColor Cyan
    Write-Host $aiResponse.message -ForegroundColor White
    Write-Host "=========================" -ForegroundColor Green
} catch {
    Write-Host "Error calling AI Advisor: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
