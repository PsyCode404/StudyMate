import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { LeaderboardService, LeaderboardEntry, LeaderboardResponse } from '../../services/leaderboard.service';
import { UserSessionsModalComponent } from '../../components/user-sessions-modal/user-sessions-modal.component';

/**
 * Leaderboard Page Component
 * Displays ranked users by study time with filtering options
 */
@Component({
  selector: 'app-leaderboard-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    SidebarComponent,
    UserSessionsModalComponent
  ],
  templateUrl: './leaderboard-page.component.html',
  styleUrl: './leaderboard-page.component.scss'
})
export class LeaderboardPageComponent implements OnInit, OnDestroy {
  
  // Data
  leaderboard: LeaderboardEntry[] = [];
  topThree: LeaderboardEntry[] = [];
  restOfLeaderboard: LeaderboardEntry[] = [];
  
  // State
  loading = false;
  error: string | null = null;
  isCached = false;
  
  // Modal state
  showModal = false;
  selectedUser: LeaderboardEntry | null = null;
  
  // Debounce subjects
  private filterChange$ = new Subject<void>();
  
  // Filters
  selectedPeriod = 'all';
  selectedSubject = 'all';
  selectedLimit = 10;
  currentPage = 1;
  anonymize = false;
  
  // Pagination
  totalUsers = 0;
  totalPages = 1;
  
  // Options
  periods = [
    { value: 'all', label: 'All Time' },
    { value: 'month', label: 'This Month' },
    { value: 'week', label: 'This Week' }
  ];
  
  subjects: string[] = ['all'];
  
  limits = [10, 20, 50];

  constructor(
    private leaderboardService: LeaderboardService
  ) {}

  ngOnInit(): void {
    // Setup debounced filter changes
    this.filterChange$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.loadLeaderboard();
    });

    this.loadLeaderboard();
  }

  ngOnDestroy(): void {
    this.filterChange$.complete();
  }

  /**
   * Load leaderboard data
   */
  loadLeaderboard(): void {
    this.loading = true;
    this.error = null;

    const subject = this.selectedSubject === 'all' ? undefined : this.selectedSubject;

    this.leaderboardService.getLeaderboard(
      this.selectedPeriod,
      subject,
      this.selectedLimit,
      this.currentPage,
      this.anonymize
    ).subscribe({
      next: (response: LeaderboardResponse) => {
        // Apply client-side visibility filtering
        this.leaderboard = this.applyVisibilitySettings(response.leaderboard);
        this.totalUsers = response.totalUsers;
        this.totalPages = Math.ceil(this.totalUsers / this.selectedLimit);
        this.isCached = response.cached || false;
        
        // Split into top 3 and rest
        this.topThree = this.leaderboard.slice(0, 3);
        this.restOfLeaderboard = this.leaderboard.slice(3);
        
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load leaderboard';
        this.loading = false;
      }
    });
  }

  /**
   * Handle period change (debounced)
   */
  onPeriodChange(period: string): void {
    this.selectedPeriod = period;
    this.currentPage = 1;
    this.filterChange$.next();
  }

  /**
   * Handle subject change (debounced)
   */
  onSubjectChange(subject: string): void {
    this.selectedSubject = subject;
    this.currentPage = 1;
    this.filterChange$.next();
  }

  /**
   * Handle limit change (debounced)
   */
  onLimitChange(limit: number): void {
    this.selectedLimit = limit;
    this.currentPage = 1;
    this.filterChange$.next();
  }

  /**
   * Handle anonymize toggle (debounced)
   */
  onAnonymizeToggle(): void {
    this.filterChange$.next();
  }

  /**
   * Go to specific page
   */
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadLeaderboard();
  }

  /**
   * Go to previous page
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  /**
   * Go to next page
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  /**
   * Get page numbers for pagination
   */
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push(-1); // Ellipsis
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        pages.push(1);
        pages.push(-1);
        for (let i = this.totalPages - 3; i <= this.totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(this.totalPages);
      }
    }
    
    return pages;
  }

  /**
   * Format minutes to hours:minutes
   */
  formatTime(minutes: number): string {
    return this.leaderboardService.formatMinutesToHours(minutes);
  }

  /**
   * Get user initials
   */
  getInitials(username: string): string {
    return this.leaderboardService.getInitials(username);
  }

  /**
   * Get avatar color
   */
  getAvatarColor(username: string): string {
    return this.leaderboardService.getAvatarColor(username);
  }

  /**
   * Get medal icon for top 3
   */
  getMedalIcon(rank: number): string {
    switch (rank) {
      case 1: return 'emoji_events';
      case 2: return 'workspace_premium';
      case 3: return 'military_tech';
      default: return '';
    }
  }

  /**
   * Get medal color for top 3
   */
  getMedalColor(rank: number): string {
    switch (rank) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-400';
      case 3: return 'text-amber-600';
      default: return '';
    }
  }

  /**
   * Get card accent color for top 3
   */
  getCardAccent(rank: number): string {
    switch (rank) {
      case 1: return 'border-yellow-200 bg-yellow-50';
      case 2: return 'border-gray-200 bg-gray-50';
      case 3: return 'border-amber-200 bg-amber-50';
      default: return '';
    }
  }

  /**
   * Open user sessions modal
   */
  openUserModal(entry: LeaderboardEntry): void {
    this.selectedUser = entry;
    this.showModal = true;
  }

  /**
   * Close user sessions modal
   */
  closeUserModal(): void {
    this.showModal = false;
    this.selectedUser = null;
  }

  /**
   * Export leaderboard to CSV
   */
  exportLeaderboard(): void {
    const filename = `leaderboard_${this.selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`;
    this.leaderboardService.exportToCSV(this.leaderboard, filename);
  }

  /**
   * Apply visibility settings from localStorage
   * Filters and transforms usernames based on user preferences
   */
  applyVisibilitySettings(entries: LeaderboardEntry[]): LeaderboardEntry[] {
    const currentUserId = this.getCurrentUserId();
    const visibility = localStorage.getItem('leaderboardVisibility') || 'public';
    const displayName = localStorage.getItem('displayName') || '';

    return entries.filter(entry => {
      // Check if this is the current user
      const isCurrentUser = entry.userId === currentUserId;

      if (isCurrentUser) {
        // Apply current user's visibility preference
        if (visibility === 'hidden') {
          return false; // Don't show current user
        } else if (visibility === 'anonymous') {
          // Generate consistent anonymous ID
          const anonymousId = this.generateAnonymousId(entry.userId);
          entry.username = `Student_${anonymousId}`;
        } else if (visibility === 'public' && displayName) {
          // Use display name if available
          entry.username = displayName;
        }
      }

      return true;
    });
  }

  /**
   * Generate consistent 3-digit anonymous ID from userId
   */
  generateAnonymousId(userId: string): string {
    const hash = userId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const threeDigit = Math.abs(hash) % 900 + 100; // Ensures 100-999
    return threeDigit.toString();
  }

  /**
   * Get current user ID from localStorage or auth service
   */
  getCurrentUserId(): string {
    // Try to get from localStorage (adjust based on your auth implementation)
    const user = localStorage.getItem('currentUser');
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.id || userData.userId || '';
      } catch {
        return '';
      }
    }
    return '';
  }
}
