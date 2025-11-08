# Environment Setup

## Required Environment Variables

### GEMINI_API_KEY

The application requires a Google Gemini API key to provide AI-powered study advice.

#### How to get your API key:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

#### How to set the environment variable:

**Windows (PowerShell):**
```powershell
$env:GEMINI_API_KEY="your-actual-api-key-here"
```

**Windows (Command Prompt):**
```cmd
set GEMINI_API_KEY=your-actual-api-key-here
```

**Linux/Mac:**
```bash
export GEMINI_API_KEY="your-actual-api-key-here"
```

#### For permanent setup:

**Windows:**
1. Search for "Environment Variables" in Windows Search
2. Click "Edit the system environment variables"
3. Click "Environment Variables" button
4. Under "User variables", click "New"
5. Variable name: `GEMINI_API_KEY`
6. Variable value: Your API key
7. Click OK

**Linux/Mac (add to ~/.bashrc or ~/.zshrc):**
```bash
export GEMINI_API_KEY="your-actual-api-key-here"
```

#### Running the application:

After setting the environment variable, start the application:
```bash
mvn spring-boot:run
```

## Security Note

⚠️ **NEVER commit API keys to version control!**
- Always use environment variables for sensitive data
- Never hardcode API keys in source code
- Add `.env` files to `.gitignore` if using them
