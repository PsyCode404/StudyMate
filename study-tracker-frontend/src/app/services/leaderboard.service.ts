import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/**
 * Leaderboard Entry Interface
 */
export interface LeaderboardEntry {
  userId: string;
  username: string;
  totalMinutes: number;
  sessionCount: number;
  avgMinutesPerSession: number;
  rank: number;
}

/**
 * Leaderboard Response Interface
 */
export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  period: string;
  page: number;
  limit: number;
  totalUsers: number;
  cached?: boolean;
}

/**
 * Study Log Interface
 */
export interface StudyLog {
  id: string;
  subject: string;
  duration: number;
  date: Date;
  userId: string;
}

/**
 * Leaderboard Service
 * Handles API calls to the leaderboard endpoint
 */
@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  
  private apiUrl = `${environment.apiUrl}/leaderboard`;

  constructor(private http: HttpClient) {}

  /**
   * Get leaderboard with filters
   * 
   * @param period Time period filter: 'all', 'month', 'week'
   * @param subject Optional subject filter
   * @param limit Number of results per page
   * @param page Page number
   * @param anonymize Whether to anonymize usernames
   * @returns Observable of LeaderboardResponse
   */
  getLeaderboard(
    period: string = 'all',
    subject?: string,
    limit: number = 10,
    page: number = 1,
    anonymize: boolean = false
  ): Observable<LeaderboardResponse> {
    
    let params = new HttpParams()
      .set('period', period)
      .set('limit', limit.toString())
      .set('page', page.toString())
      .set('anonymize', anonymize.toString());
    
    if (subject && subject !== 'all') {
      params = params.set('subject', subject);
    }

    return this.http.get<LeaderboardResponse>(this.apiUrl, { params }).pipe(
      map(response => {
        // Ensure all entries have required fields
        response.leaderboard = response.leaderboard.map(entry => ({
          ...entry,
          totalMinutes: entry.totalMinutes || 0,
          sessionCount: entry.sessionCount || 0,
          avgMinutesPerSession: entry.avgMinutesPerSession || 0
        }));
        return response;
      }),
      catchError(error => {
        console.error('Error fetching leaderboard:', error);
        return throwError(() => new Error('Failed to load leaderboard. Please try again.'));
      })
    );
  }

  /**
   * Convert minutes to hours and minutes format
   * 
   * @param minutes Total minutes
   * @returns Formatted string like "2h 30m"
   */
  formatMinutesToHours(minutes: number): string {
    if (!minutes || minutes === 0) return '0m';
    
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  }

  /**
   * Get initials from username
   * 
   * @param username User's display name
   * @returns Two-letter initials
   */
  getInitials(username: string): string {
    if (!username) return 'UN';
    
    const parts = username.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  }

  /**
   * Get avatar color based on username
   * 
   * @param username User's display name
   * @returns Tailwind color class
   */
  getAvatarColor(username: string): string {
    const colors = [
      'bg-violet-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-purple-500',
      'bg-cyan-500'
    ];
    
    if (!username) return colors[0];
    
    const hash = username.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  }

  /**
   * Get user's recent study sessions
   * 
   * @param userId User ID
   * @param limit Number of sessions to fetch
   * @returns Observable of study logs
   */
  getUserSessions(userId: string, limit: number = 5): Observable<StudyLog[]> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('limit', limit.toString());

    return this.http.get<StudyLog[]>(`${environment.apiUrl}/study-logs`, { params }).pipe(
      catchError(error => {
        console.error('Error fetching user sessions:', error);
        return throwError(() => new Error('Failed to load user sessions'));
      })
    );
  }

  /**
   * Export leaderboard to CSV
   * 
   * @param leaderboard Leaderboard entries
   * @param filename CSV filename
   */
  exportToCSV(leaderboard: LeaderboardEntry[], filename: string = 'leaderboard.csv'): void {
    if (!leaderboard || leaderboard.length === 0) {
      console.warn('No data to export');
      return;
    }

    // CSV headers
    const headers = ['Rank', 'Username', 'Total Time (minutes)', 'Total Time', 'Sessions', 'Avg Session (minutes)', 'Avg Session'];
    
    // CSV rows
    const rows = leaderboard.map(entry => [
      entry.rank.toString(),
      entry.username,
      entry.totalMinutes.toString(),
      this.formatMinutesToHours(entry.totalMinutes),
      entry.sessionCount.toString(),
      entry.avgMinutesPerSession.toFixed(1),
      this.formatMinutesToHours(entry.avgMinutesPerSession)
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}
