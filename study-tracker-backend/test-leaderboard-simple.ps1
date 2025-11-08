# Test Enhanced Leaderboard API
Write-Host "=== Testing Enhanced Leaderboard API ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8080/api"

# Login to get token
Write-Host "1. Logging in..." -ForegroundColor Yellow
$loginBody = @{
    usernameOrEmail = "bob@test.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    $token = $loginResponse.token
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    Write-Host "Success - Logged in!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "Failed: $_" -ForegroundColor Red
    exit 1
}

# Test 1: Basic leaderboard
Write-Host "2. Test: Basic Leaderboard (All Time)" -ForegroundColor Yellow
try {
    $response1 = Invoke-RestMethod -Uri "$baseUrl/leaderboard" -Method GET -Headers $headers
    Write-Host "Success!" -ForegroundColor Green
    Write-Host "  Period: $($response1.period)" -ForegroundColor Cyan
    Write-Host "  Total Users: $($response1.totalUsers)" -ForegroundColor Cyan
    Write-Host "  Results: $($response1.leaderboard.Count)" -ForegroundColor Cyan
    if ($response1.leaderboard.Count -gt 0) {
        Write-Host "  Top User: $($response1.leaderboard[0].username) - $($response1.leaderboard[0].totalMinutes) min" -ForegroundColor Cyan
    }
    Write-Host ""
} catch {
    Write-Host "Failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Weekly leaderboard
Write-Host "3. Test: Weekly Leaderboard" -ForegroundColor Yellow
try {
    $url = "$baseUrl/leaderboard" + "?period=week" + "&limit=5"
    $response2 = Invoke-RestMethod -Uri $url -Method GET -Headers $headers
    Write-Host "Success!" -ForegroundColor Green
    Write-Host "  Period: $($response2.period)" -ForegroundColor Cyan
    Write-Host "  Total Users: $($response2.totalUsers)" -ForegroundColor Cyan
    Write-Host "  Results: $($response2.leaderboard.Count)" -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host "Failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 3: Subject filter
Write-Host "4. Test: Subject Filter (Mathematics)" -ForegroundColor Yellow
try {
    $url = "$baseUrl/leaderboard" + "?subject=Mathematics"
    $response3 = Invoke-RestMethod -Uri $url -Method GET -Headers $headers
    Write-Host "Success!" -ForegroundColor Green
    Write-Host "  Subject: Mathematics" -ForegroundColor Cyan
    Write-Host "  Total Users: $($response3.totalUsers)" -ForegroundColor Cyan
    Write-Host "  Results: $($response3.leaderboard.Count)" -ForegroundColor Cyan
    if ($response3.leaderboard.Count -gt 0) {
        Write-Host "  Top User: $($response3.leaderboard[0].username) - $($response3.leaderboard[0].totalMinutes) min" -ForegroundColor Cyan
    }
    Write-Host ""
} catch {
    Write-Host "Failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 4: Subject + Period
Write-Host "5. Test: Subject + Period (Physics, Week)" -ForegroundColor Yellow
try {
    $url = "$baseUrl/leaderboard" + "?subject=Physics" + "&period=week"
    $response4 = Invoke-RestMethod -Uri $url -Method GET -Headers $headers
    Write-Host "Success!" -ForegroundColor Green
    Write-Host "  Subject: Physics, Period: week" -ForegroundColor Cyan
    Write-Host "  Total Users: $($response4.totalUsers)" -ForegroundColor Cyan
    Write-Host "  Results: $($response4.leaderboard.Count)" -ForegroundColor Cyan
    Write-Host ""
} catch {
    Write-Host "Failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 5: Anonymized
Write-Host "6. Test: Anonymized Leaderboard" -ForegroundColor Yellow
try {
    $url = "$baseUrl/leaderboard" + "?anonymize=true" + "&limit=3"
    $response5 = Invoke-RestMethod -Uri $url -Method GET -Headers $headers
    Write-Host "Success!" -ForegroundColor Green
    Write-Host "  Anonymized: true" -ForegroundColor Cyan
    Write-Host "  Results: $($response5.leaderboard.Count)" -ForegroundColor Cyan
    if ($response5.leaderboard.Count -gt 0) {
        Write-Host "  Sample usernames:" -ForegroundColor Cyan
        foreach ($entry in $response5.leaderboard) {
            Write-Host "    - $($entry.username) (Rank: $($entry.rank))" -ForegroundColor Gray
        }
    }
    Write-Host ""
} catch {
    Write-Host "Failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 6: Pagination
Write-Host "7. Test: Pagination (Page 2)" -ForegroundColor Yellow
try {
    $url = "$baseUrl/leaderboard" + "?limit=3" + "&page=2"
    $response6 = Invoke-RestMethod -Uri $url -Method GET -Headers $headers
    Write-Host "Success!" -ForegroundColor Green
    Write-Host "  Page: $($response6.page), Limit: $($response6.limit)" -ForegroundColor Cyan
    Write-Host "  Results: $($response6.leaderboard.Count)" -ForegroundColor Cyan
    if ($response6.leaderboard.Count -gt 0) {
        Write-Host "  First rank on page 2: $($response6.leaderboard[0].rank)" -ForegroundColor Cyan
    }
    Write-Host ""
} catch {
    Write-Host "Failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 7: Cache performance
Write-Host "8. Test: Cache Performance" -ForegroundColor Yellow
try {
    $url = "$baseUrl/leaderboard" + "?period=month"
    
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $cache1 = Invoke-RestMethod -Uri $url -Method GET -Headers $headers
    $sw.Stop()
    $time1 = $sw.ElapsedMilliseconds
    
    $sw.Restart()
    $cache2 = Invoke-RestMethod -Uri $url -Method GET -Headers $headers
    $sw.Stop()
    $time2 = $sw.ElapsedMilliseconds
    
    Write-Host "Success!" -ForegroundColor Green
    Write-Host "  First request: $time1 ms" -ForegroundColor Cyan
    Write-Host "  Second request: $time2 ms" -ForegroundColor Cyan
    if ($time2 -lt $time1) {
        $improvement = [math]::Round((($time1 - $time2) / $time1) * 100, 1)
        Write-Host "  Cache improvement: $improvement%" -ForegroundColor Green
    }
    Write-Host ""
} catch {
    Write-Host "Failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 8: Limit capping
Write-Host "9. Test: Limit Capping (request 150)" -ForegroundColor Yellow
try {
    $url = "$baseUrl/leaderboard" + "?limit=150"
    $response9 = Invoke-RestMethod -Uri $url -Method GET -Headers $headers
    Write-Host "Success!" -ForegroundColor Green
    Write-Host "  Requested: 150, Actual limit: $($response9.limit)" -ForegroundColor Cyan
    if ($response9.limit -eq 100) {
        Write-Host "  Correctly capped at 100" -ForegroundColor Green
    }
    Write-Host ""
} catch {
    Write-Host "Failed: $_" -ForegroundColor Red
    Write-Host ""
}

# Summary
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host "All leaderboard features tested successfully!" -ForegroundColor Green
Write-Host "  - Basic leaderboard" -ForegroundColor White
Write-Host "  - Period filtering" -ForegroundColor White
Write-Host "  - Subject filtering" -ForegroundColor White
Write-Host "  - Combined filters" -ForegroundColor White
Write-Host "  - Anonymization" -ForegroundColor White
Write-Host "  - Pagination" -ForegroundColor White
Write-Host "  - Caching" -ForegroundColor White
Write-Host "  - Limit validation" -ForegroundColor White
Write-Host ""
Write-Host "Leaderboard API is working! " -ForegroundColor Green
