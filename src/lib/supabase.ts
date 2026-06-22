import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  email: string;
  role: 'tutor' | 'parent' | 'admin';
};

export type Tutor = {
  id: string;
  user_id: string;
  full_name: string;
  mobile_number: string;
  gender: string;
  date_of_birth: string;
  qualification: string;
  college_school: string;
  subjects: string[];
  classes: string[];
  monthly_fees_min: number;
  monthly_fees_max: number;
  experience_years: number;
  languages_known: string[];
  address: string;
  pin_code: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  profile_photo_url: string | null;
  id_proof_url: string | null;
  bio: string | null;
  is_verified: boolean;
  is_available: boolean;
  profile_completion: number;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
};

export type Parent = {
  id: string;
  user_id: string;
  parent_name: string;
  mobile_number: string;
  child_name: string;
  child_class: string;
  subjects_required: string[];
  budget_min: number | null;
  budget_max: number | null;
  address: string;
  pin_code: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  preferred_timing_morning: boolean;
  preferred_timing_afternoon: boolean;
  preferred_timing_evening: boolean;
  created_at: string;
  updated_at: string;
};

export type TuitionRequest = {
  id: string;
  parent_id: string;
  tutor_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  subjects: string[];
  class: string;
  message: string | null;
  proposed_fees: number | null;
  created_at: string;
  updated_at: string;
  tutor?: Tutor;
  parent?: Parent;
};

export type SavedTutor = {
  id: string;
  parent_id: string;
  tutor_id: string;
  created_at: string;
  tutor?: Tutor;
};

export type Review = {
  id: string;
  tutor_id: string;
  parent_id: string;
  request_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};