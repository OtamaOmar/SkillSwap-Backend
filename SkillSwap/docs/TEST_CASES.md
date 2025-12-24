# SkillSwap — Test Cases (Functional)

**Legend**  
- **Type:** Manual / API (Postman) / Automated (recommended)  
- **Priority:** P0 (must), P1 (should), P2 (nice)

---

## A. Authentication

### TC-AUTH-01 — Sign up (happy path)
- **Type:** API + UI
- **Priority:** P0
- **Preconditions:** Backend running, DB migrated
- **Steps:**
  1) Open `/signup`
  2) Enter valid username, email, password, full name
  3) Submit
- **Expected:** User created; backend returns `session.access_token`; frontend stores token and navigates to `/feed`.

### TC-AUTH-02 — Sign up with duplicate email
- **Type:** API + UI
- **Priority:** P0
- **Steps:** Sign up using an email that already exists
- **Expected:** 400 with `Email already registered`; UI shows error message.

### TC-AUTH-03 — Login (happy path)
- **Type:** API + UI
- **Priority:** P0
- **Steps:** Log in with correct email/password
- **Expected:** 200 + token; `/feed` accessible.

### TC-AUTH-04 — Login with wrong password
- **Type:** API + UI
- **Priority:** P0
- **Expected:** 401 with `Invalid email or password`; user stays on login page.

### TC-AUTH-05 — Access protected route without token
- **Type:** UI
- **Priority:** P0
- **Steps:** Clear localStorage token then open `/feed`
- **Expected:** Redirect to `/login`.

### TC-AUTH-06 — Expired/invalid token
- **Type:** API
- **Priority:** P0
- **Steps:** Call a protected endpoint with invalid JWT
- **Expected:** 403 Authentication failed.

---

## B. Profile

### TC-PRO-01 — Get current profile
- **Type:** API
- **Priority:** P0
- **Steps:** `GET /api/users/me` with valid token
- **Expected:** 200 user fields + `skills` array + `stats` object.

### TC-PRO-02 — Update profile fields
- **Type:** API + UI
- **Priority:** P0
- **Steps:** Update `bio/location/country`
- **Expected:** 200 with updated values.

### TC-PRO-03 — View another user profile
- **Type:** UI
- **Priority:** P1
- **Steps:** Navigate to `/profile/<userId>`
- **Expected:** Profile details + skills + stats.

### TC-PRO-04 — Upload avatar (URL fallback)
- **Type:** API
- **Priority:** P1
- **Steps:** `POST /api/users/upload/profile-picture` with JSON `{ avatar_url }`
- **Expected:** 200 returns avatar_url saved to profile.

### TC-PRO-05 — Upload cover (multipart)
- **Type:** API
- **Priority:** P2
- **Steps:** multipart form-data key `image`
- **Expected:** file stored under `/uploads/covers/*` and profile updated.

---

## C. Skills

### TC-SK-01 — Add skill
- **Type:** API + UI
- **Priority:** P0
- **Steps:** Add skill name/type
- **Expected:** 201 skill record appears in profile.

### TC-SK-02 — Add skill missing fields
- **Type:** API
- **Priority:** P0
- **Expected:** 400 `Skill name and type are required`.

### TC-SK-03 — Delete own skill
- **Type:** API + UI
- **Priority:** P1
- **Expected:** 200 success; skill removed.

### TC-SK-04 — Update skill
- **Type:** API
- **Priority:** P2
- **Expected:** 200 returns updated skill.

---

## D. Posts & Comments

### TC-POST-01 — Create post (text only)
- **Type:** API + UI
- **Priority:** P0
- **Steps:** Create post with `{content}`
- **Expected:** 201 with post id; appears in feed.

### TC-POST-02 — Create post empty content
- **Type:** API
- **Priority:** P0
- **Expected:** 400 `Content is required`.

### TC-POST-03 — Get feed posts
- **Type:** API + UI
- **Priority:** P0
- **Steps:** `GET /api/posts` with token
- **Expected:** 200 list ordered by created_at desc, includes counts and `user_liked`.

### TC-POST-04 — Like post
- **Type:** API + UI
- **Priority:** P0
- **Steps:** `POST /api/posts/:id/like`
- **Expected:** success true; likes_count increments; post owner receives notification.

### TC-POST-05 — Like post twice
- **Type:** API
- **Priority:** P1
- **Steps:** call like endpoint twice
- **Expected:** second call does not duplicate like due to unique constraint; still success.

