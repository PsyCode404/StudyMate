import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';

/**
 * Settings Page Component
 * User settings and preferences
 */
@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    MatIconModule,
    MatSnackBarModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule
  ],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss'
})
export class SettingsPageComponent implements OnInit {
  
  displayName: string = '';
  avatarImage: string | null = null;
  leaderboardVisibility: 'public' | 'anonymous' | 'hidden' = 'public';

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadDisplayName();
    this.loadAvatar();
    this.loadLeaderboardVisibility();
  }

  /**
   * Load display name from localStorage
   */
  loadDisplayName(): void {
    const savedName = localStorage.getItem('displayName');
    if (savedName) {
      this.displayName = savedName;
    }
  }

  /**
   * Load avatar from localStorage
   */
  loadAvatar(): void {
    const savedAvatar = localStorage.getItem('avatarImage');
    if (savedAvatar) {
      this.avatarImage = savedAvatar;
    }
  }

  /**
   * Load leaderboard visibility from localStorage
   */
  loadLeaderboardVisibility(): void {
    const savedVisibility = localStorage.getItem('leaderboardVisibility') as 'public' | 'anonymous' | 'hidden';
    if (savedVisibility) {
      this.leaderboardVisibility = savedVisibility;
    }
  }

  /**
   * Save all settings to localStorage
   */
  saveDisplayName(): void {
    if (this.displayName.trim()) {
      localStorage.setItem('displayName', this.displayName.trim());
      localStorage.setItem('leaderboardVisibility', this.leaderboardVisibility);
      this.snackBar.open('Settings saved successfully!', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
    } else {
      this.snackBar.open('Please enter a display name', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
    }
  }

  /**
   * Get initials from display name
   */
  getInitials(): string {
    if (!this.displayName) return 'U';
    
    const parts = this.displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return this.displayName.substring(0, 2).toUpperCase();
  }

  /**
   * Get avatar background color based on display name
   */
  getAvatarColor(): string {
    const colors = [
      'bg-violet-200',
      'bg-blue-200',
      'bg-green-200',
      'bg-yellow-200',
      'bg-pink-200',
      'bg-indigo-200',
      'bg-purple-200',
      'bg-cyan-200',
      'bg-rose-200',
      'bg-amber-200'
    ];
    
    if (!this.displayName) return colors[0];
    
    const hash = this.displayName.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  }

  /**
   * Handle file upload
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Please select an image file', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.snackBar.open('Image size must be less than 2MB', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
        return;
      }

      // Convert to Base64
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const base64 = e.target?.result as string;
        this.avatarImage = base64;
        localStorage.setItem('avatarImage', base64);
        this.snackBar.open('Avatar uploaded successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Remove avatar
   */
  removeAvatar(): void {
    this.avatarImage = null;
    localStorage.removeItem('avatarImage');
    this.snackBar.open('Avatar removed', 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }
}
