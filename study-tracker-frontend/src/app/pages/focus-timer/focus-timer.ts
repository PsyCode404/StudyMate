import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FocusLogService } from '../../services/focus-log.service';
import { CreateFocusLogDto, FocusStats } from '../../models/focus-log';
import { SidebarComponent } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-focus-timer',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    SidebarComponent
  ],
  templateUrl: './focus-timer.html',
  styleUrl: './focus-timer.scss'
})
export class FocusTimer implements OnInit, OnDestroy {
  
  // Timer settings
  workDuration = 25 * 60; // 25 minutes in seconds
  breakDuration = 5 * 60;  // 5 minutes in seconds
  longBreakDuration = 15 * 60; // 15 minutes
  
  // Timer state
  timeLeft = this.workDuration;
  isRunning = false;
  isPaused = false;
  currentMode: 'work' | 'break' | 'longBreak' = 'work';
  sessionsCompleted = 0;
  
  // Timer interval
  private timerInterval: any;
  private startTime: Date | null = null;
  
  // Statistics
  stats: FocusStats | null = null;
  todayWorkSessions = 0;
  todayBreakSessions = 0;
  
  // Audio
  private audio: HTMLAudioElement | null = null;

  constructor(
    private focusLogService: FocusLogService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.requestNotificationPermission();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  loadStats(): void {
    this.focusLogService.getTodayFocusLogs().subscribe({
      next: (logs) => {
        this.todayWorkSessions = logs.filter(l => l.type === 'work' && l.completed).length;
        this.todayBreakSessions = logs.filter(l => l.type === 'break' && l.completed).length;
      }
    });
  }

  startTimer(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.isPaused = false;
      this.startTime = new Date();
      
      this.timerInterval = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
        } else {
          this.onTimerComplete();
        }
      }, 1000);
    }
  }

  pauseTimer(): void {
    this.isPaused = true;
    this.isRunning = false;
    this.stopTimer();
  }

  resetTimer(): void {
    this.stopTimer();
    this.isRunning = false;
    this.isPaused = false;
    this.timeLeft = this.currentMode === 'work' ? this.workDuration : 
                    this.currentMode === 'longBreak' ? this.longBreakDuration : this.breakDuration;
    this.startTime = null;
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private onTimerComplete(): void {
    this.stopTimer();
    this.isRunning = false;
    
    // Save completed session
    this.saveSession(true);
    
    // Play sound and show notification
    this.playCompletionSound();
    this.showNotification();
    
    // Auto-switch mode
    if (this.currentMode === 'work') {
      this.sessionsCompleted++;
      if (this.sessionsCompleted % 4 === 0) {
        this.switchMode('longBreak');
      } else {
        this.switchMode('break');
      }
    } else {
      this.switchMode('work');
    }
  }

  switchMode(mode: 'work' | 'break' | 'longBreak'): void {
    this.currentMode = mode;
    this.resetTimer();
    
    const modeNames = {
      work: 'Work Session',
      break: 'Short Break',
      longBreak: 'Long Break'
    };
    
    this.snackBar.open(`Switched to ${modeNames[mode]}`, 'OK', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  private saveSession(completed: boolean): void {
    if (!this.startTime) return;
    
    const endTime = new Date();
    const duration = this.currentMode === 'work' ? 25 : 
                    this.currentMode === 'longBreak' ? 15 : 5;
    
    const focusLog: CreateFocusLogDto = {
      duration,
      type: this.currentMode === 'work' ? 'work' : 'break',
      date: new Date().toISOString().split('T')[0],
      startTime: this.formatTime(this.startTime),
      endTime: this.formatTime(endTime),
      completed
    };
    
    this.focusLogService.createFocusLog(focusLog).subscribe({
      next: () => {
        this.loadStats();
        if (completed) {
          if (focusLog.type === 'work') {
            this.todayWorkSessions++;
          } else {
            this.todayBreakSessions++;
          }
        }
      },
      error: (error) => {
        console.error('Error saving focus log:', error);
      }
    });
  }

  private formatTime(date: Date): string {
    return date.toTimeString().split(' ')[0].substring(0, 5);
  }

  private playCompletionSound(): void {
    // Create a simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  private showNotification(): void {
    const modeText = this.currentMode === 'work' ? 'Work session' : 'Break';
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', {
        body: `${modeText} completed! Time for a ${this.currentMode === 'work' ? 'break' : 'work session'}.`,
        icon: '/assets/icons/icon-192x192.png'
      });
    }
    
    this.snackBar.open(`${modeText} completed!`, 'OK', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  getFormattedTime(): string {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  getProgress(): number {
    const total = this.currentMode === 'work' ? this.workDuration : 
                  this.currentMode === 'longBreak' ? this.longBreakDuration : this.breakDuration;
    return ((total - this.timeLeft) / total) * 100;
  }

  getModeColor(): string {
    return this.currentMode === 'work' ? 'primary' : 'accent';
  }

  getModeIcon(): string {
    return this.currentMode === 'work' ? 'work' : 'coffee';
  }

  getModeText(): string {
    return this.currentMode === 'work' ? 'Focus Time' : 
           this.currentMode === 'longBreak' ? 'Long Break' : 'Short Break';
  }
}
