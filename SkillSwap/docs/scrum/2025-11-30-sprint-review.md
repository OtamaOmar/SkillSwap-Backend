# Sprint Review Summary

> **Reconstructed notes:** review was discussed at the end of the sprint; this summary documents what was demonstrated.

**Date:** 2025-11-30

**Sprint:** Sprint 0 (2025-11-01 → 2025-11-30)

**Meeting Type:** Sprint Review

**Attendees:**
- Backend: Fady Ragaie, Mohamed Bassel
- Frontend: Omar Tarek, Hamza Salah

**Facilitator:** Omar Tarek

---

## Demoed functionality
- Auth: signup/login + protected routes
- Profile: view/update profile; skills CRUD
- Feed: list posts + create post + like/unlike + comments
- Friendships: request + accept/reject + suggestions
- Notifications: list + mark as read (where applicable)
- Chat: send message + basic history + (initial) SSE stream skeleton

## What went well
- Daily communication enabled quick integration fixes.
- Backend responses were aligned early enough for frontend integration.

## What needs improvement
- Standardize duplicated skills paths and missing planned endpoints (delete post / view increment).
- Add more automated tests + CI early.

## Next sprint focus
- Stabilize chat SSE + unread counts.
- Polish UI + handle edge cases.
- Finalize docs and diagrams.

## Links
- Repos:
  - Backend: https://github.com/OtamaOmar/SkillSwap-Backend
  - Frontend: https://github.com/OtamaOmar/SkillSwap-Frontend
- Docs: `docs/SRS.md`, `docs/API_REFERENCE.md`, `docs/TEST_CASES.md`, `docs/BACKLOG.md`