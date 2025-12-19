import express from 'express';
import { pool } from '../db.js';
import { authenticateToken } from '../middleware.js';

const router = express.Router();

// Add reply to a comment
router.post('/:parentId/replies', authenticateToken, async (req, res) => {
  try {
    const parentId = parseInt(req.params.parentId, 10);
    const { content } = req.body;
    if (!content || !parentId) {
      return res.status(400).json({ error: 'Content and valid parent comment id are required' });
    }

    const parent = await pool.query('SELECT id, post_id, user_id FROM comments WHERE id = $1', [parentId]);
    if (parent.rows.length === 0) {
      return res.status(404).json({ error: 'Parent comment not found' });
    }

    const postId = parent.rows[0].post_id;

    const insert = await pool.query(
      `INSERT INTO comments (user_id, post_id, content, parent_comment_id)
       VALUES ($1::uuid, $2::integer, $3, $4::integer)
       RETURNING id, user_id, post_id, content, parent_comment_id, created_at`,
      [req.user.id, postId, content, parentId]
    );

    // Optionally create a notification for the parent comment author
    try {
      const parentAuthor = parent.rows[0].user_id;
      if (parentAuthor && parentAuthor !== req.user.id) {
        await pool.query(
          `INSERT INTO notifications (user_id, actor_id, notification_type, related_post_id, related_comment_id)
           VALUES ($1::uuid, $2::uuid, 'comment', $3::integer, $4::integer)`,
          [parentAuthor, req.user.id, postId, insert.rows[0].id]
        );
      }
    } catch (e) {
      console.warn('Create reply notification error:', e.message);
    }

    res.status(201).json(insert.rows[0]);
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a comment
router.delete('/:commentId', authenticateToken, async (req, res) => {
  try {
    const commentId = parseInt(req.params.commentId, 10);
    await pool.query('DELETE FROM comments WHERE id = $1 AND user_id = $2::uuid', [commentId, req.user.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
