-- Add preferred_tutor_gender column to parents table
ALTER TABLE parents ADD COLUMN IF NOT EXISTS preferred_tutor_gender TEXT DEFAULT 'no_preference';
-- Values: 'male', 'female', 'no_preference'