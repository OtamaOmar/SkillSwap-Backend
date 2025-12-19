
import express from 'express';
import { pool } from '../db.js';
import { authenticateToken } from '../middleware.js';

const router = express.Router();

// Get all posts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.user_id, p.content, p.image_url, p.created_at, p.updated_at,
              pr.username, pr.full_name, pr.avatar_url,
              COUNT(DISTINCT l.id) as likes_count,
              COUNT(DISTINCT c.id) as comments_count,
              COUNT(DISTINCT s.id) as shares_count,
              (SELECT COUNT(*) > 0 FROM likes WHERE post_id = p.id AND user_id = $1::uuid) as user_liked,
              (
                SELECT COALESCE(json_agg(json_build_object(
                  'id', t.id,
                  'content', t.content,
                  'created_at', t.created_at,
                  'username', t.username,
                  'avatar_url', t.avatar_url
                )) FILTER (WHERE t.id IS NOT NULL), '[]'::json)
                FROM (
                  SELECT c2.id, c2.content, c2.created_at, pr2.username, pr2.avatar_url
                  FROM comments c2
                  LEFT JOIN profiles pr2 ON c2.user_id = pr2.id
                  WHERE c2.post_id = p.id AND c2.parent_comment_id IS NULL
                  ORDER BY c2.created_at DESC
                  LIMIT 10
                ) t
              ) AS comments
       FROM posts p
       LEFT JOIN profiles pr ON p.user_id = pr.id
       LEFT JOIN likes l ON p.id = l.post_id
       LEFT JOIN comments c ON p.id = c.post_id
       LEFT JOIN shares s ON p.id = s.post_id
       GROUP BY p.id, pr.username, pr.full_name, pr.avatar_url
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user posts
router.get('/user/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.user_id, p.content, p.image_url, p.created_at, p.updated_at,
              pr.username, pr.full_name, pr.avatar_url,
              COUNT(DISTINCT l.id) as likes_count,
              COUNT(DISTINCT c.id) as comments_count,
              COUNT(DISTINCT s.id) as shares_count,
              (
                SELECT COALESCE(json_agg(json_build_object(
                  'id', t.id,
                  'content', t.content,
                  'created_at', t.created_at,
                  'username', t.username,
                  'avatar_url', t.avatar_url
                )) FILTER (WHERE t.id IS NOT NULL), '[]'::json)
                FROM (
                  SELECT c2.id, c2.content, c2.created_at, pr2.username, pr2.avatar_url
                  FROM comments c2
                  LEFT JOIN profiles pr2 ON c2.user_id = pr2.id
                  WHERE c2.post_id = p.id AND c2.parent_comment_id IS NULL
                  ORDER BY c2.created_at DESC
                  LIMIT 10
                ) t
              ) AS comments
       FROM posts p
       LEFT JOIN profiles pr ON p.user_id = pr.id
       LEFT JOIN likes l ON p.id = l.post_id
       LEFT JOIN comments c ON p.id = c.post_id
       LEFT JOIN shares s ON p.id = s.post_id
      WHERE p.user_id = $1::uuid
       GROUP BY p.id, pr.username, pr.full_name, pr.avatar_url
       ORDER BY p.created_at DESC`,
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create post
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content, image_url } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const result = await pool.query(
      `INSERT INTO posts (user_id, content, image_url)
       VALUES ($1::uuid, $2, $3)
       RETURNING *`,
      [req.user.id, content, image_url || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Share post
router.post('/:id/share', authenticateToken, async (req, res) => {
  try {
    const postId = parseInt(req.params.id, 10);

    // Insert share
    await pool.query(
      `INSERT INTO shares (user_id, post_id)
       VALUES ($1::uuid, $2::integer)
       ON CONFLICT DO NOTHING`,
      [req.user.id, postId]
    );

    // Create notification for post owner
    try {
      const postOwner = await pool.query('SELECT user_id FROM posts WHERE id = $1', [postId]);
      const ownerId = postOwner.rows[0]?.user_id;
      if (ownerId && ownerId !== req.user.id) {
        await pool.query(
          `INSERT INTO notifications (user_id, actor_id, notification_type, related_post_id)
           VALUES ($1::uuid, $2::uuid, 'share', $3::integer)`,
          [ownerId, req.user.id, postId]
        );
      }
    } catch (e) {
      console.warn('Share notification error:', e.message);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search posts
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const q = (req.query.q || '').toString().trim();
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    if (!q) return res.json([]);

    const result = await pool.query(
      `SELECT p.id, p.user_id, p.content, p.image_url, p.created_at, p.updated_at,
              pr.username, pr.full_name, pr.avatar_url,
              COUNT(DISTINCT l.id) as likes_count,
              COUNT(DISTINCT c.id) as comments_count,
              COUNT(DISTINCT s.id) as shares_count,
              (SELECT COUNT(*) > 0 FROM likes WHERE post_id = p.id AND user_id = $2::uuid) as user_liked
       FROM posts p
       LEFT JOIN profiles pr ON p.user_id = pr.id
       LEFT JOIN likes l ON p.id = l.post_id
       LEFT JOIN comments c ON p.id = c.post_id
       LEFT JOIN shares s ON p.id = s.post_id
       WHERE p.content ILIKE '%' || $1 || '%'
       GROUP BY p.id, pr.username, pr.full_name, pr.avatar_url
       ORDER BY p.created_at DESC
       LIMIT $3`,
      [q, req.user.id, limit]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get comments for a post
router.get('/:id/comments', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, pr.username, pr.full_name, pr.avatar_url
       FROM comments c
       LEFT JOIN profiles pr ON c.user_id = pr.id
       WHERE c.post_id = $1
       ORDER BY c.created_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add comment to post
router.post('/:id/comment', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const result = await pool.query(
      `INSERT INTO comments (user_id, post_id, content)
       VALUES ($1::uuid, $2::integer, $3)
       RETURNING id, user_id, post_id, content, created_at`,
      [req.user.id, req.params.id, content]
    );

    // Create notification for post owner
    try {
      const postOwner = await pool.query('SELECT user_id FROM posts WHERE id = $1', [req.params.id]);
      const ownerId = postOwner.rows[0]?.user_id;
      if (ownerId && ownerId !== req.user.id) {
        await pool.query(
          `INSERT INTO notifications (user_id, actor_id, notification_type, related_post_id, related_comment_id)
           VALUES ($1::uuid, $2::uuid, 'comment', $3::integer, $4::integer)`,
          [ownerId, req.user.id, req.params.id, result.rows[0].id]
        );
      }
    } catch (e) {
      console.warn('Comment notification error:', e.message);
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Like post
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO likes (user_id, post_id)
       VALUES ($1::uuid, $2::integer)
       ON CONFLICT DO NOTHING`,
      [req.user.id, req.params.id]
    );

    // Create notification for post owner
    try {
      const postOwner = await pool.query('SELECT user_id FROM posts WHERE id = $1', [req.params.id]);
      const ownerId = postOwner.rows[0]?.user_id;
      if (ownerId && ownerId !== req.user.id) {
        await pool.query(
          `INSERT INTO notifications (user_id, actor_id, notification_type, related_post_id)
           VALUES ($1::uuid, $2::uuid, 'like', $3::integer)`,
          [ownerId, req.user.id, req.params.id]
        );
      }
    } catch (e) {
      console.warn('Like notification error:', e.message);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Unlike post
router.delete('/:id/like', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM likes WHERE user_id = $1::uuid AND post_id = $2::integer',
      [req.user.id, req.params.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Unlike post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;