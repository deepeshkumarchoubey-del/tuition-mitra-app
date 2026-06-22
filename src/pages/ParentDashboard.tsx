import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Star,
  GraduationCap,
  LogOut,
  ChevronDown,
  X,
  Send,
  User,
  Clock,
  IndianRupee,
  CheckCircle,
  XCircle,
  Menu,
  Heart,
  Bookmark,
  FileText,
  Grid,
  List,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Tutor, TuitionRequest, Parent, SavedTutor } from '../lib/supabase';
import { SUBJECTS, CLASSES, REQUEST_STATUSES } from '../lib/constants';
import { Button, Card, Badge, Input, Select, Modal, TutorCard } from '../components/ui';

type Page = 'landing' | 'login' | 'register-tutor' | 'register-parent' | 'tutor-dashboard' | 'parent-dashboard' | 'admin' | 'tutor-profile';

interface ParentDashboardProps {
  onNavigate: (page: Page, data?: { tutorId?: string }) => void;
  onLogout: () => void;
}

type TabType = 'search' | 'saved' | 'requests';

export default function ParentDashboard({ onNavigate, onLogout }: ParentDashboardProps) {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tab, setTab] = useState<TabType>('search');
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [requests, setRequests] = useState<(TuitionRequest & { tutor?: Tutor })[]>([]);
  const [savedTutors, setSavedTutors] = useState<(SavedTutor & { tutor?: Tutor })[]>([]);
  const [parent, setParent] = useState<Parent | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [requestModal, setRequestModal] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [filters, setFilters] = useState({
    subject: '',
    class: '',
    maxFees: '',
    location: '',
    search: '',
  });

  const [requestForm, setRequestForm] = useState({
    subjects: [] as string[],
    class: '',
    message: '',
    proposedFees: '',
  });

  useEffect(() => {
    fetchParentAndData();
  }, [user]);

  async function fetchParentAndData() {
    if (!user) return;

    try {
      const { data: parentData } = await supabase
        .from('parents')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (parentData) {
        setParent(parentData);
        fetchTutors();
        fetchRequests(parentData.id);
        fetchSavedTutors(parentData.id);
      }
    } catch (error) {
      console.error('Error fetching parent:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTutors() {
    try {
      const { data, error } = await supabase
        .from('tutors')
        .select('*')
        .eq('is_available', true)
        .order('rating', { ascending: false });

      if (!error && data) {
        setTutors(data as Tutor[]);
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
    }
  }

  async function fetchRequests(parentId: string) {
    try {
      const { data, error } = await supabase
        .from('tuition_requests')
        .select('*, tutor:tutors(*)')
        .eq('parent_id', parentId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setRequests(data as (TuitionRequest & { tutor: Tutor })[]);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  }

  async function fetchSavedTutors(parentId: string) {
    try {
      const { data, error } = await supabase
        .from('saved_tutors')
        .select('*, tutor:tutors(*)')
        .eq('parent_id', parentId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSavedTutors(data as (SavedTutor & { tutor: Tutor })[]);
      }
    } catch (error) {
      console.error('Error fetching saved tutors:', error);
    }
  }

  const filteredTutors = tutors.filter((tutor) => {
    if (filters.subject && !tutor.subjects.includes(filters.subject)) return false;
    if (filters.class && !tutor.classes.includes(filters.class)) return false;
    if (filters.maxFees && tutor.monthly_fees_min > parseInt(filters.maxFees)) return false;
    if (filters.location && !tutor.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.search && !tutor.full_name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const handleSaveTutor = async (tutor: Tutor) => {
    if (!parent) return;

    const existing = savedTutors.find((s) => s.tutor_id === tutor.id);
    if (existing) {
      await supabase.from('saved_tutors').delete().eq('id', existing.id);
      setSavedTutors(savedTutors.filter((s) => s.tutor_id !== tutor.id));
    } else {
      const { data } = await supabase
        .from('saved_tutors')
        .insert({ parent_id: parent.id, tutor_id: tutor.id })
        .select('*, tutor:tutors(*)')
        .single();

      if (data) {
        setSavedTutors([...savedTutors, data as SavedTutor & { tutor: Tutor }]);
      }
    }
  };

  const handleSendRequest = async () => {
    if (!parent || !selectedTutor) return;
    if (requestForm.subjects.length === 0 || !requestForm.class || !requestForm.proposedFees) {
      return;
    }

    try {
      await supabase.from('tuition_requests').insert({
        parent_id: parent.id,
        tutor_id: selectedTutor.id,
        subjects: requestForm.subjects,
        class: requestForm.class,
        message: requestForm.message,
        proposed_fees: parseInt(requestForm.proposedFees),
        status: 'pending',
      });

      setRequestModal(false);
      setSelectedTutor(null);
      setRequestForm({ subjects: [], class: '', message: '', proposedFees: '' });
      fetchRequests(parent.id);
    } catch (error) {
      console.error('Error sending request:', error);
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

  const isTutorSaved = (tutorId: string) => {
    return savedTutors.some((s) => s.tutor_id === tutorId);
  };

  const clearFilters = () => {
    setFilters({ subject: '', class: '', maxFees: '', location: '', search: '' });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

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
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => onNavigate('landing')}
            >
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Tuition Mitra</span>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <span className="text-gray-600">Welcome, {parent?.parent_name}</span>
              <Button variant="ghost" onClick={onLogout} icon={<LogOut className="w-5 h-5" />}>
                Logout
              </Button>
            </div>
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
            <p className="text-gray-600">Welcome, {parent?.parent_name}</p>
            <button onClick={onLogout} className="flex items-center gap-2 text-red-600">
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
          <button
            onClick={() => setTab('search')}
            className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              tab === 'search'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Search className="w-5 h-5" />
            Search Tutors
          </button>
          <button
            onClick={() => setTab('saved')}
            className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap relative ${
              tab === 'saved'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Bookmark className="w-5 h-5" />
            Saved Tutors
            {savedTutors.length > 0 && (
              <span className="absolute -top-1 right-0 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                {savedTutors.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('requests')}
            className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap relative ${
              tab === 'requests'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-5 h-5" />
            My Requests
            {requests.filter((r) => r.status === 'pending').length > 0 && (
              <span className="absolute -top-1 right-0 w-5 h-5 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center">
                {requests.filter((r) => r.status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {/* Search Tab */}
        {tab === 'search' && (
          <div className="space-y-6">
            <Card padding="md" className="mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by tutor name..."
                    value={filters.search}
                    onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
                <Button
                  variant={showFilters ? 'primary' : 'outline'}
                  icon={<Filter className="w-5 h-5" />}
                  onClick={() => setShowFilters(!showFilters)}
                  iconPosition="left"
                >
                  Filters
                  {hasActiveFilters && (
                    <span className="ml-1 w-5 h-5 bg-white text-primary-600 rounded-full text-xs flex items-center justify-center">
                      {Object.values(filters).filter((v) => v !== '').length}
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
                {hasActiveFilters && (
                  <Button variant="ghost" onClick={clearFilters} icon={<X className="w-4 h-4" />}>
                    Clear
                  </Button>
                )}
                <div className="flex gap-1 border-l border-gray-200 pl-4">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-100 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Select
                    placeholder="All Subjects"
                    value={filters.subject}
                    onChange={(e) => setFilters((f) => ({ ...f, subject: e.target.value }))}
                    options={SUBJECTS.map((s) => ({ value: s, label: s }))}
                  />
                  <Select
                    placeholder="All Classes"
                    value={filters.class}
                    onChange={(e) => setFilters((f) => ({ ...f, class: e.target.value }))}
                    options={CLASSES.map((c) => ({ value: c, label: c }))}
                  />
                  <Input
                    placeholder="Max Fee (Rs)"
                    type="number"
                    value={filters.maxFees}
                    onChange={(e) => setFilters((f) => ({ ...f, maxFees: e.target.value }))}
                  />
                  <Input
                    placeholder="Location"
                    value={filters.location}
                    onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
                  />
                </div>
              )}
            </Card>

            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                {filteredTutors.length} {filteredTutors.length === 1 ? 'tutor' : 'tutors'} found
              </p>
            </div>

            {/* Tutors Grid/List */}
            {filteredTutors.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredTutors.map((tutor) => (
                  <TutorCard
                    key={tutor.id}
                    tutor={tutor}
                    isSaved={isTutorSaved(tutor.id)}
                    onSave={() => handleSaveTutor(tutor)}
                    onRemoveSave={() => handleSaveTutor(tutor)}
                    onViewProfile={() => onNavigate('tutor-profile', { tutorId: tutor.id })}
                    compact={viewMode === 'list'}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No tutors found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters to find more tutors</p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Saved Tutors Tab */}
        {tab === 'saved' && (
          <div>
            {savedTutors.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedTutors.map((saved) => (
                  saved.tutor && (
                    <TutorCard
                      key={saved.id}
                      tutor={saved.tutor}
                      isSaved={true}
                      onRemoveSave={() => handleSaveTutor(saved.tutor!)}
                      onViewProfile={() => onNavigate('tutor-profile', { tutorId: saved.tutor?.id })}
                    />
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved tutors</h3>
                <p className="text-gray-500 mb-4">Save tutors to view them here later</p>
                <Button variant="primary" onClick={() => setTab('search')} icon={<Search className="w-4 h-4" />}>
                  Browse Tutors
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Requests Tab */}
        {tab === 'requests' && (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests yet</h3>
                <p className="text-gray-500 mb-4">Start searching for tutors and send your first request</p>
                <Button variant="primary" onClick={() => setTab('search')} icon={<Search className="w-4 h-4" />}>
                  Find Tutors
                </Button>
              </div>
            ) : (
              requests.map((request) => (
                <Card key={request.id} padding="md">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{request.tutor?.full_name}</h3>
                      <p className="text-sm text-gray-500">{request.subjects.join(', ')} - {request.class}</p>
                    </div>
                    <Badge
                      variant={request.status === 'accepted' ? 'success' : request.status === 'rejected' ? 'error' : 'warning'}
                      size="md"
                    >
                      {REQUEST_STATUSES[request.status]?.label}
                    </Badge>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}