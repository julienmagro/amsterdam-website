'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function Navigation() {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50" style={{ 
      background: 'rgba(217, 4, 41, 0.95)', 
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <nav className="py-4">
        <div className="nav-container">
          <Link href="/" className="nav-logo">
            <Image 
              src="/amsterdam-flag.svg" 
              alt="Amsterdam flag" 
              width={32} 
              height={24}
              className="flag-icon"
            />
            <span className="nav-title">Amsterdam</span>
          </Link>

          <ul className="nav-links">
            <li><Link href="/" className="nav-link">Home</Link></li>
            <li><Link href="/history" className="nav-link">History Fun Facts</Link></li>
            <li><Link href="/water" className="nav-link">Water Life</Link></li>
            <li><Link href="/calculator" className="nav-link">Calculator</Link></li>
          </ul>

          {/* User menu */}
          <div className="ml-auto">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 py-2 px-4 rounded-xl transition-all duration-300 font-medium text-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(5px)'
                  }}
                >
                  <span className="text-lg">👤</span>
                  <span className="max-w-32 overflow-hidden text-ellipsis whitespace-nowrap">
                    {user.email}
                  </span>
                  <span className={`text-xs transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                {isDropdownOpen && (
                  <div 
                    className="absolute top-full right-0 mt-1 rounded-xl min-w-48 shadow-lg opacity-100 visible transform translate-y-0 transition-all duration-200 z-50"
                    style={{
                      background: 'rgba(20, 20, 20, 0.95)',
                      backdropFilter: 'blur(15px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <Link 
                      href="/profile" 
                      className="block py-4 px-4 text-white text-sm transition-all duration-300 hover:bg-white/10 hover:text-yellow-400"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link 
                      href="/calculator/history" 
                      className="block py-4 px-4 text-white text-sm transition-all duration-300 hover:bg-white/10 hover:text-yellow-400"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Calculation History
                    </Link>
                    {user.is_admin && (
                      <Link 
                        href="/admin" 
                        className="block py-4 px-4 text-white text-sm transition-all duration-300 hover:bg-white/10 hover:text-yellow-400"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <div className="h-px bg-white/20 my-1"></div>
                    <button
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                      className="block w-full text-left py-4 px-4 text-white text-sm transition-all duration-300 hover:bg-red-500/20 hover:text-red-400"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <Link 
                  href="/login" 
                  className="py-2 px-4 rounded-xl text-white text-sm font-medium transition-all duration-300"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="py-2 px-4 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-yellow-500 hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    color: 'var(--primary-red)',
                    background: 'var(--accent-gold)',
                    border: '2px solid var(--accent-gold)'
                  }}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
