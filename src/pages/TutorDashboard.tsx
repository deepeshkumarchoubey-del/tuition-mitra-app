import { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  LogOut,
  Star,
  MapPin,
  IndianRupee,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Edit,
  ToggleLeft,
  ToggleRight,
  Menu,
  Award,
  BookOpen,
  Users,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Tutor, TuitionRequest, Parent } from '../lib/supabase';
import { REQUEST_STATUSES, SUBJECTS, CLASSES, LANGUAGES, QUALIFICATIONS, GENDERS } from '../lib/constants';

type Page = 'landing' | 'login' | 'register-tutor' | 'register-parent' | 'tutor-dashboard' | 'parent-dashboard' | 'admin';

interface TutorDashboardProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export default function TutorDashboard({ onNavigate, onLogout }: TutorDashboardProps) {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tab, setTab] = useState<'overview' | 'requests' | 'profile'>('overview');
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [requests, setRequests] = useState<(TuitionRequest & { parent?: Parent })[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    subjects: [] as string[],
    classes: [] as string[],
    monthlyFeesMin: '',
    monthlyFeesMax: '',
    experienceYears: '',
    languagesKnown: [] as string[],
    bio: '',
    is_available: true,
  });

  useEffect(() => {
    fetchTutorAndData();
  }, [user]);

  async function fetchTutorAndData() {
    if (!user) return;

    try {
      const { data: tutorData } = await supabase
        .from('tutors')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (tutorData) {
        setTutor(tutorData as Tutor);
        setEditForm({
          subjects: (tutorData as Tutor).subjects,
          classes: (tutorData as Tutor).classes,
          monthlyFeesMin: (tutorData as Tutor).monthly_fees_min.toString(),
          monthlyFeesMax: (tutorData as Tutor).monthly_fees_max.toString(),
          experienceYears: (tutorData as Tutor).experience_years.toString(),
          languagesKnown: (tutorData as Tutor).languages_known,
          bio: (tutorData as Tutor).bio || '',
          is_available: (tutorData as Tutor).is_available,
        });
        fetchRequests((tutorData as Tutor).id);
      }
    } catch (error) {
      console.error('Error fetching tutor:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRequests(tutorId: string) {
    try {
      const { data, error } = await supabase
        .from('tuition_requests')
        .select('*, parent:parents(*)')
        .eq('tutor_id', tutorId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setRequests(data as (TuitionRequest & { parent: Parent })[]);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  }

  const handleUpdateRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      await supabase
        .from('tuition_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (tutor) fetchRequests(tutor.id);
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  const toggleAvailability = async () => {
    if (!tutor) return;

    try {
      const newAvailability = !tutor.is_available;
      await supabase
        .from('tutors')
        .update({ is_available: newAvailability, updated_at: new Date().toISOString() })
        .eq('id', tutor.id);

      setTutor({ ...tutor, is_available: newAvailability });
      setEditForm({ ...editForm, is_available: newAvailability });
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!tutor) return;

    setSaving(true);
    try {
      await supabase
        .from('tutors')
        .update({
          subjects: editForm.subjects,
          classes: editForm.classes,
          monthly_fees_min: parseInt(editForm.monthlyFeesMin),
          monthly_fees_max: parseInt(editForm.monthlyFeesMax),
          experience_years: parseInt(editForm.experienceYears) || 0,
          languages_known: editForm.languagesKnown,
          bio: editForm.bio,
          is_available: editForm.is_available,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tutor.id);

      fetchTutorAndData();
      setEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleEditArrayItem = (field: 'subjects' | 'classes' | 'languagesKnown', item: string) => {
    setEditForm((prev) => {
      const arr = prev[field];
      const newArr = arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
      return { ...prev, [field]: newArr };
    });
  };

  const stats = {
    totalRequests: requests.length,
    pendingRequests: requests.filter((r) => r.status === 'pending').length,
    acceptedRequests: requests.filter((r) => r.status === 'accepted').length,
    potentialEarnings: requests
      .filter((r) => r.status === 'accepted')
      .reduce((sum, r) => sum + (r.proposed_fees || 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Tuition Mitra</span>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <span className="text-gray-600">Welcome, {tutor?.full_name}</span>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
            <p className="text-gray-600">Welcome, {tutor?.full_name}</p>
            <button onClick={onLogout} className="flex items-center gap-2 text-red-600">
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setTab('overview')}
            className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
              tab === 'overview'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Overview
          </button>
          <button
            onClick={() => setTab('requests')}
            className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors relative ${
              tab === 'requests'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock className="w-5 h-5" />
            Requests
            {requests.filter((r) => r.status === 'pending').length > 0 && (
              <span className="absolute -top-1 right-0 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                {requests.filter((r) => r.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('profile')}
            className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
              tab === 'profile'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-5 h-5" />
            Profile
          </button>
        </div>

        {/* Overview Tab Content */}
        {tab === 'overview' && tutor && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
                    <p className="text-sm text-gray-500">Pending Requests</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.acceptedRequests}</p>
                    <p className="text-sm text-gray-500">Accepted</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
                    <p className="text-sm text-gray-500">Total Requests</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <IndianRupee className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">Rs {stats.potentialEarnings}</p>
                    <p className="text-sm text-gray-500">Monthly Earnings</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Summary */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    {tutor.profile_photo_url ? (
                      <img src={tutor.profile_photo_url} alt={tutor.full_name} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-primary-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{tutor.full_name}</h3>
                      {tutor.is_verified && (
                        <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500">{tutor.qualification}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {tutor.rating > 0 ? (
                        <>
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{tutor.rating.toFixed(1)}</span>
                          <span className="text-gray-400 text-sm">({tutor.total_reviews} reviews)</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">No reviews yet</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">Profile Completion</span>
                    <span className="text-sm font-medium text-primary-600">{tutor.profile_completion}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${tutor.profile_completion}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability Status</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    {tutor.is_available ? (
                      <ToggleRight className="w-8 h-8 text-primary-600 cursor-pointer" onClick={toggleAvailability} />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-gray-400 cursor-pointer" onClick={toggleAvailability} />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {tutor.is_available ? 'Available for Tuition' : 'Not Available'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {tutor.is_available ? 'Parents can find and contact you' : 'Hidden from search results'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{tutor.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <IndianRupee className="w-4 h-4 text-gray-400" />
                    <span>Rs {tutor.monthly_fees_min} - {tutor.monthly_fees_max}/month</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <span>{tutor.subjects.length} subjects, {tutor.classes.length} classes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Requests Tab Content - simplified */}
        {tab === 'requests' && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
                <p className="text-gray-500">Tuition requests from parents will appear here</p>
              </div>
            ) : (
              requests.map((request) => (
                <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{request.parent?.parent_name}</h3>
                      <p className="text-sm text-gray-500">{request.subjects.join(', ')} - {request.class}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${REQUEST_STATUSES[request.status]?.color}`}>
                      {REQUEST_STATUSES[request.status]?.label}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Profile Tab - simplified */}
        {tab === 'profile' && tutor && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium text-gray-900">{tutor.full_name}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Qualification</p>
                <p className="font-medium text-gray-900">{tutor.qualification}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Subjects</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tutor.subjects.map((s) => (
                    <span key={s} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}