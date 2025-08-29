'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthToken } from '@/lib/api';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Function to check for token and redirect
    const handleAuthCallback = async () => {
      // Wait a moment for any cookies to be set
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if we now have a token
      const token = getAuthToken();
      
      if (token) {
        // Force a page reload to trigger AuthContext re-check
        window.location.href = '/calculator';
      } else {
        // No token found, redirect to login with error
        router.push('/login?error=oauth_failed');
      }
    };

    handleAuthCallback();
  }, [router]);

  // Show loading while processing
  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #D90429 0%, #B8001F 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white'
    }}>
      <div style={{
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '2rem',
        borderRadius: '1rem',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{ marginBottom: '1rem' }}>Processing Login...</h1>
        <p>Please wait while we complete your login.</p>
        
        {/* Loading spinner */}
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid #FFD700',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '2rem auto'
        }}></div>
        
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
