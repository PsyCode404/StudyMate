# AI Feedback Card Component - Usage Guide

## Overview

The `AiFeedbackCardComponent` displays AI-generated study advice in a beautiful, structured format with loading states and empty states.

## Import

```typescript
import { AiFeedbackCardComponent } from './components/ai-feedback-card/ai-feedback-card.component';
import { AiAdviceResponse } from './services/ai-advisor.service';

@Component({
  imports: [AiFeedbackCardComponent, ...]
})
```

## Basic Usage

```html
<app-ai-feedback-card
  [advice]="aiAdvice"
  [loading]="isLoading"
  (saveAdvice)="onSaveAdvice($event)">
</app-ai-feedback-card>
```

## Complete Example

```typescript
import { Component } from '@angular/core';
import { AiFeedbackCardComponent } from '../../components/ai-feedback-card/ai-feedback-card.component';
import { AiAdvisorService, AiAdviceResponse } from '../../services/ai-advisor.service';

@Component({
  selector: 'app-ai-advisor-page',
  standalone: true,
  imports: [AiFeedbackCardComponent],
  template: `
    <div class="container mx-auto p-6">
      <h1 class="text-3xl font-bold mb-6">AI Study Advisor</h1>
      
      <!-- Request Form (your existing form component) -->
      <app-ai-request-form
        [submitting]="isLoading"
        (adviceRequest)="onAdviceRequest($event)">
      </app-ai-request-form>

      <!-- Feedback Card -->
      <div class="mt-8">
        <app-ai-feedback-card
          [advice]="aiAdvice"
          [loading]="isLoading"
          (saveAdvice)="onSaveAdvice($event)">
        </app-ai-feedback-card>
      </div>
    </div>
  `
})
export class AiAdvisorPageComponent {
  isLoading = false;
  aiAdvice: AiAdviceResponse | null = null;

  constructor(private aiAdvisorService: AiAdvisorService) {}

  onAdviceRequest(request: { subject: string; mark: number }): void {
    this.isLoading = true;
    
    this.aiAdvisorService.requestAdvice(request.subject, request.mark)
      .subscribe({
        next: (response) => {
          this.aiAdvice = response;
          this.isLoading = false;
        },
        error: (error) => {
          console.error(error);
          this.isLoading = false;
        }
      });
  }

  onSaveAdvice(advice: AiAdviceResponse): void {
    console.log('Saving advice:', advice);
    // TODO: Implement save functionality
    // - Save to local storage
    // - Save to backend
    // - Show success message
  }
}
```

## Props

### Inputs

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `advice` | `AiAdviceResponse \| null` | `null` | AI advice data to display |
| `loading` | `boolean` | `false` | Show loading skeleton |

### Outputs

| Event | Payload | Description |
|-------|---------|-------------|
| `saveAdvice` | `AiAdviceResponse` | Emitted when user clicks "Save Advice" |

## AiAdviceResponse Interface

```typescript
interface AiAdviceResponse {
  message: string;        // AI-generated advice (markdown formatted)
  sessionCount: number;   // Number of study sessions
  totalMinutes: number;   // Total study time in minutes
}
```

## Features

### ✅ Three States

1. **Loading State** - Animated skeleton UI
2. **Content State** - Structured advice display
3. **Empty State** - Placeholder when no advice

### ✅ Structured Parsing

Automatically parses AI response into sections:
- 🎯 **Your Strengths** - Bullet list
- 💡 **Growth Opportunities** - Bullet list  
- 🚀 **Action Plan** - Numbered list

### ✅ Fallback Support

If AI doesn't return structured format, displays raw message.

### ✅ Visual Design

- **Header** - Gradient background with stats pills
- **Sections** - Color-coded with emoji icons
- **Lists** - Custom styled bullets and numbers
- **Footer** - Save button + AI disclaimer
- **Responsive** - Mobile-optimized layout

## Styling Customization

The component uses Tailwind CSS and can be customized via:

```scss
// Override in your global styles or component
.feedback-card {
  // Custom styles
}
```

## Example AI Response Format

The component expects AI responses in this format:

```
## 🎯 Your Strengths
- You studied consistently
- Great focus during sessions

## 💡 Growth Opportunities  
- Try shorter, more frequent sessions
- Use active recall techniques

## 🚀 Action Plan
- Schedule 2x 20-min sessions tomorrow
- Practice 3 problems without notes
- Explain concepts to a study buddy
```

## Loading State

Shows animated skeleton while fetching:

```html
<app-ai-feedback-card [loading]="true"></app-ai-feedback-card>
```

## Empty State

Shows placeholder when no advice:

```html
<app-ai-feedback-card [advice]="null"></app-ai-feedback-card>
```

## Save Functionality

Handle the save event in your parent component:

```typescript
onSaveAdvice(advice: AiAdviceResponse): void {
  // Option 1: Save to local storage
  localStorage.setItem('lastAdvice', JSON.stringify(advice));
  
  // Option 2: Save to backend
  this.adviceHistoryService.save(advice).subscribe();
  
  // Option 3: Show success message
  this.snackBar.open('Advice saved!', 'Close', { duration: 3000 });
}
```

## Responsive Behavior

- **Desktop**: Full-width card with side-by-side stats
- **Mobile**: Stacked layout, full-width buttons

## Accessibility

- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Screen reader friendly

## Browser Support

Works in all modern browsers that support:
- CSS Grid
- Flexbox
- CSS Custom Properties
- ES6+
