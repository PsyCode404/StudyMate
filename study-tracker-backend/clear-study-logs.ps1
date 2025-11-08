# Clear Study Logs Script
# Deletes all study logs from MongoDB to start fresh with user-specific data

Write-Host "`n=== Clearing Study Logs ===" -ForegroundColor Cyan

try {
    # Delete all study logs
    Write-Host "`nDeleting all study logs..." -ForegroundColor Yellow
    $result = mongosh --quiet --eval "use studylog; db.study_logs.deleteMany({})"
    
    Write-Host "Success: All study logs deleted!" -ForegroundColor Green
    
    # Verify deletion
    Write-Host "`nVerifying deletion..." -ForegroundColor Yellow
    $count = mongosh --quiet --eval "use studylog; db.study_logs.count()"
    Write-Host "Remaining logs: $count" -ForegroundColor Cyan
    
    if ($count -eq "0") {
        Write-Host "`nDatabase is clean! Ready for user-specific data." -ForegroundColor Green
    }
    
} catch {
    Write-Host "`nError: Failed to clear study logs" -ForegroundColor Red
    Write-Host "Make sure MongoDB is running on localhost:27017" -ForegroundColor Yellow
    Write-Host "Error details: $_" -ForegroundColor Red
}

Write-Host "`n=== Done ===" -ForegroundColor Cyan
