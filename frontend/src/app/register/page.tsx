'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register, verifyEmail, user } = useAuth();
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [userId, setUserId] = useState<number | null>(null);
  
  // Registration form
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    age: ''
  });
  
  // Verification form
  const [verificationCode, setVerificationCode] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    router.push('/');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await register({
        ...formData,
        age: parseInt(formData.age)
      });
      
      // For local development - if registration is successful and user is logged in immediately
      if (response.success && response.user) {
        router.push('/calculator'); // Go directly to calculator
        return;
      }
      
      // For production - verification step required  
      if (response.user_id) {
        setUserId(response.user_id);
        setStep('verify');
      }
    } catch (error: unknown) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    setIsLoading(true);
    setError('');

    try {
      await verifyEmail(userId, verificationCode);
      router.push('/calculator');
    } catch (error: unknown) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 text-center" style={{ background: 'rgba(0, 0, 0, 0.1)' }}>
          <div className="max-w-3xl mx-auto px-8">
            <h1 className="text-5xl font-semibold mb-6" style={{ color: 'var(--text-white)' }}>
              {step === 'register' ? 'Join Amsterdam Discovery' : 'Verify Your Email'}
            </h1>
            <p className="text-xl" style={{ color: 'var(--text-light-gray)' }}>
              {step === 'register' 
                ? 'Create your account to start exploring Amsterdam'
                : 'Check your email for the verification code'
              }
            </p>
          </div>
        </section>

        {/* Registration Form Section */}
        <section className="py-24">
          <div className="auth-container">
            {/* Flash Messages */}
            {error && (
              <div className="flash-error">
                {error}
              </div>
            )}

            {step === 'register' ? (
              <>
                {/* Google OAuth */}
                <div className="mb-8">
                  <a
                    href="/auth/google"
                    className="flex items-center justify-center gap-4 w-full py-4 px-6 rounded-xl font-medium text-lg transition-all duration-300"
                    style={{
                      background: '#ffffff',
                      color: '#1f1f1f',
                      border: '2px solid #dadce0'
                    }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign up with Google
                  </a>
                </div>

                {/* Divider */}
                <div className="relative text-center mb-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}></div>
                  </div>
                  <div className="relative">
                    <span 
                      className="px-4 text-sm font-medium"
                      style={{ 
                        background: 'var(--primary-red)',
                        color: 'var(--text-light-gray)'
                      }}
                    >
                      OR CREATE ACCOUNT WITH EMAIL
                    </span>
                  </div>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleRegisterSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="first_name" className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-white)' }}>
                        First Name
                      </label>
                      <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Your first name"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="last_name" className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-white)' }}>
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Your last name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-white)' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-white)' }}>
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Create a strong password"
                      required
                      minLength={6}
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--text-gray)' }}>
                      Must be at least 6 characters long
                    </p>
                  </div>

                  <div>
                    <label htmlFor="age" className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-white)' }}>
                      Age
                    </label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Your age"
                      required
                      min="13"
                      max="120"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </form>
              </>
            ) : (
              /* Verification Form */
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'rgba(76, 175, 80, 0.2)' }}>
                    <span className="text-2xl">📧</span>
                  </div>
                  <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-white)' }}>
                    Check Your Email
                  </h3>
                  <p style={{ color: 'var(--text-light-gray)' }}>
                    We've sent a 6-digit verification code to <strong>{formData.email}</strong>
                  </p>
                </div>

                <form onSubmit={handleVerifySubmit} className="space-y-6">
                  <div>
                    <label htmlFor="verification_code" className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-white)' }}>
                      Verification Code
                    </label>
                    <input
                      type="text"
                      id="verification_code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="form-input text-center text-xl font-bold tracking-wider font-mono"
                      placeholder="123456"
                      required
                      maxLength={6}
                      pattern="[0-9]{6}"
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--text-gray)' }}>
                      Enter the 6-digit code from your email
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Verifying...' : 'Verify Email'}
                  </button>
                </form>

                <div className="text-center mt-6">
                  <button
                    onClick={() => setStep('register')}
                    className="text-sm transition-all duration-300 hover:underline"
                    style={{ color: 'var(--accent-gold)' }}
                  >
                    ← Back to registration
                  </button>
                </div>
              </>
            )}

            {/* Links */}
            {step === 'register' && (
              <div className="text-center mt-8">
                <p className="mb-2" style={{ color: 'var(--text-light-gray)' }}>
                  Already have an account?{' '}
                  <Link href="/login" className="font-medium transition-all duration-300" style={{ color: 'var(--accent-gold)' }}>
                    Sign in here
                  </Link>
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer 
        className="py-8 text-center border-t"
        style={{ 
          background: 'rgba(0, 0, 0, 0.2)',
          borderColor: 'rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="max-w-6xl mx-auto px-8">
          <p className="text-sm" style={{ color: 'var(--text-gray)' }}>
            &copy; 2024 Amsterdam Discovery Site. Built with ❤️ for learning.
          </p>
        </div>
      </footer>
    </>
  );
}
