import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LeaderboardService, StudyLog } from '../../services/leaderboard.service';

/**
 * User Sessions Modal Component
 * Displays a user's recent study sessions in a modal
 */
@Component({
  selector: 'app-user-sessions-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <!-- Modal Backdrop -->
    <div 
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn"
      (click)="onBackdropClick($event)"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="'Sessions for ' + username">
      
      <!-- Modal Content -->
      <div 
        class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-slideUp"
        (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-neutral-200">
          <div class="flex items-center gap-3">
            <div [class]="'w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold ' + avatarColor">
              {{ initials }}
            </div>
            <div>
              <h2 class="text-xl font-bold text-neutral-900">{{ username }}</h2>
              <p class="text-sm text-neutral-600">Recent Study Sessions</p>
            </div>
          </div>
          <button 
            (click)="close()"
            class="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
            aria-label="Close modal">
            <mat-icon class="text-neutral-600">close</mat-icon>
          </button>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="flex flex-col items-center justify-center py-12">
          <mat-spinner diameter="40" class="mb-4"></mat-spinner>
          <p class="text-neutral-600">Loading sessions...</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error && !loading" class="p-6 text-center">
          <mat-icon class="text-red-500 !w-12 !h-12 !text-5xl mb-3">error_outline</mat-icon>
          <p class="text-red-700">{{ error }}</p>
          <button 
            (click)="loadSessions()"
            class="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Try Again
          </button>
        </div>

        <!-- Sessions List -->
        <div *ngIf="!loading && !error" class="p-6 overflow-y-auto max-h-[60vh]">
          
          <!-- Empty State -->
          <div *ngIf="sessions.length === 0" class="text-center py-8">
            <mat-icon class="text-neutral-400 !w-16 !h-16 !text-6xl mb-3">event_busy</mat-icon>
            <p class="text-neutral-600">No study sessions found</p>
          </div>

          <!-- Sessions -->
          <div *ngIf="sessions.length > 0" class="space-y-3">
            <div 
              *ngFor="let session of sessions; let i = index"
              class="bg-neutral-50 rounded-lg p-4 border border-neutral-200 hover:border-violet-300 hover:shadow-sm transition-all animate-fadeIn"
              [style.animation-delay]="i * 50 + 'ms'">
              
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-2">
                  <mat-icon class="text-violet-600 !w-5 !h-5 !text-xl">book</mat-icon>
                  <h3 class="font-semibold text-neutral-900">{{ session.subject }}</h3>
                </div>
                <span class="text-sm font-medium text-violet-600">
                  {{ formatTime(session.duration) }}
                </span>
              </div>

              <div class="flex items-center gap-4 text-sm text-neutral-600">
                <div class="flex items-center gap-1">
                  <mat-icon class="!w-4 !h-4 !text-base">calendar_today</mat-icon>
                  <span>{{ formatDate(session.date) }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <mat-icon class="!w-4 !h-4 !text-base">schedule</mat-icon>
                  <span>{{ session.duration }} minutes</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div *ngIf="sessions.length > 0" class="mt-6 pt-6 border-t border-neutral-200">
            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <p class="text-2xl font-bold text-violet-600">{{ sessions.length }}</p>
                <p class="text-sm text-neutral-600">Sessions</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-violet-600">{{ formatTime(getTotalMinutes()) }}</p>
                <p class="text-sm text-neutral-600">Total Time</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-violet-600">{{ formatTime(getAvgMinutes()) }}</p>
                <p class="text-sm text-neutral-600">Avg Session</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-3 p-6 border-t border-neutral-200 bg-neutral-50">
          <button 
            (click)="close()"
            class="px-6 py-2 bg-white border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out;
    }

    .animate-slideUp {
      animation: slideUp 0.3s ease-out;
    }
  `]
})
export class UserSessionsModalComponent implements OnInit {
  
  @Input() userId!: string;
  @Input() username!: string;
  @Input() initials!: string;
  @Input() avatarColor!: string;
  
  @Output() closeModal = new EventEmitter<void>();

  sessions: StudyLog[] = [];
  loading = false;
  error: string | null = null;

  constructor(private leaderboardService: LeaderboardService) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  /**
   * Load user sessions
   */
  loadSessions(): void {
    this.loading = true;
    this.error = null;

    this.leaderboardService.getUserSessions(this.userId, 5).subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load sessions';
        this.loading = false;
      }
    });
  }

  /**
   * Close modal
   */
  close(): void {
    this.closeModal.emit();
  }

  /**
   * Handle backdrop click
   */
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  /**
   * Format time
   */
  formatTime(minutes: number): string {
    return this.leaderboardService.formatMinutesToHours(minutes);
  }

  /**
   * Format date
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  /**
   * Get total minutes
   */
  getTotalMinutes(): number {
    return this.sessions.reduce((sum, session) => sum + session.duration, 0);
  }

  /**
   * Get average minutes
   */
  getAvgMinutes(): number {
    if (this.sessions.length === 0) return 0;
    return this.getTotalMinutes() / this.sessions.length;
  }
}
