import { pool } from "../db.js";

// GET /api/notifications
// Get all notifications for the current user
export const getNotifications = async (req, res) => {
  try {
    const myId = req.user.id;

    const result = await pool.query(
      `SELECT 
        n.id,
        n.user_id,
        n.actor_id,
        n.notification_type,
        n.related_post_id,
        n.related_comment_id,
        n.related_friendship_id,
        n.related_message_id,
        n.is_read,
        n.created_at,
        p.id as actor_id_verify,
        p.username as actor_username,
        p.full_name as actor_full_name,
        p.avatar_url as actor_avatar_url
       FROM notifications n
       LEFT JOIN profiles p ON n.actor_id = p.id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [myId]
    );

    res.json({ 
      count: result.rows.length, 
      notifications: result.rows 
    });
  } catch (error) {
    console.error("getNotifications error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/notifications/unread
// Get unread notifications count
export const getUnreadCount = async (req, res) => {
  try {
    const myId = req.user.id;

    const result = await pool.query(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false`,
      [myId]
    );

    res.json({ unread_count: parseInt(result.rows[0].count, 10) });
  } catch (error) {
    console.error("getUnreadCount error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// PATCH /api/notifications/:notificationId/read
// Mark a notification as read
export const markAsRead = async (req, res) => {
  try {
    const myId = req.user.id;
    const notificationId = req.params.notificationId;

    const result = await pool.query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [notificationId, myId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ success: true, notification: result.rows[0] });
  } catch (error) {
    console.error("markAsRead error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// PATCH /api/notifications/mark-all-read
// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const myId = req.user.id;

    await pool.query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE user_id = $1`,
      [myId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("markAllAsRead error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE /api/notifications/:notificationId
// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const myId = req.user.id;
    const notificationId = req.params.notificationId;

    const result = await pool.query(
      `DELETE FROM notifications 
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [notificationId, myId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("deleteNotification error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
