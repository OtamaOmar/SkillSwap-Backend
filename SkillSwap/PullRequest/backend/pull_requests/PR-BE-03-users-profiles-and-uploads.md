# PR: Users & profiles (me/profile/update) + avatar/cover uploads

## Summary
Adds profile endpoints for current user and other users, with support for profile updates and image uploads (avatar + cover).

## Key changes
- Implements `GET /api/users/me` to return current profile (auto-creates minimal profile if missing).
- Implements `PUT /api/users/me` to update profile fields (bio/location/country/etc.).
- Implements profile image uploads: `POST /api/users/upload/profile-picture` and `POST /api/users/upload/cover-image`.
- Serves uploaded files under `/uploads`.

## Files / areas touched
- `routes/users.js`
- `utils/upload.js`
- `server.js (static /uploads)`

## How to test (local)
1. Run backend and ensure `/uploads` is reachable.
2. Login to get a JWT access token, then call `GET /api/users/me` with `Authorization: Bearer <token>`.
3. Upload an image with multipart form-data to `/api/users/upload/profile-picture` and verify `avatar_url` updates.

## Suggested reviewers
- Backend: Fady Ragaie
- Backend: Mohamed Bassel
