import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { FocusLog, CreateFocusLogDto, FocusStats } from '../models/focus-log';

@Injectable({
  providedIn: 'root'
})
export class FocusLogService {
  
  private apiUrl = `${environment.apiUrl}/focus-logs`;
  private statsSubject = new BehaviorSubject<FocusStats | null>(null);
  public stats$ = this.statsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all focus logs
   */
  getAllFocusLogs(): Observable<FocusLog[]> {
    return this.http.get<FocusLog[]>(this.apiUrl);
  }

  /**
   * Get focus log by ID
   */
  getFocusLogById(id: string): Observable<FocusLog> {
    return this.http.get<FocusLog>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create new focus log
   */
  createFocusLog(focusLog: CreateFocusLogDto): Observable<FocusLog> {
    return this.http.post<FocusLog>(this.apiUrl, focusLog).pipe(
      tap(() => this.refreshStats())
    );
  }

  /**
   * Update focus log
   */
  updateFocusLog(id: string, focusLog: Partial<FocusLog>): Observable<FocusLog> {
    return this.http.put<FocusLog>(`${this.apiUrl}/${id}`, focusLog).pipe(
      tap(() => this.refreshStats())
    );
  }

  /**
   * Delete focus log
   */
  deleteFocusLog(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refreshStats())
    );
  }

  /**
   * Get focus statistics
   */
  getFocusStats(): Observable<FocusStats> {
    return this.http.get<FocusStats>(`${this.apiUrl}/stats`).pipe(
      tap(stats => this.statsSubject.next(stats))
    );
  }

  /**
   * Get today's focus logs
   */
  getTodayFocusLogs(): Observable<FocusLog[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.http.get<FocusLog[]>(`${this.apiUrl}/date/${today}`);
  }

  /**
   * Refresh statistics
   */
  private refreshStats(): void {
    this.getFocusStats().subscribe();
  }

  /**
   * Calculate stats from logs (client-side fallback)
   */
  calculateStats(logs: FocusLog[]): FocusStats {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter(log => log.date === today);
    
    return {
      totalSessions: logs.length,
      totalWorkSessions: logs.filter(log => log.type === 'work').length,
      totalBreakSessions: logs.filter(log => log.type === 'break').length,
      totalMinutes: logs.reduce((sum, log) => sum + log.duration, 0),
      todaySessions: todayLogs.length,
      currentStreak: this.calculateStreak(logs)
    };
  }

  /**
   * Calculate current streak
   */
  private calculateStreak(logs: FocusLog[]): number {
    if (logs.length === 0) return 0;
    
    const dates = [...new Set(logs.map(log => log.date))].sort().reverse();
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < dates.length; i++) {
      const date = new Date(dates[i]);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (date.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }
}
