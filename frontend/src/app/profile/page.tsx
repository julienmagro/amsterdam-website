'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  if (!user) {
    return (
      <>
        <Navigation />
        
        <main className="flex-1">
          <section className="py-24 text-center" style={{ background: 'rgba(0, 0, 0, 0.1)' }}>
            <div className="max-w-3xl mx-auto px-8">
              <h1 className="text-5xl font-semibold mb-6" style={{ color: 'var(--text-white)' }}>
                User Profile
              </h1>
              <p className="text-xl" style={{ color: 'var(--text-light-gray)' }}>
                Please log in to view your profile
              </p>
            </div>
          </section>

          <section className="py-24">
            <div className="auth-container">
              <h3 className="text-2xl font-semibold mb-4" style={{ color: 'var(--accent-gold)' }}>
                Login Required
              </h3>
              <p className="mb-6" style={{ color: 'var(--text-light-gray)' }}>
                Please log in to access your profile settings.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/login" className="cta-button">
                  Login
                </Link>
                <Link href="/register" className="cta-button secondary">
                  Sign Up
                </Link>
              </div>
            </div>
          </section>
        </main>
      </>
    );
  }

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <>
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 text-center" style={{ background: 'rgba(0, 0, 0, 0.1)' }}>
          <div className="max-w-3xl mx-auto px-8">
            <h1 className="text-5xl font-semibold mb-6" style={{ color: 'var(--text-white)' }}>
              User Profile
            </h1>
            <p className="text-xl" style={{ color: 'var(--text-light-gray)' }}>
              Manage your account settings and preferences
            </p>
          </div>
        </section>

        {/* Profile Content */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-8">
            
            {/* Profile Header */}
            <div className="glass-card mb-8 text-center">
              <div className="flex items-center justify-center mb-6">
                {user.profile_picture ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={user.profile_picture} 
                      alt="Profile Picture"
                      className="w-24 h-24 rounded-full border-4 border-yellow-400"
                    />
                  </>
                ) : (
                  <div 
                    className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold border-4"
                    style={{ 
                      background: 'var(--accent-gold)', 
                      color: 'var(--primary-red)',
                      borderColor: 'var(--accent-gold)'
                    }}
                  >
                    {user.first_name ? user.first_name[0].toUpperCase() : user.email[0].toUpperCase()}
                  </div>
                )}
              </div>
              
              <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-white)' }}>
                {user.first_name || user.last_name 
                  ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                  : user.email.split('@')[0]
                }
              </h2>
              
              <p className="text-lg" style={{ color: 'var(--text-light-gray)' }}>
                {user.email}
              </p>
              
              {user.is_admin && (
                <div className="mt-4">
                  <span 
                    className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
                    style={{ 
                      background: 'var(--accent-gold)', 
                      color: 'var(--primary-red)' 
                    }}
                  >
                    Administrator
                  </span>
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
              <div className="flex rounded-xl overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-6 py-3 font-medium transition-all duration-300 ${
                    activeTab === 'profile' 
                      ? 'bg-yellow-400 text-red-600' 
                      : 'text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  Profile Info
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`px-6 py-3 font-medium transition-all duration-300 ${
                    activeTab === 'security' 
                      ? 'bg-yellow-400 text-red-600' 
                      : 'text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  Security
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'profile' && (
              <div className="glass-card">
                <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--accent-gold)' }}>
                  Profile Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-white)' }}>
                      First Name
                    </label>
                    <input
                      type="text"
                      value={user.first_name || ''}
                      className="form-input"
                      placeholder="Your first name"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-white)' }}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={user.last_name || ''}
                      className="form-input"
                      placeholder="Your last name"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-white)' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      className="form-input"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-white)' }}>
                      Age
                    </label>
                    <input
                      type="number"
                      value={user.age || ''}
                      className="form-input"
                      placeholder="Your age"
                      readOnly
                    />
                  </div>
                </div>

                <div className="mt-8 p-6 rounded-xl" style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderLeft: '4px solid var(--accent-gold)'
                }}>
                  <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--accent-gold)' }}>
                    Account Statistics
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold" style={{ color: 'var(--text-white)' }}>
                        {user.calculations_count || 0}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-light-gray)' }}>
                        Calculations
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold" style={{ color: 'var(--text-white)' }}>
                        {user.email_verified ? '✓' : '✗'}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-light-gray)' }}>
                        Email Verified
                      </p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold" style={{ color: 'var(--text-white)' }}>
                        {user.profile_picture ? 'Google' : 'Email'}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-light-gray)' }}>
                        Login Method
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm" style={{ color: 'var(--text-light-gray)' }}>
                    Profile editing is currently read-only. Contact support to update your information.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="glass-card">
                <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--accent-gold)' }}>
                  Security Settings
                </h3>
                
                <div className="space-y-6">
                  <div className="p-6 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                    <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-white)' }}>
                      Account Security
                    </h4>
                    <p className="mb-4" style={{ color: 'var(--text-light-gray)' }}>
                      Your account is secured with {user.profile_picture ? 'Google OAuth' : 'email and password'}.
                    </p>
                    {user.profile_picture && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        <span style={{ color: 'var(--text-light-gray)' }}>
                          Protected by Google&apos;s security systems
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                    <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-white)' }}>
                      Quick Actions
                    </h4>
                    <div className="flex flex-wrap gap-4">
                      <Link 
                        href="/calculator/history" 
                        className="cta-button secondary"
                      >
                        View Calculation History
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="py-2 px-4 rounded-xl font-medium transition-all duration-300"
                        style={{
                          background: 'rgba(255, 75, 75, 0.2)',
                          border: '2px solid rgba(255, 75, 75, 0.5)',
                          color: '#ff6b6b'
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
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
