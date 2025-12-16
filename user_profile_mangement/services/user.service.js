import pool from "../db.js";

/* Get profile */
export const getUserById = async (id) => {
  const { rows } = await pool.query(
    "SELECT id, name, email, bio, avatar_url, cover_url, location FROM users WHERE id=$1",
    [id]
  );
  return rows[0];
};

/* Update profile */
export const updateUser = async (id, data) => {
  const { bio, location } = data;
  const { rows } = await pool.query(
    `UPDATE users SET bio=$1, location=$2 WHERE id=$3 RETURNING *`,
    [bio, location, id]
  );
  return rows[0];
};

/* Update avatar */
export const updateAvatar = async (id, avatar) => {
  await pool.query(
    "UPDATE users SET avatar_url=$1 WHERE id=$2",
    [avatar, id]
  );
};

/* Update cover */
export const updateCover = async (id, cover) => {
  await pool.query(
    "UPDATE users SET cover_url=$1 WHERE id=$2",
    [cover, id]
  );
};

/* Search users */
export const searchUsers = async (q) => {
  const { rows } = await pool.query(
    "SELECT id, name, avatar_url FROM users WHERE name ILIKE $1",
    [`%${q}%`]
  );
  return rows;
};

/* User stats (dummy for now) */
export const getUserStats = async () => {
  return {
    skills_offered: 0,
    skills_requested: 0,
    completed_swaps: 0
  };
};
