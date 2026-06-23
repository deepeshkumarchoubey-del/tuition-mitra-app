import { useState } from 'react';
import { ArrowLeft, Loader2, CheckCircle, User, BookOpen, MapPin, IndianRupee, Mail, Lock, Eye, EyeOff } from 'lucide-react';
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
  { number: 2, title: 'Student', icon: BookOpen },
  { number: 3, title: 'Location', icon: MapPin },
];

const GENDER_PREFERENCES = [
  { value: 'no_preference', label: 'No Preference', description: 'Any qualified tutor' },
  { value: 'male', label: 'Male', description: 'Prefer male tutor' },
  { value: 'female', label: 'Female', description: 'Prefer female tutor' },
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
    // Account
    email: '',
    password: '',
    confirmPassword: '',
    // Personal
    fullName: '',
    mobileNumber: '',
    // Student
    studentClass: '',
    subjectsNeeded: [] as string[],
    monthlyBudget: '',
    preferredTutorGender: 'no_preference',
    // Location
    city: '',
    localArea: '',
    address: '',
    pinCode: '',
  });

  const updateForm = (field: string, value: string | string[]) => {
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
        if (!formData.fullName) {
          setError('Please enter your full name');
          return false;
        }
        if (!formData.mobileNumber || formData.mobileNumber.length !== 10) {
          setError('Please enter a valid 10-digit mobile number');
          return false;
        }
        if (!formData.studentClass) {
          setError('Please select student class');
          return false;
        }
        if (formData.subjectsNeeded.length === 0) {
          setError('Please select at least one subject');
          return false;
        }
        if (!formData.monthlyBudget) {
          setError('Please enter your monthly budget');
          return false;
        }
        return true;

      case 3:
        if (!formData.city || !formData.localArea || !formData.pinCode) {
          setError('Please fill city, local area, and PIN code');
          return false;
        }
        if (formData.pinCode.length !== 6) {
          setError('Please enter a valid 6-digit PIN code');
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

      const fullAddress = formData.address
        ? `${formData.address}, ${formData.localArea}, ${formData.city} - ${formData.pinCode}`
        : `${formData.localArea}, ${formData.city} - ${formData.pinCode}`;

      await supabase.from('parents').insert({
        user_id: userId,
        parent_name: formData.fullName,
        mobile_number: formData.mobileNumber,
        child_name: `${formData.fullName}'s Child`,
        child_class: formData.studentClass,
        subjects_required: formData.subjectsNeeded,
        budget_max: parseInt(formData.monthlyBudget),
        budget_min: null,
        address: fullAddress,
        pin_code: formData.pinCode,
        location: formData.city,
        preferred_tutor_gender: formData.preferredTutorGender,
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Account Created!</h1>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => (step > 1 && accountCreated ? prevStep() : onNavigate('landing'))}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="font-semibold text-gray-900 text-sm sm:text-base">Parent Registration</h1>
              <p className="text-xs sm:text-sm text-gray-500">Step {step} of {STEPS.length}</p>
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${(step / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step indicators - Hidden on mobile */}
      <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6 hidden sm:block">
        <div className="flex justify-between">
          {STEPS.map((s, index) => (
            <div
              key={s.number}
              className={`flex flex-col items-center gap-2 ${index + 1 <= step ? 'text-blue-600' : 'text-gray-400'}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  index + 1 <= step
                    ? 'bg-gradient-to-br from-blue-500 to-emerald-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <s.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-12 sm:pb-20">
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
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

            <div className="space-y-5">
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
                    className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-base"
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
                    className="w-full pl-12 pr-12 py-3.5 sm:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-base"
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
                    className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-base"
                  />
                </div>
              </div>

              <Button
                onClick={nextStep}
                disabled={loading}
                loading={loading}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                Create Account & Continue
              </Button>

              <p className="text-center text-sm text-gray-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
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
              <div className="mb-6 flex items-center gap-3 p-3 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-800 text-sm sm:text-base">Account Created</p>
                  <p className="text-xs sm:text-sm text-emerald-600">{formData.email}</p>
                </div>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Personal & Student Details</h2>
              <p className="text-gray-500">Tell us about yourself and your requirements</p>
            </div>

            <div className="space-y-5">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  Your Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={formData.fullName}
                    onChange={(e) => updateForm('fullName', e.target.value)}
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

              <div className="pt-4 border-t border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-500" />
                  Student Details
                </h3>

                <Select
                  label="Student Class"
                  value={formData.studentClass}
                  onChange={(e) => updateForm('studentClass', e.target.value)}
                  options={CLASSES.map((c) => ({ value: c, label: c }))}
                  placeholder="Select class"
                />

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Subjects Needed
                  </label>
                  <ChipToggle
                    options={SUBJECTS.map((s) => ({ value: s, label: s }))}
                    selected={formData.subjectsNeeded}
                    onChange={(selected) => updateForm('subjectsNeeded', selected)}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Selected: {formData.subjectsNeeded.length} subjects
                  </p>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-emerald-500" />
                    Monthly Budget
                  </label>
                  <Input
                    type="number"
                    value={formData.monthlyBudget}
                    onChange={(e) => updateForm('monthlyBudget', e.target.value)}
                    placeholder="e.g., 3000"
                    hint="Your maximum budget per month (Rs)"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Preferred Tutor Gender
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {GENDER_PREFERENCES.map((pref) => (
                      <div
                        key={pref.value}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.preferredTutorGender === pref.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => updateForm('preferredTutorGender', pref.value)}
                      >
                        <p className={`font-medium text-sm ${formData.preferredTutorGender === pref.value ? 'text-blue-700' : 'text-gray-900'}`}>
                          {pref.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{pref.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button variant="outline" onClick={prevStep} size="lg" className="flex-1">
                Back
              </Button>
              <Button
                onClick={nextStep}
                size="lg"
                className="flex-1 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
              >
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

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="City"
                  value={formData.city}
                  onChange={(e) => updateForm('city', e.target.value)}
                  placeholder="e.g., Delhi, Mumbai"
                />
                <Input
                  label="PIN Code"
                  value={formData.pinCode}
                  onChange={(e) => updateForm('pinCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit PIN"
                  maxLength={6}
                />
              </div>

              <Input
                label="Area / Locality"
                value={formData.localArea}
                onChange={(e) => updateForm('localArea', e.target.value)}
                placeholder="e.g., Sector 62, Rajouri Garden"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Address (Optional)</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => updateForm('address', e.target.value)}
                  placeholder="House/Flat No., Street, Building Name"
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all text-base"
                />
              </div>

              {/* Summary */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Registration Summary</h3>
                <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Name</span>
                    <span className="font-medium text-gray-900">{formData.fullName || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium text-gray-900 truncate max-w-[150px] sm:max-w-none">{formData.email || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Mobile</span>
                    <span className="font-medium text-gray-900">+91 {formData.mobileNumber || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Student Class</span>
                    <span className="font-medium text-gray-900">{formData.studentClass || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subjects</span>
                    <span className="font-medium text-gray-900">{formData.subjectsNeeded.length} selected</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Monthly Budget</span>
                    <span className="font-medium text-gray-900">Rs {formData.monthlyBudget || '0'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Preferred Gender</span>
                    <span className="font-medium text-gray-900 capitalize">{formData.preferredTutorGender.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Location</span>
                    <span className="font-medium text-gray-900">{formData.city || '-'}</span>
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
                className="flex-1 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
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