// src/app/fleet/page.tsx - Fleet Portal Landing Page with Theme Integration
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import AnimatedBackground from '@/app/fleet/components/AnimatedBackground';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function FleetPortalPage() {
  const { theme } = useTheme();
  const router = useRouter();

  // Theme and Style Definitions
  const lightTheme = { 
    mainBg: '#fffbeb', 
    bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)', 
    glassPanelBg: 'rgba(255, 255, 255, 0.92)', 
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', 
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)', 
    textPrimary: '#1f2937', 
    textSecondary: '#4B5563', 
    textMuted: '#6B7280'
  };
  
  const darkTheme = { 
    mainBg: '#0f172a', 
    bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)', 
    glassPanelBg: 'rgba(30, 41, 59, 0.8)', 
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', 
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)', 
    textPrimary: '#f9fafb', 
    textSecondary: '#9ca3af', 
    textMuted: '#9ca3af'
  };
  
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    // Add a slight delay for better UX
    const timer = setTimeout(() => {
      router.push('/fleet/dashboard');
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: currentThemeStyles.bgGradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background */}
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: theme === 'dark' 
          ? 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)'
          : 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.1) 1px, transparent 0)',
        backgroundSize: '40px 40px',
        opacity: 0.3,
        zIndex: 1
      }} />

      <div style={{
        backgroundColor: currentThemeStyles.glassPanelBg,
        padding: '3rem',
        borderRadius: '1.5rem',
        boxShadow: currentThemeStyles.glassPanelShadow,
        backdropFilter: 'blur(20px)',
        border: currentThemeStyles.glassPanelBorder,
        textAlign: 'center',
        maxWidth: '500px',
        margin: '0 1rem',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '1rem', 
            marginBottom: '1.5rem' 
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#F59E0B',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.4)'
            }}>
              <ShieldCheckIcon width={32} height={32} color="white" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: currentThemeStyles.textPrimary,
                margin: 0,
                textShadow: theme === 'dark' ? '0 2px 4px rgba(0,0,0,0.5)' : '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                <span style={{ fontSize: '2.5rem', marginRight: '0.5rem' }}>ශ්‍රී</span>Express
              </h1>
              <p style={{
                color: '#F59E0B',
                fontSize: '1.125rem',
                fontWeight: '600',
                margin: 0
              }}>
                Fleet Management Portal
              </p>
            </div>
          </div>
          
          <p style={{
            color: currentThemeStyles.textSecondary,
            fontSize: '1.125rem',
            margin: '0 0 2rem 0',
            lineHeight: '1.6'
          }}>
            Redirecting to Fleet Management Dashboard...
          </p>
        </div>

        {/* Loading Animation */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: `4px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
            borderTop: '4px solid #F59E0B',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
        
        {/* Progress Indicators */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '2rem'
        }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#F59E0B',
                animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`,
                opacity: 0.3
              }}
            />
          ))}
        </div>
        
        <div style={{
          color: currentThemeStyles.textMuted,
          fontSize: '0.875rem',
          borderTop: currentThemeStyles.glassPanelBorder,
          paddingTop: '1.5rem'
        }}>
          <p style={{ margin: 0 }}>
            If you're not redirected automatically,{' '}
            <a 
              href="/fleet/dashboard" 
              style={{
                color: '#F59E0B',
                textDecoration: 'none',
                fontWeight: '600',
                borderBottom: '1px solid transparent',
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderBottomColor = '#F59E0B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderBottomColor = 'transparent';
              }}
            >
              click here
            </a>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}