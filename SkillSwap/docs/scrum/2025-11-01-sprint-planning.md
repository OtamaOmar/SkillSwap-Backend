# Sprint Planning Summary


**Date:** 2025-11-01

**Sprint:** Sprint 0 (2025-11-01 → 2025-11-30)

**Meeting Type:** Sprint Planning

**Attendees:**
- Backend: Fady Ragaie, Mohamed Bassel
- Frontend: Omar Tarek, Hamza Salah

**Facilitator:** Omar Tarek

---

## Sprint Goal
Deliver an end-to-end working MVP of **SkillSwap**:
- Authentication (signup/login/logout)
- Profiles + skills
- Feed (posts + comments + likes)
- Friendships (requests + accept/reject + suggestions)
- Chat (messages + SSE stream)
- Notifications

## Scope / Backlog selected
- **P0:** Auth + protected routes, users/me, basic profile, skills CRUD, feed list + create post, like/unlike, comment, friendships request + accept/reject, chat send + history, notifications list/mark read.
- **P1:** Search, shares, UI polish, edge-case handling (duplicate friend requests, duplicate likes).
- **P2:** Deployment hardening, rate limiting, advanced UX.

## Roles & responsibilities
- **Backend (Fady):** auth routes, middleware, DB integration, consistency of response shapes.
- **Backend (Mohamed):** posts/comments/likes/friendships controllers and edge-case handling.
- **Frontend (Omar):** routing + auth flow + axios/interceptors + integration wiring.
- **Frontend (Hamza):** pages/components UI + state handling + e2e flow testing.

## Risks
- Endpoint naming mismatches between FE services and BE routes.
- SSE reliability depending on deployment proxy.

## Links
- Backlog: `docs/BACKLOG.md`
- Repos:
  - Backend: https://github.com/OtamaOmar/SkillSwap-Backend
  - Frontend: https://github.com/OtamaOmar/SkillSwap-Frontend