### TC-POST-06 — Unlike post
- **Type:** API + UI
- **Priority:** P1
- **Expected:** success true; likes_count decrements.

### TC-POST-07 — Add comment
- **Type:** API + UI
- **Priority:** P0
- **Steps:** `POST /api/posts/:id/comment` with content
- **Expected:** 201 comment; post owner gets notification.

### TC-POST-08 — Reply to comment
- **Type:** API + UI
- **Priority:** P1
- **Steps:** `POST /api/comments/:parentId/replies`
- **Expected:** 201 reply comment linked to parent; parent author gets notification (if different).

### TC-POST-09 — Delete comment (owner only)
- **Type:** API
- **Priority:** P1
- **Steps:** Delete someone else’s comment
- **Expected:** Should not delete; API currently returns success true even if rowCount=0 (log as improvement item).

### TC-POST-10 — Share post
- **Type:** API + UI
- **Priority:** P2
- **Expected:** success true; owner gets share notification.

### TC-POST-11 — Search posts
- **Type:** API + UI
- **Priority:** P1
- **Steps:** `GET /api/posts/search?q=hello`
- **Expected:** returns posts containing query in content.

---

## E. Friendships

### TC-FR-01 — Send friend request
- **Type:** API + UI
- **Priority:** P0
- **Steps:** `POST /api/friendships/request` to another user id
- **Expected:** 201 pending friendship; receiver gets notification.

### TC-FR-02 — Send request to self
- **Type:** API
- **Priority:** P0
- **Expected:** 400 `You cannot send a friend request to yourself`.

### TC-FR-03 — View incoming requests
- **Type:** API + UI
- **Priority:** P0
- **Expected:** shows pending where you are the receiver.

### TC-FR-04 — Accept request (receiver only)
- **Type:** API
- **Priority:** P0
- **Steps:** Receiver calls accept endpoint
- **Expected:** status becomes accepted; requester gets accepted notification.

### TC-FR-05 — Reject request
- **Type:** API
- **Priority:** P1
- **Expected:** status becomes rejected; requester gets rejected notification.

### TC-FR-06 — Request already pending
- **Type:** API
- **Priority:** P1
- **Expected:** 409 conflict.

### TC-FR-07 — Suggestions exclude existing/pending
- **Type:** API
- **Priority:** P2
- **Expected:** suggestions do not include already accepted or pending users.

---

## F. Chat (Messages + SSE)

### TC-CHAT-01 — Send message
- **Type:** API + UI
- **Priority:** P0
- **Expected:** 201 message saved; receiver gets notification.

### TC-CHAT-02 — Get conversations
- **Type:** API
- **Priority:** P1
- **Expected:** list of recent conversations with unread_count.

### TC-CHAT-03 — Mark conversation as read
- **Type:** API
- **Priority:** P1
- **Expected:** messages read_at updated; unread_count becomes 0.

### TC-CHAT-04 — SSE stream receives events
- **Type:** Manual
- **Priority:** P2
- **Steps:** Open `/api/chat/stream` as authenticated user, send message from another user
- **Expected:** SSE emits event `message` and `notification`.

---

## G. Notifications

### TC-NOTIF-01 — List notifications
- **Type:** API + UI
- **Priority:** P0
- **Expected:** ordered by created_at desc, includes content string.

### TC-NOTIF-02 — Unread count
- **Type:** API
- **Priority:** P1
- **Expected:** correct unread_count.

### TC-NOTIF-03 — Mark one notification read
- **Type:** API + UI
- **Priority:** P1
- **Expected:** is_read true.

### TC-NOTIF-04 — Mark all read
- **Type:** API
- **Priority:** P2
- **Expected:** all unread become read.

### TC-NOTIF-05 — Delete notification
- **Type:** API + UI
- **Priority:** P2
- **Expected:** deleted for current user only.

---

## H. Negative / Edge Cases

### TC-EDGE-01 — SQL injection attempt in search query
- **Type:** API
- **Priority:** P1
- **Steps:** pass `q="' OR 1=1 --"`
- **Expected:** no crash; results only match literal content due to parameterized query.

### TC-EDGE-02 — Rate limiting (not implemented)
- **Type:** Manual
- **Priority:** P2
- **Expected:** Document as improvement (optional middleware).

### TC-EDGE-03 — Consistency of refresh tokens
- **Type:** API + UI
- **Priority:** P1
- **Expected:** If refresh is used, backend should issue refresh_token and frontend should store it. Currently misaligned; track in backlog.

