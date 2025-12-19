import express from 'express';
import { pool } from '../db.js';
import { authenticateToken } from '../middleware.js';
import { avatarUpload, coverUpload } from '../utils/upload.js';

const router = express.Router();

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // First check if profile exists
    let result = await pool.query(
      `SELECT id, username, email, full_name, bio, location, country, avatar_url, cover_image_url, role, created_at
       FROM profiles WHERE id = $1`,
      [req.user.id]
    );

    // If profile doesn't exist, create it from JWT auth data
    if (result.rows.length === 0) {
      const username = req.user.username || req.user.email?.split('@')[0] || 'user';
      const full_name = req.user.full_name || req.user.name || '';
      
      result = await pool.query(
        `INSERT INTO profiles (id, username, email, full_name, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET email = $3
         RETURNING id, username, email, full_name, bio, location, country, avatar_url, cover_image_url, role, created_at`,
        [req.user.id, username, req.user.email, full_name, 'user']
      );
    }

    const user = result.rows[0];

    // Get skills
    try {
      const skills = await pool.query(
        'SELECT id, skill_name, skill_type FROM skills WHERE user_id = $1 ORDER BY created_at DESC',
        [req.user.id]
      );
      user.skills = skills.rows;
    } catch (skillError) {
      console.warn('Skills table not found, returning empty array');
      user.skills = [];
    }

    // Get stats (posts + accepted friends)
    try {
      const stats = await pool.query(
        `SELECT 
          COALESCE((SELECT COUNT(*)::int FROM posts WHERE user_id = $1), 0) AS posts,
          COALESCE((SELECT COUNT(*)::int FROM friendships WHERE status = 'accepted' AND (user_id = $1 OR friend_id = $1)), 0) AS friends`,
        [req.user.id]
      );
      user.stats = stats.rows?.[0] || { posts: 0, friends: 0 };
    } catch (statsError) {
      console.warn('Stats query failed, defaulting to zero counts', statsError?.message || statsError);
      user.stats = { posts: 0, friends: 0 };
    }

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id?.trim();
    if (!userId || userId === 'null' || userId === 'undefined') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const result = await pool.query(
      `SELECT id, username, full_name, bio, location, country, avatar_url, cover_image_url, email, role, created_at
       FROM profiles WHERE id = $1::uuid`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Get skills
    const skills = await pool.query(
      'SELECT id, skill_name, skill_type FROM skills WHERE user_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    );

    user.skills = skills.rows;

    // Get stats - count accepted friendships correctly
    const stats = await pool.query(
      `SELECT 
        COALESCE((SELECT COUNT(*)::int FROM posts WHERE user_id = $1), 0) AS posts,
        COALESCE((SELECT COUNT(*)::int FROM friendships WHERE status = 'accepted' AND (user_id = $1 OR friend_id = $1)), 0) AS friends`,
      [req.params.id]
    );

    user.stats = stats.rows[0];
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, full_name, avatar_url, email, role, created_at FROM profiles ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get all users error:', error);
    // If table doesn't exist, return empty array
    if (error.code === '42P01') {
      return res.json([]);
    }
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Update user profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { full_name, bio, location, country } = req.body;

    const result = await pool.query(
      `UPDATE profiles 
       SET full_name = COALESCE($1, full_name),
           bio = COALESCE($2, bio),
           location = COALESCE($3, location),
           country = COALESCE($4, country),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, username, email, full_name, bio, location, country, avatar_url, cover_image_url, role, created_at`,
      [full_name, bio, location, country, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user posts
router.get('/:id/posts', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, 
              pr.username, pr.full_name, pr.avatar_url,
              COUNT(DISTINCT l.id) as likes_count,
              COUNT(DISTINCT c.id) as comments_count,
              COUNT(DISTINCT s.id) as shares_count
       FROM posts p
       LEFT JOIN profiles pr ON p.user_id = pr.id
       LEFT JOIN likes l ON p.id = l.post_id
       LEFT JOIN comments c ON p.id = c.post_id
       LEFT JOIN shares s ON p.id = s.post_id
       WHERE p.user_id = $1
       GROUP BY p.id, pr.id
       ORDER BY p.created_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add skill
router.post('/skills', authenticateToken, async (req, res) => {
  try {
    const { skill_name, skill_type } = req.body;

    if (!skill_name || !skill_type) {
      return res.status(400).json({ error: 'Skill name and type are required' });
    }

    const result = await pool.query(
      `INSERT INTO skills (user_id, skill_name, skill_type)
       VALUES ($1, $2, $3)
       RETURNING id, skill_name, skill_type, created_at`,
      [req.user.id, skill_name, skill_type]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add skill error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Skill already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete skill
router.delete('/skills/:skillId', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM skills WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.skillId, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload profile picture
// Upload profile picture (multipart form-data: key "image")
router.post('/upload/profile-picture', authenticateToken, avatarUpload.single('image'), async (req, res) => {
  try {
    let avatarUrl;
    if (req.file) {
      avatarUrl = `/uploads/avatars/${req.file.filename}`;
    } else if (req.body?.avatar_url) {
      // Fallback: accept direct URL if provided
      avatarUrl = req.body.avatar_url;
    } else {
      return res.status(400).json({ error: 'No image uploaded. Use form-data key: image or provide avatar_url.' });
    }

    const result = await pool.query(
      'UPDATE profiles SET avatar_url = $1, updated_at = NOW() WHERE id = $2 RETURNING avatar_url',
      [avatarUrl, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ avatar_url: result.rows[0].avatar_url });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload cover image
// Upload cover image (multipart form-data: key "image")
router.post('/upload/cover-image', authenticateToken, coverUpload.single('image'), async (req, res) => {
  try {
    let coverUrl;
    if (req.file) {
      coverUrl = `/uploads/covers/${req.file.filename}`;
    } else if (req.body?.cover_image_url) {
      // Fallback: accept direct URL if provided
      coverUrl = req.body.cover_image_url;
    } else {
      return res.status(400).json({ error: 'No image uploaded. Use form-data key: image or provide cover_image_url.' });
    }

    const result = await pool.query(
      'UPDATE profiles SET cover_image_url = $1, updated_at = NOW() WHERE id = $2 RETURNING cover_image_url',
      [coverUrl, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ cover_image_url: result.rows[0].cover_image_url });
  } catch (error) {
    console.error('Upload cover image error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
