import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * AI Request Form Component
 * Compact form for requesting AI-powered study advice
 * Emits subject and mark to parent component
 */
@Component({
  selector: 'app-ai-request-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './ai-request-form.component.html',
  styleUrl: './ai-request-form.component.scss'
})
export class AiRequestFormComponent implements OnInit {
  
  @Input() markScale: 20 | 100 = 20;           // Configurable mark scale
  @Input() submitting = false;                 // Loading state from parent
  @Output() adviceRequest = new EventEmitter<{ subject: string; mark: number }>();

  aiRequestForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.aiRequestForm = this.fb.group({
      subject: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      mark: ['', [
        Validators.required,
        Validators.min(0),
        Validators.max(this.markScale)
      ]]
    });
  }

  onSubmit(): void {
    if (this.aiRequestForm.valid && !this.submitting) {
      const formValue = this.aiRequestForm.value;
      this.adviceRequest.emit({
        subject: formValue.subject.trim(),
        mark: Number(formValue.mark)
      });
    }
  }

  // Getter methods for template
  get subject() {
    return this.aiRequestForm.get('subject');
  }

  get mark() {
    return this.aiRequestForm.get('mark');
  }

  get isFormValid(): boolean {
    return this.aiRequestForm.valid;
  }
}
