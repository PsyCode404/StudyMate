# AI Request Form Component - Usage Guide

## Import the Component

```typescript
import { AiRequestFormComponent } from './components/ai-request-form/ai-request-form.component';

@Component({
  // ...
  imports: [AiRequestFormComponent, ...]
})
```

## Basic Usage

```html
<app-ai-request-form
  [markScale]="20"
  [submitting]="isLoading"
  (adviceRequest)="onAdviceRequest($event)">
</app-ai-request-form>
```

## Parent Component Example

```typescript
export class AiAdvisorPageComponent {
  isLoading = false;
  markScale: 20 | 100 = 20; // or 100 for percentage-based grading

  onAdviceRequest(request: { subject: string; mark: number }): void {
    this.isLoading = true;
    
    // Call your AI service
    this.aiService.getAdvice(request.subject, request.mark).subscribe({
      next: (response) => {
        console.log('AI Advice:', response);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.isLoading = false;
      }
    });
  }
}
```

## Props

### Inputs
- `@Input() markScale: 20 | 100 = 20` - Grading scale (20 or 100)
- `@Input() submitting: boolean = false` - Loading state (disables form)

### Outputs
- `@Output() adviceRequest` - Emits `{ subject: string; mark: number }`

## Validation Rules

### Subject
- Required
- Minimum 2 characters
- Maximum 100 characters

### Mark
- Required
- Numeric
- Between 0 and markScale (20 or 100)
- Allows decimals (step 0.5)

## Styling

The component follows your app's theme:
- Violet primary color (#8b5cf6)
- Inter font family
- Tailwind CSS utilities
- Material Design icons
- Responsive (stacks on mobile, can be inline on desktop)

## Features

✅ Compact, clean design  
✅ Inline validation messages  
✅ Loading state with spinner  
✅ Disabled state during submission  
✅ Responsive layout  
✅ Accessible form labels  
✅ Smooth animations  
✅ Matches app theme perfectly
