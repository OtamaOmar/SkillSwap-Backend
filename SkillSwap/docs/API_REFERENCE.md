# SkillSwap — API Reference (from code)

> Local Base URL: `http://localhost:4000`  
> (If your backend is deployed, replace with your deployed API host.)  
> All protected endpoints require header: `Authorization: Bearer <access_token>`

## Auth
### POST `/api/auth/signup`
Body:
```json
{ "username": "u", "email": "e@x.com", "password": "p", "full_name": "Full Name" }
```
Responses:
- `201` user + `token` + `session.access_token`

### POST `/api/auth/login`
Body:
```json
{ "email": "e@x.com", "password": "p" }
```
Responses:
- `200` user + `token` + `session.access_token`

### POST `/api/auth/logout`
Returns `{ "message": "Logged out successfully" }`

### POST `/api/auth/refresh`
Body:
```json
{ "refresh_token": "<token>" }
```
Returns `session.access_token` (Note: current signup/login do not return refresh_token; align in backlog)

## Users / Profiles
### GET `/api/users`
- Returns list of profiles (public fields)

### GET `/api/users/me` (protected)
- Returns current user profile + `skills` + `stats`

### GET `/api/users/:id` (protected)
- Returns profile by id + `skills` + `stats`

### PUT `/api/users/me` (protected)
Body (any subset):
```json
{ "full_name": "Fady Ragaie", "bio": "Computer science student. Interested in skill exchange.", "location": "Cairo", "country": "Egypt" }
```

### POST `/api/users/upload/profile-picture` (protected)
- multipart form-data key `image` **OR** JSON `{ "avatar_url": "<url>" }`

### POST `/api/users/upload/cover-image` (protected)
- multipart form-data key `image` **OR** JSON `{ "cover_image_url": "<url>" }`

### POST `/api/users/skills` (protected)
Body:
```json
{ "skill_name": "React", "skill_type": "technical" }
```

### DELETE `/api/users/skills/:skillId` (protected)

## Skills (separate route group)
### GET `/api/skills/me` (protected)
### GET `/api/skills/user/:userId`
### POST `/api/skills` (protected)
### PUT `/api/skills/:id` (protected)
### DELETE `/api/skills/:id` (protected)

> Note: There are **two** ways to manage skills (`/api/users/skills` and `/api/skills`). Standardize in backlog.

## Posts
### GET `/api/posts` (protected)
- Returns posts with `likes_count`, `comments_count`, `shares_count`, `user_liked`, and up to 10 latest top-level comments

### GET `/api/posts/user/:userId`
- Returns posts for a user (public)

### POST `/api/posts` (protected)
Body:
```json
{ "content": "text", "image_url": "optional-url-or-null" }
```

### POST `/api/posts/:id/like` (protected)
### DELETE `/api/posts/:id/like` (protected)

### POST `/api/posts/:id/comment` (protected)
Body:
```json
{ "content": "comment text" }
```

### GET `/api/posts/:id/comments`
- returns comments for post (includes author info)

### POST `/api/posts/:id/share` (protected)

### GET `/api/posts/search?q=<text>&limit=20` (protected)

## Comments
### POST `/api/comments/:parentId/replies` (protected)
Body:
```json
{ "content": "reply text" }
```

### DELETE `/api/comments/:commentId` (protected)

## Friendships
### POST `/api/friendships/request` (protected)
Body: `{ "toUserId": "<uuid>" }`

### GET `/api/friendships/requests/incoming` (protected)
### GET `/api/friendships/requests/outgoing` (protected)
### PATCH `/api/friendships/requests/:otherUserId/accept` (protected)
### PATCH `/api/friendships/requests/:otherUserId/reject` (protected)
### DELETE `/api/friendships/:otherUserId` (protected)
### GET `/api/friendships` (protected) — connections
### GET `/api/friendships/suggestions?limit=20&offset=0` (protected)
### GET `/api/friendships/status/:otherUserId` (protected)

## Chat
### GET `/api/chat/conversations` (protected)
### GET `/api/chat/with/:userId?limit=30&offset=0` (protected)
### POST `/api/chat/messages` (protected)
Body: `{ "toUserId": "<uuid>", "content": "hi" }`

### PATCH `/api/chat/with/:userId/read` (protected)
### GET `/api/chat/stream` (protected, SSE)

## Notifications
### GET `/api/notifications?limit=20&offset=0` (protected)
### GET `/api/notifications/unread-count` (protected)
### PUT `/api/notifications/:id/read` (protected)
### PUT `/api/notifications/mark-all-read` (protected)
### DELETE `/api/notifications/:id` (protected)
