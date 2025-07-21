// src/app/sysadmin/login/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheckIcon, KeyIcon, EyeIcon, EyeSlashIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/app/context/ThemeContext'; // Make sure this path is correct

// A simple ThemeSwitcher component, now themed for the admin page
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
        color: theme === 'dark' ? '#F87171' : '#DC2626',
        border: `1px solid ${theme === 'dark' ? 'rgba(220, 38, 38, 0.3)' : 'rgba(209, 213, 219, 0.5)'}`,
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


export default function SystemAdminLoginPage() {
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

      if (data.user?.role !== 'system_admin') {
        throw new Error('Access Denied. System Administrator privileges required.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/sysadmin/dashboard');

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

  // --- Admin Theme Styles (Red Palette) ---
  const adminLightTheme = {
    mainBg: '#f1f5f9',
    bgGradient: 'linear-gradient(to bottom right, #f1f5f9, #e2e8f0, #cbd5e1)',
    glassPanelBg: 'rgba(255, 255, 255, 0.92)',
    glassPanelBorder: '1px solid rgba(220, 38, 38, 0.3)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)',
    textPrimary: '#1e293b',
    textSecondary: '#475569',
    brandText: '#ffffff',
    brandTextShadow: '0 4px 8px rgba(0, 0, 0, 0.7)',
    inputBg: 'rgba(255, 255, 255, 0.9)',
    inputBorder: '2px solid rgba(203, 213, 225, 0.8)',
    inputFocusBorder: '#DC2626',
    inputFocusShadow: '0 0 0 3px rgba(220, 38, 38, 0.2)',
    buttonBg: '#DC2626',
    buttonHoverBg: '#B91C1C',
    buttonHoverShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
    passwordToggleHoverColor: '#DC2626',
  };

  const adminDarkTheme = {
    mainBg: '#0f172a',
    bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)',
    glassPanelBg: 'rgba(30, 41, 59, 0.8)',
    glassPanelBorder: '1px solid rgba(220, 38, 38, 0.4)',
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)',
    textPrimary: '#f1f5f9',
    textSecondary: '#94a3b8',
    brandText: '#ffffff',
    brandTextShadow: '0 4px 8px rgba(0, 0, 0, 0.7)',
    inputBg: 'rgba(51, 65, 85, 0.8)',
    inputBorder: '2px solid rgba(71, 85, 105, 0.8)',
    inputFocusBorder: '#EF4444',
    inputFocusShadow: '0 0 0 3px rgba(239, 68, 68, 0.3)',
    buttonBg: '#DC2626',
    buttonHoverBg: '#B91C1C',
    buttonHoverShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
    passwordToggleHoverColor: '#EF4444',
  };

  const currentThemeStyles = theme === 'dark' ? adminDarkTheme : adminLightTheme;

  const animationStyles = `
    @keyframes road-marking { 0% { transform: translateX(-200%); } 100% { transform: translateX(500%); } }
    .animate-road-marking { animation: road-marking 10s linear infinite; }
    @keyframes car-right { 0% { transform: translateX(-100%); } 100% { transform: translateX(100vw); } }
    .animate-car-right { animation: car-right 15s linear infinite; }
    @keyframes car-left { 0% { transform: translateX(100vw) scaleX(-1); } 100% { transform: translateX(-100%) scaleX(-1); } }
    .animate-car-left { animation: car-left 16s linear infinite; }
    @keyframes light-blink { 0%, 100% { opacity: 1; box-shadow: 0 0 15px #fcd34d; } 50% { opacity: 0.6; box-shadow: 0 0 5px #fcd34d; } }
    .animate-light-blink { animation: light-blink 1s infinite; }
    @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
    @keyframes trainMove { from { left: 100%; } to { left: -300px; } }
    @keyframes slight-bounce { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-1px); } }
    .animate-slight-bounce { animation: slight-bounce 2s ease-in-out infinite; }
    @keyframes steam { 0% { opacity: 0.8; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-20px) scale(2.5); } }
    .animate-steam { animation: steam 2s ease-out infinite; }
    @keyframes wheels { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }
    .animate-wheels { animation: wheels 2s linear infinite; }
    @keyframes connecting-rod { 0% { transform: translateX(-1px) rotate(0deg); } 50% { transform: translateX(1px) rotate(180deg); } 100% { transform: translateX(-1px) rotate(360deg); } }
    .animate-connecting-rod { animation: connecting-rod 2s linear infinite; }
    @keyframes piston-move { 0% { transform: translateX(-2px); } 50% { transform: translateX(2px); } 100% { transform: translateX(-2px); } }
    .animate-piston { animation: piston-move 2s linear infinite; }
    .animation-delay-100 { animation-delay: 0.1s; } .animation-delay-200 { animation-delay: 0.2s; } .animation-delay-300 { animation-delay: 0.3s; } .animation-delay-400 { animation-delay: 0.4s; } .animation-delay-500 { animation-delay: 0.5s; } .animation-delay-600 { animation-delay: 0.6s; } .animation-delay-700 { animation-delay: 0.7s; } .animation-delay-800 { animation-delay: 0.8s; } .animation-delay-1000 { animation-delay: 1s; } .animation-delay-1200 { animation-delay: 1.2s; } .animation-delay-1500 { animation-delay: 1.5s; } .animation-delay-2000 { animation-delay: 2s; } .animation-delay-2500 { animation-delay: 2.5s; } .animation-delay-3000 { animation-delay: 3s; }
    @keyframes button-pulse { 0% { transform: scale(1); } 50% { transform: scale(1.03); } 100% { transform: scale(1); } }
    * { box-sizing: border-box; }
    @media (max-width: 380px) { .form-container { padding: 0.75rem; } .form-card { padding: 1rem; } .input-field { font-size: 0.85rem; } }
  `;

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
      <style jsx>{animationStyles}</style>
      <style jsx>{dynamicPseudoStyles}</style>
      <ThemeSwitcher />
      
      <div style={{
        position: 'absolute',
        inset: 0,
        background: currentThemeStyles.bgGradient
      }}>
        {/* --- START OF ANIMATED SCENE --- */}
        {/* Main Road */}
        <div style={{ position: 'absolute', top: '15%', left: 0, right: 0, height: '100px', backgroundColor: '#1f2937', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)', zIndex: 2 }}></div>
        <div style={{ position: 'absolute', top: '15%', left: 0, right: 0, height: '100px', zIndex: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div style={{ width: '100%', height: '5px', background: 'repeating-linear-gradient(to right, #fcd34d, #fcd34d 30px, transparent 30px, transparent 60px)', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}></div></div>
        <div style={{ position: 'absolute', top: '15%', left: 0, right: 0, height: '100px', overflow: 'hidden', zIndex: 3 }}><div style={{ position: 'absolute', top: '25%', left: 0, right: 0, height: '8px', display: 'flex', transform: 'translateY(-50%)' }}><div className="animate-road-marking" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '10%' }}></div><div className="animate-road-marking animation-delay-200" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '30%' }}></div><div className="animate-road-marking animation-delay-500" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '50%' }}></div><div className="animate-road-marking animation-delay-700" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '70%' }}></div></div><div style={{ position: 'absolute', top: '75%', left: 0, right: 0, height: '8px', display: 'flex', transform: 'translateY(-50%)' }}><div className="animate-road-marking animation-delay-300" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '20%' }}></div><div className="animate-road-marking animation-delay-400" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '40%' }}></div><div className="animate-road-marking animation-delay-600" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '60%' }}></div><div className="animate-road-marking animation-delay-800" style={{ position: 'absolute', width: '80px', backgroundColor: '#fbbf24', left: '80%' }}></div></div></div>
        {/* Secondary Road */}
        <div style={{ position: 'absolute', top: '60%', left: 0, right: 0, height: '80px', backgroundColor: '#1f2937', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)', zIndex: 2 }}></div>
        <div style={{ position: 'absolute', top: '60%', left: 0, right: 0, height: '80px', zIndex: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div style={{ width: '100%', height: '4px', background: 'repeating-linear-gradient(to right, #fcd34d, #fcd34d 20px, transparent 20px, transparent 40px)', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}></div></div>
        <div style={{ position: 'absolute', top: '60%', left: 0, right: 0, height: '80px', overflow: 'hidden', zIndex: 3 }}><div style={{ position: 'absolute', top: '25%', left: 0, right: 0, height: '6px', display: 'flex', transform: 'translateY(-50%)' }}><div className="animate-road-marking animation-delay-300" style={{ position: 'absolute', width: '60px', backgroundColor: '#fbbf24', left: '15%' }}></div><div className="animate-road-marking animation-delay-500" style={{ position: 'absolute', width: '60px', backgroundColor: '#fbbf24', left: '45%' }}></div><div className="animate-road-marking animation-delay-700" style={{ position: 'absolute', width: '60px', backgroundColor: '#fbbf24', left: '75%' }}></div></div><div style={{ position: 'absolute', top: '75%', left: 0, right: 0, height: '6px', display: 'flex', transform: 'translateY(-50%)' }}><div className="animate-road-marking animation-delay-200" style={{ position: 'absolute', width: '60px', backgroundColor: '#fbbf24', left: '25%' }}></div><div className="animate-road-marking animation-delay-400" style={{ position: 'absolute', width: '60px', backgroundColor: '#fbbf24', left: '55%' }}></div><div className="animate-road-marking animation-delay-600" style={{ position: 'absolute', width: '60px', backgroundColor: '#fbbf24', left: '85%' }}></div></div></div>
        {/* Enhanced Railway */}
        <div style={{ position: 'absolute', top: '85%', left: 0, right: 0, height: '50px', background: 'linear-gradient(to bottom, #4b5563 0%, #374151 100%)', boxShadow: '0 5px 10px -3px rgba(0, 0, 0, 0.3)', zIndex: 2 }}></div>
        <div style={{ position: 'absolute', top: '85%', left: 0, right: 0, height: '50px', overflow: 'visible', zIndex: 3 }}><div style={{ position: 'absolute', top: '35%', left: 0, right: 0, height: '6px', background: 'linear-gradient(to bottom, #94a3b8 0%, #64748b 100%)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)', zIndex: 4 }}></div><div style={{ position: 'absolute', top: '65%', left: 0, right: 0, height: '6px', background: 'linear-gradient(to bottom, #94a3b8 0%, #64748b 100%)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)', zIndex: 4 }}></div><div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', display: 'flex', gap: '15px', zIndex: 3 }}>{Array(30).fill(0).map((_, i) => (<div key={i} style={{ width: '20px', height: '100%', background: 'linear-gradient(to bottom, #92400e 0%, #7c2d12 70%, #713f12 100%)', marginLeft: `${i * 30}px`, boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.5)', border: '1px solid #78350f' }}></div>))}</div><div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', backgroundImage: 'radial-gradient(circle, #6b7280 2px, transparent 2px), radial-gradient(circle, #9ca3af 1px, transparent 1px)', backgroundSize: '8px 8px, 6px 6px', opacity: 0.5, zIndex: 2 }}></div></div>
        {/* Enhanced Train on Railway */}
        <div className="animate-slight-bounce" style={{ position: 'absolute', top: '85%', marginTop: '-15px', left: '100%', height: '70px', width: '300px', zIndex: 6, pointerEvents: 'none', display: 'flex', animation: 'trainMove 15s linear infinite', filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.2))' }}><div style={{ display: 'flex', width: '100%', height: '100%' }}><div style={{ position: 'relative', width: '110px', height: '60px', marginRight: '5px' }}><div style={{ position: 'absolute', bottom: '12px', left: '8px', width: '85%', height: '30px', background: 'linear-gradient(to bottom, #b91c1c 0%, #9f1239 60%, #7f1d1d 100%)', borderRadius: '8px 5px 5px 5px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)', border: '1px solid #7f1d1d' }}></div><div style={{ position: 'absolute', bottom: '42px', right: '10px', width: '60px', height: '30px', background: 'linear-gradient(to bottom, #7f1d1d 0%, #681e1e 100%)', borderRadius: '6px 6px 0 0', border: '1px solid #601414', boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1)' }}></div><div style={{ position: 'absolute', bottom: '72px', right: '8px', width: '65px', height: '5px', background: '#4c1d95', borderRadius: '2px', boxShadow: '0 -1px 2px rgba(0, 0, 0, 0.3)' }}></div><div style={{ position: 'absolute', bottom: '5px', left: '0', width: '15px', height: '18px', background: 'linear-gradient(135deg, #9f1239 0%, #7f1d1d 100%)', clipPath: 'polygon(0 0, 100% 0, 100% 35%, 50% 100%, 0 35%)', borderRadius: '2px' }}></div><div style={{ position: 'absolute', bottom: '15px', left: '3px', width: '10px', height: '4px', backgroundColor: '#64748b', borderRadius: '1px', border: '1px solid #475569' }}></div><div style={{ position: 'absolute', top: '3px', left: '40px', padding: '3px 5px', backgroundColor: '#fef3c7', borderRadius: '3px', border: '1px solid #7f1d1d', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)', fontSize: '9px', fontWeight: 'bold', color: '#7f1d1d', whiteSpace: 'nowrap', fontFamily: "'Noto Sans Sinhala', 'Iskoola Pota', sans-serif", zIndex: 10, transform: 'rotate(-2deg)' }}>දුම්රිය සේවය</div><div style={{ position: 'absolute', bottom: '42px', left: '22px', width: '14px', height: '18px', background: 'linear-gradient(to bottom, #27272a 0%, #18181b 100%)', borderRadius: '4px 4px 0 0', border: '1px solid #111', boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1)' }}><div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '16px', height: '4px', background: 'linear-gradient(to bottom, #cbd5e1 0%, #94a3b8 100%)', borderRadius: '4px 4px 0 0', border: '1px solid #64748b' }}></div><div className="animate-steam" style={{ position: 'absolute', top: '-15px', left: '-2px', width: '18px', height: '15px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 80%)', borderRadius: '50%', opacity: 0.9 }}></div><div className="animate-steam animation-delay-200" style={{ position: 'absolute', top: '-12px', left: '4px', width: '16px', height: '14px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 80%)', borderRadius: '50%', opacity: 0.85 }}></div><div className="animate-steam animation-delay-400" style={{ position: 'absolute', top: '-18px', left: '2px', width: '20px', height: '18px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 80%)', borderRadius: '50%', opacity: 0.9 }}></div><div className="animate-steam animation-delay-600" style={{ position: 'absolute', top: '-14px', left: '-4px', width: '17px', height: '15px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 80%)', borderRadius: '50%', opacity: 0.8 }}></div><div className="animate-steam animation-delay-800" style={{ position: 'absolute', top: '-22px', left: '1px', width: '22px', height: '20px', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 30%, rgba(255, 255, 255, 0.6) 80%)', borderRadius: '50%', opacity: 0.7 }}></div></div><div style={{ position: 'absolute', bottom: '42px', left: '45px', width: '8px', height: '10px', background: 'linear-gradient(to bottom, #fbbf24 0%, #d97706 100%)', borderRadius: '4px 4px 8px 8px', border: '1px solid #b45309' }}></div><div style={{ position: 'absolute', bottom: '42px', left: '60px', width: '6px', height: '8px', background: 'linear-gradient(to bottom, #94a3b8 0%, #64748b 100%)', borderRadius: '3px 3px 0 0', border: '1px solid #475569' }}></div><div className="animate-wheels" style={{ position: 'absolute', bottom: '0', left: '15px', width: '24px', height: '24px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}><div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', background: 'conic-gradient(from 0deg, transparent 0deg, transparent 10deg, #cbd5e1 10deg, #cbd5e1 15deg, transparent 15deg, transparent 55deg, #cbd5e1 55deg, #cbd5e1 60deg, transparent 60deg, transparent 100deg, #cbd5e1 100deg, #cbd5e1 105deg, transparent 105deg, transparent 145deg, #cbd5e1 145deg, #cbd5e1 150deg, transparent 150deg, transparent 190deg, #cbd5e1 190deg, #cbd5e1 195deg, transparent 195deg, transparent 235deg, #cbd5e1 235deg, #cbd5e1 240deg, transparent 240deg, transparent 280deg, #cbd5e1 280deg, #cbd5e1 285deg, transparent 285deg, transparent 325deg, #cbd5e1 325deg, #cbd5e1 330deg, transparent 330deg)', borderRadius: '50%' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 4px)', left: 'calc(50% - 4px)', width: '8px', height: '8px', background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', borderRadius: '50%', border: '1px solid #64748b', boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)' }}></div></div><div className="animate-wheels" style={{ position: 'absolute', bottom: '0', right: '25px', width: '24px', height: '24px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}><div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', background: 'conic-gradient(from 0deg, transparent 0deg, transparent 10deg, #cbd5e1 10deg, #cbd5e1 15deg, transparent 15deg, transparent 55deg, #cbd5e1 55deg, #cbd5e1 60deg, transparent 60deg, transparent 100deg, #cbd5e1 100deg, #cbd5e1 105deg, transparent 105deg, transparent 145deg, #cbd5e1 145deg, #cbd5e1 150deg, transparent 150deg, transparent 190deg, #cbd5e1 190deg, #cbd5e1 195deg, transparent 195deg, transparent 235deg, #cbd5e1 235deg, #cbd5e1 240deg, transparent 240deg, transparent 280deg, #cbd5e1 280deg, #cbd5e1 285deg, transparent 285deg, transparent 325deg, #cbd5e1 325deg, #cbd5e1 330deg, transparent 330deg)', borderRadius: '50%' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 4px)', left: 'calc(50% - 4px)', width: '8px', height: '8px', background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', borderRadius: '50%', border: '1px solid #64748b', boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)' }}></div></div><div className="animate-wheels" style={{ position: 'absolute', bottom: '0', right: '60px', width: '24px', height: '24px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}><div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', background: 'conic-gradient(from 0deg, transparent 0deg, transparent 10deg, #cbd5e1 10deg, #cbd5e1 15deg, transparent 15deg, transparent 55deg, #cbd5e1 55deg, #cbd5e1 60deg, transparent 60deg, transparent 100deg, #cbd5e1 100deg, #cbd5e1 105deg, transparent 105deg, transparent 145deg, #cbd5e1 145deg, #cbd5e1 150deg, transparent 150deg, transparent 190deg, #cbd5e1 190deg, #cbd5e1 195deg, transparent 195deg, transparent 235deg, #cbd5e1 235deg, #cbd5e1 240deg, transparent 240deg, transparent 280deg, #cbd5e1 280deg, #cbd5e1 285deg, transparent 285deg, transparent 325deg, #cbd5e1 325deg, #cbd5e1 330deg, transparent 330deg)', borderRadius: '50%' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 4px)', left: 'calc(50% - 4px)', width: '8px', height: '8px', background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', borderRadius: '50%', border: '1px solid #64748b', boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)' }}></div></div><div style={{ position: 'absolute', bottom: '24px', left: '22px', width: '30px', height: '8px', backgroundColor: '#64748b', borderRadius: '4px', border: '1px solid #475569', zIndex: 3 }}><div className="animate-piston" style={{ position: 'absolute', top: '2px', left: '3px', width: '22px', height: '2px', backgroundColor: '#94a3b8', borderRadius: '1px' }}></div></div><div style={{ position: 'absolute', bottom: '47px', right: '15px', width: '15px', height: '12px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '2px solid #7f1d1d', boxShadow: 'inset 0 0 4px rgba(255, 255, 255, 0.5)' }}></div><div style={{ position: 'absolute', bottom: '47px', right: '40px', width: '15px', height: '12px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '2px solid #7f1d1d', boxShadow: 'inset 0 0 4px rgba(255, 255, 255, 0.5)' }}></div><div className="animate-light-blink" style={{ position: 'absolute', bottom: '22px', left: '3px', width: '10px', height: '10px', background: 'radial-gradient(circle, #fef3c7 0%, #fcd34d 100%)', borderRadius: '50%', boxShadow: '0 0 15px #fcd34d, 0 0 5px #fef3c7', border: '1px solid #b45309' }}></div></div><div style={{ position: 'relative', width: '90px', height: '40px', marginTop: '15px', marginRight: '5px' }}><div style={{ position: 'absolute', bottom: '5px', width: '100%', height: '28px', background: 'linear-gradient(to bottom, #dc2626 0%, #be123c 60%, #9f1239 100%)', borderRadius: '4px', boxSizing: 'border-box', border: '1px solid #881337', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}><div style={{ position: 'absolute', top: '18px', left: '0', width: '100%', height: '3px', backgroundColor: '#fbbf24', opacity: 0.8 }}></div></div><div style={{ position: 'absolute', bottom: '33px', left: '2px', width: '96%', height: '4px', background: 'linear-gradient(to bottom, #7f1d1d 0%, #881337 100%)', borderRadius: '40% 40% 0 0 / 100% 100% 0 0', boxShadow: '0 -1px 2px rgba(0, 0, 0, 0.3)' }}></div><div style={{ position: 'absolute', top: '5px', left: '10px', width: '15px', height: '10px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '1px solid #881337', boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)' }}></div><div style={{ position: 'absolute', top: '5px', left: '35px', width: '15px', height: '10px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '1px solid #881337', boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)' }}></div><div style={{ position: 'absolute', top: '5px', left: '60px', width: '15px', height: '10px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '1px solid #881337', boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)' }}></div><div className="animate-wheels" style={{ position: 'absolute', bottom: '0', left: '20px', width: '20px', height: '20px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}><div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 3px)', left: 'calc(50% - 3px)', width: '6px', height: '6px', background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', borderRadius: '50%', border: '1px solid #64748b', boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)' }}></div></div><div className="animate-wheels" style={{ position: 'absolute', bottom: '0', right: '20px', width: '20px', height: '20px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}><div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 3px)', left: 'calc(50% - 3px)', width: '6px', height: '6px', background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', borderRadius: '50%', border: '1px solid #64748b', boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)' }}></div></div></div><div style={{ position: 'relative', width: '90px', height: '40px', marginTop: '15px' }}><div style={{ position: 'absolute', bottom: '5px', width: '100%', height: '28px', background: 'linear-gradient(to bottom, #c026d3 0%, #a21caf 60%, #86198f 100%)', borderRadius: '4px', boxSizing: 'border-box', border: '1px solid #701a75', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}><div style={{ position: 'absolute', top: '18px', left: '0', width: '100%', height: '3px', backgroundColor: '#fbbf24', opacity: 0.8 }}></div></div><div style={{ position: 'absolute', bottom: '33px', left: '2px', width: '96%', height: '4px', background: 'linear-gradient(to bottom, #701a75 0%, #86198f 100%)', borderRadius: '40% 40% 0 0 / 100% 100% 0 0', boxShadow: '0 -1px 2px rgba(0, 0, 0, 0.3)' }}></div><div style={{ position: 'absolute', top: '5px', left: '10px', width: '15px', height: '10px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '1px solid #701a75', boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)' }}></div><div style={{ position: 'absolute', top: '5px', left: '35px', width: '15px', height: '10px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '1px solid #701a75', boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)' }}></div><div style={{ position: 'absolute', top: '5px', left: '60px', width: '15px', height: '10px', background: 'linear-gradient(135deg, #93c5fd 0%, #bfdbfe 50%, #93c5fd 100%)', borderRadius: '2px', border: '1px solid #701a75', boxShadow: 'inset 0 0 3px rgba(255, 255, 255, 0.5)' }}></div><div className="animate-light-blink animation-delay-500" style={{ position: 'absolute', bottom: '15px', right: '3px', width: '6px', height: '6px', background: 'radial-gradient(circle, #fef3c7 0%, #f87171 100%)', borderRadius: '50%', boxShadow: '0 0 8px #f87171', border: '1px solid #7f1d1d' }}></div><div className="animate-wheels" style={{ position: 'absolute', bottom: '0', left: '20px', width: '20px', height: '20px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}><div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 3px)', left: 'calc(50% - 3px)', width: '6px', height: '6px', background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', borderRadius: '50%', border: '1px solid #64748b', boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)' }}></div></div><div className="animate-wheels" style={{ position: 'absolute', bottom: '0', right: '20px', width: '20px', height: '20px', background: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', borderRadius: '50%', border: '3px solid #cbd5e1', boxSizing: 'border-box', boxShadow: '0 3px 6px rgba(0, 0, 0, 0.4)' }}><div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', bottom: '1px', borderRadius: '50%', border: '2px solid #94a3b8' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 1px)', left: '0', width: '100%', height: '2px', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: '0', left: 'calc(50% - 1px)', width: '2px', height: '100%', backgroundColor: '#cbd5e1' }}></div><div style={{ position: 'absolute', top: 'calc(50% - 3px)', left: 'calc(50% - 3px)', width: '6px', height: '6px', background: 'radial-gradient(circle, #f8fafc 0%, #cbd5e1 100%)', borderRadius: '50%', border: '1px solid #64748b', boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.2)' }}></div></div><div style={{ position: 'absolute', bottom: '15px', left: '-8px', width: '10px', height: '4px', backgroundColor: '#64748b', borderRadius: '1px', zIndex: 1 }}></div></div></div></div>
        {/* All other vehicle components */}
        <div className="animate-car-right animation-delay-1000" style={{ position: 'absolute', top: '15%', marginTop: '10px', left: '-180px', width: '180px', height: '80px', zIndex: 5, filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3))' }}>{/* ... bus content ... */}</div>
        <div className="animate-car-left animation-delay-2000" style={{ position: 'absolute', top: '60%', marginTop: '5px', right: '-120px', width: '120px', height: '55px', zIndex: 5, filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3))' }}>{/* ... bus content ... */}</div>
        <div className="animate-car-right animation-delay-1500" style={{ position: 'absolute', top: '60%', marginTop: '30px', left: '-70px', width: '70px', height: '45px', zIndex: 5, filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3))' }}>{/* ... tuk-tuk content ... */}</div>
        <div className="animate-car-left animation-delay-1200" style={{ position: 'absolute', top: '15%', marginTop: '40px', right: '-80px', width: '80px', height: '45px', zIndex: 5, filter: 'drop-shadow(0 4px 3px rgba(0, 0, 0, 0.3))' }}>{/* ... motorcycle content ... */}</div>
        
        {/* ✅ RESTORED: Audio, Vertical Roads, Crosswalks, and Traffic Lights */}
        <audio src="/train-whistle.mp3" autoPlay loop={false} style={{ display: 'none' }} />
        {/* Vertical Roads */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '20%', width: '60px', backgroundColor: '#1f2937', boxShadow: '5px 0 15px -3px rgba(0, 0, 0, 0.2)', zIndex: 2 }}></div>
        <div style={{ position: 'absolute', top: 0, bottom: 0, right: '20%', width: '60px', backgroundColor: '#1f2937', boxShadow: '-5px 0 15px -3px rgba(0, 0, 0, 0.2)', zIndex: 2 }}></div>
        {/* Pedestrian Crossings */}
        <div style={{ position: 'absolute', top: '15%', left: '20%', height: '100px', width: '60px', zIndex: 4 }}><div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center', height: '100%' }}><div style={{ width: '100%', height: '12px', backgroundColor: 'white' }}></div><div style={{ width: '100%', height: '12px', backgroundColor: 'white' }}></div><div style={{ width: '100%', height: '12px', backgroundColor: 'white' }}></div><div style={{ width: '100%', height: '12px', backgroundColor: 'white' }}></div></div></div>
        <div style={{ position: 'absolute', top: '60%', right: '20%', height: '80px', width: '60px', zIndex: 4 }}><div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center', height: '100%' }}><div style={{ width: '100%', height: '10px', backgroundColor: 'white' }}></div><div style={{ width: '100%', height: '10px', backgroundColor: 'white' }}></div><div style={{ width: '100%', height: '10px', backgroundColor: 'white' }}></div><div style={{ width: '100%', height: '10px', backgroundColor: 'white' }}></div></div></div>
        <div style={{ position: 'absolute', top: '85%', right: '20%', height: '50px', width: '60px', zIndex: 4, backgroundColor: '#4b5563' }}><div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center', height: '100%' }}><div style={{ width: '100%', height: '8px', backgroundImage: 'linear-gradient(45deg, #f87171 25%, #fef3c7 25%, #fef3c7 50%, #f87171 50%, #f87171 75%, #fef3c7 75%, #fef3c7 100%)', backgroundSize: '8px 8px' }}></div><div style={{ width: '100%', height: '8px', backgroundImage: 'linear-gradient(45deg, #fef3c7 25%, #f87171 25%, #f87171 50%, #fef3c7 50%, #fef3c7 75%, #f87171 75%, #f87171 100%)', backgroundSize: '8px 8px' }}></div></div></div>
        {/* Traffic Lights */}
        <div style={{ position: 'absolute', top: '15%', left: '20%', marginTop: '-50px', marginLeft: '-30px', width: '20px', height: '70px', backgroundColor: '#4B5563', borderRadius: '4px 4px 0 0', zIndex: 4 }}><div style={{ width: '100%', height: '20px', backgroundColor: 'red', borderRadius: '4px 4px 0 0' }}></div><div style={{ width: '100%', height: '20px', backgroundColor: 'yellow' }}></div><div style={{ width: '100%', height: '20px', backgroundColor: 'green' }}></div></div>
        <div style={{ position: 'absolute', top: '60%', right: '20%', marginTop: '-40px', marginRight: '-30px', width: '16px', height: '60px', backgroundColor: '#4B5563', borderRadius: '4px 4px 0 0', zIndex: 4 }}><div style={{ width: '100%', height: '16px', backgroundColor: 'red', borderRadius: '4px 4px 0 0' }}></div><div style={{ width: '100%', height: '16px', backgroundColor: 'yellow' }}></div><div style={{ width: '100%', height: '16px', backgroundColor: 'green' }}></div></div>
        <div style={{ position: 'absolute', top: '85%', right: '20%', marginTop: '-40px', marginRight: '-40px', width: '16px', height: '70px', backgroundColor: '#4B5563', zIndex: 4 }}><div style={{ position: 'absolute', top: 0, left: '-15px', width: '45px', height: '45px', backgroundColor: '#fef3c7', border: '3px solid #ef4444', borderRadius: '3px', transform: 'rotate(45deg)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '8px', transform: 'rotate(-45deg)' }}>RR</div></div><div className="animate-light-blink" style={{ position: 'absolute', top: '50px', left: '-15px', width: '14px', height: '14px', backgroundColor: '#ef4444', borderRadius: '50%', boxShadow: '0 0 10px #ef4444' }}></div><div className="animate-light-blink animation-delay-500" style={{ position: 'absolute', top: '50px', left: '17px', width: '14px', height: '14px', backgroundColor: '#ef4444', borderRadius: '50%', boxShadow: '0 0 10px #ef4444' }}></div></div>
        {/* --- END OF ANIMATED SCENE --- */}
      </div> 

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
                boxShadow: `0 4px 12px ${theme === 'dark' ? 'rgba(220, 38, 38, 0.4)' : 'rgba(220, 38, 38, 0.3)'}`
              }}>
                <ShieldCheckIcon width={32} height={32} color="white" />
              </div>
              <h1 style={{
                fontSize: 'clamp(1.5rem, 5vw, 1.8rem)',
                fontWeight: 'bold',
                color: currentThemeStyles.textPrimary,
                marginBottom: '0.5rem'
              }}>
                System Administrator
              </h1>
              <p style={{ color: currentThemeStyles.textSecondary, fontSize: '0.9rem' }}>
                Secure access to system management
              </p>
            </div>

            {error && (
              <div style={{ padding: '1rem', backgroundColor: 'rgba(153, 27, 27, 0.8)', color: '#fecaca', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid rgba(220, 38, 38, 0.4)', fontSize: '0.95rem' }}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="email" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: currentThemeStyles.textPrimary, marginBottom: '0.5rem' }}>Administrator Email</label>
                <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="admin@sriexpress.com" className="input-focus input-field"
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
                  boxShadow: `0 4px 6px ${theme === 'dark' ? 'rgba(220, 38, 38, 0.5)' : 'rgba(220, 38, 38, 0.4)'}`, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1, transition: 'all 0.3s',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.1rem', minHeight: '3rem'
                }}>
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Authenticating...
                  </>
                ) : (
                  'Access System'
                )}
              </button>
            </form>
            
            <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem', color: currentThemeStyles.textSecondary, opacity: 0.7 }}>
              <p>Restricted access • System administrators only</p>
              <p style={{ marginTop: '0.5rem' }}>All actions are logged and monitored</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}