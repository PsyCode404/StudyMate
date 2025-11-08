# StudyLog Model & Service - Complete Guide

## ✅ What We've Created

### 1. **StudyLog Model** (`models/study-log.ts`)
- ✅ Main `StudyLog` interface
- ✅ `CreateStudyLogDto` for creating new logs
- ✅ `UpdateStudyLogDto` for updating existing logs
- ✅ Full TypeScript type safety

### 2. **StudyLogService** (`services/study-log.ts`)
- ✅ Complete CRUD operations
- ✅ Custom query methods (by subject, date range)
- ✅ Helper methods (calculate duration, group by subject)
- ✅ Error handling
- ✅ Environment-based API URL

### 3. **HttpClient Configuration** (`app.config.ts`)
- ✅ HttpClient provider registered
- ✅ Ready for dependency injection

---

## 📋 Model Structure

### StudyLog Interface
```typescript
export interface StudyLog {
  id?: string;          // Optional (MongoDB generates)
  subject: string;      // Required: "Mathematics", "Physics", etc.
  topic: string;        // Required: "Calculus", "Quantum Mechanics", etc.
  duration: number;     // Required: Duration in minutes (positive number)
  date: string;         // Required: ISO format "YYYY-MM-DD"
  notes?: string;       // Optional: Additional notes
}
```

### Example StudyLog Object
```typescript
const log: StudyLog = {
  id: "68eb9f7b214625dc5a2ceb0a",
  subject: "Mathematics",
  topic: "Calculus - Derivatives",
  duration: 120,
  date: "2025-10-16",
  notes: "Covered basic derivative rules"
};
```

---

## 🔧 Service Methods

### CRUD Operations

#### 1. Get All Study Logs
```typescript
getAllStudyLogs(): Observable<StudyLog[]>
```
**Usage:**
```typescript
this.studyLogService.getAllStudyLogs().subscribe({
  next: (logs) => {
    console.log('All logs:', logs);
    this.studyLogs = logs;
  },
  error: (error) => console.error('Error:', error)
});
```

#### 2. Get Study Log by ID
```typescript
getStudyLogById(id: string): Observable<StudyLog>
```
**Usage:**
```typescript
this.studyLogService.getStudyLogById('68eb9f7b214625dc5a2ceb0a').subscribe({
  next: (log) => console.log('Found log:', log),
  error: (error) => console.error('Error:', error)
});
```

#### 3. Create New Study Log
```typescript
createStudyLog(studyLog: CreateStudyLogDto): Observable<StudyLog>
```
**Usage:**
```typescript
const newLog: CreateStudyLogDto = {
  subject: "Physics",
  topic: "Quantum Mechanics",
  duration: 90,
  date: "2025-10-16",
  notes: "Introduction to wave functions"
};

this.studyLogService.createStudyLog(newLog).subscribe({
  next: (created) => console.log('Created:', created),
  error: (error) => console.error('Error:', error)
});
```

#### 4. Update Study Log
```typescript
updateStudyLog(id: string, studyLog: UpdateStudyLogDto): Observable<StudyLog>
```
**Usage:**
```typescript
const updates: UpdateStudyLogDto = {
  subject: "Mathematics",
  topic: "Calculus - Integrals",
  duration: 150,
  date: "2025-10-16",
  notes: "Updated notes"
};

this.studyLogService.updateStudyLog('68eb9f7b214625dc5a2ceb0a', updates).subscribe({
  next: (updated) => console.log('Updated:', updated),
  error: (error) => console.error('Error:', error)
});
```

#### 5. Delete Study Log
```typescript
deleteStudyLog(id: string): Observable<void>
```
**Usage:**
```typescript
this.studyLogService.deleteStudyLog('68eb9f7b214625dc5a2ceb0a').subscribe({
  next: () => console.log('Deleted successfully'),
  error: (error) => console.error('Error:', error)
});
```

---

### Custom Query Methods

#### 6. Get Logs by Subject
```typescript
getStudyLogsBySubject(subject: string): Observable<StudyLog[]>
```
**Usage:**
```typescript
this.studyLogService.getStudyLogsBySubject('Mathematics').subscribe({
  next: (logs) => console.log('Math logs:', logs),
  error: (error) => console.error('Error:', error)
});
```

#### 7. Get Logs Between Dates
```typescript
getStudyLogsBetweenDates(startDate: string, endDate: string): Observable<StudyLog[]>
```
**Usage:**
```typescript
this.studyLogService.getStudyLogsBetweenDates('2025-10-01', '2025-10-31').subscribe({
  next: (logs) => console.log('October logs:', logs),
  error: (error) => console.error('Error:', error)
});
```

---

### Helper Methods

#### 8. Calculate Total Duration
```typescript
calculateTotalDuration(logs: StudyLog[]): number
```
**Usage:**
```typescript
const totalMinutes = this.studyLogService.calculateTotalDuration(this.studyLogs);
const totalHours = totalMinutes / 60;
console.log(`Total study time: ${totalHours} hours`);
```

#### 9. Group Logs by Subject
```typescript
groupBySubject(logs: StudyLog[]): Map<string, StudyLog[]>
```
**Usage:**
```typescript
const grouped = this.studyLogService.groupBySubject(this.studyLogs);
grouped.forEach((logs, subject) => {
  console.log(`${subject}: ${logs.length} logs`);
});
```

