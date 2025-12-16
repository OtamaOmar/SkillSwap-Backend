-- migrations/003_engagement_shares_views.sql

-- 1) View counts: add a column to posts
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_posts_view_count
  ON posts(view_count);

-- 2) Shares table (only if it doesn't already exist)
-- Your code already references shares s with s.id, so we keep an id column.
CREATE TABLE IF NOT EXISTS shares (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  post_id INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FKs (safe-add)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'shares_user_id_fkey') THEN
    ALTER TABLE shares
      ADD CONSTRAINT shares_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'shares_post_id_fkey') THEN
    ALTER TABLE shares
      ADD CONSTRAINT shares_post_id_fkey
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;
  END IF;
END$$;

-- Prevent duplicates: one share per user per post
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE indexname = 'uniq_shares_user_post'
  ) THEN
    CREATE UNIQUE INDEX uniq_shares_user_post ON shares(user_id, post_id);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_shares_post_id
  ON shares(post_id);

CREATE INDEX IF NOT EXISTS idx_shares_user_id
  ON shares(user_id);
