'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    router.push('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      router.push('/calculator');
    } catch (error: unknown) {
      setError((error as any)?.message || 'Login failed');
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
              Welcome Back
            </h1>
            <p className="text-xl" style={{ color: 'var(--text-light-gray)' }}>
              Sign in to access your Amsterdam discovery experience
            </p>
          </div>
        </section>

        {/* Login Form Section */}
        <section className="py-24">
          <div className="auth-container">
            {/* Flash Messages */}
            {error && (
              <div className="flash-error">
                {error}
              </div>
            )}

            {/* Google OAuth */}
            <div className="mb-8">
              <a
                href="http://localhost:5001/auth/google"
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
                Continue with Google
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
                  OR CONTINUE WITH EMAIL
                </span>
              </div>
            </div>

            {/* Email Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-white)' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            {/* Links */}
            <div className="text-center mt-8">
              <p className="mb-2" style={{ color: 'var(--text-light-gray)' }}>
                Don&apos;t have an account?{' '}
                <Link href="/register" className="font-medium transition-all duration-300" style={{ color: 'var(--accent-gold)' }}>
                  Sign up here
                </Link>
              </p>
            </div>

            {/* Info Section */}
            <div className="mt-8 p-6 rounded-xl" style={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              borderLeft: '4px solid var(--accent-gold)'
            }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--accent-gold)' }}>
                Why Create an Account?
              </h3>
              <ul className="space-y-2" style={{ color: 'var(--text-light-gray)' }}>
                <li>• <strong>Calculator Access:</strong> Use our advanced calculator with history tracking</li>
                <li>• <strong>Personalized Experience:</strong> Save your preferences and favorites</li>
                <li>• <strong>Secure & Private:</strong> Your data is protected with industry-standard security</li>
                <li>• <strong>Easy Access:</strong> Sign in with Google or your email address</li>
              </ul>
            </div>
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
