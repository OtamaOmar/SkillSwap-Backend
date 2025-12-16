-- migrations/002_comments_replies_notifications.sql

-- 1) COMMENTS: reply support + soft delete
ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS parent_comment_id INTEGER NULL,
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'comments_parent_comment_id_fkey'
  ) THEN
    ALTER TABLE comments
      ADD CONSTRAINT comments_parent_comment_id_fkey
      FOREIGN KEY (parent_comment_id)
      REFERENCES comments(id)
      ON DELETE SET NULL;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_comments_post_id_created_at
  ON comments(post_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id
  ON comments(parent_comment_id);


-- 2) NOTIFICATIONS: comment notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,        -- receiver
  from_user_id INTEGER,            -- actor
  type TEXT NOT NULL,              -- 'comment' | 'reply'
  post_id INTEGER,
  comment_id INTEGER,
  message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_user_id_fkey') THEN
    ALTER TABLE notifications
      ADD CONSTRAINT notifications_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_from_user_id_fkey') THEN
    ALTER TABLE notifications
      ADD CONSTRAINT notifications_from_user_id_fkey
      FOREIGN KEY (from_user_id) REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_post_id_fkey') THEN
    ALTER TABLE notifications
      ADD CONSTRAINT notifications_post_id_fkey
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_comment_id_fkey') THEN
    ALTER TABLE notifications
      ADD CONSTRAINT notifications_comment_id_fkey
      FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE;
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at
  ON notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id_is_read
  ON notifications(user_id, is_read);
