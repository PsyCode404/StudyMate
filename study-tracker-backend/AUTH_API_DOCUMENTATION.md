# 🔐 Authentication API Documentation

## Overview
This document describes the JWT-based authentication system for the Study Tracker application.

## Base URL
```
http://localhost:8080/api/auth
```

## Endpoints

### 1. Register New User
**POST** `/api/auth/register`

Creates a new user account with hashed password and returns JWT token.

**Request Body:**
```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "password123"
}
```

**Validation Rules:**
- `username`: Required, 3-20 characters
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters

**Success Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "alice",
    "email": "alice@example.com"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `409 Conflict`: Username or email already exists

---

### 2. Login
**POST** `/api/auth/login`

Authenticates user and returns JWT token.

**Request Body:**
```json
{
  "usernameOrEmail": "alice",
  "password": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "alice",
    "email": "alice@example.com"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid credentials

---

### 3. Test Endpoint
**GET** `/api/auth/test`

Simple endpoint to verify auth service is running.

**Success Response (200 OK):**
```
Auth endpoint is working!
```

---

## Protected Endpoints

All endpoints under `/api/**` (except `/api/auth/**`) require authentication.

**Authorization Header:**
```
Authorization: Bearer <your_jwt_token>
```

**Example:**
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:8080/api/study-logs
```

---

## JWT Token Details

- **Algorithm**: HS256 (HMAC with SHA-256)
- **Expiration**: 30 days (2,592,000,000 milliseconds)
- **Claims**: 
  - `sub`: username
  - `iat`: issued at timestamp
  - `exp`: expiration timestamp

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "alice",
    "password": "password123"
  }'
```

### Access Protected Endpoint
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:8080/api/study-logs
```

---

## Testing with Postman

1. **Register/Login**: 
   - Method: POST
   - URL: `http://localhost:8080/api/auth/register` or `/login`
   - Body: raw JSON
   - Copy the `token` from response

2. **Access Protected Endpoints**:
   - Method: GET/POST/PUT/DELETE
   - URL: `http://localhost:8080/api/study-logs` (or other protected endpoint)
   - Headers: 
     - Key: `Authorization`
     - Value: `Bearer YOUR_TOKEN_HERE`

---

## Security Features

✅ **Password Hashing**: BCrypt with salt rounds  
✅ **Stateless Sessions**: JWT-based authentication  
✅ **CORS Protection**: Configured for Angular frontend  
✅ **Unique Constraints**: Username and email must be unique  
✅ **Token Validation**: Automatic validation on protected endpoints  
✅ **Long Expiration**: 30-day token validity  

---

## Error Handling

All errors return a consistent format:

```json
{
  "timestamp": "2025-01-19T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Username is already taken",
  "path": "/api/auth/register"
}
```

---

## Integration with Angular Frontend

### 1. Store Token
```typescript
localStorage.setItem('token', response.token);
localStorage.setItem('user', JSON.stringify(response.user));
```

### 2. Add Token to Requests
```typescript
const headers = new HttpHeaders({
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

this.http.get('http://localhost:8080/api/study-logs', { headers });
```

### 3. HTTP Interceptor (Recommended)
Create an interceptor to automatically add token to all requests:

```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return next.handle(req);
  }
}
```

---

## File Structure

```
src/main/java/com/mohamed/taskflow/
├── config/
│   └── SecurityConfig.java          # Spring Security configuration
├── controller/
│   └── AuthController.java          # Authentication endpoints
├── dto/
│   ├── RegisterRequest.java         # Registration DTO
│   ├── LoginRequest.java            # Login DTO
│   └── AuthResponse.java            # Response DTO
├── model/
│   └── User.java                    # User entity
├── repository/
│   └── UserRepository.java          # User data access
├── security/
│   ├── JwtUtil.java                 # JWT utility class
│   ├── CustomUserDetailsService.java # UserDetails implementation
│   └── JwtAuthenticationFilter.java # JWT filter
└── service/
    └── AuthService.java             # Authentication business logic
```

---

## Next Steps

1. **Build the project**: `mvn clean install`
2. **Run the application**: `mvn spring-boot:run`
3. **Test endpoints** using Postman or cURL
4. **Integrate with Angular frontend**
5. **Add refresh token mechanism** (optional)
6. **Implement password reset** (optional)
7. **Add email verification** (optional)

---

## Notes

- The JWT secret in `application.properties` should be changed in production
- Consider using environment variables for sensitive configuration
- Token expiration is set to 30 days for convenience
- All passwords are hashed using BCrypt before storage
- CORS is configured for `http://localhost:4200` (Angular default)
