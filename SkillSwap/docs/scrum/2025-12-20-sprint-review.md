# Sprint Review Summary

> **Reconstructed notes:** final review before submission; summary written afterwards.

**Date:** 2025-12-20

**Sprint:** Sprint 1 (2025-12-01 → 2025-12-20)

**Meeting Type:** Sprint Review

**Attendees:**
- Backend: Fady Ragaie, Mohamed Bassel
- Frontend: Omar Tarek, Hamza Salah

**Facilitator:** Omar Tarek

---

## Demoed functionality
- Login/signup → protected pages access
- Profile view/update + skills management
- Feed: create posts, view feed, like/unlike, comment
- Friendships: request/accept/reject + suggestions
- Chat: send messages, view history, real-time updates (SSE where supported)
- Notifications: list, mark read, unread badge (if enabled)

## Quality checks performed
- Smoke test on a clean install (install dependencies, run backend, run frontend)
- Manual regression using the key test cases in `docs/TEST_CASES.md` (Auth, Feed, Friends, Chat, Notifications)
- Quick validation of error handling for 401/403 and bad requests (400)

## Known gaps / follow-ups
- If any planned endpoint remains unused or not implemented (delete post/view count), track it as a backlog item and remove dead client calls.
- Add more automated tests over time (unit tests for controllers + frontend component tests).

## Links
- Repos:
  - Backend: https://github.com/OtamaOmar/SkillSwap-Backend
  - Frontend: https://github.com/OtamaOmar/SkillSwap-Frontend
- Docs: `docs/SRS.md`, `docs/API_REFERENCE.md`, `docs/TEST_CASES.md`, `docs/diagrams/*`