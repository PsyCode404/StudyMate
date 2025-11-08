import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { StudyLog, CreateStudyLogDto, UpdateStudyLogDto } from '../models/study-log';

/**
 * StudyLogService
 * Handles all HTTP communication with the Spring Boot backend
 * Base URL: http://localhost:8080/api/logs
 */
@Injectable({
  providedIn: 'root'
})
export class StudyLogService {
  
  private readonly apiUrl = `${environment.apiUrl}/logs`;

  constructor(private http: HttpClient) { }

  /**
   * Get all study logs
   * GET /api/logs
   * @returns Observable<StudyLog[]>
   */
  getAllStudyLogs(): Observable<StudyLog[]> {
    return this.http.get<StudyLog[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get a single study log by ID
   * GET /api/logs/{id}
   * @param id - Study log ID
   * @returns Observable<StudyLog>
   */
  getStudyLogById(id: string): Observable<StudyLog> {
    return this.http.get<StudyLog>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Create a new study log
   * POST /api/logs
   * @param studyLog - Study log data (without id)
   * @returns Observable<StudyLog>
   */
  createStudyLog(studyLog: CreateStudyLogDto): Observable<StudyLog> {
    return this.http.post<StudyLog>(this.apiUrl, studyLog).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing study log
   * PUT /api/logs/{id}
   * @param id - Study log ID
   * @param studyLog - Updated study log data
   * @returns Observable<StudyLog>
   */
  updateStudyLog(id: string, studyLog: UpdateStudyLogDto): Observable<StudyLog> {
    return this.http.put<StudyLog>(`${this.apiUrl}/${id}`, studyLog).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete a study log
   * DELETE /api/logs/{id}
   * @param id - Study log ID
   * @returns Observable<void>
   */
  deleteStudyLog(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get study logs filtered by subject
   * GET /api/logs/by-subject?subject={subject}
   * @param subject - Subject name to filter by
   * @returns Observable<StudyLog[]>
   */
  getStudyLogsBySubject(subject: string): Observable<StudyLog[]> {
    const params = new HttpParams().set('subject', subject);
    return this.http.get<StudyLog[]>(`${this.apiUrl}/by-subject`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get study logs within a date range
   * GET /api/logs/between?start={start}&end={end}
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Observable<StudyLog[]>
   */
  getStudyLogsBetweenDates(startDate: string, endDate: string): Observable<StudyLog[]> {
    const params = new HttpParams()
      .set('start', startDate)
      .set('end', endDate);
    return this.http.get<StudyLog[]>(`${this.apiUrl}/between`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Calculate total study time for all logs
   * @param logs - Array of study logs
   * @returns Total duration in minutes
   */
  calculateTotalDuration(logs: StudyLog[]): number {
    return logs.reduce((total, log) => total + log.duration, 0);
  }

  /**
   * Group study logs by subject
   * @param logs - Array of study logs
   * @returns Map of subject to logs
   */
  groupBySubject(logs: StudyLog[]): Map<string, StudyLog[]> {
    return logs.reduce((map, log) => {
      const subject = log.subject;
      if (!map.has(subject)) {
        map.set(subject, []);
      }
      map.get(subject)!.push(log);
      return map;
    }, new Map<string, StudyLog[]>());
  }

  /**
   * Error handler for HTTP requests
   * @param error - HTTP error response
   * @returns Observable that throws an error
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error (${error.status}): ${error.message}`;
      
      // Handle specific error cases
      if (error.status === 404) {
        errorMessage = 'Study log not found';
      } else if (error.status === 400) {
        errorMessage = 'Invalid data provided';
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to the server. Please check if the backend is running.';
      }
    }
    
    console.error('StudyLogService Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
