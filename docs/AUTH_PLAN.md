# Authentication Plan

## Overview

Dual auth strategy: Email/password + Google OAuth. JWT-based with access + refresh tokens.

## Flow

### Email Registration
1. User submits name, email, password
2. Backend validates, hashes password (bcrypt)
3. Insert user into `users` table
4. Return access_token + refresh_token

### Email Login
1. User submits email + password
2. Backend verifies password hash
3. Return access_token + refresh_token

### Google OAuth
1. User clicks "Sign in with Google"
2. Frontend receives Google ID token from Google SDK
3. Frontend sends ID token to `POST /auth/google`
4. Backend verifies token with Google, extracts email/name/avatar
5. Upsert user (create if not exists, link google_id)
6. Return access_token + refresh_token

## Token Strategy

| Token | Lifetime | Storage | Usage |
|-------|----------|---------|-------|
| Access Token | 30 minutes | Memory (httpOnly cookie preferred) | API authorization |
| Refresh Token | 7 days | Secure cookie | Token renewal |

### Access Token Payload
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234569690
}
```

## Middleware

### Backend (FastAPI)
- `Depends(get_current_user)` dependency
- Extracts Bearer token from Authorization header
- Validates and decodes JWT
- Returns `UserContext` object
- 401 Unauthorized on failure

### Frontend (Next.js)
- Axios interceptor attaches token to all requests
- Automatic refresh on 401 response
- Redirect to `/login` on refresh failure

## Password Rules
- Minimum 8 characters
- At least 1 uppercase, 1 lowercase, 1 number
- Bcrypt hashing with 12 rounds

## Security
- CORS restricted to frontend origin
- HTTP-only cookies for token storage (preferred)
- No tokens in localStorage
- Rate limiting on auth endpoints
- Google ID token verified server-side (never trusted blindly)
