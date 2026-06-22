import { useState } from 'react';
import { ArrowLeft, Loader2, CheckCircle, User, BookOpen, MapPin, IndianRupee, Clock, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { SUBJECTS, CLASSES } from '../lib/constants';
import { Button, Input, Select, Card, ChipToggle } from '../components/ui';

type Page = 'landing' | 'login' | 'register-tutor' | 'register-parent' | 'tutor-dashboard' | 'parent-dashboard' | 'admin' | 'tutor-profile';

interface ParentRegistrationProps {
  onNavigate: (page: Page) => void;
}

const STEPS = [
  { number: 1, title: 'Account', icon: Mail },
  { number: 2, title: 'Details', icon: BookOpen },
  { number: 3, title: 'Location', icon: MapPin },
];

export default function ParentRegistration({ onNavigate }: ParentRegistrationProps) {
  const { signUpWithEmail } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    parentName: '',
    mobileNumber: '',
    childName: '',
    childClass: '',
    subjectsRequired: [] as string[],
    budgetMin: '',
    budgetMax: '',
    timingMorning: false,
    timingAfternoon: false,
    timingEvening: false,
    address: '',
    pinCode: '',
    location: '',
  });

  const updateForm = (field: string, value: string | string[] | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateAccount = async () => {
    if (!formData.email) {
      setError('Please enter your email');
      return;
    }
    if (!formData.password) {
      setError('Please enter a password');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    const { error } = await signUpWithEmail(formData.email, formData.password);

    if (error) {
      setError(error.message || 'Failed to create account. Please try again.');
      setLoading(false);
      return;
    }

    setAccountCreated(true);
    setStep(2);
    setLoading(false);
  };

  const validateStep = (stepNum: number): boolean => {
    setError('');

    switch (stepNum) {
      case 2:
        if (!formData.parentName) {
          setError('Please enter your name');
          return false;
        }
        if (!formData.mobileNumber || formData.mobileNumber.length !== 10) {
          setError('Please enter a valid 10-digit mobile number');
          return false;
        }
        if (!formData.childName || !formData.childClass) {
          setError('Please fill student details');
          return false;
        }
        if (formData.subjectsRequired.length === 0) {
          setError('Please select at least one subject');
          return false;
        }
        return true;

      case 3:
        if (!formData.address || !formData.pinCode || !formData.location) {
          setError('Please fill all location details');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const nextStep = () => {
    if (step === 1) {
      handleCreateAccount();
    } else if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    setError('');

    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        setError('Please create your account first');
        setLoading(false);
        return;
      }

      await supabase.from('parents').insert({
        user_id: userId,
        parent_name: formData.parentName,
        mobile_number: formData.mobileNumber,
        child_name: formData.childName,
        child_class: formData.childClass,
        subjects_required: formData.subjectsRequired,
        budget_min: formData.budgetMin ? parseInt(formData.budgetMin) : null,
        budget_max: formData.budgetMax ? parseInt(formData.budgetMax) : null,
        address: formData.address,
        pin_code: formData.pinCode,
        location: formData.location,
        preferred_timing_morning: formData.timingMorning,
        preferred_timing_afternoon: formData.timingAfternoon,
        preferred_timing_evening: formData.timingEvening,
      });

      setRedirecting(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      onNavigate('parent-dashboard');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-white flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Account Created!</h1>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-white">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => (step > 1 && accountCreated ? prevStep() : onNavigate('landing'))}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="font-semibold text-gray-900">Parent Registration</h1>
              <p className="text-sm text-gray-500">Step {step} of {STEPS.length}</p>
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out"
            style={{ width: `${(step / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step indicators */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex justify-between">
          {STEPS.map((s, index) => (
            <div
              key={s.number}
              className={`flex flex-col items-center gap-2 ${index + 1 <= step ? 'text-primary-600' : 'text-gray-400'}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  index + 1 <= step
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <s.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium hidden sm:block">{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Step 1: Account Creation */}
        {step === 1 && (
          <Card padding="lg" className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Create Your Account</h2>
              <p className="text-gray-500">Enter your email and create a password</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      updateForm('email', e.target.value);
                      setError('');
                    }}
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => {
                      updateForm('password', e.target.value);
                      setError('');
                    }}
                    placeholder="Create a password (min 6 characters)"
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      updateForm('confirmPassword', e.target.value);
                      setError('');
                    }}
                    placeholder="Confirm your password"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  />
                </div>
              </div>

              <Button
                onClick={nextStep}
                disabled={loading}
                loading={loading}
                size="lg"
                className="w-full"
              >
                Create Account & Continue
              </Button>

              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Sign In
                </button>
              </p>
            </div>
          </Card>
        )}

        {/* Step 2: Student Details */}
        {step === 2 && (
          <Card padding="lg" className="animate-fade-in">
            {accountCreated && (
              <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">Account Created</p>
                  <p className="text-sm text-green-600">{formData.email}</p>
                </div>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Parent & Student Details</h2>
              <p className="text-gray-500">Tell us about yourself and your child</p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-600" />
                  Parent Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Parent/Guardian Name"
                    value={formData.parentName}
                    onChange={(e) => updateForm('parentName', e.target.value)}
                    placeholder="Your full name"
                  />
                  <Input
                    label="Mobile Number"
                    value={formData.mobileNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      updateForm('mobileNumber', value);
                    }}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary-600" />
                  Student Details
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Student's Name"
                    value={formData.childName}
                    onChange={(e) => updateForm('childName', e.target.value)}
                    placeholder="Child's name"
                  />
                  <Select
                    label="Current Class"
                    value={formData.childClass}
                    onChange={(e) => updateForm('childClass', e.target.value)}
                    options={CLASSES.map((c) => ({ value: c, label: c }))}
                    placeholder="Select class"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Subjects Required
                </label>
                <ChipToggle
                  options={SUBJECTS.map((s) => ({ value: s, label: s }))}
                  selected={formData.subjectsRequired}
                  onChange={(selected) => updateForm('subjectsRequired', selected)}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Selected: {formData.subjectsRequired.length} subjects
                </p>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-primary-600" />
                  Budget Range (Monthly)
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Minimum Budget (Rs)"
                    type="number"
                    value={formData.budgetMin}
                    onChange={(e) => updateForm('budgetMin', e.target.value)}
                    placeholder="e.g., 2000"
                  />
                  <Input
                    label="Maximum Budget (Rs)"
                    type="number"
                    value={formData.budgetMax}
                    onChange={(e) => updateForm('budgetMax', e.target.value)}
                    placeholder="e.g., 5000"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-600" />
                  Preferred Timing
                </label>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { key: 'timingMorning', label: 'Morning', time: '7 AM - 12 PM' },
                    { key: 'timingAfternoon', label: 'Afternoon', time: '12 PM - 5 PM' },
                    { key: 'timingEvening', label: 'Evening', time: '5 PM - 9 PM' },
                  ].map((timing) => (
                    <div
                      key={timing.key}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData[timing.key as keyof typeof formData]
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => updateForm(timing.key, !formData[timing.key as keyof typeof formData])}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData[timing.key as keyof typeof formData] ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
                        }`}>
                          {formData[timing.key as keyof typeof formData] && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{timing.label}</p>
                          <p className="text-xs text-gray-500">{timing.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button variant="outline" onClick={prevStep} size="lg" className="flex-1">
                Back
              </Button>
              <Button onClick={nextStep} size="lg" className="flex-1">
                Continue
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <Card padding="lg" className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Location Details</h2>
              <p className="text-gray-500">Where are you located?</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => updateForm('address', e.target.value)}
                  placeholder="House/Flat No., Street, Area"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none transition-all"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="PIN Code"
                  value={formData.pinCode}
                  onChange={(e) => updateForm('pinCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit PIN"
                  maxLength={6}
                />
                <Input
                  label="City/Locality"
                  value={formData.location}
                  onChange={(e) => updateForm('location', e.target.value)}
                  placeholder="e.g., Delhi, Mumbai"
                />
              </div>

              {/* Summary */}
              <div className="pt-6 border-t border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Registration Summary</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Parent Name</span>
                    <span className="font-medium text-gray-900">{formData.parentName || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium text-gray-900">{formData.email || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone</span>
                    <span className="font-medium text-gray-900">+91 {formData.mobileNumber || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Student</span>
                    <span className="font-medium text-gray-900">{formData.childName || '-'} ({formData.childClass || '-'})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subjects</span>
                    <span className="font-medium text-gray-900">{formData.subjectsRequired.length} selected</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Budget</span>
                    <span className="font-medium text-gray-900">
                      Rs {formData.budgetMin || '0'} - {formData.budgetMax || '0'}/mo
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Preferred Time</span>
                    <span className="font-medium text-gray-900">
                      {[
                        formData.timingMorning && 'Morning',
                        formData.timingAfternoon && 'Afternoon',
                        formData.timingEvening && 'Evening',
                      ].filter(Boolean).join(', ') || 'Any'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location</span>
                    <span className="font-medium text-gray-900">{formData.location || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button variant="outline" onClick={prevStep} size="lg" className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                size="lg"
                loading={loading}
                className="flex-1"
              >
                Complete Registration
              </Button>
            </div>
          </Card>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}