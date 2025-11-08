# 🚀 Tailwind Quick Start Guide

## ⚡ Run the App

```bash
ng serve
```
**Open:** http://localhost:4200

---

## 🎨 Key Tailwind Classes Used

### **Layout**
```html
flex                    - Flexbox container
grid                    - Grid container
h-screen               - Full viewport height
w-64                   - Width 256px (sidebar)
max-w-7xl              - Max width 1280px
mx-auto                - Center horizontally
```

### **Spacing**
```html
p-4, p-5, p-6          - Padding (16px, 20px, 24px)
px-4, py-2             - Padding horizontal/vertical
gap-4                  - Gap between flex/grid items
space-y-6              - Vertical spacing between children
```

### **Colors**
```html
bg-white               - White background
bg-primary-600         - Brand purple
bg-neutral-50          - Light gray background
text-neutral-900       - Dark text
border-neutral-200     - Light border
```

### **Borders & Shadows**
```html
rounded-lg             - Border radius 8px
rounded-xl             - Border radius 12px
rounded-2xl            - Border radius 16px
shadow-card            - Custom card shadow
border                 - 1px border
```

### **Typography**
```html
text-sm, text-base, text-lg, text-xl, text-2xl
font-medium, font-semibold, font-bold
```

### **Responsive**
```html
sm:grid-cols-2         - 2 columns on small screens
md:grid-cols-2         - 2 columns on medium screens
lg:flex                - Flex on large screens
lg:w-64                - Width 256px on large screens
hidden lg:flex         - Hidden on mobile, flex on desktop
```

### **States**
```html
hover:bg-primary-700   - Hover state
focus:ring-2           - Focus ring
disabled:opacity-50    - Disabled state
transition-colors      - Smooth color transitions
```

---

## 🎨 Custom Color Palette

```javascript
primary-50   #f5f3ff  (lightest purple)
primary-500  #8b5cf6  (main brand)
primary-600  #7c3aed  (hover)
primary-700  #6d28d9  (active)

accent-500   #d946ef  (pink)
accent-600   #c026d3  (pink hover)

neutral-50   #fafafa  (background)
neutral-200  #e5e5e5  (borders)
neutral-600  #525252  (secondary text)
neutral-900  #171717  (primary text)
```

---

## 📝 Common Patterns

### **Card**
```html
<div class="bg-white rounded-xl shadow-card border border-neutral-200 p-5">
  <!-- Content -->
</div>
```

### **Button Primary**
```html
<button class="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-all">
  Click Me
</button>
```

### **Button Secondary**
```html
<button class="px-4 py-2.5 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors">
  Cancel
</button>
```

### **Input Field**
```html
<input class="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors">
```

### **Badge**
```html
<span class="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm font-semibold">
  Badge Text
</span>
```

### **Icon Button**
```html
<button class="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors">
  <mat-icon>edit</mat-icon>
</button>
```

---

## 🔧 Customization

### **Change Brand Color**
Edit `tailwind.config.js`:
```javascript
primary: {
  500: '#your-color',
}
```

### **Add New Utility**
In `src/styles.scss`:
```scss
@layer utilities {
  .your-utility {
    /* your styles */
  }
}
```

---

## 📱 Responsive Design

```html
<!-- Mobile First Approach -->
<div class="
  w-full           <!-- Mobile: full width -->
  sm:w-1/2         <!-- Small: half width -->
  lg:w-1/3         <!-- Large: third width -->
">
```

**Breakpoints:**
- `sm:` 640px+
- `md:` 768px+
- `lg:` 1024px+
- `xl:` 1280px+

---

## ✅ Quick Checklist

- [x] Tailwind installed
- [x] PostCSS configured
- [x] Custom colors defined
- [x] All components redesigned
- [x] Responsive design working
- [x] Build successful

---

## 🎯 Pro Tips

1. **Use Tailwind IntelliSense** (VS Code extension)
2. **Compose utilities** instead of custom CSS
3. **Use `@apply`** sparingly (prefer utilities)
4. **Keep Material** for complex components (datepicker, dialogs)
5. **Mobile-first** approach for responsive design

---

**Happy Coding! 🚀**
