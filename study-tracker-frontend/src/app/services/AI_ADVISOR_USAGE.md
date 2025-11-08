# AI Advisor Service - Usage Guide

## Overview

The `AiAdvisorService` connects your Angular frontend to the Spring Boot backend's AI Advisor endpoint, which integrates with Google Gemini API to provide personalized study advice.

## Import & Inject

```typescript
import { AiAdvisorService, AiAdviceResponse } from './services/ai-advisor.service';

@Component({
  // ...
})
export class AiAdvisorPageComponent {
  constructor(private aiAdvisorService: AiAdvisorService) {}
}
```

## Basic Usage

```typescript
export class AiAdvisorPageComponent {
  isLoading = false;
  advice: string = '';
  sessionCount = 0;
  totalMinutes = 0;
  errorMessage = '';

  onAdviceRequest(request: { subject: string; mark: number }): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.aiAdvisorService.requestAdvice(request.subject, request.mark)
      .subscribe({
        next: (response: AiAdviceResponse) => {
          this.advice = response.message;
          this.sessionCount = response.sessionCount;
          this.totalMinutes = response.totalMinutes;
          this.isLoading = false;
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
          this.isLoading = false;
        }
      });
  }
}
```

## Complete Component Example

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiAdvisorService, AiAdviceResponse } from '../../services/ai-advisor.service';
import { AiRequestFormComponent } from '../../components/ai-request-form/ai-request-form.component';

@Component({
  selector: 'app-ai-advisor',
  standalone: true,
  imports: [CommonModule, AiRequestFormComponent],
  template: `
    <div class="container mx-auto p-6">
      <h1 class="text-3xl font-bold mb-6">AI Study Advisor</h1>
      
      <!-- Request Form -->
      <app-ai-request-form
        [markScale]="20"
        [submitting]="isLoading"
        (adviceRequest)="onAdviceRequest($event)">
      </app-ai-request-form>

      <!-- Error Message -->
      <div *ngIf="errorMessage" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-600">{{ errorMessage }}</p>
      </div>

      <!-- AI Response -->
      <div *ngIf="advice" class="mt-6 p-6 bg-white rounded-xl shadow-sm border">
        <div class="flex items-center gap-4 mb-4">
          <div class="text-sm text-gray-600">
            <span class="font-medium">{{ sessionCount }}</span> sessions
          </div>
          <div class="text-sm text-gray-600">
            <span class="font-medium">{{ totalMinutes }}</span> minutes
          </div>
        </div>
        <div class="prose max-w-none" [innerHTML]="advice | markdown"></div>
      </div>
    </div>
  `
})
export class AiAdvisorPageComponent {
  isLoading = false;
  advice = '';
  sessionCount = 0;
  totalMinutes = 0;
  errorMessage = '';

  constructor(private aiAdvisorService: AiAdvisorService) {}

  onAdviceRequest(request: { subject: string; mark: number }): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.advice = '';

    this.aiAdvisorService.requestAdvice(request.subject, request.mark)
      .subscribe({
        next: (response: AiAdviceResponse) => {
          this.advice = response.message;
          this.sessionCount = response.sessionCount;
          this.totalMinutes = response.totalMinutes;
          this.isLoading = false;
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
          this.isLoading = false;
        }
      });
  }
}
```

## API Details

### Method: `requestAdvice(subject: string, mark: number)`

**Parameters:**
- `subject` (string) - Subject name (e.g., "Mathematics", "Physics")
- `mark` (number) - Student's score/mark

**Returns:**
- `Observable<AiAdviceResponse>`

**Response Model:**
```typescript
interface AiAdviceResponse {
  message: string;        // AI-generated advice (markdown formatted)
  sessionCount: number;   // Number of study sessions
  totalMinutes: number;   // Total study time in minutes
}
```

## Features

✅ **Automatic Authentication** - JWT token sent automatically via HTTP interceptor  
✅ **Retry Logic** - Automatically retries failed requests (2 attempts)  
✅ **Timeout Handling** - 30-second timeout for AI processing  
✅ **Error Handling** - User-friendly error messages for common scenarios  
✅ **Type Safety** - Full TypeScript support with interfaces  

## Error Handling

The service handles these error scenarios:

| Error | User Message |
|-------|-------------|
| Network error | "Network error. Please check your internet connection." |
| 401 Unauthorized | "Your session has expired. Please log in again." |
| 429 Rate Limit | "Too many requests. Please wait a moment and try again." |
| 500 Server Error | "Server error. Our AI service is temporarily unavailable." |
| 504 Timeout | "Request timeout. The AI is taking longer than expected." |

## Backend Integration

The service communicates with:
- **Endpoint:** `POST /api/ai/advice`
- **Authentication:** JWT Bearer token (automatic)
- **Request:** `{ subject: string, mark: number }`
- **Response:** `{ message: string, sessionCount: number, totalMinutes: number }`

Backend automatically:
1. Extracts user ID from JWT
2. Fetches user's study logs for the subject
3. Calculates study metrics
4. Calls Google Gemini API
5. Returns personalized advice

## Future Enhancements

- **Caching:** Cache responses to reduce API calls
- **Offline Support:** Queue requests when offline
- **History:** Save advice history for later review
- **Export:** Export advice as PDF/text

## Testing

Run unit tests:
```bash
ng test --include='**/ai-advisor.service.spec.ts'
```

## Notes

- The service uses a 30-second timeout (AI processing can take time)
- Requests are automatically retried twice on failure
- Subject names are automatically trimmed
- All errors are caught and converted to user-friendly messages
