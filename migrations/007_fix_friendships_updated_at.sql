-- Ensure friendships has updated_at and notifications have expected columns

-- 1) Friendships.updated_at missing in early schema; add if not exists
ALTER TABLE IF EXISTS friendships
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Optional: create an update trigger to keep updated_at fresh
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'friendships_set_updated_at'
  ) THEN
    CREATE OR REPLACE FUNCTION set_friendships_updated_at()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.updated_at := NOW();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;

    CREATE TRIGGER friendships_set_updated_at
    BEFORE UPDATE ON friendships
    FOR EACH ROW
    EXECUTE FUNCTION set_friendships_updated_at();
  END IF;
END$$;

-- 2) Notifications: ensure table exists with expected columns
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  related_post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  related_comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
  related_friendship_id INTEGER REFERENCES friendships(id) ON DELETE CASCADE,
  related_message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- If notifications already existed but lacked columns, add them safely
ALTER TABLE IF EXISTS notifications
  ADD COLUMN IF NOT EXISTS related_friendship_id INTEGER REFERENCES friendships(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS notifications
  ADD COLUMN IF NOT EXISTS related_message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE;

-- Helpful indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_actor_id ON notifications(actor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
