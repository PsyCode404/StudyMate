import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { StudyLog } from '../models/study-log';
import { StudyLogService } from './study-log';

export interface DailyStats {
  date: string;
  hours: number;
  sessions: number;
}

export interface SubjectStats {
  subject: string;
  hours: number;
  sessions: number;
  percentage: number;
}

export interface OverallStats {
  totalSessions: number;
  totalHours: number;
  averageDailyHours: number;
  totalSubjects: number;
  mostStudiedSubject: string;
  currentWeekHours: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor(private studyLogService: StudyLogService) { }

  /**
   * Get overall statistics
   */
  getOverallStats(): Observable<OverallStats> {
    return this.studyLogService.getAllStudyLogs().pipe(
      map(logs => this.calculateOverallStats(logs))
    );
  }

  /**
   * Get daily statistics for the last 7 days
   */
  getWeeklyStats(): Observable<DailyStats[]> {
    return this.studyLogService.getAllStudyLogs().pipe(
      map(logs => this.calculateWeeklyStats(logs))
    );
  }

  /**
   * Get statistics by subject
   */
  getSubjectStats(): Observable<SubjectStats[]> {
    return this.studyLogService.getAllStudyLogs().pipe(
      map(logs => this.calculateSubjectStats(logs))
    );
  }

  /**
   * Calculate overall statistics
   */
  private calculateOverallStats(logs: StudyLog[]): OverallStats {
    if (logs.length === 0) {
      return {
        totalSessions: 0,
        totalHours: 0,
        averageDailyHours: 0,
        totalSubjects: 0,
        mostStudiedSubject: 'N/A',
        currentWeekHours: 0
      };
    }

    const totalMinutes = logs.reduce((sum, log) => sum + log.duration, 0);
    const totalHours = totalMinutes / 60;
    
    // Get unique subjects
    const subjects = new Set(logs.map(log => log.subject));
    
    // Calculate date range for average
    const dates = logs.map(log => new Date(log.date).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const daysDiff = Math.max(1, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1);
    
    // Calculate current week hours (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const currentWeekLogs = logs.filter(log => new Date(log.date) >= sevenDaysAgo);
    const currentWeekMinutes = currentWeekLogs.reduce((sum, log) => sum + log.duration, 0);
    
    // Find most studied subject
    const subjectHours = new Map<string, number>();
    logs.forEach(log => {
      const current = subjectHours.get(log.subject) || 0;
      subjectHours.set(log.subject, current + log.duration);
    });
    
    let mostStudiedSubject = 'N/A';
    let maxHours = 0;
    subjectHours.forEach((hours, subject) => {
      if (hours > maxHours) {
        maxHours = hours;
        mostStudiedSubject = subject;
      }
    });

    return {
      totalSessions: logs.length,
      totalHours: Math.round(totalHours * 10) / 10,
      averageDailyHours: Math.round((totalHours / daysDiff) * 10) / 10,
      totalSubjects: subjects.size,
      mostStudiedSubject,
      currentWeekHours: Math.round((currentWeekMinutes / 60) * 10) / 10
    };
  }

  /**
   * Calculate daily statistics for the last 7 days
   */
  private calculateWeeklyStats(logs: StudyLog[]): DailyStats[] {
    const dailyMap = new Map<string, { hours: number; sessions: number }>();
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyMap.set(dateStr, { hours: 0, sessions: 0 });
    }
    
    // Aggregate logs by date
    logs.forEach(log => {
      const dateStr = log.date;
      if (dailyMap.has(dateStr)) {
        const current = dailyMap.get(dateStr)!;
        current.hours += log.duration / 60;
        current.sessions += 1;
      }
    });
    
    // Convert to array
    const result: DailyStats[] = [];
    dailyMap.forEach((value, date) => {
      result.push({
        date,
        hours: Math.round(value.hours * 10) / 10,
        sessions: value.sessions
      });
    });
    
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Calculate statistics by subject
   */
  private calculateSubjectStats(logs: StudyLog[]): SubjectStats[] {
    const subjectMap = new Map<string, { hours: number; sessions: number }>();
    
    // Aggregate by subject
    logs.forEach(log => {
      const current = subjectMap.get(log.subject) || { hours: 0, sessions: 0 };
      current.hours += log.duration / 60;
      current.sessions += 1;
      subjectMap.set(log.subject, current);
    });
    
    // Calculate total hours for percentage
    const totalHours = Array.from(subjectMap.values())
      .reduce((sum, stat) => sum + stat.hours, 0);
    
    // Convert to array with percentages
    const result: SubjectStats[] = [];
    subjectMap.forEach((value, subject) => {
      result.push({
        subject,
        hours: Math.round(value.hours * 10) / 10,
        sessions: value.sessions,
        percentage: totalHours > 0 ? Math.round((value.hours / totalHours) * 100) : 0
      });
    });
    
    // Sort by hours descending
    return result.sort((a, b) => b.hours - a.hours);
  }

  /**
   * Get day name from date string
   */
  getDayName(dateStr: string): string {
    const date = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  }

  /**
   * Format date for display
   */
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
