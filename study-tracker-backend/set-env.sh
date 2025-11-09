#!/bin/bash
# Set Gemini API Key Environment Variable
# Run this script before starting the Spring Boot application
# Usage: source ./set-env.sh

export GEMINI_API_KEY="AIzaSyC4u8_Z19LlQkHVNv3lKQUa3lwvfBtXbOc"

echo "✓ GEMINI_API_KEY environment variable set successfully!"
echo ""
echo "To verify, run: echo \$GEMINI_API_KEY"
echo ""
echo "Now you can start the backend with: mvn spring-boot:run"
