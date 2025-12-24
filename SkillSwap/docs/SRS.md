# SkillSwap — Specifications & Requirements (SRS)

**Date:** 2025-12-19  
**Scope:** SkillSwap Frontend (React) + Backend (Node/Express) + PostgreSQL.

## 1. Purpose
SkillSwap is a social platform where users create profiles, list skills, publish posts, connect with other users (friend requests), chat in real time, and receive notifications for activity.

## 2. System Context
- **Frontend:** React SPA (Vite) consuming REST API and an SSE stream.
- **Backend:** Node.js/Express REST API with JWT-based authentication.
- **Database:** PostgreSQL with SQL migrations.

## 3. Users & Roles
- **Guest (unauthenticated):** can access landing/learn more pages and authentication pages.
- **User (authenticated):** full platform functionality (feed, profile, skills, friendships, chat, notifications).

## 4. Functional Requirements

### FR-1 Authentication
- FR-1.1 Users can sign up using username, email, password, and full name.
- FR-1.2 Users can log in using email + password.
- FR-1.3 Backend issues a JWT access token used for protected requests (Authorization: Bearer).
- FR-1.4 Users can log out (client clears stored tokens).

### FR-2 Profile
- FR-2.1 Users can view their profile.
- FR-2.2 Users can view another user’s profile by id.
- FR-2.3 Users can update profile fields: full_name, bio, location, country.
- FR-2.4 Users can upload/update avatar and cover image.

### FR-3 Skills
- FR-3.1 Users can add skills (name + type/category).
- FR-3.2 Users can update and delete their skills.
- FR-3.3 Users can view their own skills and another user’s skills.

### FR-4 Posts & Feed
- FR-4.1 Users can create a post with text content and optional image_url.
- FR-4.2 Users can view the global feed (most recent first).
- FR-4.3 Users can view posts by a specific user.
- FR-4.4 Users can like and unlike a post.
- FR-4.5 Users can comment on a post.
- FR-4.6 Users can reply to a comment (threading).
- FR-4.7 Users can share a post.
- FR-4.8 Users can search posts by text query.
- **Note:** Some front-end API calls include endpoints not currently exposed in the backend routes (e.g., delete post, increment view). These are included as “planned” items in the backlog.

### FR-5 Friendships
- FR-5.1 Users can send friend requests to other users.
- FR-5.2 Users can view incoming friend requests and outgoing requests.
- FR-5.3 Users can accept or reject a friend request.
- FR-5.4 Users can unfriend/cancel pending requests.
- FR-5.5 Users can see their accepted connections.
- FR-5.6 Users can see suggestions (friends-of-friends + fallback).

### FR-6 Chat (Messaging)
- FR-6.1 Users can send a message to another user.
- FR-6.2 Users can view conversations list (recent chats with unread counts).
- FR-6.3 Users can view chat history with a specific user (paged).
- FR-6.4 Users can mark a conversation as read.
- FR-6.5 Users can subscribe to an SSE stream for real-time message/notification events.

### FR-7 Notifications
- FR-7.1 Users can list notifications with pagination.
- FR-7.2 Users can view unread notification count.
- FR-7.3 Users can mark a notification as read.
- FR-7.4 Users can mark all notifications as read.
- FR-7.5 Users can delete a notification.

## 5. Non-Functional Requirements

### NFR-1 Security
- JWT used for authorization on protected routes.
- Passwords must be stored as salted hashes (bcrypt).

### NFR-2 Performance
- Feed, notifications, and suggestions should support pagination.
- Create proper DB indexes for common queries (already included via migrations).

### NFR-3 Reliability & Availability
- API should return consistent JSON errors and avoid leaking stack traces in production.
- Basic health endpoint `/` is available.

### NFR-4 Maintainability
- Separation of concerns: routes/controllers, reusable middleware for auth, migrations for schema.

## 6. External Interfaces
- REST endpoints under `/api/*`
- Real-time SSE endpoint: `/api/chat/stream`
- Static uploads served under `/uploads/*`

## 7. Assumptions & Constraints
- PostgreSQL is available.
- Frontend stores JWT in localStorage (consider security tradeoffs; HttpOnly cookies are safer but not used here).
- Some features (e.g., refresh tokens) may require alignment between frontend and backend response shapes.

## 8. Acceptance Criteria (Project-level)
- A new user can sign up, log in, and access protected pages.
- A user can create a post, like/comment/share it, and see the activity reflected in feed and notifications.
- A user can send/accept friend requests and see connections.
- A user can chat and receive real-time updates via SSE.
