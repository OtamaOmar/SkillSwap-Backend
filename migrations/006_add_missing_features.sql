-- migrations/006_add_missing_features.sql

-- 1. Add comment threading support (parent_comment_id for replies)
ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_comment_id);

-- 2. Add view counts to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- 3. Create notifications table for engagement tracking
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL, -- 'like', 'comment', 'friend_request', 'message', 'share'
  related_post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  related_comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
  related_friendship_id SERIAL REFERENCES friendships(id) ON DELETE CASCADE,
  related_message_id SERIAL REFERENCES messages(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_actor_id ON notifications(actor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- 4. Add full-text search support to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Trigger to automatically update search_vector when content changes
CREATE OR REPLACE FUNCTION update_posts_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS posts_search_vector_trigger ON posts;
CREATE TRIGGER posts_search_vector_trigger
BEFORE INSERT OR UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_posts_search_vector();

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_posts_search_vector ON posts USING GIN(search_vector);

-- 5. Add indexes for better performance on common queries
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_user_id ON shares(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_post_id ON shares(post_id);

-- 6. Add created_at ordering indexes for timeline feeds
CREATE INDEX IF NOT EXISTS idx_posts_created_at_desc ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_created_at_desc ON comments(created_at DESC);
