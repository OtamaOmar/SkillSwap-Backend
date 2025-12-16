import { pool } from "../db.js";

// POST /api/posts/:id/share
export const sharePost = async (req, res) => {
  try {
    const postId = req.params.id;

    // Ensure post exists
    const post = await pool.query("SELECT id FROM posts WHERE id = $1", [postId]);
    if (post.rows.length === 0) return res.status(404).json({ error: "Post not found" });

    await pool.query(
      `INSERT INTO shares (user_id, post_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [req.user.id, postId]
    );

    return res.json({ success: true });
  } catch (error) {
    console.error("Share post error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// DELETE /api/posts/:id/share
export const unsharePost = async (req, res) => {
  try {
    const postId = req.params.id;

    await pool.query(
      "DELETE FROM shares WHERE user_id = $1 AND post_id = $2",
      [req.user.id, postId]
    );

    return res.json({ success: true });
  } catch (error) {
    console.error("Unshare post error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

// POST /api/posts/:id/view
// increments view_count by 1
export const addView = async (req, res) => {
  try {
    const postId = req.params.id;

    const updated = await pool.query(
      `UPDATE posts
       SET view_count = COALESCE(view_count, 0) + 1
       WHERE id = $1
       RETURNING id, view_count`,
      [postId]
    );

    if (updated.rows.length === 0) return res.status(404).json({ error: "Post not found" });

    return res.json({ success: true, post: updated.rows[0] });
  } catch (error) {
    console.error("Add view error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
