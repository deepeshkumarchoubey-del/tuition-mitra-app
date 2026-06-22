import { useState } from 'react';
import { ArrowLeft, Upload, Loader2, CheckCircle, User, BookOpen, MapPin, IndianRupee, Clock, Globe, Mail, Lock, Eye, EyeOff, Home, Wifi, MonitorSmartphone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { SUBJECTS, CLASSES, LANGUAGES, QUALIFICATIONS, GENDERS } from '../lib/constants';
import { Button, Input, Select, Card, Badge, Toggle, ChipToggle } from '../components/ui';

type Page = 'landing' | 'login' | 'register-tutor' | 'register-parent' | 'tutor-dashboard' | 'parent-dashboard' | 'admin' | 'tutor-profile';

interface TutorRegistrationProps {
  onNavigate: (page: Page) => void;
}

const STEPS = [
  { number: 1, title: 'Account', icon: Mail },
  { number: 2, title: 'Personal', icon: User },
  { number: 3, title: 'Education', icon: BookOpen },
  { number: 4, title: 'Teaching', icon: Clock },
  { number: 5, title: 'Location', icon: MapPin },
];

const TEACHING_MODES = [
  { value: 'home', label: 'Home Tuition', icon: Home, description: 'I visit student\'s home' },
  { value: 'online', label: 'Online', icon: Wifi, description: 'Teach via video call' },
  { value: 'both', label: 'Both', icon: MonitorSmartphone, description: 'Home & Online both' },
];

export default function TutorRegistration({ onNavigate }: TutorRegistrationProps) {
  const { signUpWithEmail } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  const [availability, setAvailability] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    mobileNumber: '',
    gender: '',
    dateOfBirth: '',
    qualification: '',
    collegeSchool: '',
    subjects: [] as string[],
    classes: [] as string[],
    monthlyFeesMin: '',
    monthlyFeesMax: '',
    experienceYears: '',
    languagesKnown: [] as string[],
    teachingMode: 'both' as 'home' | 'online' | 'both',
    address: '',
    areaLocality: '',
    pinCode: '',
    city: '',
    bio: '',
  });

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [idProof, setIdProof] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);

  const updateForm = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'id') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'profile') {
        setProfilePhoto(file);
        const reader = new FileReader();
        reader.onloadend = () => setProfilePhotoPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setIdProof(file);
      }
    }
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
        if (!formData.fullName || !formData.mobileNumber || !formData.gender || !formData.dateOfBirth) {
          setError('Please fill all personal details');
          return false;
        }
        if (formData.mobileNumber.length !== 10) {
          setError('Please enter a valid 10-digit mobile number');
          return false;
        }
        return true;

      case 3:
        if (!formData.qualification || !formData.collegeSchool) {
          setError('Please fill all education details');
          return false;
        }
        return true;

      case 4:
        if (formData.subjects.length === 0) {
          setError('Please select at least one subject');
          return false;
        }
        if (formData.classes.length === 0) {
          setError('Please select at least one class');
          return false;
        }
        if (!formData.monthlyFeesMin || !formData.monthlyFeesMax) {
          setError('Please specify your fee range');
          return false;
        }
        if (parseInt(formData.monthlyFeesMin) > parseInt(formData.monthlyFeesMax)) {
          setError('Minimum fee cannot be greater than maximum fee');
          return false;
        }
        return true;

      case 5:
        if (!formData.address || !formData.areaLocality || !formData.pinCode || !formData.city) {
          setError('Please fill all location details');
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
      setStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setLoading(true);
    setError('');

    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        setError('Please create your account first');
        setLoading(false);
        return;
      }

      const profileCompletion = calculateCompletion();

      // Combine address components for full address
      const fullAddress = `${formData.address}, ${formData.areaLocality}, ${formData.city} - ${formData.pinCode}`;

      await supabase.from('tutors').insert({
        user_id: userId,
        full_name: formData.fullName,
        mobile_number: formData.mobileNumber,
        gender: formData.gender,
        date_of_birth: formData.dateOfBirth,
        qualification: formData.qualification,
        college_school: formData.collegeSchool,
        subjects: formData.subjects,
        classes: formData.classes,
        monthly_fees_min: parseInt(formData.monthlyFeesMin),
        monthly_fees_max: parseInt(formData.monthlyFeesMax),
        experience_years: parseInt(formData.experienceYears) || 0,
        languages_known: formData.languagesKnown,
        teaching_mode: formData.teachingMode,
        address: fullAddress,
        pin_code: formData.pinCode,
        location: formData.city,
        bio: formData.bio,
        is_verified: false,
        is_available: availability,
        profile_completion: profileCompletion,
      });

      setRedirecting(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      onNavigate('tutor-dashboard');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletion = () => {
    const fields = [
      formData.fullName,
      formData.mobileNumber,
      formData.email,
      formData.gender,
      formData.dateOfBirth,
      formData.qualification,
      formData.collegeSchool,
      formData.subjects.length > 0,
      formData.classes.length > 0,
      formData.monthlyFeesMin,
      formData.monthlyFeesMax,
      formData.experienceYears,
      formData.address,
      formData.areaLocality,
      formData.city,
      formData.pinCode,
      profilePhoto,
      formData.bio,
      formData.teachingMode,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  if (redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-white flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile Created!</h1>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-white">
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
              <h1 className="font-semibold text-gray-900 text-sm sm:text-base">Tutor Registration</h1>
              <p className="text-xs sm:text-sm text-gray-500">Step {step} of {STEPS.length}</p>
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

      {/* Step indicators - Hidden on mobile */}
      <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6 hidden sm:block">
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

        {/* Step 1: Account Details */}
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
                    className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-base"
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
                    className="w-full pl-12 pr-12 py-3.5 sm:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-base"
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
                    className="w-full pl-12 pr-4 py-3.5 sm:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-base"
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

        {/* Step 2: Personal Details */}
        {step === 2 && (
          <Card padding="lg" className="animate-fade-in">
            {accountCreated && (
              <div className="mb-6 flex items-center gap-3 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800 text-sm sm:text-base">Account Created</p>
                  <p className="text-xs sm:text-sm text-green-600">{formData.email}</p>
                </div>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Personal Information</h2>
              <p className="text-gray-500">Tell us about yourself</p>
            </div>

            <div className="space-y-5">
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
                hint="We'll contact you on this number"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Gender"
                  value={formData.gender}
                  onChange={(e) => updateForm('gender', e.target.value)}
                  options={GENDERS.map((g) => ({ value: g, label: g }))}
                  placeholder="Select gender"
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateForm('dateOfBirth', e.target.value)}
                />
              </div>

              {/* Profile Photo Upload */}
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-3">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-primary-500 transition-colors cursor-pointer bg-gray-50 flex-shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'profile')}
                      className="hidden"
                      id="profile-photo"
                    />
                    <label htmlFor="profile-photo" className="cursor-pointer">
                      {profilePhotoPreview ? (
                        <img
                          src={profilePhotoPreview}
                          alt="Profile"
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-primary-100"
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
                        </div>
                      )}
                    </label>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 font-medium">
                      {profilePhoto ? profilePhoto.name : 'Click to upload'}
                    </p>
                    <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
                  </div>
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

        {/* Step 3: Education */}
        {step === 3 && (
          <Card padding="lg" className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Educational Qualification</h2>
              <p className="text-gray-500">Tell us about your education background</p>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Highest Qualification"
                  value={formData.qualification}
                  onChange={(e) => updateForm('qualification', e.target.value)}
                  options={QUALIFICATIONS.map((q) => ({ value: q, label: q }))}
                  placeholder="Select qualification"
                />
                <Input
                  label="College/School Name"
                  value={formData.collegeSchool}
                  onChange={(e) => updateForm('collegeSchool', e.target.value)}
                  placeholder="Name of your institution"
                />
              </div>

              <Input
                label="Teaching Experience (Years)"
                type="number"
                value={formData.experienceYears}
                onChange={(e) => updateForm('experienceYears', e.target.value)}
                placeholder="e.g., 2"
                hint="Enter 0 if you're a fresher"
              />

              {/* ID Proof Upload */}
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-3">College ID / Aadhaar (Optional)</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-primary-500 transition-colors cursor-pointer bg-gray-50">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, 'id')}
                    className="hidden"
                    id="id-proof"
                  />
                  <label htmlFor="id-proof" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    {idProof ? (
                      <p className="text-sm text-primary-600 font-medium">{idProof.name}</p>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600 font-medium">Upload ID Proof</p>
                        <p className="text-xs text-gray-400 mt-1">College ID or Aadhaar Card</p>
                      </>
                    )}
                  </label>
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

        {/* Step 4: Teaching Details */}
        {step === 4 && (
          <Card padding="lg" className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Teaching Details</h2>
              <p className="text-gray-500">What subjects and classes can you teach?</p>
            </div>

            <div className="space-y-6">
              {/* Subjects */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Subjects You Can Teach
                </label>
                <ChipToggle
                  options={SUBJECTS.map((s) => ({ value: s, label: s }))}
                  selected={formData.subjects}
                  onChange={(selected) => updateForm('subjects', selected)}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Selected: {formData.subjects.length} subjects
                </p>
              </div>

              {/* Classes */}
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Classes You Can Teach
                </label>
                <div className="flex flex-wrap gap-2">
                  {CLASSES.map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => {
                        const classes = formData.classes.includes(cls)
                          ? formData.classes.filter((c) => c !== cls)
                          : [...formData.classes, cls];
                        updateForm('classes', classes);
                      }}
                      className={`px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        formData.classes.includes(cls)
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Selected: {formData.classes.length} classes
                </p>
              </div>

              {/* Teaching Mode */}
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Teaching Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {TEACHING_MODES.map((mode) => (
                    <div
                      key={mode.value}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.teachingMode === mode.value
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => updateForm('teachingMode', mode.value)}
                    >
                      <div className="flex flex-col items-center text-center gap-2">
                        <mode.icon className={`w-6 h-6 ${formData.teachingMode === mode.value ? 'text-primary-600' : 'text-gray-400'}`} />
                        <p className={`font-medium text-sm ${formData.teachingMode === mode.value ? 'text-primary-700' : 'text-gray-900'}`}>
                          {mode.label}
                        </p>
                        <p className="text-xs text-gray-500">{mode.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fee Range */}
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-primary-600" />
                  Monthly Fee Range
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Minimum (Rs)"
                    type="number"
                    value={formData.monthlyFeesMin}
                    onChange={(e) => updateForm('monthlyFeesMin', e.target.value)}
                    placeholder="e.g., 2000"
                  />
                  <Input
                    label="Maximum (Rs)"
                    type="number"
                    value={formData.monthlyFeesMax}
                    onChange={(e) => updateForm('monthlyFeesMax', e.target.value)}
                    placeholder="e.g., 5000"
                  />
                </div>
              </div>

              {/* Languages */}
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary-600" />
                  Languages Known
                </label>
                <ChipToggle
                  options={LANGUAGES.map((l) => ({ value: l, label: l }))}
                  selected={formData.languagesKnown}
                  onChange={(selected) => updateForm('languagesKnown', selected)}
                />
              </div>

              {/* Bio */}
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  About You (Bio)
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => updateForm('bio', e.target.value)}
                  placeholder="Write a brief description about yourself, your teaching style, and what makes you a great tutor..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none transition-all text-base"
                />
              </div>

              {/* Availability Toggle */}
              <div className="pt-4 border-t border-gray-100">
                <Toggle
                  enabled={availability}
                  onChange={setAvailability}
                  label="Available for Tuition"
                  description={availability ? 'Parents can find and contact you' : 'Hidden from search results'}
                />
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

        {/* Step 5: Location */}
        {step === 5 && (
          <Card padding="lg" className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Location Details</h2>
              <p className="text-gray-500">Where are you located?</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => updateForm('address', e.target.value)}
                  placeholder="House/Flat No., Street, Building Name"
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none transition-all text-base"
                />
              </div>

              <Input
                label="Area / Locality"
                value={formData.areaLocality}
                onChange={(e) => updateForm('areaLocality', e.target.value)}
                placeholder="e.g., Sector 62, Rajouri Garden"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="PIN Code"
                  value={formData.pinCode}
                  onChange={(e) => updateForm('pinCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit PIN"
                  maxLength={6}
                />
                <Input
                  label="City"
                  value={formData.city}
                  onChange={(e) => updateForm('city', e.target.value)}
                  placeholder="e.g., Delhi, Mumbai"
                />
              </div>

              {/* Summary */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4">Profile Summary</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
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
                    <span className="text-gray-500">Qualification</span>
                    <span className="font-medium text-gray-900">{formData.qualification || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Experience</span>
                    <span className="font-medium text-gray-900">{formData.experienceYears || '0'} years</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subjects</span>
                    <span className="font-medium text-gray-900">{formData.subjects.length} selected</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Classes</span>
                    <span className="font-medium text-gray-900">{formData.classes.length} selected</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Teaching Mode</span>
                    <span className="font-medium text-gray-900 capitalize">{formData.teachingMode}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Fee Range</span>
                    <span className="font-medium text-gray-900">
                      Rs {formData.monthlyFeesMin || '0'} - {formData.monthlyFeesMax || '0'}/mo
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Location</span>
                    <span className="font-medium text-gray-900">{formData.city || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Availability</span>
                    <Badge variant={availability ? 'success' : 'warning'} size="sm">
                      {availability ? 'Available' : 'Not Available'}
                    </Badge>
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
