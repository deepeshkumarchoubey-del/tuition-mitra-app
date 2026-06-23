import { useState, useEffect } from 'react';
import {
  BookOpen,
  Users,
  MapPin,
  Search,
  GraduationCap,
  CheckCircle,
  Star,
  Menu,
  X,
  ArrowRight,
  IndianRupee,
  Shield,
  Heart,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Tutor } from '../lib/supabase';
import { SUBJECTS } from '../lib/constants';
import { TutorCard, Badge } from '../components/ui';

type Page = 'landing' | 'login' | 'register-tutor' | 'register-parent' | 'tutor-dashboard' | 'parent-dashboard' | 'admin' | 'tutor-profile';

interface LandingProps {
  onNavigate: (page: Page, data?: { tutorId?: string }) => void;
}

export default function Landing({ onNavigate }: LandingProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuredTutors, setFeaturedTutors] = useState<Tutor[]>([]);
  const [searchSubject, setSearchSubject] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedTutors();
    fetchLocations();
  }, []);

  async function fetchFeaturedTutors() {
    try {
      const { data, error } = await supabase
        .from('tutors')
        .select('*')
        .eq('is_available', true)
        .eq('is_verified', true)
        .order('rating', { ascending: false })
        .limit(6);

      if (!error && data) {
        setFeaturedTutors(data as Tutor[]);
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLocations() {
    try {
      const { data } = await supabase
        .from('tutors')
        .select('location')
        .eq('is_available', true);

      const uniqueLocations = [...new Set(data?.map((t) => t.location) || [])];
      setLocations(uniqueLocations.slice(0, 10));
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  }

  const handleSearch = () => {
    onNavigate('parent-dashboard');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md border-b border-gray-100`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => onNavigate('landing')}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Tuition Mitra</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">How It Works</a>
              <a href="#featured" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">Featured Tutors</a>
              <a href="#why-us" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">Why Us</a>
              <button
                onClick={() => onNavigate('login')}
                className="text-gray-700 font-semibold hover:text-primary-600 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('register-parent')}
                className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30"
              >
                Get Started
              </button>
            </div>

            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-6 space-y-4 shadow-lg">
            <a href="#how-it-works" className="block text-gray-600 py-2 font-medium">How It Works</a>
            <a href="#featured" className="block text-gray-600 py-2 font-medium">Featured Tutors</a>
            <a href="#why-us" className="block text-gray-600 py-2 font-medium">Why Us</a>
            <button onClick={() => onNavigate('login')} className="block text-gray-700 py-2 font-semibold">Sign In</button>
            <button
              onClick={() => onNavigate('register-parent')}
              className="w-full bg-primary-600 text-white px-5 py-3 rounded-xl font-semibold shadow-lg"
            >
              Get Started
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-white" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary-200/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left content */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight mb-6 animate-fade-in-up">
                Find the Best
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500">
                  Home Tutors Near You
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up animation-delay-100">
                Connect with verified college students and experienced teachers for personalized
                home tuition. Quality education delivered at your doorstep.
              </p>

              {/* Search Box */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 max-w-2xl mx-auto lg:mx-0 animate-fade-in-up animation-delay-200">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={searchSubject}
                      onChange={(e) => setSearchSubject(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none appearance-none cursor-pointer"
                    >
                      <option value="">All Subjects</option>
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none appearance-none cursor-pointer"
                    >
                      <option value="">All Locations</option>
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleSearch}
                    className="bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/25 flex items-center justify-center gap-2"
                  >
                    <Search className="w-5 h-5" />
                    <span>Search</span>
                  </button>
                </div>
              </div>

              {/* Feature Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-8 animate-fade-in-up animation-delay-300">
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium">
                  <Shield className="w-4 h-4" />
                  <span>Verified Tutors</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                  <MapPin className="w-4 h-4" />
                  <span>Local Area Search</span>
                </div>
                <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-sm font-medium">
                  <IndianRupee className="w-4 h-4" />
                  <span>Affordable Home Tuition</span>
                </div>
                <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                  <Heart className="w-4 h-4" />
                  <span>Safe & Trusted</span>
                </div>
              </div>
            </div>

            {/* Right image */}
            <div className="flex-1 relative">
              <div className="relative w-full max-w-lg mx-auto">
                <div className="absolute -inset-8 bg-gradient-to-r from-primary-400 to-primary-600 rounded-3xl opacity-10 blur-3xl animate-pulse" />
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  <img
                    src="https://images.pexels.com/photos/8617885/pexels-photo-8617885.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Home tutoring session"
                    className="w-full h-80 sm:h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                {/* Floating cards */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">ID Verified</p>
                      <p className="text-sm text-gray-500">All Tutors</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 animate-float animation-delay-1000">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Top Rated</p>
                      <p className="text-sm text-gray-500">Quality Tutors</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="primary" size="md" className="mb-4">Simple Process</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get started in just 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Register Your Profile',
                description: 'Sign up as a parent or tutor. Complete your profile with relevant details.',
                step: 1,
              },
              {
                icon: Search,
                title: 'Search & Connect',
                description: 'Parents search for tutors. Tutors receive requests. Find your perfect match.',
                step: 2,
              },
              {
                icon: GraduationCap,
                title: 'Start Learning',
                description: 'Accept requests, schedule classes, and begin your personalized learning journey.',
                step: 3,
              },
            ].map((item, index) => (
              <div
                key={item.step}
                className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="absolute -top-4 left-8 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {item.step}
                </div>
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-600 transition-colors">
                  <item.icon className="w-8 h-8 text-primary-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tutors */}
      <section id="featured" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
            <div>
              <Badge variant="primary" size="md" className="mb-4">Featured</Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Top Rated Tutors
              </h2>
              <p className="text-lg text-gray-600">
                Verified tutors with excellent reviews
              </p>
            </div>
            <button
              onClick={() => onNavigate('register-parent')}
              className="text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-2 transition-colors"
            >
              View All Tutors
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTutors.map((tutor) => (
                <TutorCard
                  key={tutor.id}
                  tutor={tutor}
                  onViewProfile={() => onNavigate('tutor-profile', { tutorId: tutor.id })}
                />
              ))}
            </div>
          )}

          {!loading && featuredTutors.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tutors available yet</h3>
              <p className="text-gray-500 mb-4">Be the first to register as a tutor</p>
              <button
                onClick={() => onNavigate('register-tutor')}
                className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
              >
                Register as Tutor
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-us" className="py-20 bg-gradient-to-br from-primary-600 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-white/20 text-white" size="md">Why Choose Us</Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-4 mb-4">
              Why Tuition Mitra?
            </h2>
            <p className="text-lg text-primary-100 max-w-2xl mx-auto">
              We bridge the gap between quality education and accessibility
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: 'Verified Tutors',
                description: 'All tutors undergo ID verification with College ID or Aadhaar.',
              },
              {
                icon: MapPin,
                title: 'Local Area Search',
                description: 'Find tutors in your locality based on distance and preferences.',
              },
              {
                icon: IndianRupee,
                title: 'Affordable Home Tuition',
                description: 'Compare fees and choose tutors that fit your budget.',
              },
              {
                icon: Heart,
                title: 'Safe & Trusted',
                description: 'Review profiles, ratings, and qualifications before choosing.',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-primary-100">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Become a Tutor CTA */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              <div className="flex-1 p-8 lg:p-12">
                <Badge className="bg-primary-100 text-primary-700" size="md">For Tutors</Badge>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4 mb-4">
                  Share Your Knowledge,<br />Earn Money
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Are you a college student or a teacher looking to earn extra income?
                  Join Tuition Mitra and connect with parents seeking quality home tutors.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    'Flexible working hours',
                    'Earn Rs 3,000 - 10,000 per month',
                    'Connect with local parents',
                    'Build your teaching portfolio',
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-primary-600" />
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onNavigate('register-tutor')}
                  className="bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/25 flex items-center gap-2"
                >
                  Register as Tutor
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 relative min-h-64 lg:min-h-auto">
                <img
                  src="https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Tutor teaching"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent lg:bg-gradient-to-l" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Ready to Find Your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500">
              Perfect Tutor?
            </span>
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join Tuition Mitra today and discover the power of personalized home education
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('register-parent')}
              className="bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/25 flex items-center justify-center gap-2"
            >
              Find a Tutor Now
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate('register-tutor')}
              className="bg-white text-primary-600 border-2 border-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-all flex items-center justify-center gap-2"
            >
              Become a Tutor
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Tuition Mitra</span>
              </div>
              <p className="text-gray-400 max-w-md leading-relaxed">
                Connecting parents with verified home tutors for quality education at your doorstep.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#how-it-works" className="hover:text-primary-400 transition-colors">How It Works</a></li>
                <li><a href="#featured" className="hover:text-primary-400 transition-colors">Featured Tutors</a></li>
                <li><a href="#why-us" className="hover:text-primary-400 transition-colors">Why Tuition Mitra</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 Tuition Mitra. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animation-delay-100 {
          animation-delay: 100ms;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
}