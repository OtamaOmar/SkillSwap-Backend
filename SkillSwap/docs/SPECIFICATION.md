# SkillSwap — Technical Specification

**Date:** 2025-12-20  
**Scope:** Backend API + Database schema + Frontend integration contracts.

---

## 1. Architecture Overview

### 1.1 Components
- Frontend (React/Vite):
  - Pages: Landing, LearnMore, Login, SignUp, ForgetPass, Feed, Profile, Chat
  - `services/api.js`: Axios instance + auth header injection + optional refresh flow
- Backend (Node/Express):
  - `server.js`: Express app, CORS, mounts route modules, defines `/api/auth/*`
  - `routes/*`: feature routes
  - `controllers/*`: logic and DB operations
  - `middleware.js`: JWT auth guard
- Database (PostgreSQL):
  - SQL migrations under `migrations/`

### 1.2 Authentication Contract
- Client stores `accessToken` in localStorage.
- Client sends `Authorization: Bearer <accessToken>` for protected endpoints.
- Refresh endpoint:
  - `POST /api/auth/refresh`
  - Body: `{ "refresh_token": "<jwt>" }`
  - Response: `{ "session": { "access_token": "<newAccessToken>" } }`

---

## 2. Environment Variables

### Backend
- `PORT` (default 4000)
- `JWT_SECRET`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `FRONTEND_URL` (CORS)

> Recommendation: store secrets in `.env` locally and commit only `.env.example` containing names.

### Frontend
- `VITE_API_BASE_URL` (optional). If not set, frontend uses relative `/api`.

---

## 3. REST API (Summary)

### Auth (`/api/auth`)
- `POST /signup` body `{ email, password, username, full_name }`
- `POST /login` body `{ email, password }`
- `POST /logout`
- `POST /refresh` body `{ refresh_token }`

### Users (`/api/users`)
- `GET /` list users
- `GET /me` current user
- `PUT /me` update profile
- `GET /:id` user by id
- `GET /:id/posts` posts by user
- `POST /upload/profile-picture`
- `POST /upload/cover-image`

### Skills (`/api/skills`)
- `GET /me`
- `GET /user/:userId`
- `POST /`
- `PUT /:id`
- `DELETE /:id`

### Posts (`/api/posts`)
- `GET /`
- `GET /user/:userId`
- `POST /`
- `POST /:id/like`
- `DELETE /:id/like`
- `POST /:id/share`
- `GET /:id/comments`
- `POST /:id/comment`
- `GET /search`

### Comments (`/api/comments`)
- `POST /:parentId/replies`
- `DELETE /:commentId`

### Friendships (`/api/friendships`)
- `POST /request`
- `GET /requests/incoming`
- `GET /requests/outgoing`
- `GET /status/:otherUserId`
- `GET /`
- `GET /suggestions`
- `DELETE /:otherUserId`

### Chat (`/api/chat`)
- `GET /conversations`
- `GET /with/:userId`
- `POST /messages`
- `GET /stream` (SSE)

### Notifications (`/api/notifications`)
- `GET /`
- `GET /unread-count`
- `PUT /:id/read`
- `PUT /mark-all-read`
- `DELETE /:id`

---

## 4. Database Schema (from migrations)

### 4.1 Tables (key columns)

#### profiles
- id (UUID, PK), email (unique), password_hash
- username, full_name
- bio, location, country
- avatar_url, cover_image_url
- role, created_at, updated_at

#### skills
- id (UUID, PK), user_id (FK → profiles.id)
- skill_name, skill_type, created_at

#### posts
- id (UUID, PK), user_id (FK)
- content, image_url
- view_count, search_vector
- created_at, updated_at

#### comments
- id (UUID, PK), user_id (FK), post_id (FK)
- content, parent_comment_id (self-FK), created_at

#### likes / shares
- id (UUID, PK), user_id (FK), post_id (FK), created_at

#### friendships
- id (UUID, PK)
- user_id (FK), friend_id (FK)
- status, requested_by
- created_at, updated_at

#### messages
- id (UUID, PK)
- sender_id (FK), receiver_id (FK)
- content, created_at, read_at

#### notifications
- id (UUID, PK)
- user_id (FK), actor_id (FK)
- notification_type
- related_post_id / related_comment_id / related_friendship_id / related_message_id
- is_read, created_at

---

## 5. Error Handling (Recommended Standard)
- Status codes:
  - 400 invalid input
  - 401 unauthorized
  - 403 forbidden
  - 404 not found
  - 500 server error
- JSON body: `{ "error": "<message>" }`

---

## 6. Deployment Notes
- Frontend: static hosting (Vercel/Netlify/Azure)
- Backend: Node server (Render/Railway/Azure VM)
- DB: managed Postgres or container
- Ensure `FRONTEND_URL` CORS matches the deployed frontend domain.
