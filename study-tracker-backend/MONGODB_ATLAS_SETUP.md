# MongoDB Atlas Cloud Setup Guide

## Prerequisites
- MongoDB Atlas account (free tier available at https://www.mongodb.com/cloud/atlas)
- Spring Boot application with `spring-boot-starter-data-mongodb` dependency

## Step 1: Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in to your account
3. Click **"Build a Database"** or **"Create"**
4. Choose **FREE** tier (M0 Sandbox)
5. Select your preferred cloud provider and region
6. Name your cluster (e.g., "TaskFlowCluster")
7. Click **"Create Cluster"** (takes 3-5 minutes)

## Step 2: Configure Database Access

1. In the left sidebar, click **"Database Access"** under Security
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter a username (e.g., `taskflow_user`)
5. Generate a secure password (save it securely!)
6. Set user privileges to **"Read and write to any database"**
7. Click **"Add User"**

## Step 3: Configure Network Access

1. In the left sidebar, click **"Network Access"** under Security
2. Click **"Add IP Address"**
3. For development:
   - Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - **Note:** For production, restrict to specific IPs
4. Click **"Confirm"**

## Step 4: Get Connection String

1. Go to **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Select **"Connect your application"**
4. Choose **"Java"** as driver and version **"4.3 or later"**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 5: Configure Your Application

### Option A: Using Environment Variable (Recommended)

1. Edit `set-mongodb-env.ps1` and replace placeholders:
   ```powershell
   $env:MONGODB_URI = "mongodb+srv://taskflow_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/taskflow?retryWrites=true&w=majority"
   ```

2. Run the script before starting your app:
   ```powershell
   .\set-mongodb-env.ps1
   ```

3. Start your Spring Boot application:
   ```powershell
   mvn spring-boot:run
   ```

### Option B: Direct Configuration

Edit `application.properties` and replace the placeholder:
```properties
spring.data.mongodb.uri=mongodb+srv://taskflow_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/taskflow?retryWrites=true&w=majority
```

**Important:** Never commit passwords to version control!

## Step 6: Verify Connection

1. Start your application
2. Check the logs for successful connection:
   ```
   INFO o.s.d.m.c.MongoTemplate : Opened connection [connectionId{localValue:1}]
   ```

3. If you see connection errors:
   - Verify username and password are correct
   - Check if IP address is whitelisted
   - Ensure cluster is active (not paused)

## Troubleshooting

### Connection Timeout
- Check network access settings in MongoDB Atlas
- Verify firewall isn't blocking port 27017

### Authentication Failed
- Double-check username and password
- Ensure password doesn't contain special characters that need URL encoding
- Use URL encoding for special characters: `@` → `%40`, `#` → `%23`, etc.

### Database Not Found
- MongoDB Atlas creates databases automatically on first write
- Ensure your application attempts to write data

## Security Best Practices

1. **Never hardcode credentials** in `application.properties`
2. Use environment variables or secret management tools
3. Restrict network access to specific IPs in production
4. Use strong passwords for database users
5. Enable database audit logs for production
6. Regularly rotate credentials

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Spring Data MongoDB Reference](https://docs.spring.io/spring-data/mongodb/docs/current/reference/html/)
- [Connection String Format](https://docs.mongodb.com/manual/reference/connection-string/)
