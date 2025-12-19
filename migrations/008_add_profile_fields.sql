-- Add missing profile fields for user profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
