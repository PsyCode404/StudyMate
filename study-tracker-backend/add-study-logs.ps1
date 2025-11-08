# Add study logs for Bob
Write-Host "Adding study logs for Bob..." -ForegroundColor Cyan

# Login
$loginBody = @{
    usernameOrEmail = "bob@test.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $loginBody

$token = $loginResponse.token
Write-Host "Logged in successfully!" -ForegroundColor Green

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Add Mathematics study logs
$studyLogs = @(
    @{ subject = "Mathematics"; topic = "Algebra - Quadratic Equations"; duration = 60; date = "2024-11-01"; notes = "Practiced solving quadratic equations" },
    @{ subject = "mathematics"; topic = "Calculus - Derivatives"; duration = 45; date = "2024-11-02"; notes = "Learned derivative rules" },
    @{ subject = "MATH"; topic = "Geometry - Triangles"; duration = 90; date = "2024-11-03"; notes = "Studied triangle properties" },
    @{ subject = "Math"; topic = "Statistics - Mean and Median"; duration = 30; date = "2024-11-05"; notes = "Calculated averages" },
    @{ subject = "Mathematics"; topic = "Trigonometry - Basic Functions"; duration = 75; date = "2024-11-06"; notes = "Sin, cos, tan functions" }
)

$successCount = 0
foreach ($log in $studyLogs) {
    try {
        $logBody = $log | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "http://localhost:8080/api/study-logs" `
            -Method POST `
            -Headers $headers `
            -Body $logBody
        Write-Host "  Added: $($log.topic) - $($log.duration) mins" -ForegroundColor Green
        $successCount++
    } catch {
        Write-Host "  Failed: $($log.topic)" -ForegroundColor Red
    }
}

Write-Host "`nAdded $successCount study logs successfully!" -ForegroundColor Cyan
