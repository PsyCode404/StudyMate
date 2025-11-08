/**
 * Focus Log Model
 * Represents a completed Pomodoro session
 */
export interface FocusLog {
  id?: string;
  duration: number;        // Duration in minutes (25 for work, 5 for break)
  type: 'work' | 'break';  // Type of session
  date: string;            // Date in YYYY-MM-DD format
  startTime: string;       // Start time in HH:mm format
  endTime: string;         // End time in HH:mm format
  completed: boolean;      // Whether session was completed
  notes?: string;          // Optional notes
}

export interface CreateFocusLogDto {
  duration: number;
  type: 'work' | 'break';
  date: string;
  startTime: string;
  endTime: string;
  completed: boolean;
  notes?: string;
}

export interface FocusStats {
  totalSessions: number;
  totalWorkSessions: number;
  totalBreakSessions: number;
  totalMinutes: number;
  todaySessions: number;
  currentStreak: number;
}
