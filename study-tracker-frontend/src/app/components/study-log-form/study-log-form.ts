import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { StudyLog, CreateStudyLogDto, UpdateStudyLogDto } from '../../models/study-log';

/**
 * StudyLogForm Component
 * Reusable form for creating and editing study logs
 * Supports both add and edit modes
 */
@Component({
  selector: 'app-study-log-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './study-log-form.html',
  styleUrl: './study-log-form.scss'
})
export class StudyLogForm implements OnInit {
  
  @Input() studyLog?: StudyLog;           // Optional: for edit mode
  @Input() submitButtonText = 'Save';     // Customizable button text
  @Output() formSubmit = new EventEmitter<CreateStudyLogDto | UpdateStudyLogDto>();
  @Output() formCancel = new EventEmitter<void>();

  studyLogForm!: FormGroup;
  isEditMode = false;
  maxDate = new Date();                   // Can't log future dates

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.isEditMode = !!this.studyLog;
    this.initializeForm();
  }

  /**
   * Initialize the reactive form with validators
   */
  private initializeForm(): void {
    this.studyLogForm = this.fb.group({
      subject: [
        this.studyLog?.subject || '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(100)]
      ],
      topic: [
        this.studyLog?.topic || '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(200)]
      ],
      duration: [
        this.studyLog?.duration || null,
        [Validators.required, Validators.min(1), Validators.max(1440)] // Max 24 hours
      ],
      date: [
        this.studyLog?.date ? new Date(this.studyLog.date) : new Date(),
        [Validators.required]
      ],
      notes: [
        this.studyLog?.notes || '',
        [Validators.maxLength(500)]
      ]
    });
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.studyLogForm.valid) {
      const formValue = this.studyLogForm.value;
      
      // Format date to YYYY-MM-DD
      const date = formValue.date instanceof Date 
        ? formValue.date.toISOString().split('T')[0]
        : formValue.date;

      const studyLogData = {
        subject: formValue.subject.trim(),
        topic: formValue.topic.trim(),
        duration: Number(formValue.duration),
        date: date,
        notes: formValue.notes?.trim() || undefined
      };

      this.formSubmit.emit(studyLogData);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.studyLogForm.controls).forEach(key => {
        this.studyLogForm.get(key)?.markAsTouched();
      });
    }
  }

  /**
   * Handle cancel button click
   */
  onCancel(): void {
    this.formCancel.emit();
  }

  /**
   * Reset form to initial state
   */
  resetForm(): void {
    this.studyLogForm.reset({
      date: new Date()
    });
  }

  /**
   * Get error message for a form field
   */
  getErrorMessage(fieldName: string): string {
    const control = this.studyLogForm.get(fieldName);
    
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control.errors['minlength']) {
      return `${this.getFieldLabel(fieldName)} must be at least ${control.errors['minlength'].requiredLength} characters`;
    }
    if (control.errors['maxlength']) {
      return `${this.getFieldLabel(fieldName)} must not exceed ${control.errors['maxlength'].requiredLength} characters`;
    }
    if (control.errors['min']) {
      return `${this.getFieldLabel(fieldName)} must be at least ${control.errors['min'].min}`;
    }
    if (control.errors['max']) {
      return `${this.getFieldLabel(fieldName)} must not exceed ${control.errors['max'].max}`;
    }

    return 'Invalid value';
  }

  /**
   * Get user-friendly field label
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      subject: 'Subject',
      topic: 'Topic',
      duration: 'Duration',
      date: 'Date',
      notes: 'Notes'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Check if a field has an error and is touched
   */
  hasError(fieldName: string): boolean {
    const control = this.studyLogForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }
}
