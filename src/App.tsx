import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import TutorRegistration from './pages/TutorRegistration';
import ParentRegistration from './pages/ParentRegistration';
import TutorDashboard from './pages/TutorDashboard';
import ParentDashboard from './pages/ParentDashboard';
import AdminPanel from './pages/AdminPanel';
import TutorProfile from './pages/TutorProfile';

type Page = 'landing' | 'login' | 'register-tutor' | 'register-parent' | 'tutor-dashboard' | 'parent-dashboard' | 'admin' | 'tutor-profile';

interface NavigationData {
  tutorId?: string;
}

function AppContent() {
  const { user, userRole, loading, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [navigationData, setNavigationData] = useState<NavigationData>({});

  const handleNavigate = (page: Page, data?: NavigationData) => {
    setCurrentPage(page);
    if (data) {
      setNavigationData(data);
    }
  };

  // Protect dashboard routes
  const protectedPages: Page[] = ['tutor-dashboard', 'parent-dashboard', 'admin', 'tutor-profile'];

  useEffect(() => {
    if (!loading && user) {
      if (userRole === 'tutor' && currentPage !== 'tutor-dashboard' && currentPage !== 'tutor-profile') {
        handleNavigate('tutor-dashboard');
      } else if (userRole === 'parent' && currentPage !== 'parent-dashboard' && currentPage !== 'tutor-profile') {
        handleNavigate('parent-dashboard');
      } else if (userRole === 'admin') {
        handleNavigate('admin');
      }
    }
  }, [user, userRole, loading]);

  // Redirect unauthenticated users trying to access protected pages
  useEffect(() => {
    if (!loading && !user && protectedPages.includes(currentPage)) {
      handleNavigate('login');
    }
  }, [user, loading, currentPage]);

  const handleLogout = async () => {
    await signOut();
    handleNavigate('landing');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <Landing onNavigate={handleNavigate} />;
      case 'login':
        return <Login onNavigate={handleNavigate} />;
      case 'register-tutor':
        return <TutorRegistration onNavigate={handleNavigate} />;
      case 'register-parent':
        return <ParentRegistration onNavigate={handleNavigate} />;
      case 'tutor-dashboard':
        if (!user || userRole !== 'tutor') {
          return <Login onNavigate={handleNavigate} />;
        }
        return <TutorDashboard onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'parent-dashboard':
        if (!user || userRole !== 'parent') {
          return <Login onNavigate={handleNavigate} />;
        }
        return <ParentDashboard onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'admin':
        if (!user || userRole !== 'admin') {
          return <Login onNavigate={handleNavigate} />;
        }
        return <AdminPanel onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'tutor-profile':
        if (!user || userRole !== 'parent') {
          return <Login onNavigate={handleNavigate} />;
        }
        return (
          <TutorProfile
            tutorId={navigationData.tutorId}
            onNavigate={handleNavigate}
            onBack={() => handleNavigate('parent-dashboard')}
          />
        );
      default:
        return <Landing onNavigate={handleNavigate} />;
    }
  };

  return renderPage();
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