---

## 🎯 Complete Component Example

Here's a complete example of using the service in a component:

```typescript
import { Component, OnInit } from '@angular/core';
import { StudyLogService } from '../../services/study-log';
import { StudyLog, CreateStudyLogDto } from '../../models/study-log';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  
  studyLogs: StudyLog[] = [];
  loading = false;
  error: string | null = null;

  constructor(private studyLogService: StudyLogService) { }

  ngOnInit(): void {
    this.loadAllLogs();
  }

  // Load all study logs
  loadAllLogs(): void {
    this.loading = true;
    this.error = null;
    
    this.studyLogService.getAllStudyLogs().subscribe({
      next: (logs) => {
        this.studyLogs = logs;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  // Create a new log
  createLog(): void {
    const newLog: CreateStudyLogDto = {
      subject: "Computer Science",
      topic: "Angular Development",
      duration: 120,
      date: new Date().toISOString().split('T')[0],
      notes: "Built a study tracker app"
    };

    this.studyLogService.createStudyLog(newLog).subscribe({
      next: (created) => {
        console.log('Created:', created);
        this.loadAllLogs(); // Refresh the list
      },
      error: (error) => {
        this.error = error.message;
      }
    });
  }

  // Delete a log
  deleteLog(id: string): void {
    if (confirm('Are you sure you want to delete this log?')) {
      this.studyLogService.deleteStudyLog(id).subscribe({
        next: () => {
          console.log('Deleted successfully');
          this.loadAllLogs(); // Refresh the list
        },
        error: (error) => {
          this.error = error.message;
        }
      });
    }
  }

  // Calculate total study time
  getTotalStudyTime(): number {
    return this.studyLogService.calculateTotalDuration(this.studyLogs);
  }

  // Get logs by subject
  filterBySubject(subject: string): void {
    this.loading = true;
    this.studyLogService.getStudyLogsBySubject(subject).subscribe({
      next: (logs) => {
        this.studyLogs = logs;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }
}
```

---

## 🌐 API Endpoints Mapping

| Method | Service Method | Backend Endpoint | Description |
|--------|---------------|------------------|-------------|
| GET | `getAllStudyLogs()` | `/api/logs` | Get all logs |
| GET | `getStudyLogById(id)` | `/api/logs/{id}` | Get one log |
| POST | `createStudyLog(log)` | `/api/logs` | Create new log |
| PUT | `updateStudyLog(id, log)` | `/api/logs/{id}` | Update log |
| DELETE | `deleteStudyLog(id)` | `/api/logs/{id}` | Delete log |
| GET | `getStudyLogsBySubject(subject)` | `/api/logs/by-subject?subject=...` | Filter by subject |
| GET | `getStudyLogsBetweenDates(start, end)` | `/api/logs/between?start=...&end=...` | Date range |

---

## ⚙️ Configuration

### Environment Variables

**Development** (`environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

**Production** (`environments/environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api'
};
```

---

## 🔒 Error Handling

The service includes comprehensive error handling:

### Error Types
- **404** - Study log not found
- **400** - Invalid data provided
- **0** - Cannot connect to server (backend not running)
- **Other** - Generic server errors

### Error Response Example
```typescript
this.studyLogService.getAllStudyLogs().subscribe({
  next: (logs) => console.log(logs),
  error: (error) => {
    // error.message will contain a user-friendly message
    console.error(error.message);
    // Examples:
    // "Study log not found"
    // "Invalid data provided"
    // "Unable to connect to the server. Please check if the backend is running."
  }
});
```

---

## ✅ Testing the Service

### 1. Start Your Spring Boot Backend
```bash
cd taskflow
mvn spring-boot:run
```

### 2. Start Angular Development Server
```bash
cd study-tracker-frontend
ng serve
```

### 3. Test in Browser Console
```typescript
// Inject the service in your component
constructor(private studyLogService: StudyLogService) { }

// Test in ngOnInit or any method
ngOnInit() {
  // Test GET all
  this.studyLogService.getAllStudyLogs().subscribe(
    logs => console.log('All logs:', logs)
  );
  
  // Test CREATE
  const newLog = {
    subject: "Test",
    topic: "Testing",
    duration: 60,
    date: "2025-10-16"
  };
  this.studyLogService.createStudyLog(newLog).subscribe(
    created => console.log('Created:', created)
  );
}
```

---

## 🎯 Next Steps

Now that the model and service are complete, you can:

1. ✅ **Set up routing** - Configure navigation between pages
2. ✅ **Build components** - Create UI for listing, creating, editing logs
3. ✅ **Add forms** - Implement reactive forms for data entry
4. ✅ **Style the app** - Add CSS/SCSS styling
5. ✅ **Test integration** - Connect to your Spring Boot backend

---

## 📝 Summary

✅ **StudyLog Model** - Complete TypeScript interfaces  
✅ **StudyLogService** - Full CRUD + custom queries  
✅ **HttpClient** - Configured and ready  
✅ **Error Handling** - Comprehensive error management  
✅ **Type Safety** - Full TypeScript support  
✅ **Documentation** - Complete usage examples  

**Your Angular service layer is production-ready!** 🚀
