import { pool } from "../db.js";

// GET /api/notifications?limit=30&offset=0
export const getMyNotifications = async (req, res) => {
  try {
    let limit = Number(req.query.limit ?? 30);
    let offset = Number(req.query.offset ?? 0);

    if (!Number.isFinite(limit) || limit <= 0) limit = 30;
    if (!Number.isFinite(offset) || offset < 0) offset = 0;
    limit = Math.min(limit, 100);

    const result = await pool.query(
      `SELECT n.*,
              p.username as from_username,
              p.full_name as from_full_name,
              p.avatar_url as from_avatar_url
       FROM notifications n
       LEFT JOIN profiles p ON n.from_user_id = p.id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    res.json({ limit, offset, count: result.rows.length, notifications: result.rows });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/notifications/unread-count
export const getUnreadCount = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = FALSE",
      [req.user.id]
    );
    res.json({ unread: result.rows[0].count });
  } catch (error) {
    console.error("Unread count error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// PATCH /api/notifications/:id/read
export const markNotificationRead = async (req, res) => {
  try {
    const id = req.params.id;

    const result = await pool.query(
      `UPDATE notifications
       SET is_read = TRUE
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Notification not found" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// PATCH /api/notifications/read-all
export const markAllRead = async (req, res) => {
  try {
    await pool.query(
      "UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE",
      [req.user.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Mark all read error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
