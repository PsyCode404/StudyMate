# AI Advisor Implementation Summary

## Overview
Successfully implemented AI-powered study advice using Google Gemini API.

## Files Created/Modified

### 1. **AiAdviceRequest.java** (DTO)
Location: `src/main/java/com/mohamed/taskflow/dto/AiAdviceRequest.java`
- `subject`: String (required)
- `mark`: Double (required)

### 2. **AiAdviceResponse.java** (DTO)
Location: `src/main/java/com/mohamed/taskflow/dto/AiAdviceResponse.java`
- `message`: String (AI-generated advice)
- `sessionCount`: Integer (number of study sessions)
- `totalMinutes`: Integer (total study time)

### 3. **AiAdvisorService.java** (Service)
Location: `src/main/java/com/mohamed/taskflow/service/AiAdvisorService.java`

**Key Features:**
- **Subject Normalization**: Converts subjects to lowercase and trims whitespace for case-insensitive matching
- **Study Metrics Calculation**:
  - Total sessions count
  - Total study minutes
  - Average session length
  - Number of distinct study days
  - Consistency score (study days / total days span)
- **Gemini API Integration**: Calls Google Gemini Pro model to generate personalized advice
- **Error Handling**: Graceful fallback if API fails

**Methods:**
- `generateAdvice(userId, subject, mark)`: Main method that orchestrates the entire flow
- `normalizeSubject(subject)`: Normalizes subject strings for matching
- `calculateConsistencyScore(studyDates)`: Calculates study consistency
- `buildPrompt(...)`: Constructs the prompt for Gemini API
- `callGeminiApi(prompt)`: Makes HTTP request to Gemini API
- `getTotalSessions(userId, subject)`: Helper to get session count
- `getTotalMinutes(userId, subject)`: Helper to get total minutes

### 4. **AiAdvisorController.java** (Controller)
Location: `src/main/java/com/mohamed/taskflow/controller/AiAdvisorController.java`

**Endpoint:** `POST /api/ai/advice`

**Request Body:**
```json
{
  "subject": "Mathematics",
  "mark": 75.5
}
```

**Response:**
```json
{
  "message": "AI-generated advice text...",
  "sessionCount": 10,
  "totalMinutes": 450
}
```

### 5. **RestTemplateConfig.java** (Configuration)
Location: `src/main/java/com/mohamed/taskflow/config/RestTemplateConfig.java`
- Provides RestTemplate bean for HTTP requests

### 6. **application.properties** (Updated)
Added Gemini API key configuration:
```properties
gemini.api.key=AIzaSyCvkGfGCVPi0068NSMy3W_FIi8EIwZsQGI
```

### 7. **test-ai-advisor.ps1** (Test Script)
PowerShell script to test the AI Advisor endpoint

## How It Works

1. **User Request**: Frontend sends subject and mark to `/api/ai/advice`
2. **Subject Normalization**: Service normalizes the subject (lowercase, trim)
3. **Data Retrieval**: Fetches all study logs for the user and filters by normalized subject
4. **Metrics Calculation**: Computes study statistics (sessions, minutes, consistency)
5. **Prompt Construction**: Builds a detailed prompt with all metrics
6. **Gemini API Call**: Sends prompt to Google Gemini Pro model
7. **Response Processing**: Extracts AI-generated advice from API response
8. **Return**: Sends advice along with metrics back to frontend

## Gemini API Prompt Format

```
Subject: {subject}
Mark received: {mark}
Total study sessions: {totalSessions}
Total study time (minutes): {totalMinutes}
Average study session (minutes): {averageSessionLength}
Study consistency score (0-1): {consistencyScore}

Based on this data, analyze what the student likely did well, 
what went wrong, and provide 3 concrete personalized recommendations to improve.
Keep the tone supportive and constructive.
Return response as plain text.
```

## Testing

1. **Start Backend**: Run the Spring Boot application
2. **Run Test Script**: Execute `test-ai-advisor.ps1` in PowerShell
3. **Manual Test**: Use Postman or curl:

```bash
# Login first
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Use the token from login response
curl -X POST http://localhost:8080/api/ai/advice \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"subject":"Mathematics","mark":75.5}'
```

## Security Notes

⚠️ **Important**: The API key is currently hardcoded in `application.properties`. For production:
1. Move to environment variables
2. Use Spring Cloud Config or AWS Secrets Manager
3. Never commit API keys to version control

## Next Steps

1. Rebuild Maven project to resolve classpath warnings
2. Test the endpoint with real data
3. Add frontend integration
4. Consider caching AI responses to reduce API calls
5. Add rate limiting to prevent API quota exhaustion
6. Implement error logging and monitoring

## Dependencies

All required dependencies are already in your project:
- Spring Web (for RestTemplate)
- Spring Data MongoDB
- Lombok
- Jakarta Validation

No additional Maven dependencies needed!
