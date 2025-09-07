// src/app/route-admin/login/page.tsx - Route Admin Login
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  UserIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '@/app/context/ThemeContext';
import AnimatedBackground from '@/app/components/AnimatedBackground2'; // Import the AnimatedBackground component

// A simple ThemeSwitcher component, now themed for the route admin page
const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 100,
        background: theme === 'dark' ? 'rgba(75, 85, 99, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        color: theme === 'dark' ? '#A855F7' : '#7C3AED',
        border: `1px solid ${theme === 'dark' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(209, 213, 219, 0.5)'}`,
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
      }}
    >
      {theme === 'dark' ? (
        <SunIcon width={24} height={24} />
      ) : (
        <MoonIcon width={24} height={24} />
      )}
    </button>
  );
};

export default function RouteAdminLogin() {
  const router = useRouter();
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    mfaCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const apiURL = `${baseURL}/api/auth/login`;
      
      const response = await fetch(apiURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.requiresMfa && !mfaRequired) {
          setMfaRequired(true);
          setError('MFA Required. Please enter your code.');
          return;
        }
        throw new Error(data.message || 'Login failed. Check credentials or MFA code.');
      }

      if (data.user?.role !== 'route_admin' && data.user?.role !== 'system_admin') {
        throw new Error('Access Denied. Route Administrator privileges required.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/route-admin/dashboard');

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Route Admin Theme Styles (Purple Palette) ---
  const routeAdminLightTheme = {
    mainBg: '#f1f5f9',
    bgGradient: 'linear-gradient(to bottom right, #f1f5f9, #e2e8f0, #cbd5e1)',
    glassPanelBg: 'rgba(255, 255, 255, 0.92)',
    glassPanelBorder: '1px solid rgba(168, 85, 247, 0.3)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)',
    textPrimary: '#1e293b',
    textSecondary: '#475569',
    brandText: '#ffffff',
    brandTextShadow: '0 4px 8px rgba(0, 0, 0, 0.7)',
    inputBg: 'rgba(255, 255, 255, 0.9)',
    inputBorder: '2px solid rgba(203, 213, 225, 0.8)',
    inputFocusBorder: '#8B5CF6',
    inputFocusShadow: '0 0 0 3px rgba(139, 92, 246, 0.2)',
    buttonBg: '#8B5CF6',
    buttonHoverBg: '#7C3AED',
    buttonHoverShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
    passwordToggleHoverColor: '#8B5CF6',
  };

  const routeAdminDarkTheme = {
    mainBg: '#0f172a',
    bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)',
    glassPanelBg: 'rgba(30, 41, 59, 0.8)',
    glassPanelBorder: '1px solid rgba(168, 85, 247, 0.4)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    brandText: '#ffffff',
    brandTextShadow: '0 4px 8px rgba(0, 0, 0, 0.7)',
    inputBg: 'rgba(51, 65, 85, 0.8)',
    inputBorder: '2px solid rgba(71, 85, 105, 0.8)',
    inputFocusBorder: '#A855F7',
    inputFocusShadow: '0 0 0 3px rgba(168, 85, 247, 0.3)',
    buttonBg: '#8B5CF6',
    buttonHoverBg: '#7C3AED',
    buttonHoverShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
    passwordToggleHoverColor: '#A855F7',
  };

  const currentThemeStyles = theme === 'dark' ? routeAdminDarkTheme : routeAdminLightTheme;

  const dynamicPseudoStyles = `
    .button-hover:hover {
      animation: button-pulse 1s infinite;
      background-color: ${currentThemeStyles.buttonHoverBg} !important;
      box-shadow: ${currentThemeStyles.buttonHoverShadow} !important;
    }
    .input-focus:focus {
      border-color: ${currentThemeStyles.inputFocusBorder} !important;
      box-shadow: ${currentThemeStyles.inputFocusShadow} !important;
      outline: none;
    }
    .password-toggle:hover {
      color: ${currentThemeStyles.passwordToggleHoverColor} !important;
    }
    @keyframes button-pulse { 0% { transform: scale(1); } 50% { transform: scale(1.03); } 100% { transform: scale(1); } }
    @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
    * { box-sizing: border-box; }
    @media (max-width: 380px) { .form-container { padding: 0.75rem; } .form-card { padding: 1rem; } .input-field { font-size: 0.85rem; } }
  `;

  return (
    <div
      style={{
        backgroundColor: currentThemeStyles.mainBg,
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <style jsx>{dynamicPseudoStyles}</style>
      <ThemeSwitcher />
      
      {/* Use the AnimatedBackground component */}
      <AnimatedBackground theme={theme} />

      {/* Login Form Container */}
      <div style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(1rem, 5vw, 1.5rem)',
        position: 'relative',
        zIndex: 10
      }}>
        <div className="animate-fade-in-up form-container" style={{
          width: '100%',
          maxWidth: 'min(90%, 420px)',
          margin: '0 auto',
        }}>
          
          <div className="form-card" style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            padding: 'clamp(1.5rem, 5vw, 2.5rem)',
            borderRadius: 'clamp(0.75rem, 3vw, 1rem)',
            boxShadow: currentThemeStyles.glassPanelShadow,
            backdropFilter: 'blur(12px)',
            border: currentThemeStyles.glassPanelBorder,
            width: '100%'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                backgroundColor: currentThemeStyles.buttonBg,
                padding: '1rem',
                borderRadius: '50%',
                display: 'inline-block',
                marginBottom: '1rem',
                boxShadow: `0 4px 12px ${theme === 'dark' ? 'rgba(139, 92, 246, 0.4)' : 'rgba(139, 92, 246, 0.3)'}`
              }}>
                <MapIcon width={32} height={32} color="white" />
              </div>
              <h1 style={{
                fontSize: 'clamp(1.5rem, 5vw, 1.8rem)',
                fontWeight: 'bold',
                color: currentThemeStyles.textPrimary,
                marginBottom: '0.5rem'
              }}>
                Route Administrator
              </h1>
              <p style={{ color: currentThemeStyles.textSecondary, fontSize: '0.9rem' }}>
                Secure access to route management
              </p>
            </div>

            {error && (
              <div style={{ padding: '1rem', backgroundColor: 'rgba(153, 27, 29, 0.8)', color: '#fecaca', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid rgba(220, 38, 38, 0.4)', fontSize: '0.95rem' }}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="email" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: currentThemeStyles.textPrimary, marginBottom: '0.5rem' }}>Administrator Email</label>
                <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="routeadmin@sriexpress.com" className="input-focus input-field"
                  style={{
                    width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem',
                    border: currentThemeStyles.inputBorder, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary,
                    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.05)', fontSize: '0.95rem', transition: 'all 0.2s ease', height: '3rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="password" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: currentThemeStyles.textPrimary, marginBottom: '0.5rem' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input id="password" name="password" type={showPassword ? "text" : "password"} required value={formData.password} onChange={handleChange} placeholder="••••••••••••" className="input-focus input-field"
                    style={{
                      width: '100%', padding: '0.75rem 2.75rem 0.75rem 1rem', borderRadius: '0.75rem',
                      border: currentThemeStyles.inputBorder, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary,
                      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.05)', fontSize: '0.95rem', transition: 'all 0.2s ease', height: '3rem'
                    }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', transition: 'color 0.2s ease', padding: 0 }}>
                    {showPassword ? <EyeSlashIcon width={20} height={20} /> : <EyeIcon width={20} height={20} />}
                  </button>
                </div>
              </div>

              {mfaRequired && (
                <div style={{ marginBottom: '1.5rem', animation: 'fade-in-down 0.5s ease-out' }}>
                  <label htmlFor="mfaCode" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: currentThemeStyles.textPrimary, marginBottom: '0.5rem' }}>MFA Code</label>
                  <input id="mfaCode" name="mfaCode" type="text" required={mfaRequired} value={formData.mfaCode} onChange={handleChange} placeholder="123456" className="input-focus input-field"
                    style={{
                      width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem',
                      border: currentThemeStyles.inputBorder, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary,
                      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.05)', fontSize: '1.2rem', transition: 'all 0.2s ease', height: '3rem',
                      textAlign: 'center', letterSpacing: '0.3em'
                    }}
                  />
                </div>
              )}

              <button type="submit" disabled={loading} className="button-hover" style={{
                  width: '100%', backgroundColor: currentThemeStyles.buttonBg, color: 'white', fontWeight: 700, padding: '0.875rem', borderRadius: '0.75rem', border: 'none',
                  boxShadow: `0 4px 6px ${theme === 'dark' ? 'rgba(139, 92, 246, 0.5)' : 'rgba(139, 92, 246, 0.4)'}`, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1, transition: 'all 0.3s',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.1rem', minHeight: '3rem'
                }}>
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Authenticating...
                  </>
                ) : (
                  'Access Routes'
                )}
              </button>
            </form>
            
            <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem', color: currentThemeStyles.textSecondary, opacity: 0.7 }}>
              <p>Route management access • Route administrators only</p>
              <p style={{ marginTop: '0.5rem' }}>All actions are logged and monitored</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}