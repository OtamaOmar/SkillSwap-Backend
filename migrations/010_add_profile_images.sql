-- Ensure profile image columns exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Optional indexes for faster lookups by image fields (rarely needed)
-- CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url ON profiles(avatar_url);
-- CREATE INDEX IF NOT EXISTS idx_profiles_cover_image_url ON profiles(cover_image_url);
