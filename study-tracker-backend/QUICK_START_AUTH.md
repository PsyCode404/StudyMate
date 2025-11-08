# 🚀 Quick Start - Authentication API

## Start the Server

```bash
cd study-tracker-backend
mvn spring-boot:run
```

Server runs on: `http://localhost:8080`

---

## Test Endpoints (cURL)

### 1. Register
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@test.com","password":"pass123"}'
```

### 2. Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail":"alice","password":"pass123"}'
```

### 3. Access Protected Endpoint
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/study-logs
```

---

## Response Format

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "alice",
    "email": "alice@test.com"
  }
}
```

---

## Angular Integration

```typescript
// Login
this.http.post('http://localhost:8080/api/auth/login', {
  usernameOrEmail: 'alice',
  password: 'pass123'
}).subscribe(response => {
  localStorage.setItem('token', response.token);
});

// Use token
const headers = new HttpHeaders({
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});
this.http.get('http://localhost:8080/api/study-logs', { headers });
```

---

## Key Files

| File | Purpose |
|------|---------|
| `AuthController.java` | REST endpoints |
| `AuthService.java` | Business logic |
| `SecurityConfig.java` | Security configuration |
| `JwtUtil.java` | Token generation/validation |
| `application.properties` | JWT secret & expiration |

---

## Endpoints Summary

| Endpoint | Method | Auth Required |
|----------|--------|---------------|
| `/api/auth/register` | POST | ❌ |
| `/api/auth/login` | POST | ❌ |
| `/api/auth/test` | GET | ❌ |
| `/api/study-logs` | GET/POST/PUT/DELETE | ✅ |
| `/api/**` | ALL | ✅ |

---

## Common Issues

**401 Unauthorized?**  
→ Add `Authorization: Bearer <token>` header

**Username taken?**  
→ Use different username or check MongoDB

**CORS error?**  
→ Verify Angular runs on `localhost:4200`

---

## Production Checklist

- [ ] Change JWT secret in `application.properties`
- [ ] Use environment variables for secrets
- [ ] Reduce token expiration (e.g., 1 hour)
- [ ] Add refresh token mechanism
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Implement email verification
- [ ] Add password reset

---

**📖 Full Documentation:** See `AUTH_API_DOCUMENTATION.md` and `AUTHENTICATION_SETUP.md`
