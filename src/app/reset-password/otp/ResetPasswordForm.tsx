"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon, KeyIcon, EnvelopeIcon, SunIcon, MoonIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/app/context/ThemeContext'; // Make sure this path is correct

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

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  
  const emailFromQuery = searchParams ? searchParams.get('email') : '';
  const otpFromQuery = searchParams ? searchParams.get('otp') : '';

  const [email, setEmail] = useState(emailFromQuery || '');
  const [otp, setOtp] = useState(otpFromQuery || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !otp || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Something went wrong');
      
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // --- Theme Styles ---
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
    loginLinkColor: '#fcd34d',
    loginLinkHoverColor: '#FBBF24',
    loginBg: 'rgba(0, 0, 0, 0.5)',
    loginText: '#ffffff',
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
    loginLinkColor: '#fcd34d',
    loginLinkHoverColor: '#FBBF24',
    loginBg: 'rgba(0, 0, 0, 0.6)',
    loginText: '#ffffff',
  };

  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  // Animation keyframes that are theme-independent
  const animationStyles = `
    @keyframes road-marking { 0% { transform: translateX(-200%); } 100% { transform: translateX(500%); } }
    .animate-road-marking { animation: road-marking 10s linear infinite; }
    @keyframes car-right { 0% { transform: translateX(-100%); } 100% { transform: translateX(100vw); } }
    .animate-car-right { animation: car-right 15s linear infinite; }
    @keyframes car-left { 0% { transform: translateX(100vw) scaleX(-1); } 100% { transform: translateX(-100%) scaleX(-1); } }
    .animate-car-left { animation: car-left 16s linear infinite; }
    @keyframes light-blink { 0%, 100% { opacity: 1; box-shadow: 0 0 15px #fcd34d; } 50% { opacity: 0.6; box-shadow: 0 0 5px #fcd34d; } }
    .animate-light-blink { animation: light-blink 1s infinite; }
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
    @keyframes trainMove { from { left: 100%; } to { left: -300px; } }
    @keyframes slight-bounce { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-1px); } }
    .animate-slight-bounce { animation: slight-bounce 2s ease-in-out infinite; }
    @keyframes steam { 0% { opacity: 0.8; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-20px) scale(2.5); } }
    .animate-steam { animation: steam 2s ease-out infinite; }
    @keyframes wheels { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }
    .animate-wheels { animation: wheels 2s linear infinite; }
    .animation-delay-100 { animation-delay: 0.1s; } .animation-delay-200 { animation-delay: 0.2s; } .animation-delay-300 { animation-delay: 0.3s; } .animation-delay-400 { animation-delay: 0.4s; } .animation-delay-500 { animation-delay: 0.5s; } .animation-delay-600 { animation-delay: 0.6s; } .animation-delay-700 { animation-delay: 0.7s; } .animation-delay-800 { animation-delay: 0.8s; } .animation-delay-1000 { animation-delay: 1s; } .animation-delay-1200 { animation-delay: 1.2s; } .animation-delay-1500 { animation-delay: 1.5s; } .animation-delay-2000 { animation-delay: 2s; } .animation-delay-2500 { animation-delay: 2.5s; } .animation-delay-3000 { animation-delay: 3s; }
    @keyframes button-pulse { 0% { transform: scale(1); } 50% { transform: scale(1.03); } 100% { transform: scale(1); } }
    * { box-sizing: border-box; }
    @media (max-width: 380px) { .form-container { padding: 0.75rem; } .form-card { padding: 1rem; } .input-field { font-size: 0.85rem; } }
  `;

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
    .password-toggle:hover {
      color: ${currentThemeStyles.passwordToggleHoverColor} !important;
    }
    .login-link:hover {
      color: ${currentThemeStyles.loginLinkHoverColor} !important;
      border-bottom: 1px solid ${currentThemeStyles.loginLinkHoverColor} !important;
    }
  `;

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <style jsx>{animationStyles}</style>
      <style jsx>{dynamicPseudoStyles}</style>
      <ThemeSwitcher />
      
      <div style={{ position: 'absolute', inset: 0, background: currentThemeStyles.bgGradient }}>
        {/* --- START OF ANIMATED SCENE (UNCHANGED) --- */}
        {/* This is where you would paste the entire animated background JSX from the login page. */}
        {/* It is omitted here for brevity but is required for the visual effect. */}
        <div style={{ position: 'absolute', top: '15%', left: 0, right: 0, height: '100px', backgroundColor: '#1f2937', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)', zIndex: 2 }}></div>
        <div style={{ position: 'absolute', top: '15%', left: 0, right: 0, height: '100px', zIndex: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div style={{ width: '100%', height: '5px', background: 'repeating-linear-gradient(to right, #fcd34d, #fcd34d 30px, transparent 30px, transparent 60px)', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}></div></div>
        <div style={{ position: 'absolute', top: '15%', left: 0, right: 0, height: '100px', overflow: 'hidden', zIndex: 3 }}><div style={{ position: 'absolute', top: '25%', left: 0, right: 0, height: '8px', display: 'flex', transform: 'translateY(-50%)' }}><div className="animate-road-marking" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '10%' }}></div><div className="animate-road-marking animation-delay-200" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '30%' }}></div><div className="animate-road-marking animation-delay-500" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '50%' }}></div><div className="animate-road-marking animation-delay-700" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '70%' }}></div></div><div style={{ position: 'absolute', top: '75%', left: 0, right: 0, height: '8px', display: 'flex', transform: 'translateY(-50%)' }}><div className="animate-road-marking animation-delay-300" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '20%' }}></div><div className="animate-road-marking animation-delay-400" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '40%' }}></div><div className="animate-road-marking animation-delay-600" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '60%' }}></div><div className="animate-road-marking animation-delay-800" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '80%' }}></div></div></div>
        <div style={{ position: 'absolute', top: '60%', left: 0, right: 0, height: '80px', backgroundColor: '#1f2937', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)', zIndex: 2 }}></div>
        <div style={{ position: 'absolute', top: '60%', left: 0, right: 0, height: '80px', zIndex: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div style={{ width: '100%', height: '4px', background: 'repeating-linear-gradient(to right, #fcd34d, #fcd34d 20px, transparent 20px, transparent 40px)', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}></div></div>
        <div style={{ position: 'absolute', top: '60%', left: 0, right: 0, height: '80px', overflow: 'hidden', zIndex: 3 }}><div style={{ position: 'absolute', top: '25%', left: 0, right: 0, height: '6px', display: 'flex', transform: 'translateY(-50%)' }}><div className="animate-road-marking animation-delay-300" style={{ position: 'absolute', width: '60px', backgroundColor: '#fbbf24', left: '15%' }}></div><div className="animate-road-marking animation-delay-500" style={{ position: 'absolute', width: '60px', backgroundColor: '#fbbf24', left: '45%' }}></div><div className="animate-road-marking animation-delay-700" style={{ position: 'absolute', width: '60px', backgroundColor: '#fbbf24', left: '75%' }}></div></div><div style={{ position: 'absolute', top: '75%', left: 0, right: 0, height: '6px', display: 'flex', transform: 'translateY(-50%)' }}><div className="animate-road-marking animation-delay-200" style={{ position: 'absolute', width: '60px', backgroundColor: '#fbbf24', left: '25%' }}></div><div className="animate-road-marking animation-delay-400" style={{ position: 'absolute', width: '60px', backgroundColor: '#fbbf24', left: '55%' }}></div><div className="animate-road-marking animation-delay-600" style={{ position: 'absolute', width: '60px', backgroundColor: '#fbbf24', left: '85%' }}></div></div></div>
        <div style={{ position: 'absolute', top: '85%', left: 0, right: 0, height: '50px', background: 'linear-gradient(to bottom, #4b5563 0%, #374151 100%)', boxShadow: '0 5px 10px -3px rgba(0, 0, 0, 0.3)', zIndex: 2 }}></div>
        <div style={{ position: 'absolute', top: '85%', left: 0, right: 0, height: '50px', overflow: 'visible', zIndex: 3 }}><div style={{ position: 'absolute', top: '35%', left: 0, right: 0, height: '6px', background: 'linear-gradient(to bottom, #94a3b8 0%, #64748b 100%)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)', zIndex: 4 }}></div><div style={{ position: 'absolute', top: '65%', left: 0, right: 0, height: '6px', background: 'linear-gradient(to bottom, #94a3b8 0%, #64748b 100%)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)', zIndex: 4 }}></div><div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', display: 'flex', gap: '15px', zIndex: 3 }}>{Array(30).fill(0).map((_, i) => (<div key={i} style={{ width: '20px', height: '100%', background: 'linear-gradient(to bottom, #92400e 0%, #7c2d12 70%, #713f12 100%)', marginLeft: `${i * 30}px`, boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.5)', border: '1px solid #78350f' }}></div>))}</div><div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', backgroundImage: 'radial-gradient(circle, #6b7280 2px, transparent 2px), radial-gradient(circle, #9ca3af 1px, transparent 1px)', backgroundSize: '8px 8px, 6px 6px', opacity: 0.5, zIndex: 2 }}></div></div>
        {/* --- END OF ANIMATED SCENE --- */}
      </div>

      <div style={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(1rem, 5vw, 1.5rem)', position: 'relative', zIndex: 10 }}>
        <div className="animate-fade-in-up form-container" style={{ width: '100%', maxWidth: 'min(90%, 420px)', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem', marginTop: '-1.1rem' }}>
            <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', fontWeight: 'bold', color: currentThemeStyles.brandText, display: 'flex', alignItems: 'center', justifyContent: 'center', textShadow: currentThemeStyles.brandTextShadow }}>
              <span style={{ fontSize: 'clamp(3.5rem, 12vw, 5rem)', marginRight: '0.5rem', textShadow: '0 4px 8px rgba(0, 0, 0, 0.7), 0 0 30px rgba(250, 204, 21, 0.4)' }}>ශ්‍රී</span> 
              E<span style={{ color: '#DC2626' }}>x</span>press
            </h1>
            <p style={{ marginTop: '0.5rem', color: currentThemeStyles.textOnDarkBg, fontSize: 'clamp(1rem, 4vw, 1.35rem)', fontWeight: '600', backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.6)', padding: '0.5rem 1rem', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)', display: 'inline-block' }}>
              Reset Your Password
            </p>
          </div>
          
          <div className="form-card" style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: 'clamp(1.25rem, 4vw, 2rem)', borderRadius: 'clamp(0.75rem, 3vw, 1rem)', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder, width: '100%' }}>
            {error && <div style={{ padding: '1rem', backgroundColor: 'rgba(254, 202, 202, 0.8)', color: '#DC2626', borderRadius: '0.75rem', marginBottom: '1.75rem', border: '1px solid rgba(220, 38, 38, 0.4)', fontSize: '0.95rem' }}>{error}</div>}
            {message && <div style={{ padding: '1rem', backgroundColor: 'rgba(187, 247, 208, 0.8)', color: '#166534', borderRadius: '0.75rem', marginBottom: '1.75rem', border: '1px solid rgba(74, 222, 128, 0.4)', fontSize: '0.95rem' }}>{message}</div>}

            {!message && (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="email" style={{ display: 'block', fontSize: '1rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '0.625rem' }}>Email</label>
                  <div style={{ position: 'relative' }}>
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!!emailFromQuery} required className="input-focus input-field"
                      style={{ width: '100%', padding: 'clamp(0.6rem, 2vw, 0.75rem)', paddingLeft: 'clamp(2.25rem, 6vw, 2.75rem)', borderRadius: 'clamp(0.5rem, 2vw, 0.75rem)', border: currentThemeStyles.inputBorder, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.05)', fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', transition: 'all 0.2s ease', height: 'clamp(2.75rem, 8vw, 3rem)' }}
                    />
                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#F59E0B' }}><EnvelopeIcon width={20} height={20} /></div>
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="otp" style={{ display: 'block', fontSize: '1rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '0.625rem' }}>OTP Code</label>
                  <div style={{ position: 'relative' }}>
                    <input id="otp" type="text" placeholder="Enter 6-digit code" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} disabled={!!otpFromQuery} required className="input-focus input-field"
                      style={{ width: '100%', padding: 'clamp(0.6rem, 2vw, 0.75rem)', paddingLeft: 'clamp(2.25rem, 6vw, 2.75rem)', borderRadius: 'clamp(0.5rem, 2vw, 0.75rem)', border: currentThemeStyles.inputBorder, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.05)', fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', transition: 'all 0.2s ease', height: 'clamp(2.75rem, 8vw, 3rem)', fontFamily: 'monospace', letterSpacing: '0.25rem', textAlign: 'center' }}
                    />
                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#F59E0B' }}><ShieldExclamationIcon width={20} height={20} /></div>
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="password" style={{ display: 'block', fontSize: '1rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '0.625rem' }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="input-focus input-field"
                      style={{ width: '100%', padding: 'clamp(0.6rem, 2vw, 0.75rem)', paddingLeft: 'clamp(2.25rem, 6vw, 2.75rem)', paddingRight: 'clamp(2.25rem, 6vw, 2.75rem)', borderRadius: 'clamp(0.5rem, 2vw, 0.75rem)', border: currentThemeStyles.inputBorder, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.05)', fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', transition: 'all 0.2s ease', height: 'clamp(2.75rem, 8vw, 3rem)' }}
                    />
                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#F59E0B' }}><KeyIcon width={20} height={20} /></div>
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', transition: 'color 0.2s ease', padding: 0 }}>
                      {showPassword ? <EyeSlashIcon width={20} height={20} /> : <EyeIcon width={20} height={20} />}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="confirmPassword" style={{ display: 'block', fontSize: '1rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '0.625rem' }}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="input-focus input-field"
                      style={{ width: '100%', padding: 'clamp(0.6rem, 2vw, 0.75rem)', paddingLeft: 'clamp(2.25rem, 6vw, 2.75rem)', paddingRight: 'clamp(2.25rem, 6vw, 2.75rem)', borderRadius: 'clamp(0.5rem, 2vw, 0.75rem)', border: currentThemeStyles.inputBorder, backgroundColor: currentThemeStyles.inputBg, color: currentThemeStyles.textPrimary, boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.05)', fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)', transition: 'all 0.2s ease', height: 'clamp(2.75rem, 8vw, 3rem)' }}
                    />
                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#F59E0B' }}><KeyIcon width={20} height={20} /></div>
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="password-toggle" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', transition: 'color 0.2s ease', padding: 0 }}>
                      {showConfirmPassword ? <EyeSlashIcon width={20} height={20} /> : <EyeIcon width={20} height={20} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="button-hover" style={{ width: '100%', backgroundColor: '#F59E0B', color: 'white', fontWeight: '700', padding: 'clamp(0.75rem, 2.5vw, 0.875rem)', borderRadius: 'clamp(0.5rem, 2vw, 0.75rem)', border: 'none', boxShadow: '0 4px 6px rgba(245, 158, 11, 0.5), 0 2px 4px rgba(0, 0, 0, 0.1)', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1, transition: 'all 0.3s', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', position: 'relative', overflow: 'hidden', minHeight: 'clamp(2.75rem, 8vw, 3rem)', marginTop: '1.5rem' }}>
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Resetting Password...
                    </>
                  ) : (
                    <>Reset Password</>
                  )}
                </button>
              </form>
            )}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '1.75rem', backgroundColor: currentThemeStyles.loginBg, padding: '1rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
            <p style={{ color: currentThemeStyles.loginText, fontSize: '0.95rem' }}>
              Remembered your password?{" "}
              <Link href="/login" className="login-link" style={{ color: currentThemeStyles.loginLinkColor, textDecoration: 'none', fontWeight: '600', borderBottom: '1px solid transparent', transition: 'all 0.2s ease', paddingBottom: '2px' }}>
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}