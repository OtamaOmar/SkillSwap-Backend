// controllers/postsController.js
import { pool } from "../db.js";

// -----------------------------
// SEARCH: GET /api/posts/search?q=...
// -----------------------------
export const searchPosts = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) return res.status(400).json({ error: "Query parameter 'q' is required" });

    let limit = Number(req.query.limit ?? 20);
    let offset = Number(req.query.offset ?? 0);
    if (!Number.isFinite(limit) || limit <= 0) limit = 20;
    if (!Number.isFinite(offset) || offset < 0) offset = 0;
    limit = Math.min(limit, 50);

    const result = await pool.query(
      `SELECT p.*,
              pr.username, pr.full_name, pr.avatar_url,
              COUNT(DISTINCT l.id) as likes_count,
              COUNT(DISTINCT c.id) as comments_count,
              COUNT(DISTINCT s.id) as shares_count,
              (SELECT COUNT(*) > 0 FROM likes WHERE post_id = p.id AND user_id = $1) as user_liked
       FROM posts p
       LEFT JOIN profiles pr ON p.user_id = pr.id
       LEFT JOIN likes l ON p.id = l.post_id
       LEFT JOIN comments c ON p.id = c.post_id
       LEFT JOIN shares s ON p.id = s.post_id
       WHERE p.content ILIKE $2
       GROUP BY p.id, pr.id
       ORDER BY p.created_at DESC
       LIMIT $3 OFFSET $4`,
      [req.user.id, `%${q}%`, limit, offset]
    );

    res.json({ q, limit, offset, count: result.rows.length, posts: result.rows });
  } catch (error) {
    console.error("Search posts error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// -----------------------------
// FEED: GET /api/posts/feed
// my posts + accepted friends posts
// -----------------------------
export const getFeed = async (req, res) => {
  try {
    let limit = Number(req.query.limit ?? 20);
    let offset = Number(req.query.offset ?? 0);
    if (!Number.isFinite(limit) || limit <= 0) limit = 20;
    if (!Number.isFinite(offset) || offset < 0) offset = 0;
    limit = Math.min(limit, 50);

    const result = await pool.query(
      `
      WITH friends AS (
        SELECT CASE
          WHEN user_id = $1 THEN friend_id
          ELSE user_id
        END AS friend_id
        FROM friendships
        WHERE (user_id = $1 OR friend_id = $1)
          AND status = 'accepted'
      )
      SELECT p.*,
             pr.username, pr.full_name, pr.avatar_url,
             COUNT(DISTINCT l.id) as likes_count,
             COUNT(DISTINCT c.id) as comments_count,
             COUNT(DISTINCT s.id) as shares_count,
             (SELECT COUNT(*) > 0 FROM likes WHERE post_id = p.id AND user_id = $1) as user_liked
      FROM posts p
      LEFT JOIN profiles pr ON p.user_id = pr.id
      LEFT JOIN likes l ON p.id = l.post_id
      LEFT JOIN comments c ON p.id = c.post_id
      LEFT JOIN shares s ON p.id = s.post_id
      WHERE p.user_id = $1
         OR p.user_id IN (SELECT friend_id FROM friends)
      GROUP BY p.id, pr.id
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
      `,
      [req.user.id, limit, offset]
    );

    res.json({ limit, offset, count: result.rows.length, posts: result.rows });
  } catch (error) {
    console.error("Get feed error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// -----------------------------
// READ ONE: GET /api/posts/:id
// -----------------------------
export const getPostById = async (req, res) => {
  try {
    const postId = req.params.id;

    const result = await pool.query(
      `SELECT p.*,
              pr.username, pr.full_name, pr.avatar_url,
              COUNT(DISTINCT l.id) as likes_count,
              COUNT(DISTINCT c.id) as comments_count,
              COUNT(DISTINCT s.id) as shares_count,
              (SELECT COUNT(*) > 0 FROM likes WHERE post_id = p.id AND user_id = $1) as user_liked
       FROM posts p
       LEFT JOIN profiles pr ON p.user_id = pr.id
       LEFT JOIN likes l ON p.id = l.post_id
       LEFT JOIN comments c ON p.id = c.post_id
       LEFT JOIN shares s ON p.id = s.post_id
       WHERE p.id = $2
       GROUP BY p.id, pr.id`,
      [req.user.id, postId]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Post not found" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get post by id error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// -----------------------------
// UPDATE: PUT /api/posts/:id  (owner only)
// body: { content?, image_url? }  (image_url can be null)
// -----------------------------
export const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { content, image_url } = req.body;

    if (content === undefined && image_url === undefined) {
      return res.status(400).json({ error: "Provide content and/or image_url" });
    }

    const existing = await pool.query("SELECT user_id FROM posts WHERE id = $1", [postId]);
    if (existing.rows.length === 0) return res.status(404).json({ error: "Post not found" });

    // safe compare
    if (String(existing.rows[0].user_id) !== String(req.user.id)) {
      return res.status(403).json({ error: "Not allowed" });
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (content !== undefined) {
      fields.push(`content = $${idx++}`);
      values.push(content);
    }
    if (image_url !== undefined) {
      fields.push(`image_url = $${idx++}`);
      values.push(image_url); // allow null
    }

    values.push(postId);

    const updated = await pool.query(
      `UPDATE posts SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );

    res.json(updated.rows[0]);
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// -----------------------------
// DELETE: DELETE /api/posts/:id  (owner only)
// -----------------------------
export const deletePost = async (req, res) => {
  const client = await pool.connect();
  try {
    const postId = req.params.id;

    const existing = await client.query("SELECT user_id FROM posts WHERE id = $1", [postId]);
    if (existing.rows.length === 0) return res.status(404).json({ error: "Post not found" });

    if (String(existing.rows[0].user_id) !== String(req.user.id)) {
      return res.status(403).json({ error: "Not allowed" });
    }

    await client.query("BEGIN");

    // remove dependencies first
    await client.query("DELETE FROM likes WHERE post_id = $1", [postId]);
    await client.query("DELETE FROM comments WHERE post_id = $1", [postId]);
    await client.query("DELETE FROM shares WHERE post_id = $1", [postId]);

    await client.query("DELETE FROM posts WHERE id = $1", [postId]);

    await client.query("COMMIT");
    res.json({ success: true });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Delete post error:", error);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
};

// -----------------------------
// IMAGE: POST /api/posts/:id/image (multer will attach req.file)
// owner only
// -----------------------------
export const setPostImageUrl = async (req, res) => {
  try {
    const postId = req.params.id;

    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded. Use form-data key: image" });
    }

    const existing = await pool.query("SELECT user_id FROM posts WHERE id = $1", [postId]);
    if (existing.rows.length === 0) return res.status(404).json({ error: "Post not found" });

    if (String(existing.rows[0].user_id) !== String(req.user.id)) {
      return res.status(403).json({ error: "Not allowed" });
    }

    const imageUrl = `/uploads/posts/${req.file.filename}`;

    const updated = await pool.query(
      "UPDATE posts SET image_url = $1 WHERE id = $2 RETURNING *",
      [imageUrl, postId]
    );

    res.json(updated.rows[0]);
  } catch (error) {
    console.error("Set post image error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
