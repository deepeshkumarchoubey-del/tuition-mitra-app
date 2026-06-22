import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  MapPin,
  IndianRupee,
  Star,
  Clock,
  CheckCircle,
  BookOpen,
  Award,
  Globe,
  Send,
  Heart,
  HeartOff,
  GraduationCap,
  X,
  Loader2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Tutor, Parent } from '../lib/supabase';
import { Button, Badge, Card, Modal, Input } from '../components/ui';
import { SUBJECTS, CLASSES, REQUEST_STATUSES } from '../lib/constants';

type Page = 'landing' | 'login' | 'register-tutor' | 'register-parent' | 'tutor-dashboard' | 'parent-dashboard' | 'admin' | 'tutor-profile';

interface TutorProfileProps {
  tutorId?: string;
  onNavigate: (page: Page, data?: { tutorId?: string }) => void;
  onBack?: () => void;
}

export default function TutorProfile({ tutorId, onNavigate, onBack }: TutorProfileProps) {
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestModal, setRequestModal] = useState(false);
  const [sendRequestLoading, setSendRequestLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [parent, setParent] = useState<Parent | null>(null);

  const [requestForm, setRequestForm] = useState({
    subjects: [] as string[],
    class: '',
    message: '',
    proposedFees: '',
  });

  useEffect(() => {
    if (tutorId) {
      fetchTutor(tutorId);
      checkLoginStatus();
    }
  }, [tutorId]);

  async function fetchTutor(id: string) {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tutors')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setTutor(data as Tutor);
      }
    } catch (error) {
      console.error('Error fetching tutor:', error);
    } finally {
      setLoading(false);
    }
  }

  async function checkLoginStatus() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: parentData } = await supabase
        .from('parents')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (parentData) {
        setParent(parentData as Parent);

        // Check if tutor is saved
        const { data: savedTutor } = await supabase
          .from('saved_tutors')
          .select('id')
          .eq('parent_id', (parentData as Parent).id)
          .eq('tutor_id', tutorId)
          .single();

        setIsSaved(!!savedTutor);
      }
    }
  }

  const handleSaveTutor = async () => {
    if (!parent || !tutor) return;

    if (isSaved) {
      await supabase
        .from('saved_tutors')
        .delete()
        .eq('parent_id', parent.id)
        .eq('tutor_id', tutor.id);
      setIsSaved(false);
    } else {
      await supabase.from('saved_tutors').insert({
        parent_id: parent.id,
        tutor_id: tutor.id,
      });
      setIsSaved(true);
    }
  };

  const handleSendRequest = async () => {
    if (!parent || !tutor) return;
    if (requestForm.subjects.length === 0 || !requestForm.class || !requestForm.proposedFees) {
      return;
    }

    setSendRequestLoading(true);
    try {
      await supabase.from('tuition_requests').insert({
        parent_id: parent.id,
        tutor_id: tutor.id,
        subjects: requestForm.subjects,
        class: requestForm.class,
        message: requestForm.message,
        proposed_fees: parseInt(requestForm.proposedFees),
        status: 'pending',
      });

      setRequestModal(false);
      setRequestForm({ subjects: [], class: '', message: '', proposedFees: '' });

      // Show success message
      alert('Request sent successfully!');
    } catch (error) {
      console.error('Error sending request:', error);
      alert('Failed to send request. Please try again.');
    } finally {
      setSendRequestLoading(false);
    }
  };

  const toggleRequestSubject = (subject: string) => {
    setRequestForm((prev) => {
      const subjects = prev.subjects;
      return {
        ...prev,
        subjects: subjects.includes(subject)
          ? subjects.filter((s) => s !== subject)
          : [...subjects, subject],
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Tutor Not Found</h2>
          <Button onClick={() => onNavigate('landing')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onBack?.() || onNavigate('landing')}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => onNavigate('landing')}
            >
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Tuition Mitra</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card padding="lg" className="mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left - Avatar and basic info */}
            <div className="flex flex-col items-center md:items-start">
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-primary-100 to-primary-200 rounded-3xl flex items-center justify-center overflow-hidden">
                  {tutor.profile_photo_url ? (
                    <img
                      src={tutor.profile_photo_url}
                      alt={tutor.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-primary-600" />
                  )}
                </div>
                {tutor.is_verified && (
                  <div className="absolute -bottom-2 -right-2 bg-primary-600 text-white p-1.5 rounded-full shadow-lg">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="mt-4 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <h1 className="text-2xl font-bold text-gray-900">{tutor.full_name}</h1>
                  {tutor.is_verified && (
                    <Badge variant="success" size="sm" icon={<CheckCircle className="w-3 h-3" />}>
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-gray-500">{tutor.qualification}</p>
                <p className="text-sm text-gray-400">{tutor.college_school}</p>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900">
                      {tutor.rating > 0 ? tutor.rating.toFixed(1) : 'New'}
                    </span>
                  </div>
                  {tutor.total_reviews > 0 && (
                    <span className="text-sm text-gray-500">
                      ({tutor.total_reviews} reviews)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right - Quick info cards */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <MapPin className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-semibold text-gray-900">{tutor.location}</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <IndianRupee className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Monthly Fee</p>
                <p className="font-semibold text-gray-900">
                  Rs {tutor.monthly_fees_min.toLocaleString()} - {tutor.monthly_fees_max.toLocaleString()}
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <Clock className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Experience</p>
                <p className="font-semibold text-gray-900">
                  {tutor.experience_years > 0 ? `${tutor.experience_years} years` : 'Fresher'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <BookOpen className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Subjects</p>
                <p className="font-semibold text-gray-900">{tutor.subjects.length} subjects</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <Award className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Classes</p>
                <p className="font-semibold text-gray-900">{tutor.classes.length} classes</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 text-center">
                <Globe className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Languages</p>
                <p className="font-semibold text-gray-900">{tutor.languages_known.length}</p>
              </div>
            </div>
          </div>

          {/* Availability Status */}
          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${tutor.is_available ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-gray-700">
                {tutor.is_available ? 'Available for Tuition' : 'Currently Unavailable'}
              </span>
            </div>

            <div className="flex gap-3">
              <Button
                variant={isSaved ? 'secondary' : 'outline'}
                size="md"
                icon={isSaved ? <HeartOff className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                onClick={handleSaveTutor}
              >
                {isSaved ? 'Saved' : 'Save'}
              </Button>
              <Button
                size="lg"
                icon={<Send className="w-5 h-5" />}
                onClick={() => {
                  if (!parent) {
                    alert('Please login as a parent to send request');
                    return;
                  }
                  setRequestForm({
                    subjects: [],
                    class: '',
                    message: '',
                    proposedFees: Math.round((tutor.monthly_fees_min + tutor.monthly_fees_max) / 2).toString(),
                  });
                  setRequestModal(true);
                }}
                disabled={!tutor.is_available}
              >
                Request Tuition
              </Button>
            </div>
          </div>
        </Card>

        {/* Details Sections */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-6">
            {/* About */}
            {tutor.bio && (
              <Card padding="md">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-600" />
                  About
                </h2>
                <p className="text-gray-700 leading-relaxed">{tutor.bio}</p>
              </Card>
            )}

            {/* Subjects */}
            <Card padding="md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-600" />
                Subjects
              </h2>
              <div className="flex flex-wrap gap-2">
                {tutor.subjects.map((subject) => (
                  <Badge key={subject} variant="primary" size="md">
                    {subject}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Classes */}
            <Card padding="md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary-600" />
                Classes
              </h2>
              <div className="flex flex-wrap gap-2">
                {tutor.classes.map((cls) => (
                  <span
                    key={cls}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm"
                  >
                    {cls}
                  </span>
                ))}
              </div>
            </Card>

            {/* Location */}
            <Card padding="md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-600" />
                Location
              </h2>
              <div className="space-y-2">
                <p className="text-gray-700">{tutor.address}</p>
                <p className="text-gray-500">{tutor.location} - {tutor.pin_code}</p>
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Verification Status */}
            <Card padding="md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Verification</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Profile Verified</span>
                  {tutor.is_verified ? (
                    <Badge variant="success" size="sm" icon={<CheckCircle className="w-3 h-3" />}>
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="sm">Pending</Badge>
                  )}
                </div>
              </div>
            </Card>

            {/* Languages */}
            <Card padding="md">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary-600" />
                Languages
              </h2>
              <div className="flex flex-wrap gap-2">
                {tutor.languages_known.map((lang) => (
                  <span
                    key={lang}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      <Modal
        isOpen={requestModal}
        onClose={() => setRequestModal(false)}
        title="Send Tuition Request"
        size="lg"
      >
        <div className="space-y-6">
          {/* Tutor Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{tutor.full_name}</h3>
              <p className="text-sm text-gray-500">{tutor.qualification}</p>
            </div>
          </div>

          {/* Subjects */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subjects Required</label>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.filter((s) => tutor.subjects.includes(s)).map((subject) => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => toggleRequestSubject(subject)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    requestForm.subjects.includes(subject)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
            <textarea
              value={requestForm.message}
              onChange={(e) => setRequestForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Write a brief message about your requirements..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => setRequestModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendRequest}
              loading={sendRequestLoading}
              disabled={!requestForm.subjects.length}
              className="flex-1"
              icon={<Send className="w-4 h-4" />}
            >
              Send Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}