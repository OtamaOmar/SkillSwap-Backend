# PR: Chat (messages, conversations, read receipts) + SSE real-time stream

## Summary
Implements chat APIs and server-sent-events (SSE) stream for real-time updates.

## Key changes
- Adds conversations list and per-user chat history endpoints under `/api/chat`.
- Supports sending messages and marking chats read.
- Implements `/api/chat/stream` using SSE for real-time updates.

## Files / areas touched
- `routes/chat.js`
- `controllers/chatController.js`
- `utils/realtime.js`

## How to test (local)
1. Login and call `GET /api/chat/conversations`.
2. Send a message: `POST /api/chat/messages` with `{receiverId, content}`.
3. Open `/api/chat/stream` with Authorization header and confirm events stream when messages are sent.

## Suggested reviewers
- Backend: Fady Ragaie
- Backend: Mohamed Bassel
