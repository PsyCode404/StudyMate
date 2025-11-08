import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { StudyLogService } from '../../services/study-log';
import { StudyLog } from '../../models/study-log';
import { SidebarComponent } from '../../components/sidebar/sidebar';

interface CalendarDay {
  date: Date;
  dateString: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  logs: StudyLog[];
  totalDuration: number;
}

interface DayDetails {
  date: Date;
  dateString: string;
  logs: StudyLog[];
  totalDuration: number;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    SidebarComponent
  ],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss'
})
export class Calendar implements OnInit {
  
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth();
  currentYear = this.currentDate.getFullYear();
  
  calendarDays: CalendarDay[] = [];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'];
  
  studyLogs: StudyLog[] = [];
  loading = true;
  selectedDay: DayDetails | null = null;
  showDayDetails = false;

  constructor(
    private studyLogService: StudyLogService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadStudyLogs();
  }

  loadStudyLogs(): void {
    this.loading = true;
    this.studyLogService.getAllStudyLogs().subscribe({
      next: (logs) => {
        this.studyLogs = logs;
        this.generateCalendar();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading study logs:', error);
        this.loading = false;
      }
    });
  }

  generateCalendar(): void {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const prevLastDay = new Date(this.currentYear, this.currentMonth, 0);
    
    const firstDayIndex = firstDay.getDay();
    const lastDayIndex = lastDay.getDay();
    const nextDays = 7 - lastDayIndex - 1;
    
    this.calendarDays = [];
    
    // Previous month days
    for (let i = firstDayIndex; i > 0; i--) {
      const date = new Date(this.currentYear, this.currentMonth - 1, prevLastDay.getDate() - i + 1);
      this.calendarDays.push(this.createCalendarDay(date, false));
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(this.currentYear, this.currentMonth, i);
      this.calendarDays.push(this.createCalendarDay(date, true));
    }
    
    // Next month days
    for (let i = 1; i <= nextDays; i++) {
      const date = new Date(this.currentYear, this.currentMonth + 1, i);
      this.calendarDays.push(this.createCalendarDay(date, false));
    }
  }

  createCalendarDay(date: Date, isCurrentMonth: boolean): CalendarDay {
    const dateString = this.formatDateForComparison(date);
    const logs = this.studyLogs.filter(log => log.date === dateString);
    const totalDuration = logs.reduce((sum, log) => sum + log.duration, 0);
    
    const today = new Date();
    const isToday = date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear();
    
    return {
      date,
      dateString,
      isCurrentMonth,
      isToday,
      logs,
      totalDuration
    };
  }

  previousMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  goToToday(): void {
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    this.generateCalendar();
  }

  onDayClick(day: CalendarDay): void {
    if (day.logs.length > 0) {
      this.selectedDay = {
        date: day.date,
        dateString: day.dateString,
        logs: day.logs,
        totalDuration: day.totalDuration
      };
      this.showDayDetails = true;
    }
  }

  closeDayDetails(): void {
    this.showDayDetails = false;
    this.selectedDay = null;
  }

  formatDateForComparison(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  getDurationColor(minutes: number): string {
    if (minutes === 0) return 'bg-neutral-100 text-neutral-600';
    if (minutes < 60) return 'bg-blue-100 text-blue-700';
    if (minutes < 120) return 'bg-green-100 text-green-700';
    if (minutes < 180) return 'bg-yellow-100 text-yellow-700';
    if (minutes < 240) return 'bg-orange-100 text-orange-700';
    return 'bg-purple-100 text-purple-700';
  }

  getMonthStats(): { totalSessions: number; totalHours: number; activeDays: number } {
    const monthLogs = this.studyLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate.getMonth() === this.currentMonth && 
             logDate.getFullYear() === this.currentYear;
    });
    
    const uniqueDays = new Set(monthLogs.map(log => log.date));
    const totalMinutes = monthLogs.reduce((sum, log) => sum + log.duration, 0);
    
    return {
      totalSessions: monthLogs.length,
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      activeDays: uniqueDays.size
    };
  }
}
