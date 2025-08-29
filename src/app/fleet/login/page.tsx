// src/app/fleet/login/page.tsx - Clean Fleet Login Page
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EnvelopeIcon, KeyIcon, EyeIcon, EyeSlashIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/app/context/ThemeContext';
import AnimatedBackground from '@/app/components/AnimatedBackground2';

// A simple ThemeSwitcher component
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

export default function FleetLoginPage() {
  const router = useRouter();
  const { theme } = useTheme();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Store authentication data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Check if user has fleet management permissions
        const allowedRoles = ['fleet_manager', 'company_admin', 'system_admin'];
        if (!allowedRoles.includes(data.user.role)) {
          setError('Access denied. Fleet management permissions required.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return;
        }
        
        // Redirect to fleet dashboard
        router.push('/fleet/dashboard');
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Connection error. Please check your network connection and try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setError('');
    setFormData({ email: '', password: '' });
  };

  // --- Theme Styles ---
  const lightTheme = {
    mainBg: '#fffbeb',
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
    buttonBg: '#F59E0B',
    buttonHoverBg: '#E9A200',
    buttonHoverShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
    buttonDisabledBg: '#6b7280',
    linkColor: '#3b82f6',
    linkHoverColor: '#2563eb',
    helpBg: 'rgba(255, 255, 255, 0.7)',
    helpBorder: '1px solid rgba(209, 213, 219, 0.5)',
    clearButtonBg: 'transparent',
    clearButtonBorder: '1px solid rgba(209, 213, 219, 0.5)',
    clearButtonHoverBg: 'rgba(209, 213, 219, 0.1)',
    // FIXED: Added missing properties
    registerBg: 'rgba(255, 255, 255, 0.7)',
    registerText: '#1F2937',
  };

  const darkTheme = {
    mainBg: '#0f172a',
    glassPanelBg: 'rgba(30, 41, 59, 0.8)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    textOnDarkBg: '#f1f5f9',
    brandText: '#ffffff',
    brandTextShadow: '0 4px 8px rgba(0, 0, 0, 0.7)',
    inputBg: 'rgba(51, 65, 85, 0.8)',
    inputBorder: '2px solid rgba(75, 85, 99, 0.8)',
    inputFocusBorder: '#F59E0B',
    inputFocusShadow: '0 0 0 3px rgba(245, 158, 11, 0.3)',
    buttonBg: '#F59E0B',
    buttonHoverBg: '#E9A200',
    buttonHoverShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
    buttonDisabledBg: '#6b7280',
    linkColor: '#3b82f6',
    linkHoverColor: '#60a5fa',
    helpBg: 'rgba(51, 65, 85, 0.8)',
    helpBorder: '1px solid rgba(75, 85, 99, 0.8)',
    clearButtonBg: 'transparent',
    clearButtonBorder: '1px solid rgba(75, 85, 99, 0.8)',
    clearButtonHoverBg: 'rgba(75, 85, 99, 0.3)',
    // FIXED: Added missing properties
    registerBg: 'rgba(30, 41, 59, 0.6)',
    registerText: '#f1f5f9',
  };

  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  // Dynamic styles for pseudo-classes (:hover, :focus) that depend on the theme
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
    .link-hover:hover {
      color: ${currentThemeStyles.linkHoverColor} !important;
    }
    .clear-button:hover {
      background-color: ${currentThemeStyles.clearButtonHoverBg} !important;
    }
    @keyframes button-pulse { 0% { transform: scale(1); } 50% { transform: scale(1.03); } 100% { transform: scale(1); } }
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
    * { box-sizing: border-box; }
  `;

  return (
    <div style={{ 
      backgroundColor: currentThemeStyles.mainBg,
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>{dynamicPseudoStyles}</style>
      <ThemeSwitcher />
      
      {/* Use the AnimatedBackground component */}
      <AnimatedBackground theme={theme} />

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
        <div className="animate-fade-in-up" style={{
          width: '100%',
          maxWidth: 'min(90%, 400px)',
          margin: '0 auto',
        }}>
          {/* Logo and Brand - Outside the card */}
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
            }}>Fleet Manager Login</p>
          </div>

          {/* Login Form Card */}
          <div style={{ 
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
            {/* Fleet-specific header inside card */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <p style={{ 
                color: currentThemeStyles.textSecondary,
                fontSize: '0.875rem',
                margin: 0
              }}>
                Access your fleet management dashboard
              </p>
            </div>

          {/* Error Message */}
          {error && (
            <div style={{ 
              backgroundColor: 'rgba(127, 29, 29, 0.8)',
              border: '1px solid #991b1b',
              color: '#fecaca',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block',
                color: currentThemeStyles.textPrimary,
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email"
                  className="input-focus"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    paddingLeft: '2.5rem',
                    backgroundColor: currentThemeStyles.inputBg,
                    border: currentThemeStyles.inputBorder,
                    borderRadius: '0.5rem',
                    color: currentThemeStyles.textPrimary,
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease'
                  }}
                />
                <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#F59E0B' }}>
                  <EnvelopeIcon width={18} height={18} />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block',
                color: currentThemeStyles.textPrimary,
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your password"
                  className="input-focus"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    paddingLeft: '2.5rem',
                    paddingRight: '2.5rem',
                    backgroundColor: currentThemeStyles.inputBg,
                    border: currentThemeStyles.inputBorder,
                    borderRadius: '0.5rem',
                    color: currentThemeStyles.textPrimary,
                    fontSize: '0.875rem',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease'
                  }}
                />
                <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#F59E0B' }}>
                  <KeyIcon width={18} height={18} />
                </div>
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  style={{ 
                    position: 'absolute', 
                    right: '0.75rem', 
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
                  {showPassword ? <EyeSlashIcon width={18} height={18} /> : <EyeIcon width={18} height={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.email || !formData.password}
              className="button-hover"
              style={{
                width: '100%',
                backgroundColor: loading || !formData.email || !formData.password ? currentThemeStyles.buttonDisabledBg : currentThemeStyles.buttonBg,
                color: 'white',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: loading || !formData.email || !formData.password ? 'not-allowed' : 'pointer',
                marginBottom: '1rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px rgba(245, 158, 11, 0.3)'
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Clear Storage Button */}
            <button
              onClick={clearStorage}
              type="button"
              className="clear-button"
              style={{
                width: '100%',
                backgroundColor: currentThemeStyles.clearButtonBg,
                color: currentThemeStyles.textSecondary,
                border: currentThemeStyles.clearButtonBorder,
                padding: '0.5rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                cursor: 'pointer',
                marginBottom: '1rem',
                transition: 'all 0.2s ease'
              }}
            >
              Clear Stored Data
            </button>
          </form>

          {/* Registration text */}
          <div style={{ textAlign: 'center', marginTop: '1.75rem', backgroundColor: currentThemeStyles.registerBg || 'rgba(0, 0, 0, 0.5)', padding: '1rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
            <p style={{ color: currentThemeStyles.registerText || currentThemeStyles.textPrimary, fontSize: '0.95rem' }}>
              Need system admin access?{" "}
              <button
                onClick={() => router.push('/sysadmin/login')}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: currentThemeStyles.linkColor, 
                  textDecoration: 'underline', 
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '600'
                }}
              >
                Admin Login
              </button>
            </p>
          </div>
        </div>

      

          {/* Help Text */}
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: currentThemeStyles.helpBg,
            borderRadius: '0.5rem',
            border: currentThemeStyles.helpBorder,
            backdropFilter: 'blur(8px)'
          }}>
            <h4 style={{ 
              color: currentThemeStyles.textPrimary,
              fontSize: '0.875rem',
              margin: '0 0 0.5rem 0'
            }}>
              Need Help?
            </h4>
            <p style={{ 
              color: currentThemeStyles.textSecondary,
              fontSize: '0.75rem',
              margin: 0,
              lineHeight: '1.4'
            }}>
              Contact your system administrator if you don't have fleet management credentials or need access to the platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

