import { useState, useEffect } from 'react';
import { ArrowLeft, Phone, Shield, Loader2, GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Card } from '../components/ui';

type Page = 'landing' | 'login' | 'register-tutor' | 'register-parent' | 'tutor-dashboard' | 'parent-dashboard' | 'admin' | 'tutor-profile';

interface LoginProps {
  onNavigate: (page: Page) => void;
}

export default function Login({ onNavigate }: LoginProps) {
  const { signInWithPhone, verifyOtp, session } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (session) {
      // The App component will handle redirect based on userRole
    }
  }, [session]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');

    const formattedPhone = `+91${phoneNumber}`;
    const { error } = await signInWithPhone(formattedPhone);

    if (error) {
      setError(error.message || 'Failed to send OTP. Please try again.');
      setLoading(false);
      return;
    }

    setOtpSent(true);
    setStep('otp');
    setCountdown(60);
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    const formattedPhone = `+91${phoneNumber}`;
    const { error } = await verifyOtp(formattedPhone, otp);

    if (error) {
      setError('Invalid OTP. Please try again.');
      setLoading(false);
      return;
    }

    // Auth state will change and redirect will happen automatically
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setLoading(true);
    setError('');
    setOtp('');

    const formattedPhone = `+91${phoneNumber}`;
    const { error } = await signInWithPhone(formattedPhone);

    if (error) {
      setError(error.message || 'Failed to resend OTP. Please try again.');
    } else {
      setCountdown(60);
      setOtpSent(true);
    }

    setLoading(false);
  };

  const goBack = () => {
    if (step === 'otp') {
      setStep('phone');
      setOtp('');
      setError('');
    } else {
      onNavigate('landing');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-white flex flex-col">
      {/* Header */}
      <div className="p-4">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/25">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <GraduationCap className="w-6 h-6 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Tuition Mitra</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in with your mobile number</p>
          </div>

          <Card padding="lg" className="shadow-xl">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            {step === 'phone' && (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-gray-600 font-semibold">+91</span>
                    </div>
                    <div className="absolute inset-y-0 left-14 flex items-center">
                      <Phone className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhoneNumber(value);
                        setError('');
                      }}
                      placeholder="Enter mobile number"
                      className="w-full pl-24 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-lg"
                      maxLength={10}
                      inputMode="numeric"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    We'll send a 6-digit OTP to this number
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading || phoneNumber.length !== 10}
                  loading={loading}
                  size="lg"
                  className="w-full"
                >
                  Send OTP
                </Button>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="text-center mb-4">
                  <p className="text-gray-700">We've sent a 6-digit OTP to</p>
                  <p className="font-semibold text-gray-900">+91 {phoneNumber}</p>
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
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  loading={loading}
                  size="lg"
                  className="w-full"
                >
                  Verify & Login
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
                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone');
                      setOtp('');
                      setError('');
                      setCountdown(0);
                    }}
                    className="block w-full text-sm text-gray-500 hover:text-gray-700"
                  >
                    Change Number
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-center text-gray-600 text-sm mb-4">
                Don't have an account?
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => onNavigate('register-parent')}
                  className="flex-1"
                >
                  Register as Parent
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onNavigate('register-tutor')}
                  className="flex-1"
                >
                  Register as Tutor
                </Button>
              </div>
            </div>
          </Card>

          {/* What happens text */}
          {step === 'otp' && !otpSent && (
            <p className="text-center text-sm text-gray-500 mt-4 animate-pulse">
              Waiting for OTP...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}