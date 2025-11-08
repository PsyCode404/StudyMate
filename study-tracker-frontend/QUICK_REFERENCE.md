# 🚀 Quick Reference - StudyLog Service

## 📦 Import Statements

```typescript
import { StudyLogService } from './services/study-log';
import { StudyLog, CreateStudyLogDto, UpdateStudyLogDto } from './models/study-log';
```

---

## 🔧 Inject Service in Component

```typescript
constructor(private studyLogService: StudyLogService) { }
```

---

## 📋 Common Operations

### Get All Logs
```typescript
this.studyLogService.getAllStudyLogs().subscribe({
  next: (logs) => console.log(logs),
  error: (error) => console.error(error)
});
```

### Get One Log
```typescript
this.studyLogService.getStudyLogById('log-id').subscribe({
  next: (log) => console.log(log),
  error: (error) => console.error(error)
});
```

### Create Log
```typescript
const newLog = {
  subject: "Mathematics",
  topic: "Calculus",
  duration: 120,
  date: "2025-10-16",
  notes: "Optional notes"
};

this.studyLogService.createStudyLog(newLog).subscribe({
  next: (created) => console.log(created),
  error: (error) => console.error(error)
});
```

### Update Log
```typescript
const updates = {
  subject: "Physics",
  topic: "Quantum Mechanics",
  duration: 90,
  date: "2025-10-16"
};

this.studyLogService.updateStudyLog('log-id', updates).subscribe({
  next: (updated) => console.log(updated),
  error: (error) => console.error(error)
});
```

### Delete Log
```typescript
this.studyLogService.deleteStudyLog('log-id').subscribe({
  next: () => console.log('Deleted'),
  error: (error) => console.error(error)
});
```

### Filter by Subject
```typescript
this.studyLogService.getStudyLogsBySubject('Mathematics').subscribe({
  next: (logs) => console.log(logs),
  error: (error) => console.error(error)
});
```

### Date Range Query
```typescript
this.studyLogService.getStudyLogsBetweenDates('2025-10-01', '2025-10-31').subscribe({
  next: (logs) => console.log(logs),
  error: (error) => console.error(error)
});
```

---

## 🎯 Helper Methods

### Calculate Total Duration
```typescript
const total = this.studyLogService.calculateTotalDuration(logs);
console.log(`Total: ${total} minutes`);
```

### Group by Subject
```typescript
const grouped = this.studyLogService.groupBySubject(logs);
grouped.forEach((logs, subject) => {
  console.log(`${subject}: ${logs.length} logs`);
});
```

---

## 🌐 API Endpoints

| Method | Endpoint |
|--------|----------|
| GET | `/api/logs` |
| GET | `/api/logs/{id}` |
| POST | `/api/logs` |
| PUT | `/api/logs/{id}` |
| DELETE | `/api/logs/{id}` |
| GET | `/api/logs/by-subject?subject=...` |
| GET | `/api/logs/between?start=...&end=...` |

**Base URL:** `http://localhost:8080/api`

---

## 📝 StudyLog Interface

```typescript
interface StudyLog {
  id?: string;
  subject: string;
  topic: string;
  duration: number;
  date: string;        // Format: "YYYY-MM-DD"
  notes?: string;
}
```

---

## ⚡ Start Development

```bash
# Terminal 1: Start Spring Boot backend
cd taskflow
mvn spring-boot:run

# Terminal 2: Start Angular frontend
cd study-tracker-frontend
ng serve
```

**Frontend:** http://localhost:4200  
**Backend:** http://localhost:8080
