import pool from "../db.js";

/* Add skill */
export const addSkill = async (userId, data) => {
  const { title, description, type, level } = data;
  const { rows } = await pool.query(
    `INSERT INTO skills (user_id, title, description, type, level)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, title, description, type, level]
  );
  return rows[0];
};

/* Update skill */
export const updateSkill = async (skillId, userId, data) => {
  const { title, description, level } = data;
  const { rows } = await pool.query(
    `UPDATE skills
     SET title=$1, description=$2, level=$3
     WHERE id=$4 AND user_id=$5
     RETURNING *`,
    [title, description, level, skillId, userId]
  );
  return rows[0];
};

/* Delete skill */
export const deleteSkill = async (skillId, userId) => {
  await pool.query(
    "DELETE FROM skills WHERE id=$1 AND user_id=$2",
    [skillId, userId]
  );
};

/* Get user skills */
export const getUserSkills = async (userId) => {
  const { rows } = await pool.query(
    "SELECT * FROM skills WHERE user_id=$1",
    [userId]
  );
  return rows;
};

/* Browse & filter skills */
export const browseSkills = async (filters) => {
  const { type, level, q } = filters;

  let query = "SELECT skills.*, users.name FROM skills JOIN users ON users.id = skills.user_id WHERE 1=1";
  let values = [];
  let i = 1;

  if (type) {
    query += ` AND type=$${i++}`;
    values.push(type);
  }

  if (level) {
    query += ` AND level=$${i++}`;
    values.push(level);
  }

  if (q) {
    query += ` AND title ILIKE $${i++}`;
    values.push(`%${q}%`);
  }

  const { rows } = await pool.query(query, values);
  return rows;
};
