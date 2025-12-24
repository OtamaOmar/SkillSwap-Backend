# PR: Frontend routing + protected routes + auth pages

## Summary
Implements the main route structure of the SkillSwap SPA and protects authenticated pages using a reusable `ProtectedRoute` component.

## Key changes
- Defines all routes in `src/App.jsx` (landing, login, signup, feed, profile, chat, learn more, forgot password).
- Protects authenticated routes (`/feed`, `/profile`, `/chat`) using `ProtectedRoute`.
- Adds basic loading spinner component for async states.

## Files / areas touched
- `src/App.jsx`
- `src/components/ProtectedRoute.jsx`
- `src/components/LoadingSpinner.jsx`
- `src/pages/LoginPage.jsx`
- `src/pages/SignUp.jsx`
- `src/pages/ForgetPassPage.jsx`

## How to test (local)
1. Run `npm install && npm run dev` (http://localhost:5173).
2. Without a token in localStorage, try visiting `/feed` → should redirect to `/login`.
3. Complete signup/login and confirm `/feed` is accessible.

## Suggested reviewers
- Frontend: Omar Tarek
- Frontend: Hamza Salah
