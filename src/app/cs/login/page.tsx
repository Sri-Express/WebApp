// app/cs/login/page.tsx - CLEANED VERSION
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EnvelopeIcon, KeyIcon, EyeIcon, EyeSlashIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/app/context/ThemeContext';
import AnimatedBackground from '@/app/components/AnimatedBackground2';

// Simple ThemeSwitcher component
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
        color: theme === 'dark' ? '#FBBF24' : '#1F2937',
        border: `1px solid ${theme === 'dark' ? 'rgba(251, 191, 36, 0.3)' : 'rgba(209, 213, 219, 0.5)'}`,
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

export default function CSLoginPage() {
  const router = useRouter();
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      
      if (!apiUrl) {
        throw new Error('API URL is not configured. Please check environment variables.');
      }
      
      console.log('Attempting login with:', { 
        email: formData.email, 
        apiUrl: apiUrl,
        fullUrl: `${apiUrl}/api/auth/login`
      });
      
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error(`Server returned invalid response (${response.status}). Please check if the backend server is running.`);
      }
      
      console.log('Response data:', data);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Login endpoint not found. Please check if the backend server is running on the correct port.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later or contact support.');
        } else {
          throw new Error(data.message || `HTTP ${response.status}: Login failed. Please check your credentials.`);
        }
      }

      // Check if user exists and has correct role
      if (!data.user) {
        throw new Error('Invalid response: User data not found');
      }

      const userRole = data.user.role;
      console.log('User role:', userRole);
      
      if (userRole === 'customer_service' || userRole === 'system_admin') {
        // Store authentication data
        localStorage.setItem('cs_token', data.token);
        localStorage.setItem('cs_user', JSON.stringify(data.user));
        
        console.log('Login successful, redirecting to dashboard...');
        
        // Redirect to dashboard
        router.push('/cs/dashboard');
      } else {
        throw new Error(`Access Denied. Role "${userRole}" does not have permission to access this portal. Required roles: customer_service, system_admin`);
      }

    } catch (err: unknown) {
      console.error('Login error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Theme styles
  const lightTheme = {
    mainBg: '#fffbeb',
    bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)',
    glassPanelBg: 'rgba(255, 255, 255, 0.92)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)',
    textPrimary: '#1F2937',
    textSecondary: '#4B5563',
    textOnDarkBg: '#1F2937',
    brandText: '#ffffff',
    brandTextShadow: '0 4px 8px rgba(0, 0, 0, 0.7)',
    inputBg: 'rgba(255, 255, 255, 0.9)',
    inputBorder: '2px solid rgba(209, 213, 219, 0.8)',
    inputFocusBorder: '#F59E0B',
    inputFocusShadow: '0 0 0 3px rgba(245, 158, 11, 0.2)',
    buttonHoverBg: '#E9A200',
    buttonHoverShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
    passwordToggleHoverColor: '#F59E0B',
    linkColor: '#D97706',
    linkHoverColor: '#B45309',
  };

  const darkTheme = {
    mainBg: '#0f172a',
    bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)',
    glassPanelBg: 'rgba(30, 41, 59, 0.8)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)',
    textPrimary: '#f9fafb',
    textSecondary: '#9ca3af',
    textOnDarkBg: '#f9fafb',
    brandText: '#ffffff',
    brandTextShadow: '0 4px 8px rgba(0, 0, 0, 0.7)',
    inputBg: 'rgba(51, 65, 85, 0.8)',
    inputBorder: '2px solid rgba(75, 85, 99, 0.8)',
    inputFocusBorder: '#F59E0B',
    inputFocusShadow: '0 0 0 3px rgba(245, 158, 11, 0.3)',
    buttonHoverBg: '#E9A200',
    buttonHoverShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
    passwordToggleHoverColor: '#F59E0B',
    linkColor: '#fcd34d',
    linkHoverColor: '#FBBF24',
  };

  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  // Dynamic styles for pseudo-classes
  const dynamicPseudoStyles = `
    .button-hover:hover {
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
    .link-hover:hover {
      color: ${currentThemeStyles.linkHoverColor} !important;
      border-bottom: 1px solid ${currentThemeStyles.linkHoverColor} !important;
    }
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .animate-spin { animation: spin 1s linear infinite; }
    * { box-sizing: border-box; }
    @media (max-width: 380px) {
      .form-container { padding: 0.75rem; }
      .form-card { padding: 1rem; }
      .input-field { font-size: 0.85rem; }
      .remember-forgot { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
    }
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
      
      {/* Use the AnimatedBackground component instead of hardcoded background */}
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
          maxWidth: 'min(90%, 400px)',
          margin: '0 auto',
        }}>
          {/* Logo and Brand */}
          <div style={{ textAlign: 'center', marginBottom: '2rem', marginTop: '-1.1rem' }}>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 8vw, 3.5rem)',
              fontWeight: 'bold',
              color: currentThemeStyles.brandText,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textShadow: currentThemeStyles.brandTextShadow,
            }}>
              <span style={{ fontSize: 'clamp(3.5rem, 12vw, 5rem)', marginRight: '0.5rem', textShadow: '0 4px 8px rgba(0, 0, 0, 0.7), 0 0 30px rgba(250, 204, 21, 0.4)' }}>ශ්‍රී</span> 
              E<span style={{ color: '#DC2626' }}>x</span>press
            </h1>
            <p style={{
              marginTop: '0.5rem',
              color: currentThemeStyles.textOnDarkBg,
              fontSize: 'clamp(1rem, 4vw, 1.35rem)',
              fontWeight: '600',
              backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.6)',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
              display: 'inline-block'
            }}>Customer Service & Admin Portal</p>
          </div>
          
          {/* Login Form Card */}
          <div className="form-card" style={{
            backgroundColor: currentThemeStyles.glassPanelBg,
            padding: 'clamp(1.25rem, 4vw, 2rem)',
            borderRadius: 'clamp(0.75rem, 3vw, 1rem)',
            boxShadow: currentThemeStyles.glassPanelShadow,
            backdropFilter: 'blur(12px)',
            border: currentThemeStyles.glassPanelBorder,
            transform: 'translateY(0)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            width: '100%'
          }}>
            {error && (
              <div style={{ 
                padding: '1rem', 
                backgroundColor: 'rgba(254, 202, 202, 0.8)', 
                color: '#DC2626', 
                borderRadius: '0.75rem', 
                marginBottom: '1.75rem', 
                border: '1px solid rgba(220, 38, 38, 0.4)', 
                fontSize: '0.95rem',
                wordWrap: 'break-word'
              }}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* Email field */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label htmlFor="email" style={{ display: 'block', fontSize: '1rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '0.625rem' }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    id="email" 
                    name="email" 
                    type="email" 
                    required 
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder="your@email.com" 
                    className="input-focus input-field"
                    style={{
                      width: '100%', 
                      padding: 'clamp(0.6rem, 2vw, 0.75rem)', 
                      paddingLeft: 'clamp(2.25rem, 6vw, 2.75rem)', 
                      borderRadius: 'clamp(0.5rem, 2vw, 0.75rem)',
                      border: currentThemeStyles.inputBorder, 
                      backgroundColor: currentThemeStyles.inputBg, 
                      color: currentThemeStyles.textPrimary,
                      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.05)', 
                      fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', 
                      transition: 'all 0.2s ease', 
                      height: 'clamp(2.75rem, 8vw, 3rem)'
                    }}
                  />
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#F59E0B' }}>
                    <EnvelopeIcon width={20} height={20} />
                  </div>
                </div>
              </div>

              {/* Password field */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label htmlFor="password" style={{ display: 'block', fontSize: '1rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '0.625rem' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    id="password" 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    required 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="••••••••" 
                    className="input-focus input-field"
                    style={{
                      width: '100%', 
                      padding: 'clamp(0.6rem, 2vw, 0.75rem)', 
                      paddingLeft: 'clamp(2.25rem, 6vw, 2.75rem)', 
                      paddingRight: 'clamp(2.25rem, 6vw, 2.75rem)', 
                      borderRadius: 'clamp(0.5rem, 2vw, 0.75rem)',
                      border: currentThemeStyles.inputBorder, 
                      backgroundColor: currentThemeStyles.inputBg, 
                      color: currentThemeStyles.textPrimary,
                      boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.05)', 
                      fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', 
                      transition: 'all 0.2s ease', 
                      height: 'clamp(2.75rem, 8vw, 3rem)'
                    }}
                  />
                  <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#F59E0B' }}>
                    <KeyIcon width={20} height={20} />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="password-toggle" 
                    style={{ 
                      position: 'absolute', 
                      right: '1rem', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      background: 'none', 
                      border: 'none', 
                      color: '#9CA3AF', 
                      cursor: 'pointer', 
                      transition: 'color 0.2s ease', 
                      padding: 0 
                    }}
                  >
                    {showPassword ? <EyeSlashIcon width={20} height={20} /> : <EyeIcon width={20} height={20} />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot password */}
              <div className="remember-forgot" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input 
                    id="remember-me" 
                    name="remember-me" 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={() => setRememberMe(!rememberMe)} 
                    style={{ marginRight: '0.5rem', width: '1.125rem', height: '1.125rem', accentColor: '#F59E0B', cursor: 'pointer' }} 
                  />
                  <label htmlFor="remember-me" style={{ fontSize: '0.95rem', color: currentThemeStyles.textSecondary, cursor: 'pointer' }}>
                    Remember me
                  </label>
                </div>
                <div>
                  <Link href="/forgot-password" className="link-hover" style={{ fontSize: '0.95rem', color: currentThemeStyles.linkColor, textDecoration: 'none', fontWeight: '600', transition: 'all 0.2s ease', borderBottom: '1px solid transparent', paddingBottom: '2px' }}>
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Submit button */}
              <button 
                type="submit" 
                disabled={loading} 
                className="button-hover" 
                style={{
                  width: '100%', 
                  backgroundColor: '#F59E0B', 
                  color: 'white', 
                  fontWeight: '700', 
                  padding: 'clamp(0.75rem, 2.5vw, 0.875rem)', 
                  borderRadius: 'clamp(0.5rem, 2vw, 0.75rem)', 
                  border: 'none',
                  boxShadow: '0 4px 6px rgba(245, 158, 11, 0.5), 0 2px 4px rgba(0, 0, 0, 0.1)', 
                  cursor: loading ? 'not-allowed' : 'pointer', 
                  opacity: loading ? 0.8 : 1, 
                  transition: 'all 0.3s',
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', 
                  position: 'relative', 
                  overflow: 'hidden', 
                  minHeight: 'clamp(2.75rem, 8vw, 3rem)'
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>Sign In</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}