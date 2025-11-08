import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/auth.models';
import { StudyLogService } from '../../services/study-log';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.html',
  styleUrls: ['./welcome.css']
})
export class WelcomeComponent implements OnInit {
  user = signal<User | null>(null);
  studySessions = signal<number>(0);
  focusHours = signal<number>(0);
  streakDays = signal<number>(0);
  loading = signal<boolean>(true);

  constructor(
    private authService: AuthService,
    private router: Router,
    private studyLogService: StudyLogService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.user.set(currentUser);
    this.loadUserStats();
  }

  loadUserStats(): void {
    this.loading.set(true);
    
    this.studyLogService.getAllStudyLogs().subscribe({
      next: (studyLogs) => {
        // Calculate study sessions count
        this.studySessions.set(studyLogs.length);
        
        // Calculate total focus hours from study logs
        const totalMinutes = studyLogs.reduce((sum, log) => sum + log.duration, 0);
        this.focusHours.set(Math.round(totalMinutes / 60));
        
        // Calculate streak days (consecutive days with study sessions)
        this.streakDays.set(this.calculateStreak(studyLogs));
        
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.loading.set(false);
      }
    });
  }

  calculateStreak(logs: any[]): number {
    if (logs.length === 0) return 0;
    
    // Sort logs by date (most recent first)
    const sortedLogs = [...logs].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Get unique dates
    const uniqueDates = [...new Set(sortedLogs.map(log => log.date))];
    
    if (uniqueDates.length === 0) return 0;
    
    // Check if today or yesterday has a log (streak must be current)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const mostRecentDate = new Date(uniqueDates[0]);
    mostRecentDate.setHours(0, 0, 0, 0);
    
    // If most recent log is not today or yesterday, streak is broken
    if (mostRecentDate.getTime() !== today.getTime() && 
        mostRecentDate.getTime() !== yesterday.getTime()) {
      return 0;
    }
    
    // Count consecutive days
    let streak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i - 1]);
      const previousDate = new Date(uniqueDates[i]);
      
      const diffTime = currentDate.getTime() - previousDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
