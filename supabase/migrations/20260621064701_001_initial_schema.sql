-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tutors table
CREATE TABLE tutors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL UNIQUE,
  gender TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  qualification TEXT NOT NULL,
  college_school TEXT NOT NULL,
  subjects TEXT[] NOT NULL,
  classes TEXT[] NOT NULL,
  monthly_fees_min INTEGER NOT NULL,
  monthly_fees_max INTEGER NOT NULL,
  experience_years INTEGER NOT NULL,
  languages_known TEXT[] NOT NULL,
  address TEXT NOT NULL,
  pin_code TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  profile_photo_url TEXT,
  id_proof_url TEXT,
  bio TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  profile_completion INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parents table
CREATE TABLE parents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL UNIQUE,
  child_name TEXT NOT NULL,
  child_class TEXT NOT NULL,
  subjects_required TEXT[] NOT NULL,
  budget_min INTEGER,
  budget_max INTEGER,
  address TEXT NOT NULL,
  pin_code TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tuition requests table
CREATE TABLE tuition_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  subjects TEXT[] NOT NULL,
  class TEXT NOT NULL,
  message TEXT,
  proposed_fees INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  request_id UUID REFERENCES tuition_requests(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tuition_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Tutors RLS policies
CREATE POLICY "select_own_tutors" ON tutors FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "insert_own_tutors" ON tutors FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_tutors" ON tutors FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_tutors" ON tutors FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Parents RLS policies
CREATE POLICY "select_own_parents" ON parents FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "insert_own_parents" ON parents FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_parents" ON parents FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_parents" ON parents FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Tuition requests RLS policies
CREATE POLICY "select_own_requests" ON tuition_requests FOR SELECT
  TO authenticated USING (
    auth.uid() = (SELECT user_id FROM parents WHERE id = parent_id)
    OR
    auth.uid() = (SELECT user_id FROM tutors WHERE id = tutor_id)
  );
CREATE POLICY "insert_own_requests" ON tuition_requests FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = (SELECT user_id FROM parents WHERE id = parent_id)
  );
CREATE POLICY "update_own_requests" ON tuition_requests FOR UPDATE
  TO authenticated USING (
    auth.uid() = (SELECT user_id FROM parents WHERE id = parent_id)
    OR
    auth.uid() = (SELECT user_id FROM tutors WHERE id = tutor_id)
  );
CREATE POLICY "delete_own_requests" ON tuition_requests FOR DELETE
  TO authenticated USING (
    auth.uid() = (SELECT user_id FROM parents WHERE id = parent_id)
  );

-- Admin users RLS policies
CREATE POLICY "select_admin" ON admin_users FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_admin" ON admin_users FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Reviews RLS policies
CREATE POLICY "select_reviews" ON reviews FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "insert_own_reviews" ON reviews FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = (SELECT user_id FROM parents WHERE id = parent_id)
  );
CREATE POLICY "delete_own_reviews" ON reviews FOR DELETE
  TO authenticated USING (
    auth.uid() = (SELECT user_id FROM parents WHERE id = parent_id)
  );