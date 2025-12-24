# PR: Feed/Profile/Chat pages wired to backend APIs

## Summary
Connects the main UI pages to backend endpoints via the service layer: feed loading, profile viewing/updating, chat conversations and messaging, and notifications.

## Key changes
- Feed page fetches current user + posts + friend suggestions and supports like/comment/share actions.
- Profile page loads own profile or other user profile via `/api/users/:id` and supports updates.
- Chat page loads conversations, fetches history, sends messages, and supports real-time stream integration (if enabled).

## Files / areas touched
- `src/pages/FeedPage.jsx`
- `src/pages/ProfilePage.jsx`
- `src/pages/chat.jsx`
- `src/services/api.js`
- `src/components/LoadingSpinner.jsx`

## How to test (local)
1. Login and open `/feed` → confirm posts render and actions work (like/comment).
2. Navigate to `/profile` and `/profile/:id` → confirm profiles load.
3. Navigate to `/chat` → confirm conversations and messages work.

## Notes / assumptions
UI behavior depends on backend availability at `/api/*` (proxy) or `VITE_API_BASE_URL`.

## Suggested reviewers
- Frontend: Omar Tarek
- Frontend: Hamza Salah
- Backend: Mohamed Bassel
