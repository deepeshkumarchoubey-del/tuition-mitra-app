import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, CheckCircle, User, BookOpen, MapPin, IndianRupee, Clock, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { SUBJECTS, CLASSES } from '../lib/constants';
import { Button, Input, Select, Card, Badge, ChipToggle } from '../components/ui';

type Page = 'landing' | 'login' | 'register-tutor' | 'register-parent' | 'tutor-dashboard' | 'parent-dashboard' | 'admin' | 'tutor-profile';

interface ParentRegistrationProps {
  onNavigate: (page: Page) => void;
}

const STEPS = [
  { number: 1, title: 'Phone', icon: Phone },
  { number: 2, title: 'Details', icon: BookOpen },
  { number: 3, title: 'Location', icon: MapPin },
];

export default function ParentRegistration({ onNavigate }: ParentRegistrationProps) {
  const { signInWithPhone, verifyOtp } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);

  const [formData, setFormData] = useState({
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

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const updateForm = (field: string, value: string | string[] | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSendOtp = async () => {
    if (formData.mobileNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');

    const formattedPhone = `+91${formData.mobileNumber}`;
    const { error } = await signInWithPhone(formattedPhone);

    if (error) {
      setError(error.message || 'Failed to send OTP. Please try again.');
      setLoading(false);
      return;
    }

    setOtpSent(true);
    setCountdown(60);
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    const formattedPhone = `+91${formData.mobileNumber}`;
    const { error } = await verifyOtp(formattedPhone, otp);

    if (error) {
      setError('Invalid OTP. Please try again.');
      setLoading(false);
      return;
    }

    setPhoneVerified(true);
    setStep(2);
    setLoading(false);
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setLoading(true);
    setError('');
    setOtp('');

    const formattedPhone = `+91${formData.mobileNumber}`;
    const { error } = await signInWithPhone(formattedPhone);

    if (error) {
      setError(error.message || 'Failed to resend OTP.');
    } else {
      setCountdown(60);
    }

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
    if (validateStep(step)) {
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
        setError('Please verify your phone number first');
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

      // Show loading state before redirecting
      setRedirecting(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      onNavigate('parent-dashboard');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show redirecting screen
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
              onClick={() => (step > 1 && phoneVerified ? prevStep() : onNavigate('landing'))}
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

        {/* Step 1: Phone Verification */}
        {step === 1 && (
          <Card padding="lg" className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Verify Your Mobile Number</h2>
              <p className="text-gray-500">We'll send a 6-digit OTP to verify your number</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-600 font-semibold">+91</span>
                  </div>
                  <div className="absolute inset-y-0 left-14 flex items-center">
                    <Phone className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      updateForm('mobileNumber', value);
                      setError('');
                      setOtpSent(false);
                    }}
                    placeholder="Enter mobile number"
                    className="w-full pl-24 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-lg"
                    maxLength={10}
                    inputMode="numeric"
                    disabled={phoneVerified}
                  />
                </div>
              </div>

              {!otpSent && !phoneVerified && (
                <Button
                  onClick={handleSendOtp}
                  disabled={loading || formData.mobileNumber.length !== 10}
                  size="lg"
                  className="w-full"
                >
                  Send OTP
                </Button>
              )}

              {otpSent && !phoneVerified && (
                <div className="space-y-4">
                  <div className="text-center text-gray-700">
                    We've sent a 6-digit OTP to +91 {formData.mobileNumber}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtp(value);
                        setError('');
                      }}
                      placeholder="------"
                      className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-center text-3xl tracking-widest font-bold"
                      maxLength={6}
                      inputMode="numeric"
                    />
                  </div>
                  <Button
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.length !== 6}
                    size="lg"
                    className="w-full"
                  >
                    Verify & Continue
                  </Button>
                  <div className="text-center space-y-2">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={countdown > 0 || loading}
                      className={`text-sm font-medium ${
                        countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-primary-600 hover:text-primary-700'
                      }`}
                    >
                      {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </div>
              )}

              {phoneVerified && (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800">Phone Verified</p>
                    <p className="text-sm text-green-600">+91 {formData.mobileNumber}</p>
                  </div>
                </div>
              )}

              {phoneVerified && (
                <Button onClick={() => setStep(2)} size="lg" className="w-full">
                  Continue Registration
                </Button>
              )}
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