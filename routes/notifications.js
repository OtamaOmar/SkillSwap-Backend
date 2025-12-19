import express from 'express';
import { pool } from '../db.js';
import { authenticateToken } from '../middleware.js';

const router = express.Router();

// List notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const offset = parseInt(req.query.offset, 10) || 0;
    const result = await pool.query(
      `SELECT n.id, n.user_id, n.actor_id, n.notification_type,
              n.related_post_id, n.related_comment_id, n.related_friendship_id, n.related_message_id,
              n.is_read, n.created_at,
              p.username AS actor_username, p.full_name AS actor_full_name, p.avatar_url AS actor_avatar_url,
              CASE n.notification_type
                WHEN 'friend_request' THEN COALESCE(p.full_name, p.username, 'Someone') || ' sent you a friend request'
                WHEN 'friend_request_accepted'  THEN COALESCE(p.full_name, p.username, 'Someone') || ' accepted your friend request'
                WHEN 'friend_request_rejected'  THEN COALESCE(p.full_name, p.username, 'Someone') || ' rejected your friend request'
                WHEN 'friend_accept'  THEN COALESCE(p.full_name, p.username, 'Someone') || ' accepted your friend request'
                WHEN 'like'           THEN COALESCE(p.full_name, p.username, 'Someone') || ' liked your post'
                WHEN 'comment'        THEN COALESCE(p.full_name, p.username, 'Someone') || ' commented on your post'
                WHEN 'message'        THEN COALESCE(p.full_name, p.username, 'Someone') || ' sent you a message'
                WHEN 'share'          THEN COALESCE(p.full_name, p.username, 'Someone') || ' shared your post'
                ELSE 'You have a new notification'
              END AS content
       FROM notifications n
       LEFT JOIN profiles p ON p.id = n.actor_id
       WHERE n.user_id = $1::uuid
       ORDER BY n.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Unread count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*)::int AS unread_count FROM notifications WHERE user_id = $1::uuid AND is_read = false',
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark single notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2::uuid RETURNING id, is_read',
      [id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark all as read
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1::uuid AND is_read = false',
      [req.user.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await pool.query('DELETE FROM notifications WHERE id = $1 AND user_id = $2::uuid', [id, req.user.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
