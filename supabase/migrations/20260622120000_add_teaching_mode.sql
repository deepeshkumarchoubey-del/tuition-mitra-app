-- Add teaching_mode column to tutors
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS teaching_mode TEXT DEFAULT 'both';
-- Values: 'home', 'online', 'both'
