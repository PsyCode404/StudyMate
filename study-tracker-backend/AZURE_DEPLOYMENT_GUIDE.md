# Azure Deployment Guide - Study Tracker

## ✅ Backend Deployment Status

### Completed Steps

1. **JAR Build** ✅
   - File: `target/taskflow-0.0.1-SNAPSHOT.jar`
   - Size: 32.43 MB
   - Java Version: 17

2. **Resource Group Created** ✅
   - Name: `study-tracker-rg`
   - Location: `germanywestcentral`
   - Subscription: `a2494746-081d-4526-8009-b0aaf2926ce3`

3. **App Service Plan Created** ✅
   - Name: `study-tracker-plan`
   - SKU: F1 (Free Linux)
   - Location: `germanywestcentral`
   - Status: Ready

4. **Web App Created** ✅
   - Name: `study-tracker-backend`
   - URL: https://study-tracker-backend.azurewebsites.net
   - Runtime: JAVA:17-java17
   - Status: Running

5. **Environment Variables Configured** ✅
   - `MONGODB_URI`: MongoDB Atlas connection string
   - `GEMINI_API_KEY`: (needs to be set with your actual key)
   - `JAVA_OPTS`: JVM options

6. **Deployment In Progress** 🔄
   - Deploying JAR file to Azure App Service
   - This may take 2-5 minutes

---

## Important Notes

### Allowed Azure Regions
Your subscription has a region restriction policy. Only these regions are allowed:
- `polandcentral`
- `swedencentral`
- `switzerlandnorth`
- `germanywestcentral` ← **Currently using this**
- `spaincentral`

### Backend URL
```
https://study-tracker-backend.azurewebsites.net
```

### API Endpoints
Once deployed, your API will be available at:
- Auth: `https://study-tracker-backend.azurewebsites.net/api/auth/*`
- Study Logs: `https://study-tracker-backend.azurewebsites.net/api/studylogs/*`
- Leaderboard: `https://study-tracker-backend.azurewebsites.net/api/leaderboard/*`
- AI Advisor: `https://study-tracker-backend.azurewebsites.net/api/ai-advisor/*`

---

## Next Steps

### 1. Set Gemini API Key (Required)

Edit `azure-settings.json` and replace `REPLACE_WITH_YOUR_GEMINI_API_KEY` with your actual key, then run:

```powershell
az webapp config appsettings set `
  --name study-tracker-backend `
  --resource-group study-tracker-rg `
  --settings '@azure-settings.json'
```

Or set it directly:
```powershell
az webapp config appsettings set `
  --name study-tracker-backend `
  --resource-group study-tracker-rg `
  --settings "GEMINI_API_KEY=your_actual_key_here"
```

### 2. Verify Deployment

Check deployment status:
```powershell
az webapp show --name study-tracker-backend --resource-group study-tracker-rg --query "state" --output tsv
```

View logs:
```powershell
az webapp log tail --name study-tracker-backend --resource-group study-tracker-rg
```

### 3. Test the Backend

```powershell
# Test health (once deployed)
curl https://study-tracker-backend.azurewebsites.net/api/auth/login -Method POST

# Should return 400 or 401 (means server is responding)
```

### 4. Update Frontend Configuration

Update Angular environment files to point to:
```
https://study-tracker-backend.azurewebsites.net/api
```

---

## Redeploy After Changes

When you make code changes:

1. **Rebuild JAR:**
   ```powershell
   mvn clean package -DskipTests
   ```

2. **Deploy:**
   ```powershell
   az webapp deploy `
     --resource-group study-tracker-rg `
     --name study-tracker-backend `
     --src-path target/taskflow-0.0.1-SNAPSHOT.jar `
     --type jar
   ```

---

## Troubleshooting

### View Application Logs
```powershell
az webapp log tail --name study-tracker-backend --resource-group study-tracker-rg
```

### Restart the App
```powershell
az webapp restart --name study-tracker-backend --resource-group study-tracker-rg
```

### Check Configuration
```powershell
az webapp config appsettings list `
  --name study-tracker-backend `
  --resource-group study-tracker-rg `
  --output table
```

### Enable Logging
```powershell
az webapp log config `
  --name study-tracker-backend `
  --resource-group study-tracker-rg `
  --application-logging filesystem `
  --level information
```

---

## Cost Management

- **Current SKU:** F1 (Free)
- **Limitations:**
  - 60 minutes/day compute time
  - 1 GB storage
  - No custom domains
  - No auto-scaling

To upgrade to a paid tier:
```powershell
az appservice plan update `
  --name study-tracker-plan `
  --resource-group study-tracker-rg `
  --sku B1
```

---

## Security Recommendations

1. **Enable HTTPS Only:**
   ```powershell
   az webapp update `
     --name study-tracker-backend `
     --resource-group study-tracker-rg `
     --https-only true
   ```

2. **Configure CORS:**
   ```powershell
   az webapp cors add `
     --name study-tracker-backend `
     --resource-group study-tracker-rg `
     --allowed-origins https://your-frontend-url.azurestaticapps.net
   ```

3. **Use Key Vault for Secrets** (recommended for production)

---

## Monitoring

### View Metrics
```powershell
az monitor metrics list `
  --resource /subscriptions/a2494746-081d-4526-8009-b0aaf2926ce3/resourceGroups/study-tracker-rg/providers/Microsoft.Web/sites/study-tracker-backend `
  --metric "Requests" `
  --start-time 2025-11-09T00:00:00Z
```

### Set Up Alerts
Configure alerts in Azure Portal for:
- High CPU usage
- Memory usage
- Response time
- Error rate

---

## Clean Up Resources

To delete everything:
```powershell
az group delete --name study-tracker-rg --yes --no-wait
```

---

## Files Created

- `azure-settings.json` - Environment variables configuration
- `target/taskflow-0.0.1-SNAPSHOT.jar` - Deployable JAR file
- `AZURE_DEPLOYMENT_GUIDE.md` - This guide

---

## Support

- Azure CLI Documentation: https://docs.microsoft.com/cli/azure/
- Azure App Service: https://docs.microsoft.com/azure/app-service/
- Spring Boot on Azure: https://docs.microsoft.com/azure/developer/java/spring-framework/
