import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { AiRequestFormComponent } from '../../components/ai-request-form/ai-request-form.component';
import { AiFeedbackCardComponent } from '../../components/ai-feedback-card/ai-feedback-card.component';
import { AiAdvisorService, AiAdviceResponse } from '../../services/ai-advisor.service';

/**
 * AI Advisor Page Component
 * Main page for AI-powered study advice
 * Integrates request form and feedback card
 */
@Component({
  selector: 'app-ai-advisor-page',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatIconModule,
    SidebarComponent,
    AiRequestFormComponent,
    AiFeedbackCardComponent
  ],
  templateUrl: './ai-advisor-page.component.html',
  styleUrl: './ai-advisor-page.component.scss'
})
export class AiAdvisorPageComponent {
  
  isLoading = false;
  aiAdvice: AiAdviceResponse | null = null;
  markScale: 20 | 100 = 20; // Configurable grading scale

  constructor(
    private aiAdvisorService: AiAdvisorService,
    private snackBar: MatSnackBar
  ) {}

  /**
   * Handle advice request from form
   * Calls AI service and manages loading state
   */
  onAdviceRequest(request: { subject: string; mark: number }): void {
    this.isLoading = true;
    this.aiAdvice = null; // Clear previous advice

    this.aiAdvisorService.requestAdvice(request.subject, request.mark)
      .subscribe({
        next: (response: AiAdviceResponse) => {
          this.aiAdvice = response;
          this.isLoading = false;
          this.showSuccess('AI advice generated successfully!');
        },
        error: (error: Error) => {
          this.isLoading = false;
          this.showError(error.message);
        }
      });
  }

  /**
   * Handle save advice event from feedback card
   * TODO: Implement save functionality
   */
  onSaveAdvice(advice: AiAdviceResponse): void {
    // Future implementation:
    // - Save to local storage
    // - Save to backend history
    // - Export as PDF
    
    console.log('Saving advice:', advice);
    this.showSuccess('Advice saved! (Feature coming soon)');
  }

  /**
   * Show success toast message
   */
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Show error toast message
   */
  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 6000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });
  }
}
