-- Add preferred timing columns to parents
ALTER TABLE parents ADD COLUMN IF NOT EXISTS preferred_timing_morning BOOLEAN DEFAULT false;
ALTER TABLE parents ADD COLUMN IF NOT EXISTS preferred_timing_afternoon BOOLEAN DEFAULT false;
ALTER TABLE parents ADD COLUMN IF NOT EXISTS preferred_timing_evening BOOLEAN DEFAULT false;

-- Create saved_tutors table
CREATE TABLE saved_tutors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, tutor_id)
);

-- Enable RLS on saved_tutors
ALTER TABLE saved_tutors ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_tutors
CREATE POLICY "select_own_saved_tutors" ON saved_tutors FOR SELECT
  TO authenticated USING (
    auth.uid() = (SELECT user_id FROM parents WHERE id = parent_id)
  );
CREATE POLICY "insert_own_saved_tutors" ON saved_tutors FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = (SELECT user_id FROM parents WHERE id = parent_id)
  );
CREATE POLICY "delete_own_saved_tutors" ON saved_tutors FOR DELETE
  TO authenticated USING (
    auth.uid() = (SELECT user_id FROM parents WHERE id = parent_id)
  );

-- Add index for better search performance
CREATE INDEX IF NOT EXISTS idx_tutors_location ON tutors(location);
CREATE INDEX IF NOT EXISTS idx_tutors_subjects ON tutors USING GIN(subjects);
CREATE INDEX IF NOT EXISTS idx_tutors_classes ON tutors USING GIN(classes);