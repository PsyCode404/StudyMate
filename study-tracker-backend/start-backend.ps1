# Start Backend with Gemini API Key
# This script sets the environment variable and starts the backend in one command

Write-Host "Setting up environment..." -ForegroundColor Cyan

# Set API key for this session
$env:GEMINI_API_KEY = "AIzaSyC4u8_Z19LlQkHVNv3lKQUa3lwvfBtXbOc"

Write-Host "GEMINI_API_KEY set: $($env:GEMINI_API_KEY.Substring(0,10))..." -ForegroundColor Green
Write-Host "Starting Spring Boot backend..." -ForegroundColor Cyan
Write-Host ""

# Start Maven with the environment variable
mvn spring-boot:run
