import { useState, useEffect } from 'react';
import {
  GraduationCap,
  LogOut,
  Menu,
  Users,
  UserCheck,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  Eye,
  ChevronDown,
  Search,
  MapPin,
  Star,
  IndianRupee,
  Award,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Tutor, Parent, TuitionRequest } from '../lib/supabase';
import { REQUEST_STATUSES, SUBJECTS, CLASSES } from '../lib/constants';

type Page = 'landing' | 'login' | 'register-tutor' | 'register-parent' | 'tutor-dashboard' | 'parent-dashboard' | 'admin';

interface AdminPanelProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export default function AdminPanel({ onNavigate, onLogout }: AdminPanelProps) {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tab, setTab] = useState<'overview' | 'tutors' | 'parents' | 'requests'>('overview');
  const [loading, setLoading] = useState(true);

  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [requests, setRequests] = useState<(TuitionRequest & { tutor?: Tutor; parent?: Parent })[]>([]);

  const [tutorFilter, setTutorFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [requestFilter, setRequestFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [tutorModal, setTutorModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  async function fetchData() {
    setLoading(true);
    try {
      const [tutorsRes, parentsRes, requestsRes] = await Promise.all([
        supabase.from('tutors').select('*').order('created_at', { ascending: false }),
        supabase.from('parents').select('*').order('created_at', { ascending: false }),
        supabase
          .from('tuition_requests')
          .select('*, tutor:tutors(*), parent:parents(*)')
          .order('created_at', { ascending: false }),
      ]);

      if (tutorsRes.data) setTutors(tutorsRes.data as Tutor[]);
      if (parentsRes.data) setParents(parentsRes.data as Parent[]);
      if (requestsRes.data) setRequests(requestsRes.data as (TuitionRequest & { tutor: Tutor; parent: Parent })[]);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyTutor(tutorId: string, verified: boolean) {
    try {
      await supabase
        .from('tutors')
        .update({ is_verified: verified, updated_at: new Date().toISOString() })
        .eq('id', tutorId);

      fetchData();
      setTutorModal(false);
    } catch (error) {
      console.error('Error updating tutor:', error);
    }
  }

  const stats = {
    totalTutors: tutors.length,
    verifiedTutors: tutors.filter((t) => t.is_verified).length,
    pendingTutors: tutors.filter((t) => !t.is_verified).length,
    totalParents: parents.length,
    totalRequests: requests.length,
    pendingRequests: requests.filter((r) => r.status === 'pending').length,
    acceptedRequests: requests.filter((r) => r.status === 'accepted').length,
    monthlyVolume: requests
      .filter((r) => r.status === 'accepted')
      .reduce((sum, r) => sum + (r.proposed_fees || 0), 0),
  };

  const filteredTutors = tutors
    .filter((t) => {
      if (tutorFilter === 'verified') return t.is_verified;
      if (tutorFilter === 'pending') return !t.is_verified;
      return true;
    })
    .filter((t) =>
      searchQuery
        ? t.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.location.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  const filteredRequests = requests.filter((r) => {
    if (requestFilter === 'pending') return r.status === 'pending';
    if (requestFilter === 'accepted') return r.status === 'accepted';
    if (requestFilter === 'rejected') return r.status === 'rejected';
    return true;
  });

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
              <div>
                <span className="text-xl font-bold text-gray-900">Tuition Mitra</span>
                <span className="ml-2 text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full font-medium">
                  Admin
                </span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
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
            onClick={() => setTab('overview')}
            className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              tab === 'overview'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Overview
          </button>
          <button
            onClick={() => setTab('tutors')}
            className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap relative ${
              tab === 'tutors'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <GraduationCap className="w-5 h-5" />
            Tutors
            {stats.pendingTutors > 0 && (
              <span className="absolute -top-1 right-0 w-5 h-5 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center">
                {stats.pendingTutors}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('parents')}
            className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              tab === 'parents'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-5 h-5" />
            Parents
          </button>
          <button
            onClick={() => setTab('requests')}
            className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap relative ${
              tab === 'requests'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock className="w-5 h-5" />
            Requests
          </button>
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalTutors}</p>
                    <p className="text-sm text-gray-500">Total Tutors</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
                  <span className="text-primary-600">{stats.verifiedTutors} Verified</span>
                  <span className="text-yellow-600">{stats.pendingTutors} Pending</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalParents}</p>
                    <p className="text-sm text-gray-500">Total Parents</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
                    <p className="text-sm text-gray-500">Pending Requests</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
                  <span className="text-green-600">{stats.acceptedRequests} Accepted</span>
                  <span className="text-gray-500">{stats.totalRequests} Total</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <IndianRupee className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">Rs {stats.monthlyVolume.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Monthly Volume</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity - simplified */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Top Locations</h4>
                  <div className="space-y-2">
                    {Object.entries(
                      tutors.reduce((acc, t) => {
                        acc[t.location] = (acc[t.location] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    )
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([loc, count]) => (
                        <div key={loc} className="flex justify-between text-sm">
                          <span className="text-gray-700">{loc}</span>
                          <span className="text-gray-500">{count} tutors</span>
                        </div>
                      ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Popular Subjects</h4>
                  <div className="space-y-2">
                    {Object.entries(
                      tutors.reduce((acc, t) => {
                        t.subjects.forEach((s) => {
                          acc[s] = (acc[s] || 0) + 1;
                        });
                        return acc;
                      }, {} as Record<string, number>)
                    )
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([subj, count]) => (
                        <div key={subj} className="flex justify-between text-sm">
                          <span className="text-gray-700">{subj}</span>
                          <span className="text-gray-500">{count} tutors</span>
                        </div>
                      ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Request Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-yellow-700">Pending</span>
                      <span className="text-gray-500">{stats.pendingRequests}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Accepted</span>
                      <span className="text-gray-500">{stats.acceptedRequests}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-red-700">Rejected</span>
                      <span className="text-gray-500">{requests.filter((r) => r.status === 'rejected').length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tutors Tab - simplified */}
        {tab === 'tutors' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tutors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setTutorFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tutorFilter === 'all'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({tutors.length})
                </button>
                <button
                  onClick={() => setTutorFilter('verified')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tutorFilter === 'verified'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Verified ({stats.verifiedTutors})
                </button>
                <button
                  onClick={() => setTutorFilter('pending')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tutorFilter === 'pending'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pending ({stats.pendingTutors})
                </button>
              </div>
            </div>

            {/* Tutors List - simplified */}
            <div className="space-y-2">
              {filteredTutors.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                  <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No tutors found</p>
                </div>
              ) : (
                filteredTutors.map((tutor) => (
                  <div key={tutor.id} className="bg-white rounded-lg border border-gray-100 p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{tutor.full_name}</p>
                      <p className="text-sm text-gray-500">{tutor.location} - {tutor.qualification}</p>
                    </div>
                    {tutor.is_verified ? (
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                        Verified
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        Pending
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Parents Tab - simplified */}
        {tab === 'parents' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="space-y-2 p-4">
              {parents.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No parents found</p>
                </div>
              ) : (
                parents.slice(0, 10).map((parent) => (
                  <div key={parent.id} className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">{parent.parent_name}</p>
                    <p className="text-sm text-gray-500">{parent.child_name} ({parent.child_class})</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Requests Tab - simplified */}
        {tab === 'requests' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-2">
              {(['all', 'pending', 'accepted', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setRequestFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    requestFilter === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({filteredRequests.length})
                </button>
              ))}
            </div>

            {/* Requests List - simplified */}
            <div className="space-y-2">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No requests found</p>
                </div>
              ) : (
                filteredRequests.slice(0, 10).map((request) => (
                  <div key={request.id} className="bg-white rounded-lg border border-gray-100 p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{request.parent?.parent_name}</p>
                        <p className="text-sm text-gray-500">{request.tutor?.full_name} - {request.subjects[0]}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${REQUEST_STATUSES[request.status]?.color}`}>
                        {REQUEST_STATUSES[request.status]?.label}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}