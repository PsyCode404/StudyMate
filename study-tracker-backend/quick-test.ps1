# Quick Test - User Isolation
Write-Host "`n=== Quick User Isolation Test ===" -ForegroundColor Cyan

# Login Alice
Write-Host "`n1. Logging in as Alice..." -ForegroundColor Yellow
$aliceLogin = @{usernameOrEmail='alice';password='password123'} | ConvertTo-Json
$aliceResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/login' -Method Post -Body $aliceLogin -ContentType 'application/json'
$aliceToken = $aliceResp.token
Write-Host "Alice logged in! Token: $($aliceToken.Substring(0,20))..." -ForegroundColor Green

# Create log for Alice
Write-Host "`n2. Creating log for Alice..." -ForegroundColor Yellow
$aliceLog = @{subject='Math';topic='Algebra';duration=30;date='2025-10-19'} | ConvertTo-Json
$aliceHeaders = @{Authorization="Bearer $aliceToken"}
$created = Invoke-RestMethod -Uri 'http://localhost:8080/api/logs' -Method Post -Body $aliceLog -ContentType 'application/json' -Headers $aliceHeaders
Write-Host "Created: $($created.subject) - $($created.topic) (userId: $($created.userId))" -ForegroundColor Green

# Get Alice's logs
Write-Host "`n3. Getting Alice's logs..." -ForegroundColor Yellow
$aliceLogs = Invoke-RestMethod -Uri 'http://localhost:8080/api/logs' -Headers $aliceHeaders
Write-Host "Alice has $($aliceLogs.Count) log(s)" -ForegroundColor Cyan
foreach($log in $aliceLogs) {
    Write-Host "  - $($log.subject): $($log.topic)" -ForegroundColor White
}

# Login Bob
Write-Host "`n4. Logging in as Bob..." -ForegroundColor Yellow
$bobLogin = @{usernameOrEmail='bob';password='password123'} | ConvertTo-Json
$bobResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/auth/login' -Method Post -Body $bobLogin -ContentType 'application/json'
$bobToken = $bobResp.token
Write-Host "Bob logged in! Token: $($bobToken.Substring(0,20))..." -ForegroundColor Green

# Create log for Bob
Write-Host "`n5. Creating log for Bob..." -ForegroundColor Yellow
$bobLog = @{subject='Physics';topic='Mechanics';duration=45;date='2025-10-19'} | ConvertTo-Json
$bobHeaders = @{Authorization="Bearer $bobToken"}
$created2 = Invoke-RestMethod -Uri 'http://localhost:8080/api/logs' -Method Post -Body $bobLog -ContentType 'application/json' -Headers $bobHeaders
Write-Host "Created: $($created2.subject) - $($created2.topic) (userId: $($created2.userId))" -ForegroundColor Green

# Get Bob's logs
Write-Host "`n6. Getting Bob's logs..." -ForegroundColor Yellow
$bobLogs = Invoke-RestMethod -Uri 'http://localhost:8080/api/logs' -Headers $bobHeaders
Write-Host "Bob has $($bobLogs.Count) log(s)" -ForegroundColor Cyan
foreach($log in $bobLogs) {
    Write-Host "  - $($log.subject): $($log.topic)" -ForegroundColor White
}

# Verify isolation
Write-Host "`n=== VERIFICATION ===" -ForegroundColor Cyan
if ($aliceLogs.Count -gt 0 -and $bobLogs.Count -gt 0) {
    $aliceHasBobsLog = $aliceLogs | Where-Object { $_.subject -eq 'Physics' }
    $bobHasAlicesLog = $bobLogs | Where-Object { $_.subject -eq 'Math' }
    
    if (-not $aliceHasBobsLog -and -not $bobHasAlicesLog) {
        Write-Host "SUCCESS: Users see only their own data!" -ForegroundColor Green
        Write-Host "  - Alice sees only Math" -ForegroundColor Green
        Write-Host "  - Bob sees only Physics" -ForegroundColor Green
    } else {
        Write-Host "FAILED: Data is still shared!" -ForegroundColor Red
    }
} else {
    Write-Host "Test incomplete - check errors above" -ForegroundColor Yellow
}
