import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AiAdviceResponse } from '../../services/ai-advisor.service';

/**
 * AI Feedback Card Component
 * Displays AI-generated study advice with metrics
 * Supports loading state with skeleton UI
 */
@Component({
  selector: 'app-ai-feedback-card',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './ai-feedback-card.component.html',
  styleUrl: './ai-feedback-card.component.scss'
})
export class AiFeedbackCardComponent {
  
  @Input() advice: AiAdviceResponse | null = null;
  @Input() loading = false;
  @Output() saveAdvice = new EventEmitter<AiAdviceResponse>();

  /**
   * Parse the AI advice message into structured sections
   * Extracts: Strengths, Growth Opportunities, Action Plan
   */
  get parsedAdvice() {
    if (!this.advice?.message) return null;

    const message = this.advice.message;
    
    // Extract sections using regex or simple string splitting
    const strengthsMatch = message.match(/##\s*🎯.*?\n([\s\S]*?)(?=##|$)/i);
    const opportunitiesMatch = message.match(/##\s*💡.*?\n([\s\S]*?)(?=##|$)/i);
    const actionPlanMatch = message.match(/##\s*🚀.*?\n([\s\S]*?)(?=##|$)/i);

    return {
      strengths: this.extractBulletPoints(strengthsMatch?.[1] || ''),
      opportunities: this.extractBulletPoints(opportunitiesMatch?.[1] || ''),
      actionPlan: this.extractBulletPoints(actionPlanMatch?.[1] || ''),
      rawMessage: message
    };
  }

  /**
   * Extract bullet points from markdown text
   */
  private extractBulletPoints(text: string): string[] {
    if (!text) return [];
    
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('*') || line.startsWith('-') || line.match(/^\d+\./))
      .map(line => line.replace(/^[\*\-\d\.]\s*/, '').trim())
      .filter(line => line.length > 0);
  }

  /**
   * Check if advice has structured sections
   */
  get hasStructuredAdvice(): boolean {
    const parsed = this.parsedAdvice;
    return !!(parsed && (parsed.strengths.length > 0 || parsed.opportunities.length > 0 || parsed.actionPlan.length > 0));
  }

  /**
   * Handle save advice button click
   */
  onSaveAdvice(): void {
    if (this.advice) {
      this.saveAdvice.emit(this.advice);
    }
  }
}
