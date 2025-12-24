# SkillSwap — Requirements (Checklist Format)

**Date:** 2025-12-20  
**Purpose:** A concise requirements checklist aligned with test cases and endpoints.

---

## Functional Requirements

| ID | Requirement | Priority | UI | API (base: /api) | Tests |
|---|---|---:|---|---|---|
| FR-1 | Sign up, login, logout, refresh endpoint | P0 | /signup, /login | /auth/signup, /auth/login, /auth/logout, /auth/refresh | TC-AUTH-01..06 |
| FR-2 | View/update profile + upload images | P0 | /profile, /profile/:id | /users/me, /users/:id, /users/me (PUT), /users/upload/* | TC-PRO-01..05 |
| FR-3 | Skills CRUD | P0 | Profile sections | /skills/* | TC-SKILL-01..04 |
| FR-4 | Feed + posts + likes + comments + shares + search | P0/P1 | /feed | /posts/*, /comments/* | TC-POST-* + TC-COMMENT-* |
| FR-5 | Friend requests + status + suggestions + remove | P0 | Friends module | /friendships/* | TC-FRIEND-* |
| FR-6 | Chat + SSE stream | P0/P1 | /chat | /chat/* | TC-CHAT-* |
| FR-7 | Notifications list/unread/read/delete | P1 | Notifications UI | /notifications/* | TC-NOTIF-* |

---

## Non-Functional Requirements

| ID | Requirement | Priority | Metric / Acceptance |
|---|---|---:|---|
| NFR-SEC-1 | Secure password storage | P0 | password stored as hash in DB |
| NFR-SEC-2 | JWT protects private endpoints | P0 | unauthorized request → 401 |
| NFR-REL-1 | Consistent error responses | P1 | `{ "error": "<message>" }` |
| NFR-PERF-1 | Reasonable API latency | P1 | typical requests < 500ms (dev scale) |
| NFR-USE-1 | User feedback on loading/errors | P1 | spinner + message shown |

---

## Deliverable Traceability
- Details live in:
  - `docs/SRS.md`
  - `docs/API_REFERENCE.md`
  - `docs/TEST_CASES.md`
  - `docs/SPECIFICATION.md`
