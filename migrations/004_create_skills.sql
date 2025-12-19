-- Ensure the skills table exists as expected by routes.

CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  skill_name VARCHAR(255) NOT NULL,
  skill_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON skills(user_id);
