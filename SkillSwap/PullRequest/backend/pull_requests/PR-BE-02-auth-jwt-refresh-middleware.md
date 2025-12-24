# PR: Auth (signup/login/logout/refresh) + JWT middleware

## Summary
Implements JWT-based authentication endpoints in the backend and a reusable middleware to protect API routes.

## Key changes
- Implements `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, and `/api/auth/refresh` in `server.js`.
- Hashes passwords using `bcrypt` and signs tokens using `jsonwebtoken` (24h expiry).
- `/api/auth/refresh` accepts `{ refresh_token }` and returns `{ session: { access_token } }` (new access token).
- Adds `authenticateToken` middleware used across routes to secure endpoints.

## Files / areas touched
- `server.js (auth routes)`
- `middleware.js (authenticateToken)`

## How to test (local)
1. Start backend: `npm install && npm run dev` (default `http://localhost:4000`).
2. Signup: `POST /api/auth/signup` with `{email,password,username,full_name}` → expect `session.access_token` (and `token`).
3. Login: `POST /api/auth/login` with `{email,password}` → expect `session.access_token` (and `token`).
4. Refresh: `POST /api/auth/refresh` with `{refresh_token}` → expect `{session:{access_token}}`.

## Notes / assumptions
Auth routes are implemented directly in `server.js`. The access token payload includes `{id, email}`.

## Suggested reviewers
- Backend: Fady Ragaie
- Backend: Mohamed Bassel
