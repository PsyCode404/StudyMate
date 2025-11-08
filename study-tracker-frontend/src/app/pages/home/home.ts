import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { StudyLogService } from '../../services/study-log';
import { StudyLog, CreateStudyLogDto, UpdateStudyLogDto } from '../../models/study-log';
import { StudyLogForm } from '../../components/study-log-form/study-log-form';
import { StudyLogList } from '../../components/study-log-list/study-log-list';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/auth.models';
import { SidebarComponent } from '../../components/sidebar/sidebar';

/**
 * Home/Dashboard Component
 * Main page that combines the form and list components
 * Handles all CRUD operations and integrates with the backend service
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatToolbarModule,
    StudyLogForm,
    StudyLogList,
    SidebarComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  
  studyLogs: StudyLog[] = [];
  loading = false;
  showForm = false;
  editingLog: StudyLog | undefined;

  constructor(
    private studyLogService: StudyLogService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadAllLogs();
  }

  /**
   * Load all study logs from the backend
   */
  loadAllLogs(): void {
    this.loading = true;
    this.studyLogService.getAllStudyLogs().subscribe({
      next: (logs) => {
        this.studyLogs = logs;
        this.loading = false;
      },
      error: (error) => {
        this.showError('Failed to load study logs: ' + error.message);
        this.loading = false;
      }
    });
  }

  /**
   * Show the form for adding a new log
   */
  onAddNew(): void {
    this.editingLog = undefined;
    this.showForm = true;
  }

  /**
   * Handle form submission (create or update)
   */
  onFormSubmit(logData: CreateStudyLogDto | UpdateStudyLogDto): void {
    if (this.editingLog && this.editingLog.id) {
      // Update existing log
      this.updateLog(this.editingLog.id, logData as UpdateStudyLogDto);
    } else {
      // Create new log
      this.createLog(logData as CreateStudyLogDto);
    }
  }

  /**
   * Create a new study log
   */
  private createLog(logData: CreateStudyLogDto): void {
    this.studyLogService.createStudyLog(logData).subscribe({
      next: (created) => {
        this.studyLogs.unshift(created); // Add to beginning of array
        this.showForm = false;
        this.showSuccess('Study log created successfully!');
      },
      error: (error) => {
        this.showError('Failed to create study log: ' + error.message);
      }
    });
  }

  /**
   * Update an existing study log
   */
  private updateLog(id: string, logData: UpdateStudyLogDto): void {
    this.studyLogService.updateStudyLog(id, logData).subscribe({
      next: (updated) => {
        const index = this.studyLogs.findIndex(log => log.id === id);
        if (index !== -1) {
          this.studyLogs[index] = updated;
          this.studyLogs = [...this.studyLogs]; // Trigger change detection
        }
        this.showForm = false;
        this.editingLog = undefined;
        this.showSuccess('Study log updated successfully!');
      },
      error: (error) => {
        this.showError('Failed to update study log: ' + error.message);
      }
    });
  }

  /**
   * Handle edit button click from list
   */
  onEditLog(log: StudyLog): void {
    this.editingLog = { ...log }; // Create a copy
    this.showForm = true;
  }

  /**
   * Handle delete button click from list
   */
  onDeleteLog(log: StudyLog): void {
    if (!log.id) return;

    if (confirm(`Are you sure you want to delete the study log "${log.subject} - ${log.topic}"?`)) {
      this.studyLogService.deleteStudyLog(log.id).subscribe({
        next: () => {
          this.studyLogs = this.studyLogs.filter(l => l.id !== log.id);
          this.showSuccess('Study log deleted successfully!');
        },
        error: (error) => {
          this.showError('Failed to delete study log: ' + error.message);
        }
      });
    }
  }

  /**
   * Handle view button click from list
   */
  onViewLog(log: StudyLog): void {
    // For now, just show details in a snackbar
    // You can implement a proper dialog later
    const message = `${log.subject} - ${log.topic}\nDuration: ${log.duration} minutes\nDate: ${log.date}${log.notes ? '\nNotes: ' + log.notes : ''}`;
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  /**
   * Handle form cancel
   */
  onFormCancel(): void {
    this.showForm = false;
    this.editingLog = undefined;
  }

  /**
   * Show success message
   */
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Get form title based on mode
   */
  getFormTitle(): string {
    return this.editingLog ? 'Edit Study Log' : 'Add New Study Log';
  }
}
