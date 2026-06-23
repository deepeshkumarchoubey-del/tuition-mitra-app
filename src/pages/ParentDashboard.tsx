import { useState, useEffect } from 'react';
import {
  Search,
  GraduationCap,
  LogOut,
  User,
  FileText,
  Settings,
  Home,
  ChevronRight,
  Menu,
  X,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { TuitionRequest, Parent } from '../lib/supabase';
import { Button, Card, Badge, Modal, Input, Select, ChipToggle } from '../components/ui';
import { SUBJECTS, CLASSES } from '../lib/constants';

type Page = 'landing' | 'login' | 'register-tutor' | 'register-parent' | 'tutor-dashboard' | 'parent-dashboard' | 'admin' | 'tutor-profile';

interface ParentDashboardProps {
  onNavigate: (page: Page, data?: { tutorId?: string }) => void;
  onLogout: () => void;
}

type ViewType = 'home' | 'search' | 'requests' | 'profile';

export default function ParentDashboard({ onNavigate, onLogout }: ParentDashboardProps) {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [view, setView] = useState<ViewType>('home');
  const [parent, setParent] = useState<Parent | null>(null);
  const [requests, setRequests] = useState<(TuitionRequest & { tutor?: { full_name: string; qualification: string; location: string } })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParentData();
  }, [user]);

  async function fetchParentData() {
    if (!user) return;

    try {
      const { data: parentData } = await supabase
        .from('parents')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (parentData) {
        setParent(parentData);
        fetchRequests(parentData.id);
      }
    } catch (error) {
      console.error('Error fetching parent:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRequests(parentId: string) {
    try {
      const { data, error } = await supabase
        .from('tuition_requests')
        .select('*, tutor:tutors(full_name, qualification, location)')
        .eq('parent_id', parentId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  }

  const handleLogout = async () => {
    await onLogout();
    onNavigate('landing');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Find Tutors', icon: Search },
    { id: 'requests', label: 'My Requests', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User },
  ] as const;

  const pendingRequests = requests.filter((r) => r.status === 'pending').length;
  const acceptedRequests = requests.filter((r) => r.status === 'accepted').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 pb-20 sm:pb-0">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Welcome back</p>
                <h1 className="font-bold text-gray-900">{parent?.parent_name || 'Parent'}</h1>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="sm:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              icon={<LogOut className="w-4 h-4" />}
              className="hidden sm:flex"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Home View */}
        {view === 'home' && (
          <div className="space-y-6">
            {/* Welcome Card */}
            <Card className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white border-0 overflow-hidden">
              <div className="relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-2">Welcome, {parent?.parent_name?.split(' ')[0] || 'Parent'}!</h2>
                  <p className="text-blue-100 text-sm mb-4">Find the perfect tutor for your child</p>
                  <Button
                    onClick={() => setView('search')}
                    className="bg-white text-blue-600 hover:bg-blue-50"
                    icon={<Search className="w-4 h-4" />}
                  >
                    Find Tutors Now
                  </Button>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{pendingRequests}</p>
                <p className="text-xs text-gray-500">Pending Requests</p>
              </Card>
              <Card className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{acceptedRequests}</p>
                <p className="text-xs text-gray-500">Accepted</p>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setView('search')}
                  className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <Search className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Find Tutors</p>
                      <p className="text-xs text-gray-500">Search for qualified tutors</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>

                <button
                  onClick={() => setView('requests')}
                  className="w-full flex items-center justify-between p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">My Requests</p>
                      <p className="text-xs text-gray-500">{requests.length} total requests</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>

                <button
                  onClick={() => setView('profile')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-500 rounded-xl flex items-center justify-center">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Profile Settings</p>
                      <p className="text-xs text-gray-500">Manage your account</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Search View */}
        {view === 'search' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Find Your Perfect Tutor</h2>
            <p className="text-gray-500 mb-6">Search and filter tutors based on your requirements</p>
            <Button
              onClick={() => onNavigate('tutor-profile')}
              className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
            >
              Browse All Tutors
            </Button>
          </div>
        )}

        {/* Requests View */}
        {view === 'requests' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-900">My Requests</h2>
              <p className="text-sm text-gray-500">{requests.length} total</p>
            </div>

            {requests.length > 0 ? (
              <div className="space-y-3">
                {requests.map((request) => (
                  <Card key={request.id} padding="md">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{request.tutor?.full_name}</h3>
                          <p className="text-xs text-gray-500">{request.tutor?.qualification}</p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          request.status === 'accepted'
                            ? 'success'
                            : request.status === 'rejected'
                            ? 'error'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {request.status === 'accepted' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {request.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                        {request.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Subjects</p>
                        <p className="font-medium text-gray-900">{request.subjects?.join(', ') || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Class</p>
                        <p className="font-medium text-gray-900">{request.class || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Proposed Fee</p>
                        <p className="font-medium text-gray-900">Rs {request.proposed_fees}/mo</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests yet</h3>
                <p className="text-gray-500 mb-4">Start searching for tutors and send requests</p>
                <Button
                  onClick={() => setView('search')}
                  icon={<Search className="w-4 h-4" />}
                  className="bg-gradient-to-r from-blue-500 to-emerald-500"
                >
                  Find Tutors
                </Button>
              </Card>
            )}
          </div>
        )}

        {/* Profile View */}
        {view === 'profile' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-2">My Profile</h2>

            <Card>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{parent?.parent_name}</h3>
                  <p className="text-sm text-gray-500">{parent?.mobile_number}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium text-gray-900">{user?.email}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500">Mobile</span>
                  <span className="font-medium text-gray-900">+91 {parent?.mobile_number}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500">Student Class</span>
                  <span className="font-medium text-gray-900">{parent?.child_class}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500">Subjects</span>
                  <span className="font-medium text-gray-900 text-right">
                    {parent?.subjects_required?.join(', ') || '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500">Budget</span>
                  <span className="font-medium text-gray-900">
                    Rs {parent?.budget_max || 'N/A'}/month
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-500">Preferred Gender</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {parent?.preferred_tutor_gender?.replace('_', ' ') || 'No preference'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-500">Location</span>
                  <span className="font-medium text-gray-900">{parent?.location}</span>
                </div>
              </div>
            </Card>

            <Button
              variant="outline"
              onClick={handleLogout}
              icon={<LogOut className="w-4 h-4" />}
              className="w-full"
            >
              Logout
            </Button>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 sm:hidden z-50">
        <div className="flex items-center justify-around py-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors ${
                view === item.id
                  ? 'text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <item.icon className={`w-6 h-6 ${view === item.id ? 'stroke-2' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
              {item.id === 'requests' && pendingRequests > 0 && (
                <span className="absolute -top-1 right-0 w-4 h-4 bg-yellow-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {pendingRequests}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}