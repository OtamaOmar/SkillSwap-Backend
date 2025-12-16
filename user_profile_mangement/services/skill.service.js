import pool from "../db.js";

export const addSkill = async (userId, data) => {
  const { skill_name, type, proficiency } = data;
  const { rows } = await pool.query(
    "INSERT INTO user_skills (user_id, skill_name, type, proficiency) VALUES ($1, $2, $3, $4) RETURNING *",
    [userId, skill_name, type, proficiency]
  );
  return rows[0];
};

export const getUserSkills = async (userId) => {
  const { rows } = await pool.query(
    "SELECT * FROM user_skills WHERE user_id = $1",
    [userId]
  );
  return {
    teach: rows.filter(s => s.type === 'TEACH'),
    learn: rows.filter(s => s.type === 'LEARN')
  };
};

export const deleteSkill = async (skillId, userId) => {
  await pool.query(
    "DELETE FROM user_skills WHERE id = $1 AND user_id = $2",
    [skillId, userId]
  );
};