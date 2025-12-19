-- Align foreign key columns to UUID to match profiles.id
-- No backend code changes; pure schema updates.

-- Posts.user_id integer -> uuid
-- If existing data are integers, cast to NULL to allow type change.
ALTER TABLE IF EXISTS posts
  ALTER COLUMN user_id TYPE uuid USING NULL::uuid;

-- Comments.user_id integer -> uuid
ALTER TABLE IF EXISTS comments
  ALTER COLUMN user_id TYPE uuid USING NULL::uuid;

-- Likes.user_id integer -> uuid
ALTER TABLE IF EXISTS likes
  ALTER COLUMN user_id TYPE uuid USING NULL::uuid;

-- Shares.user_id integer -> uuid
ALTER TABLE IF EXISTS shares
  ALTER COLUMN user_id TYPE uuid USING NULL::uuid;

-- Friendships.user_id integer -> uuid
ALTER TABLE IF EXISTS friendships
  ALTER COLUMN user_id TYPE uuid USING NULL::uuid;

-- Friendships.friend_id integer -> uuid
ALTER TABLE IF EXISTS friendships
  ALTER COLUMN friend_id TYPE uuid USING NULL::uuid;

-- Ensure requested_by exists, then convert to uuid if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'friendships' AND column_name = 'requested_by'
  ) THEN
    ALTER TABLE friendships ADD COLUMN requested_by uuid;
  END IF;
END$$;

-- Friendships.requested_by integer -> uuid
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'friendships' AND column_name = 'requested_by'
  ) THEN
    -- If it's not already uuid, attempt to convert
    BEGIN
      ALTER TABLE friendships
        ALTER COLUMN requested_by TYPE uuid USING NULL::uuid;
    EXCEPTION WHEN undefined_column THEN
      -- ignore if somehow missing
      NULL;
    END;
  END IF;
END$$;

-- Messages.sender_id integer -> uuid
DO $$
BEGIN
  -- Delete any rows with NULL sender_id or receiver_id first
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    DELETE FROM messages WHERE sender_id IS NULL OR receiver_id IS NULL;
    ALTER TABLE messages
      ALTER COLUMN sender_id TYPE uuid USING sender_id::text::uuid;
  END IF;
EXCEPTION WHEN others THEN
  -- If conversion fails, try with NULL cast
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    ALTER TABLE messages
      ALTER COLUMN sender_id TYPE uuid USING NULL::uuid;
  END IF;
END$$;

-- Messages.receiver_id integer -> uuid
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    ALTER TABLE messages
      ALTER COLUMN receiver_id TYPE uuid USING receiver_id::text::uuid;
  END IF;
EXCEPTION WHEN others THEN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
    ALTER TABLE messages
      ALTER COLUMN receiver_id TYPE uuid USING NULL::uuid;
  END IF;
END$$;

-- Recreate foreign keys to profiles(id) if missing (id is UUID)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_user_fk'
  ) THEN
    ALTER TABLE posts
      ADD CONSTRAINT posts_user_fk FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'comments_user_fk'
  ) THEN
    ALTER TABLE comments
      ADD CONSTRAINT comments_user_fk FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'likes_user_fk'
  ) THEN
    ALTER TABLE likes
      ADD CONSTRAINT likes_user_fk FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'shares_user_fk'
  ) THEN
    ALTER TABLE shares
      ADD CONSTRAINT shares_user_fk FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END$$;
