"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EnvelopeIcon, KeyIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { CSSProperties } from 'react';

export default function LoginPage() {
  const router = useRouter();
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  // Properly typed styles
  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    fontFamily: 'sans-serif',
    padding: '1rem',
  };

  const formWrapperStyle: CSSProperties = {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'white',
    padding: '2.5rem',
    borderRadius: '0.75rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  };

  const headerStyle: CSSProperties = {
    textAlign: 'center',
    marginBottom: '2rem',
  };

  const titleStyle: CSSProperties = {
    fontSize: '2.25rem',
    fontWeight: 'bold',
    color: '#111827',
  };

  const subtitleStyle: CSSProperties = {
    marginTop: '0.5rem',
    color: '#4b5563',
  };

  const errorBoxStyle: CSSProperties = {
    padding: '1rem',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
    border: '1px solid #fecaca',
  };

  const inputGroupStyle: CSSProperties = {
    marginBottom: '1.5rem',
  };

  const labelStyle: CSSProperties = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem',
  };

  const inputContainerStyle: CSSProperties = {
    position: 'relative',
  };

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '0.75rem 2.5rem',
    borderRadius: '0.5rem',
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    fontSize: '1rem',
    boxSizing: 'border-box',
  };

  const iconStyle: CSSProperties = {
    position: 'absolute',
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
  };

  const passwordToggleStyle: CSSProperties = {
    position: 'absolute',
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#9ca3af',
  };

  const optionsRowStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
  };

  const checkboxLabelStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    color: '#4b5563',
    cursor: 'pointer',
  };

  const checkboxStyle: CSSProperties = {
    marginRight: '0.5rem',
    accentColor: '#F59E0B',
  };

  const linkStyle: CSSProperties = {
    color: '#D97706',
    textDecoration: 'none',
    fontWeight: '600',
  };

  const submitButtonStyle: CSSProperties = {
    width: '100%',
    backgroundColor: '#F59E0B',
    color: 'white',
    fontWeight: '700',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    opacity: loading ? 0.7 : 1,
  };

  const footerTextStyle: CSSProperties = {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: '#4b5563',
  };
  
  return (
    <div style={containerStyle}>
      <div style={formWrapperStyle}>
        
        <div style={headerStyle}>
          <h1 style={titleStyle}>
            <span>ශ්‍රී</span> E<span style={{ color: '#DC2626' }}>x</span>press
          </h1>
          <p style={subtitleStyle}>Sign in to your account</p>
        </div>
        
        {error && (
          <div style={errorBoxStyle}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          
          <div style={inputGroupStyle}>
            <label htmlFor="email" style={labelStyle}>Email</label>
            <div style={inputContainerStyle}>
              <span style={iconStyle}><EnvelopeIcon width={20} height={20} /></span>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={inputGroupStyle}>
            <label htmlFor="password" style={labelStyle}>Password</label>
            <div style={inputContainerStyle}>
              <span style={iconStyle}><KeyIcon width={20} height={20} /></span>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                style={inputStyle}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={passwordToggleStyle}>
                {showPassword ? <EyeSlashIcon width={20} height={20} /> : <EyeIcon width={20} height={20} />}
              </button>
            </div>
          </div>

          <div style={optionsRowStyle}>
            <label htmlFor="remember-me" style={checkboxLabelStyle}>
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                style={checkboxStyle}
              />
              Remember me
            </label>
            <Link href="/forgot-password" style={linkStyle}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading} style={submitButtonStyle}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div style={footerTextStyle}>
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={linkStyle}>
              Register here
            </Link>
          </p>
        </div>
        
      </div>
    </div>
  );
}