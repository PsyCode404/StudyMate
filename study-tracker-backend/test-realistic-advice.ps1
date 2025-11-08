# Test Realistic AI Advice - Different Performance Levels
Write-Host "=== Testing Realistic AI Advice ===" -ForegroundColor Cyan

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
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "Logged in successfully!" -ForegroundColor Green
Write-Host ""

# Test 1: Failing Grade (1/20)
Write-Host "Test 1: FAILING GRADE (1/20)" -ForegroundColor Red
Write-Host "Expected: Honest, urgent advice about critical situation" -ForegroundColor Yellow
$request1 = @{ subject = "Mathematics"; mark = 1 } | ConvertTo-Json
$response1 = Invoke-RestMethod -Uri "http://localhost:8080/api/ai/advice" -Method POST -Headers $headers -Body $request1
Write-Host "Response Preview:" -ForegroundColor Cyan
Write-Host $response1.message.Substring(0, [Math]::Min(300, $response1.message.Length)) -ForegroundColor White
Write-Host "..." -ForegroundColor Gray
Write-Host ""
Start-Sleep -Seconds 2

# Test 2: Barely Passing (10/20)
Write-Host "Test 2: BARELY PASSING (10/20)" -ForegroundColor Yellow
Write-Host "Expected: Supportive but clear about need for improvement" -ForegroundColor Yellow
$request2 = @{ subject = "Physics"; mark = 10 } | ConvertTo-Json
$response2 = Invoke-RestMethod -Uri "http://localhost:8080/api/ai/advice" -Method POST -Headers $headers -Body $request2
Write-Host "Response Preview:" -ForegroundColor Cyan
Write-Host $response2.message.Substring(0, [Math]::Min(300, $response2.message.Length)) -ForegroundColor White
Write-Host "..." -ForegroundColor Gray
Write-Host ""
Start-Sleep -Seconds 2

# Test 3: Good Grade (15/20)
Write-Host "Test 3: GOOD GRADE (15/20)" -ForegroundColor Green
Write-Host "Expected: Positive with suggestions for excellence" -ForegroundColor Yellow
$request3 = @{ subject = "Chemistry"; mark = 15 } | ConvertTo-Json
$response3 = Invoke-RestMethod -Uri "http://localhost:8080/api/ai/advice" -Method POST -Headers $headers -Body $request3
Write-Host "Response Preview:" -ForegroundColor Cyan
Write-Host $response3.message.Substring(0, [Math]::Min(300, $response3.message.Length)) -ForegroundColor White
Write-Host "..." -ForegroundColor Gray
Write-Host ""
Start-Sleep -Seconds 2

# Test 4: Excellent Grade (20/20)
Write-Host "Test 4: EXCELLENT GRADE (20/20)" -ForegroundColor Green
Write-Host "Expected: Celebration and advice to maintain excellence" -ForegroundColor Yellow
$request4 = @{ subject = "Biology"; mark = 20 } | ConvertTo-Json
$response4 = Invoke-RestMethod -Uri "http://localhost:8080/api/ai/advice" -Method POST -Headers $headers -Body $request4
Write-Host "Response Preview:" -ForegroundColor Cyan
Write-Host $response4.message.Substring(0, [Math]::Min(300, $response4.message.Length)) -ForegroundColor White
Write-Host "..." -ForegroundColor Gray
Write-Host ""

Write-Host "=== All Tests Complete ===" -ForegroundColor Cyan
Write-Host "The AI should now provide realistic, context-aware advice!" -ForegroundColor Green
