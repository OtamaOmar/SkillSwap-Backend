# PR: Friend requests + connections + suggestions + notifications

## Summary
Adds the social layer: friend requests workflow, connections list, suggestions, and notifications with read/unread behavior.

## Key changes
- Implements friend request lifecycle under `/api/friendships` (incoming/outgoing/accept/reject/unfriend).
- Adds `/api/friendships/status/:otherUserId` to check relationship state.
- Implements notifications endpoints: list, unread count, mark read, mark all read, delete.

## Files / areas touched
- `routes/friendships.js`
- `controllers/friendshipsController.js`
- `routes/notifications.js`
- `controllers/notificationsController.js`

## How to test (local)
1. Login as User A and send request: `POST /api/friendships/request` to User B.
2. Login as User B and accept: `PATCH /api/friendships/requests/:otherUserId/accept`.
3. Check notifications: `GET /api/notifications` and `GET /api/notifications/unread-count`.

## Suggested reviewers
- Backend: Fady Ragaie
- Backend: Mohamed Bassel
