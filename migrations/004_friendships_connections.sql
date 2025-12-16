-- migrations/004_friendships_connections.sql

-- Friendships table: one row per pair (canonical order user_id < friend_id)
CREATE TABLE IF NOT EXISTS friendships (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  friend_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | accepted | rejected
  requested_by UUID NOT NULL,          -- who sent the request
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Canonical ordering constraint (helps keep one row per pair)
-- Note: UUID comparison works left-to-right as strings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'friendships_user_friend_order_chk'
  ) THEN
    ALTER TABLE friendships
      ADD CONSTRAINT friendships_user_friend_order_chk CHECK (user_id::text < friend_id::text);
  END IF;
END$$;

-- Unique pair
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'uniq_friendships_pair'
  ) THEN
    CREATE UNIQUE INDEX uniq_friendships_pair ON friendships(user_id, friend_id);
  END IF;
END$$;

-- Foreign keys
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'friendships_user_id_fkey') THEN
    ALTER TABLE friendships
      ADD CONSTRAINT friendships_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'friendships_friend_id_fkey') THEN
    ALTER TABLE friendships
      ADD CONSTRAINT friendships_friend_id_fkey
      FOREIGN KEY (friend_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'friendships_requested_by_fkey') THEN
    ALTER TABLE friendships
      ADD CONSTRAINT friendships_requested_by_fkey
      FOREIGN KEY (requested_by) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END$$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
CREATE INDEX IF NOT EXISTS idx_friendships_requested_by ON friendships(requested_by);
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
