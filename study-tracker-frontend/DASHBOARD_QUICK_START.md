# 📊 Dashboard Quick Start

## 🚀 **Run the Dashboard**

```bash
# Start frontend
ng serve

# Open in browser
http://localhost:4200/dashboard
```

---

## 📍 **Navigation**

### **Sidebar Links**
- **Home** → `/home` - Study log form and list
- **Analytics** → `/dashboard` - Charts and statistics
- **Calendar** → Coming soon
- **Settings** → Coming soon

---

## 📊 **Dashboard Sections**

### **1. Quick Stats (Top Row)**
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│   Total     │   Total     │   Average   │  This Week  │
│  Sessions   │   Hours     │    Daily    │    Hours    │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### **2. Info Cards**
- Total Subjects
- Most Studied Subject

### **3. Charts**
- **Weekly Study Time** (Bar Chart) - Last 7 days
- **Subject Distribution** (Doughnut Chart) - Percentage breakdown

### **4. Subject Details Table**
- Ranked list with sessions, hours, percentage
- Visual progress bars

---

## 🎨 **Key Features**

### **Interactive Charts**
- **Hover** - See exact values
- **Tooltips** - Dark background with details
- **Animations** - Smooth transitions

### **Responsive Design**
- **Desktop** - 4 columns, side-by-side charts
- **Tablet** - 2 columns, stacked charts
- **Mobile** - 1 column, full width

### **Real-Time Data**
- Fetches from backend API
- Click **Refresh** to update
- Automatic calculations

---

## 📊 **Chart Details**

### **Weekly Bar Chart**
```
Colors: Purple gradient
Shows: Last 7 days (Mon-Sun)
Y-axis: Hours (0h, 1h, 2h...)
Tooltip: "X hours"
```

### **Subject Doughnut Chart**
```
Colors: Purple/pink gradients
Shows: Top 6 subjects
Legend: Bottom position
Tooltip: "Subject: Xh (Y%)"
```

---

## 🔧 **Quick Customization**

### **Change Chart Colors**
Edit `src/app/pages/dashboard/dashboard.ts`:
```typescript
backgroundColor: 'rgba(YOUR, RGB, COLOR, 0.8)'
```

### **Change Chart Height**
Edit `src/app/pages/dashboard/dashboard.html`:
```html
<div class="h-80">  <!-- h-64, h-96, etc. -->
```

### **Adjust Stats Layout**
```html
<!-- Change grid columns -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
```

---

## 📱 **Responsive Classes**

```html
sm:   640px+   (small tablets)
md:   768px+   (tablets)
lg:   1024px+  (laptops)
xl:   1280px+  (desktops)
```

---

## 🎯 **Common Tasks**

### **Add More Stats**
1. Add calculation in `analytics.service.ts`
2. Add property in `OverallStats` interface
3. Add card in `dashboard.html`

### **Add New Chart**
1. Import chart type in `dashboard.ts`
2. Configure chart data and options
3. Add canvas in `dashboard.html`

### **Change Date Range**
Modify `getWeeklyStats()` in `analytics.service.ts`:
```typescript
// Change from 7 to 30 for last 30 days
for (let i = 29; i >= 0; i--) {
  // ...
}
```

---

## 🐛 **Quick Fixes**

### **No Data?**
- Add study logs in Home page
- Check backend is running
- Verify API URL in `environment.ts`

### **Charts Not Showing?**
- Check browser console
- Verify Chart.js import in `main.ts`
- Ensure ng2-charts installed

### **Routing Issues?**
- Check `app.routes.ts`
- Verify RouterOutlet in `app.ts`
- Clear browser cache

---

## ✅ **Checklist**

- [x] Chart.js installed
- [x] ng2-charts installed
- [x] Analytics service created
- [x] Dashboard component created
- [x] Routes configured
- [x] Navigation updated
- [x] Build successful

---

## 🎉 **You're Ready!**

Navigate to `/dashboard` and see your study analytics come to life! 📊✨

**Happy Tracking! 🎓📚**
