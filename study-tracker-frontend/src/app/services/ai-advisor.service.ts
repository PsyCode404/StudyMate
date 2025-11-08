import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/**
 * AI Advice Response Model
 * Matches backend AiAdviceResponse DTO
 */
export interface AiAdviceResponse {
  message: string;
  sessionCount: number;
  totalMinutes: number;
}

/**
 * AI Advice Request Model
 * Matches backend AiAdviceRequest DTO
 */
export interface AiAdviceRequest {
  subject: string;
  mark: number;
}

/**
 * AI Advisor Service
 * Handles communication with the AI Advisor backend endpoint
 * Integrates with Google Gemini API via Spring Boot backend
 * Base URL: http://localhost:8080/api/ai
 */
@Injectable({
  providedIn: 'root'
})
export class AiAdvisorService {
  
  private readonly apiUrl = `${environment.apiUrl}/ai`;
  private readonly REQUEST_TIMEOUT = 30000; // 30 seconds for AI processing
  private readonly RETRY_ATTEMPTS = 2;      // Retry failed requests

  constructor(private http: HttpClient) { }

  /**
   * Request AI-powered study advice
   * POST /api/ai/advice
   * 
   * Backend automatically:
   * - Extracts user ID from JWT token
   * - Fetches user's study logs for the subject
   * - Calculates study metrics
   * - Calls Google Gemini API
   * - Returns personalized advice
   * 
   * @param subject - Subject name (e.g., "Mathematics")
   * @param mark - Student's mark/score
   * @returns Observable<AiAdviceResponse> - AI-generated advice with metrics
   */
  requestAdvice(subject: string, mark: number): Observable<AiAdviceResponse> {
    const request: AiAdviceRequest = {
      subject: subject.trim(),
      mark: mark
    };

    return this.http.post<AiAdviceResponse>(`${this.apiUrl}/advice`, request).pipe(
      timeout(this.REQUEST_TIMEOUT),
      retry(this.RETRY_ATTEMPTS),
      catchError(this.handleError)
    );
  }

  /**
   * Error handler with user-friendly messages
   * Handles common error scenarios:
   * - Network errors
   * - Timeout errors
   * - Rate limiting (429)
   * - Server errors (500)
   * - Authentication errors (401)
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred. Please try again.';

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = 'Network error. Please check your internet connection.';
      console.error('Client-side error:', error.error.message);
    } else {
      // Backend error
      console.error(`Backend returned code ${error.status}:`, error.error);
      
      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to the server. Please check your connection.';
          break;
        case 401:
          errorMessage = 'Your session has expired. Please log in again.';
          break;
        case 429:
          errorMessage = 'Too many requests. Please wait a moment and try again.';
          break;
        case 500:
          errorMessage = 'Server error. Our AI service is temporarily unavailable.';
          break;
        case 504:
          errorMessage = 'Request timeout. The AI is taking longer than expected. Please try again.';
          break;
        default:
          if (error.error?.message) {
            errorMessage = error.error.message;
          }
      }
    }

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Future enhancement: Cache support
   * Can be implemented to cache advice responses
   * to reduce API calls and improve performance
   * 
   * Potential implementation:
   * - Cache key: `${subject}-${mark}`
   * - TTL: 1 hour
   * - Clear cache on new study log creation
   */
  // TODO: Add caching mechanism in future iteration
}
