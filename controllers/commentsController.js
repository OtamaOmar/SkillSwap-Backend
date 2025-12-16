import { pool } from "../db.js";

// Build nested comments tree (replies)
const buildTree = (rows) => {
  const byId = new Map();
  const roots = [];

  for (const r of rows) {
    byId.set(r.id, {
      id: r.id,
      post_id: r.post_id,
      user_id: r.user_id,
      parent_comment_id: r.parent_comment_id,
      content: r.is_deleted ? null : r.content,
      is_deleted: r.is_deleted,
      created_at: r.created_at,
      user: {
        username: r.username,
        full_name: r.full_name,
        avatar_url: r.avatar_url,
      },
      replies: [],
    });
  }

  for (const node of byId.values()) {
    if (node.parent_comment_id && byId.has(node.parent_comment_id)) {
      byId.get(node.parent_comment_id).replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
};

const createNotification = async ({
  user_id,
  from_user_id,
  type,
  post_id,
  comment_id,
  message,
}) => {
  await pool.query(
    `INSERT INTO notifications (user_id, from_user_id, type, post_id, comment_id, message)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [user_id, from_user_id, type, post_id ?? null, comment_id ?? null, message ?? null]
  );
};

// GET /api/posts/:id/comments
export const getCommentsForPost = async (req, res) => {
  try {
    const postId = req.params.id;

    const result = await pool.query(
      `SELECT c.id, c.user_id, c.post_id, c.parent_comment_id, c.content, c.created_at, c.is_deleted,
              pr.username, pr.full_name, pr.avatar_url
       FROM comments c
       LEFT JOIN profiles pr ON c.user_id = pr.id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [postId]
    );

    res.json({ post_id: Number(postId), comments: buildTree(result.rows) });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// POST /api/posts/:id/comment
// body: { content, parent_comment_id? }
export const addCommentToPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { content, parent_comment_id } = req.body;

    if (!content || !String(content).trim()) {
      return res.status(400).json({ error: "Content is required" });
    }

    // confirm post exists + get post owner
    const post = await pool.query("SELECT id, user_id FROM posts WHERE id = $1", [postId]);
    if (post.rows.length === 0) return res.status(404).json({ error: "Post not found" });

    const postOwnerId = post.rows[0].user_id;

    // if reply: validate parent comment belongs to the same post
    let parentOwnerId = null;
    if (parent_comment_id) {
      const parent = await pool.query(
        "SELECT id, user_id, post_id FROM comments WHERE id = $1",
        [parent_comment_id]
      );

      if (parent.rows.length === 0) return res.status(404).json({ error: "Parent comment not found" });
      if (Number(parent.rows[0].post_id) !== Number(postId)) {
        return res.status(400).json({ error: "Parent comment does not belong to this post" });
      }
      parentOwnerId = parent.rows[0].user_id;
    }

    const inserted = await pool.query(
      `INSERT INTO comments (user_id, post_id, content, parent_comment_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, post_id, parent_comment_id, content, created_at, is_deleted`,
      [req.user.id, postId, content.trim(), parent_comment_id ?? null]
    );

    const userInfo = await pool.query(
      "SELECT username, full_name, avatar_url FROM profiles WHERE id = $1",
      [req.user.id]
    );

    const responseComment = {
      ...inserted.rows[0],
      user: userInfo.rows[0] ?? { username: null, full_name: null, avatar_url: null },
    };

    // Notifications (avoid notifying yourself)
    const receivers = new Set();
    if (postOwnerId && postOwnerId !== req.user.id) receivers.add(postOwnerId);
    if (parentOwnerId && parentOwnerId !== req.user.id) receivers.add(parentOwnerId);

    const actorName = req.user.username || req.user.full_name || "Someone";
    const notifType = parent_comment_id ? "reply" : "comment";
    const message =
      notifType === "reply"
        ? `${actorName} replied to a comment on your post`
        : `${actorName} commented on your post`;

    for (const user_id of receivers) {
      await createNotification({
        user_id,
        from_user_id: req.user.id,
        type: notifType,
        post_id: Number(postId),
        comment_id: responseComment.id,
        message,
      });
    }

    res.status(201).json(responseComment);
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE /api/comments/:commentId
// Allowed: comment owner OR post owner. Soft delete if it has replies.
export const deleteComment = async (req, res) => {
  const client = await pool.connect();
  try {
    const commentId = req.params.commentId;

    const comment = await client.query(
      "SELECT id, user_id, post_id FROM comments WHERE id = $1",
      [commentId]
    );
    if (comment.rows.length === 0) return res.status(404).json({ error: "Comment not found" });

    const commentOwnerId = comment.rows[0].user_id;
    const postId = comment.rows[0].post_id;

    const post = await client.query("SELECT user_id FROM posts WHERE id = $1", [postId]);
    const postOwnerId = post.rows[0]?.user_id;

    const allowed = req.user.id === commentOwnerId || (postOwnerId && req.user.id === postOwnerId);
    if (!allowed) return res.status(403).json({ error: "Not allowed" });

    await client.query("BEGIN");

    const repliesCount = await client.query(
      "SELECT COUNT(*)::int AS cnt FROM comments WHERE parent_comment_id = $1",
      [commentId]
    );

    if (repliesCount.rows[0].cnt > 0) {
      const updated = await client.query(
        "UPDATE comments SET is_deleted = TRUE, content = '[deleted]' WHERE id = $1 RETURNING id, is_deleted",
        [commentId]
      );
      await client.query("COMMIT");
      return res.json({ success: true, mode: "soft", comment: updated.rows[0] });
    }

    await client.query("DELETE FROM comments WHERE id = $1", [commentId]);
    await client.query("COMMIT");
    res.json({ success: true, mode: "hard" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Delete comment error:", error);
    res.status(500).json({ error: "Server error" });
  } finally {
    client.release();
  }
};
