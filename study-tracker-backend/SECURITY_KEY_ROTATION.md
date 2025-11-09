# Security: API Key Rotation Guide

## ⚠️ Important: Your API keys were exposed in Git history

The `azure-settings.json` file containing sensitive credentials was committed to the repository. Follow these steps to secure your application.

---

## 🔐 Step 1: Rotate MongoDB Atlas Password

### 1.1 Go to MongoDB Atlas
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to **Database Access** (under Security)
3. Find user: `StudyMate_db_user`

### 1.2 Update Password
1. Click the **Edit** button for the user
2. Click **Edit Password**
3. Generate a new secure password (save it securely!)
4. Click **Update User**

### 1.3 Update Connection String
Your new connection string will be:
```
mongodb+srv://StudyMate_db_user:<NEW_PASSWORD>@cluster0.w3kwmqo.mongodb.net/taskflow?retryWrites=true&w=majority&appName=Cluster0
```

---

## 🔑 Step 2: Rotate Gemini API Key

### 2.1 Go to Google AI Studio
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Log in with your Google account

### 2.2 Revoke Old Key
1. Find your current API key: `AIzaSyC4u8_Z19LlQkHVNv3lKQUa3lwvfBtXbOc`
2. Click **Delete** or **Revoke** to disable it

### 2.3 Create New Key
1. Click **Create API Key**
2. Select your project
3. Copy the new API key (save it securely!)

---

## 📝 Step 3: Update Local Configuration

### 3.1 Update azure-settings.json
Copy `azure-settings.template.json` to `azure-settings.json`:

```powershell
Copy-Item azure-settings.template.json azure-settings.json
```

Then edit `azure-settings.json` with your NEW credentials:

```json
[
  {
    "name": "MONGODB_URI",
    "value": "mongodb+srv://StudyMate_db_user:<NEW_PASSWORD>@cluster0.w3kwmqo.mongodb.net/taskflow?retryWrites=true&w=majority&appName=Cluster0",
    "slotSetting": false
  },
  {
    "name": "GEMINI_API_KEY",
    "value": "<NEW_GEMINI_API_KEY>",
    "slotSetting": false
  },
  {
    "name": "JAVA_OPTS",
    "value": "-Dserver.port=8080",
    "slotSetting": false
  }
]
```

---

## ☁️ Step 4: Update Azure App Service

### 4.1 Update Environment Variables
```powershell
az webapp config appsettings set `
  --name study-tracker-backend `
  --resource-group study-tracker-rg `
  --settings '@azure-settings.json'
```

### 4.2 Restart the App
```powershell
az webapp restart `
  --name study-tracker-backend `
  --resource-group study-tracker-rg
```

### 4.3 Verify
```powershell
# Test the backend
Invoke-WebRequest -Uri "https://study-tracker-backend.azurewebsites.net/api/auth/login" -Method POST -ContentType "application/json" -Body '{}' -UseBasicParsing
```

---

## 🧹 Step 5: Clean Git History (Optional but Recommended)

### Option A: Remove from Recent History (Simple)

If the commit is recent and you haven't shared the repository:

```powershell
# Remove the file from the last commit
git reset --soft HEAD~1
git reset HEAD azure-settings.json
git commit -m "Deploy backend to Azure - Remove sensitive credentials"
git push --force origin main
```

### Option B: Use BFG Repo-Cleaner (Thorough)

For complete removal from all history:

1. **Install BFG Repo-Cleaner:**
   ```powershell
   # Download from: https://rtyley.github.io/bfg-repo-cleaner/
   ```

2. **Clone a fresh copy:**
   ```powershell
   git clone --mirror https://github.com/PsyCode404/StudyMate.git
   ```

3. **Remove the file:**
   ```powershell
   java -jar bfg.jar --delete-files azure-settings.json StudyMate.git
   cd StudyMate.git
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push --force
   ```

### Option C: Make Repository Private

If this is a learning project:
1. Go to GitHub repository settings
2. Scroll to **Danger Zone**
3. Click **Change visibility** → **Make private**

---

## ✅ Step 6: Commit the Security Changes

```powershell
git add .gitignore azure-settings.template.json SECURITY_KEY_ROTATION.md
git commit -m "Security: Add gitignore for sensitive files and key rotation guide"
git push origin main
```

---

## 🔒 Step 7: Best Practices Going Forward

### Use Environment Variables
Never commit credentials. Always use:
- Environment variables
- Azure Key Vault (for production)
- GitHub Secrets (for CI/CD)

### For Local Development
Create `azure-settings.json` locally (it's now in .gitignore):
```powershell
Copy-Item azure-settings.template.json azure-settings.json
# Edit with your credentials
```

### For Azure Deployment
Set secrets directly in Azure:
```powershell
az webapp config appsettings set `
  --name study-tracker-backend `
  --resource-group study-tracker-rg `
  --settings "MONGODB_URI=<value>" "GEMINI_API_KEY=<value>"
```

---

## 📋 Checklist

- [ ] Rotated MongoDB Atlas password
- [ ] Revoked old Gemini API key
- [ ] Created new Gemini API key
- [ ] Updated local `azure-settings.json`
- [ ] Updated Azure App Service settings
- [ ] Restarted Azure App Service
- [ ] Tested backend endpoints
- [ ] Added `azure-settings.json` to `.gitignore`
- [ ] Committed security changes
- [ ] (Optional) Cleaned Git history or made repo private

---

## 🆘 If Keys Are Already Compromised

### MongoDB Atlas
- Check **Metrics** tab for unusual activity
- Review **Access Logs** for unauthorized access
- Consider creating a new cluster if compromised

### Gemini API
- Check usage in Google Cloud Console
- Look for unexpected API calls
- Monitor billing for unusual charges

---

## 📞 Support

- MongoDB Atlas Support: https://support.mongodb.com/
- Google AI Support: https://support.google.com/
- GitHub Security: https://docs.github.com/en/code-security

---

**Created:** November 9, 2025  
**Priority:** HIGH - Complete ASAP  
**Status:** ⚠️ Action Required
