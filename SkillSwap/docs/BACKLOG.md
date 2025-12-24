# Product Backlog (User Stories)



## Epic E1 — Authentication & Security
- **US-1:** As a user, I can sign up so that I can create an account.
  - Acceptance: `/api/auth/signup` creates user; password hashed; token returned.
- **US-2:** As a user, I can log in so that I can access protected features.
- **US-3:** As a user, I can log out so that my session is ended on this device.
- **US-4 (Alignment):** As a user, my session can be refreshed securely.
  - Notes: Frontend expects refresh_token; backend refresh exists but signup/login do not return refresh_token.

## Epic E2 — Profiles
- **US-5:** As a user, I can view my profile with my skills and stats.
- **US-6:** As a user, I can edit my profile (bio/location/country).
- **US-7:** As a user, I can upload avatar and cover images.

## Epic E3 — Skills
- **US-8:** As a user, I can add/update/delete skills.
  - Notes: Standardize between `/api/skills` vs `/api/users/skills`.

## Epic E4 — Feed / Posts
- **US-9:** As a user, I can create posts (text + optional image).
- **US-10:** As a user, I can like/unlike posts.
- **US-11:** As a user, I can comment on posts and reply to comments.
- **US-12:** As a user, I can share posts.
- **US-13:** As a user, I can search posts by text.
- **US-14 (Planned):** As a user, I can delete my post.
  - Notes: Frontend calls `DELETE /api/posts/:id`, but backend route is not currently exposed (controller exists).
- **US-15 (Planned):** As a user, views are counted per post.
  - Notes: Migration adds `view_count`; frontend calls increment endpoint.

## Epic E5 — Friendships
- **US-16:** As a user, I can send friend requests.
- **US-17:** As a user, I can accept/reject incoming requests.
- **US-18:** As a user, I can view connections.
- **US-19:** As a user, I can see suggestions.

## Epic E6 — Chat & Real-time
- **US-20:** As a user, I can send messages.
- **US-21:** As a user, I can view conversation list and chat history.
- **US-22:** As a user, I can receive messages in real-time via SSE.

## Epic E7 — Notifications
- **US-23:** As a user, I can see notifications for likes/comments/shares/requests/messages.
- **US-24:** As a user, I can mark notifications read and clear them.

## Epic E8 — DevOps / Quality
- **US-25:** As a team, we have automated CI running lint + tests on PRs.
- **US-26:** As a team, we have automated deployment to a hosting provider (e.g., Render/Railway/Vercel).
- **US-27:** As a team, we have a documented Definition of Done.

