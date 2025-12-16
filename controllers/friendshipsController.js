import { pool } from "../db.js";

const canonicalPair = (a, b) => {
  const x = Number(a);
  const y = Number(b);
  return x < y ? [x, y] : [y, x];
};

const getOtherId = (row, myId) => (row.user_id === myId ? row.friend_id : row.user_id);

// POST /api/friends/request
// body: { toUserId }
export const sendFriendRequest = async (req, res) => {
  try {
    const myId = Number(req.user.id);
    const toUserId = Number(req.body.toUserId);

    if (!toUserId || !Number.isFinite(toUserId)) {
      return res.status(400).json({ error: "toUserId is required (number)" });
    }
    if (toUserId === myId) {
      return res.status(400).json({ error: "You cannot send a friend request to yourself" });
    }

    // target exists?
    const target = await pool.query("SELECT id FROM profiles WHERE id = $1", [toUserId]);
    if (target.rows.length === 0) return res.status(404).json({ error: "User not found" });

    const [u, f] = canonicalPair(myId, toUserId);

    // insert if not exists
    const existing = await pool.query(
      "SELECT * FROM friendships WHERE user_id = $1 AND friend_id = $2",
      [u, f]
    );

    if (existing.rows.length > 0) {
      const row = existing.rows[0];

      // If previously rejected, allow re-request by setting pending again
      if (row.status === "rejected") {
        const updated = await pool.query(
          `UPDATE friendships
           SET status = 'pending', requested_by = $3, updated_at = NOW()
           WHERE user_id = $1 AND friend_id = $2
           RETURNING *`,
          [u, f, myId]
        );
        return res.json({ success: true, friendship: updated.rows[0], message: "Request sent again" });
      }

      if (row.status === "pending") return res.status(409).json({ error: "Friend request already pending" });
      if (row.status === "accepted") return res.status(409).json({ error: "You are already friends" });
    }

    const created = await pool.query(
      `INSERT INTO friendships (user_id, friend_id, status, requested_by)
       VALUES ($1, $2, 'pending', $3)
       RETURNING *`,
      [u, f, myId]
    );

    res.status(201).json({ success: true, friendship: created.rows[0] });
  } catch (error) {
    console.error("sendFriendRequest error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/friends/requests/incoming
export const getIncomingRequests = async (req, res) => {
  try {
    const myId = Number(req.user.id);

    const result = await pool.query(
      `SELECT fr.*,
              p.id as requester_id, p.username as requester_username, p.full_name as requester_full_name, p.avatar_url as requester_avatar_url
       FROM friendships fr
       JOIN profiles p ON p.id = fr.requested_by
       WHERE fr.status = 'pending'
         AND fr.requested_by <> $1
         AND ($1 = fr.user_id OR $1 = fr.friend_id)
       ORDER BY fr.created_at DESC`,
      [myId]
    );

    res.json({ count: result.rows.length, requests: result.rows });
  } catch (error) {
    console.error("getIncomingRequests error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/friends/requests/outgoing
export const getOutgoingRequests = async (req, res) => {
  try {
    const myId = Number(req.user.id);

    const result = await pool.query(
      `SELECT fr.*,
              p.id as target_id, p.username as target_username, p.full_name as target_full_name, p.avatar_url as target_avatar_url
       FROM friendships fr
       JOIN profiles p
         ON p.id = CASE WHEN fr.user_id = $1 THEN fr.friend_id ELSE fr.user_id END
       WHERE fr.status = 'pending'
         AND fr.requested_by = $1
         AND ($1 = fr.user_id OR $1 = fr.friend_id)
       ORDER BY fr.created_at DESC`,
      [myId]
    );

    res.json({ count: result.rows.length, requests: result.rows });
  } catch (error) {
    console.error("getOutgoingRequests error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// PATCH /api/friends/requests/:otherUserId/accept
export const acceptRequest = async (req, res) => {
  try {
    const myId = Number(req.user.id);
    const otherUserId = Number(req.params.otherUserId);
    if (!otherUserId || !Number.isFinite(otherUserId)) {
      return res.status(400).json({ error: "otherUserId is required" });
    }
    if (otherUserId === myId) return res.status(400).json({ error: "Invalid user" });

    const [u, f] = canonicalPair(myId, otherUserId);

    const fr = await pool.query(
      "SELECT * FROM friendships WHERE user_id = $1 AND friend_id = $2",
      [u, f]
    );
    if (fr.rows.length === 0) return res.status(404).json({ error: "Friend request not found" });

    const row = fr.rows[0];
    if (row.status !== "pending") return res.status(409).json({ error: `Request is not pending (status=${row.status})` });

    // Only receiver can accept: requested_by must be the other person
    if (row.requested_by === myId) return res.status(403).json({ error: "You cannot accept your own request" });

    const updated = await pool.query(
      `UPDATE friendships
       SET status = 'accepted', updated_at = NOW()
       WHERE user_id = $1 AND friend_id = $2
       RETURNING *`,
      [u, f]
    );

    res.json({ success: true, friendship: updated.rows[0] });
  } catch (error) {
    console.error("acceptRequest error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// PATCH /api/friends/requests/:otherUserId/reject
export const rejectRequest = async (req, res) => {
  try {
    const myId = Number(req.user.id);
    const otherUserId = Number(req.params.otherUserId);
    if (!otherUserId || !Number.isFinite(otherUserId)) {
      return res.status(400).json({ error: "otherUserId is required" });
    }
    if (otherUserId === myId) return res.status(400).json({ error: "Invalid user" });

    const [u, f] = canonicalPair(myId, otherUserId);

    const fr = await pool.query(
      "SELECT * FROM friendships WHERE user_id = $1 AND friend_id = $2",
      [u, f]
    );
    if (fr.rows.length === 0) return res.status(404).json({ error: "Friend request not found" });

    const row = fr.rows[0];
    if (row.status !== "pending") return res.status(409).json({ error: `Request is not pending (status=${row.status})` });

    // Only receiver can reject
    if (row.requested_by === myId) return res.status(403).json({ error: "You cannot reject your own request" });

    const updated = await pool.query(
      `UPDATE friendships
       SET status = 'rejected', updated_at = NOW()
       WHERE user_id = $1 AND friend_id = $2
       RETURNING *`,
      [u, f]
    );

    res.json({ success: true, friendship: updated.rows[0] });
  } catch (error) {
    console.error("rejectRequest error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE /api/friends/:otherUserId  (unfriend OR cancel request)
export const unfriend = async (req, res) => {
  try {
    const myId = Number(req.user.id);
    const otherUserId = Number(req.params.otherUserId);

    if (!otherUserId || !Number.isFinite(otherUserId)) {
      return res.status(400).json({ error: "otherUserId is required" });
    }
    if (otherUserId === myId) return res.status(400).json({ error: "Invalid user" });

    const [u, f] = canonicalPair(myId, otherUserId);

    await pool.query("DELETE FROM friendships WHERE user_id = $1 AND friend_id = $2", [u, f]);
    res.json({ success: true });
  } catch (error) {
    console.error("unfriend error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/friends  (accepted list)
export const getConnections = async (req, res) => {
  try {
    const myId = Number(req.user.id);

    const result = await pool.query(
      `SELECT fr.*,
              p.id, p.username, p.full_name, p.avatar_url
       FROM friendships fr
       JOIN profiles p
         ON p.id = CASE WHEN fr.user_id = $1 THEN fr.friend_id ELSE fr.user_id END
       WHERE fr.status = 'accepted'
         AND ($1 = fr.user_id OR $1 = fr.friend_id)
       ORDER BY fr.updated_at DESC`,
      [myId]
    );

    res.json({
      count: result.rows.length,
      connections: result.rows.map((r) => ({
        friendship_id: r.id,
        user: { id: r.id, username: r.username, full_name: r.full_name, avatar_url: r.avatar_url },
        status: r.status,
        created_at: r.created_at,
        updated_at: r.updated_at,
      })),
    });
  } catch (error) {
    console.error("getConnections error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/friends/suggestions?limit=20&offset=0
// Suggest friends-of-friends by mutual count, excluding existing/pending/rejected pairs.
export const getSuggestions = async (req, res) => {
  try {
    const myId = Number(req.user.id);

    let limit = Number(req.query.limit ?? 20);
    let offset = Number(req.query.offset ?? 0);
    if (!Number.isFinite(limit) || limit <= 0) limit = 20;
    if (!Number.isFinite(offset) || offset < 0) offset = 0;
    limit = Math.min(limit, 50);

    const result = await pool.query(
      `
      WITH my_friends AS (
        SELECT CASE WHEN user_id = $1 THEN friend_id ELSE user_id END AS friend_id
        FROM friendships
        WHERE status = 'accepted' AND ($1 = user_id OR $1 = friend_id)
      ),
      fof AS (
        SELECT
          CASE WHEN f.user_id = mf.friend_id THEN f.friend_id ELSE f.user_id END AS candidate_id
        FROM friendships f
        JOIN my_friends mf
          ON (f.user_id = mf.friend_id OR f.friend_id = mf.friend_id)
        WHERE f.status = 'accepted'
      ),
      filtered AS (
        SELECT candidate_id
        FROM fof
        WHERE candidate_id <> $1
          AND candidate_id NOT IN (SELECT friend_id FROM my_friends)
      ),
      excluded AS (
        -- anyone who already has a relationship row with me (pending/accepted/rejected)
        SELECT CASE WHEN user_id = $1 THEN friend_id ELSE user_id END AS other_id
        FROM friendships
        WHERE ($1 = user_id OR $1 = friend_id)
      )
      SELECT
        p.id,
        p.username,
        p.full_name,
        p.avatar_url,
        COUNT(*)::int AS mutual_count
      FROM filtered f
      JOIN profiles p ON p.id = f.candidate_id
      WHERE f.candidate_id NOT IN (SELECT other_id FROM excluded)
      GROUP BY p.id, p.username, p.full_name, p.avatar_url
      ORDER BY mutual_count DESC, p.id ASC
      LIMIT $2 OFFSET $3
      `,
      [myId, limit, offset]
    );

    res.json({
      limit,
      offset,
      count: result.rows.length,
      suggestions: result.rows,
    });
  } catch (error) {
    console.error("getSuggestions error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
