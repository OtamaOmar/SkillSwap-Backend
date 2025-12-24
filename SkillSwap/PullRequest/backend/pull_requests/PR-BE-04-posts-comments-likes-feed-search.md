# PR: Posts feed + comments + likes + shares + search

## Summary
Implements the core feed experience: listing posts, creating posts, liking, commenting, sharing, and searching posts.

## Key changes
- Adds authenticated feed endpoints under `/api/posts` including listing posts with counts + user-specific posts.
- Supports creating posts with optional `image_url`, and updating/deleting own posts.
- Supports liking/unliking posts and tracking `user_liked` state in feed response.
- Supports sharing posts and tracking shares count.
- Adds comment creation and replies + comment deletion endpoints.

## Files / areas touched
- `routes/posts.js`
- `routes/comments.js`

## How to test (local)
1. Login and call `GET /api/posts` to confirm posts include counts (likes/comments/shares) + `user_liked`.
2. Create a post via `POST /api/posts` and confirm it appears in the feed.
3. Like/unlike via `POST /api/posts/:id/like` and `DELETE /api/posts/:id/like`.
4. Search via `GET /api/posts/search?q=<term>`.

## Suggested reviewers
- Backend: Fady Ragaie
- Backend: Mohamed Bassel
