import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { StudyLog } from '../../models/study-log';

/**
 * StudyLogList Component
 * Displays study logs in a Material table with sorting, pagination, and actions
 */
@Component({
  selector: 'app-study-log-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './study-log-list.html',
  styleUrl: './study-log-list.scss'
})
export class StudyLogList implements OnChanges {
  
  @Input() studyLogs: StudyLog[] = [];
  @Input() loading = false;
  @Output() editLog = new EventEmitter<StudyLog>();
  @Output() deleteLog = new EventEmitter<StudyLog>();
  @Output() viewLog = new EventEmitter<StudyLog>();

  displayedColumns: string[] = ['subject', 'topic', 'duration', 'date', 'actions'];
  dataSource = new MatTableDataSource<StudyLog>([]);
  filteredLogs: StudyLog[] = [];

  // Filter properties
  searchQuery = '';
  startDate: Date | null = null;
  endDate: Date | null = null;
  maxDate = new Date();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['studyLogs']) {
      this.applyFilters();
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Handle edit button click
   */
  onEdit(log: StudyLog): void {
    this.editLog.emit(log);
  }

  /**
   * Handle delete button click
   */
  onDelete(log: StudyLog): void {
    this.deleteLog.emit(log);
  }

  /**
   * Handle view button click
   */
  onView(log: StudyLog): void {
    this.viewLog.emit(log);
  }

  /**
   * Format duration to hours and minutes
   */
  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  /**
   * Format date to readable format
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  /**
   * Get total study time
   */
  getTotalDuration(): number {
    return this.studyLogs.reduce((total, log) => total + log.duration, 0);
  }

  /**
   * Get unique subjects count
   */
  getSubjectsCount(): number {
    const subjects = new Set(this.filteredLogs.map(log => log.subject));
    return subjects.size;
  }

  /**
   * Apply all filters (search + date range)
   */
  applyFilters(): void {
    let filtered = [...this.studyLogs];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(log => 
        log.subject.toLowerCase().includes(query) ||
        log.topic.toLowerCase().includes(query) ||
        (log.notes && log.notes.toLowerCase().includes(query))
      );
    }

    // Apply date range filter
    if (this.startDate) {
      const startDateStr = this.formatDateForComparison(this.startDate);
      filtered = filtered.filter(log => log.date >= startDateStr);
    }

    if (this.endDate) {
      const endDateStr = this.formatDateForComparison(this.endDate);
      filtered = filtered.filter(log => log.date <= endDateStr);
    }

    this.filteredLogs = filtered;
    this.dataSource.data = filtered;

    // Reset paginator to first page
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  /**
   * Handle search input change
   */
  onSearchChange(): void {
    this.applyFilters();
  }

  /**
   * Handle start date change
   */
  onStartDateChange(): void {
    this.applyFilters();
  }

  /**
   * Handle end date change
   */
  onEndDateChange(): void {
    this.applyFilters();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchQuery = '';
    this.startDate = null;
    this.endDate = null;
    this.applyFilters();
  }

  /**
   * Check if any filters are active
   */
  hasActiveFilters(): boolean {
    return this.searchQuery.trim() !== '' || this.startDate !== null || this.endDate !== null;
  }

  /**
   * Format date for comparison (YYYY-MM-DD)
   */
  private formatDateForComparison(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get filtered results count
   */
  getFilteredCount(): number {
    return this.filteredLogs.length;
  }
}
