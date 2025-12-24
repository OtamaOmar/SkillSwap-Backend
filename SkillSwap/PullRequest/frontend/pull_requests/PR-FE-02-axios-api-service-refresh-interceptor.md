# PR: Axios API service layer + refresh-token interceptor

## Summary
Adds a centralized API client layer with automatic Authorization headers and (optional) refresh-token retry handling for 401 responses.

## Key changes
- Uses relative `/api` paths by default (works behind Docker/Nginx proxy), with `VITE_API_BASE_URL` fallback for local dev.
- Automatically attaches `Authorization: Bearer <token>` on requests using axios request interceptor.
- On 401 responses, tries to refresh using `POST /api/auth/refresh` with `{ refresh_token }` if a refresh token exists; retries the original request on success.
- If no refresh token exists (or refresh fails), clears auth storage and redirects to `/login`.

## Files / areas touched
- `src/services/api.js`
- `.env (optional VITE_API_BASE_URL)`
- `README.md (local dev notes)`

## How to test (local)
1. Start backend on `http://localhost:4000` and frontend on `http://localhost:5173`.
2. Login and verify API calls include the Authorization header.
3. Trigger a 401 (e.g., by using an invalid token) and confirm the app redirects to `/login` when no refresh token is available.

## Notes / assumptions
Backend currently returns `session.access_token` on signup/login and refresh; refresh token handling is optional in the frontend.

## Suggested reviewers
- Frontend: Omar Tarek
- Frontend: Hamza Salah
- Backend: Fady Ragaie
