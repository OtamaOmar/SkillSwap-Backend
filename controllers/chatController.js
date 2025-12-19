import { pool } from "../db.js";
import { addClient, removeClient, pushToUser } from "../utils/realtime.js";

// Helper: create a notification aligned with notifications schema
const createNotification = async ({ user_id, actor_id, notification_type, related_message_id = null }) => {
  await pool.query(
    `INSERT INTO notifications (user_id, actor_id, notification_type, related_message_id)
     VALUES ($1::uuid, $2::uuid, $3, $4)`,
    [user_id, actor_id, notification_type, related_message_id]
  );
};

// GET /api/chat/conversations
// returns recent chats (one row per other user)
export const getConversations = async (req, res) => {
  try {
    const myId = req.user.id; // UUID string

    const result = await pool.query(
      `
      WITH last_msgs AS (
        SELECT
          CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END AS other_id,
          MAX(created_at) AS last_time
        FROM messages
        WHERE sender_id = $1 OR receiver_id = $1
        GROUP BY 1
      )
      SELECT
        lm.other_id,
        p.username,
        p.full_name,
        p.avatar_url,
        m.content AS last_message,
        m.created_at AS last_message_time,
        (
          SELECT COUNT(*)::int
          FROM messages mm
          WHERE mm.receiver_id = $1
            AND mm.sender_id = lm.other_id
            AND mm.read_at IS NULL
        ) AS unread_count
      FROM last_msgs lm
      JOIN profiles p ON p.id = lm.other_id
      JOIN messages m
        ON (
          (m.sender_id = $1 AND m.receiver_id = lm.other_id)
          OR
          (m.sender_id = lm.other_id AND m.receiver_id = $1)
        )
       AND m.created_at = lm.last_time
      ORDER BY lm.last_time DESC
      `,
      [myId]
    );

    res.json({ count: result.rows.length, conversations: result.rows });
  } catch (error) {
    console.error("getConversations error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/chat/with/:userId?limit=30&offset=0
export const getChatHistory = async (req, res) => {
  try {
    const myId = req.user.id; // UUID string
    const otherId = req.params.userId; // UUID string

    let limit = Number(req.query.limit ?? 30);
    let offset = Number(req.query.offset ?? 0);
    if (!Number.isFinite(limit) || limit <= 0) limit = 30;
    if (!Number.isFinite(offset) || offset < 0) offset = 0;
    limit = Math.min(limit, 100);

    const result = await pool.query(
      `
      SELECT m.*,
             sp.username AS sender_username, sp.full_name AS sender_full_name, sp.avatar_url AS sender_avatar_url,
             rp.username AS receiver_username, rp.full_name AS receiver_full_name, rp.avatar_url AS receiver_avatar_url
      FROM messages m
      LEFT JOIN profiles sp ON sp.id = m.sender_id
      LEFT JOIN profiles rp ON rp.id = m.receiver_id
      WHERE (m.sender_id = $1 AND m.receiver_id = $2)
         OR (m.sender_id = $2 AND m.receiver_id = $1)
      ORDER BY m.created_at DESC
      LIMIT $3 OFFSET $4
      `,
      [myId, otherId, limit, offset]
    );

    res.json({ limit, offset, count: result.rows.length, messages: result.rows });
  } catch (error) {
    console.error("getChatHistory error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// POST /api/chat/messages
// body: { toUserId, content }
export const sendMessage = async (req, res) => {
  try {
    const fromId = req.user.id; // UUID string
    const toId = req.body.toUserId; // UUID string
    const content = String(req.body.content ?? "").trim();

    if (!toId) {
      return res.status(400).json({ error: "toUserId is required" });
    }
    if (!content) return res.status(400).json({ error: "content is required" });
    if (toId === fromId) return res.status(400).json({ error: "Cannot message yourself" });

    // ensure receiver exists
    const target = await pool.query("SELECT id FROM profiles WHERE id = $1", [toId]);
    if (target.rows.length === 0) return res.status(404).json({ error: "User not found" });

    const inserted = await pool.query(
      `
      INSERT INTO messages (sender_id, receiver_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [fromId, toId, content]
    );

    const msg = inserted.rows[0];

    // create notification in DB
    await createNotification({
      user_id: toId,
      actor_id: fromId,
      notification_type: "message",
      related_message_id: msg.id,
    });

    // push real-time SSE event to receiver
    pushToUser(toId, "message", msg);
    pushToUser(toId, "notification", { notification_type: "message", actor_id: fromId, message_id: msg.id });

    res.status(201).json(msg);
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// PATCH /api/chat/with/:userId/read
export const markChatRead = async (req, res) => {
  try {
    const myId = req.user.id; // UUID string
    const otherId = req.params.userId; // UUID string

    const updated = await pool.query(
      `
      UPDATE messages
      SET read_at = NOW()
      WHERE receiver_id = $1
        AND sender_id = $2
        AND read_at IS NULL
      `,
      [myId, otherId]
    );

    res.json({ success: true, updated: updated.rowCount });
  } catch (error) {
    console.error("markChatRead error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/chat/stream  (SSE real-time)
// Keep this open in frontend to receive events.
export const stream = async (req, res) => {
  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // If behind proxies, helps:
  res.flushHeaders?.();

  const myId = req.user.id; // UUID string
  addClient(myId, res);

  // initial ping
  res.write(`event: ready\ndata: ${JSON.stringify({ ok: true })}\n\n`);

  req.on("close", () => {
    removeClient(myId, res);
  });
};
