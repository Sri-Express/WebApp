"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get email and OTP from URL query parameters if available
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
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, otp, password }),
});

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setMessage('Password reset successful! You will be redirected to login...');
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Inline styles
  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  const cardStyle = {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    width: '100%',
    maxWidth: '28rem',
  };

  const headingStyle = {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#1a73e8',
    textAlign: 'center' as const,
    marginBottom: '0.5rem',
  };

  const subtitleStyle = {
    color: '#5f6368',
    textAlign: 'center' as const,
    marginBottom: '2rem',
  };

  const errorStyle = {
    backgroundColor: 'rgba(234, 67, 53, 0.1)',
    color: '#ea4335',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    marginBottom: '1rem',
  };

  const messageStyle = {
    backgroundColor: 'rgba(52, 168, 83, 0.1)',
    color: '#34a853',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    marginBottom: '1rem',
  };

  const labelStyle = {
    display: 'block',
    color: '#202124',
    marginBottom: '0.5rem',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.625rem 0.75rem',
    border: '1px solid #dadce0',
    borderRadius: '0.375rem',
    marginBottom: '1rem',
    outline: 'none',
  };

  const passwordContainerStyle = {
    position: 'relative' as const,
    marginBottom: '1rem',
  };

  const passwordInputStyle = {
    ...inputStyle,
    marginBottom: 0,
    paddingRight: '2.5rem',
  };

  const eyeIconStyle = {
    position: 'absolute' as const,
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: '#5f6368',
  };

  const buttonStyle = {
    width: '100%',
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.75rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  };

  const linkTextStyle = {
    textAlign: 'center' as const,
    marginTop: '1.5rem',
    color: '#5f6368',
  };

  const linkStyle = {
    color: '#1a73e8',
    textDecoration: 'underline',
  };

  const otpInputStyle = {
    ...inputStyle,
    fontFamily: 'monospace',
    letterSpacing: '0.25rem',
    textAlign: 'center' as const,
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={headingStyle}>ශ්‍රී Express</h1>
        <p style={subtitleStyle}>Reset Your Password</p>

        {error && <div style={errorStyle}>{error}</div>}
        {message && <div style={messageStyle}>{message}</div>}

        {!message && (
          <form onSubmit={handleSubmit}>
            <div>
              <label style={labelStyle} htmlFor="email">
                Email
              </label>
              <input
                style={inputStyle}
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!emailFromQuery}
                required
              />
            </div>

            <div>
              <label style={labelStyle} htmlFor="otp">
                OTP Code
              </label>
              <input
                style={otpInputStyle}
                type="text"
                id="otp"
                placeholder="Enter 6-digit code"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                disabled={!!otpFromQuery}
                required
              />
            </div>

            <div style={passwordContainerStyle}>
              <label style={labelStyle} htmlFor="password">
                New Password
              </label>
              <input
                style={passwordInputStyle}
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <div
                style={eyeIconStyle}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon width={20} height={20} />
                ) : (
                  <EyeIcon width={20} height={20} />
                )}
              </div>
            </div>

            <div style={passwordContainerStyle}>
              <label style={labelStyle} htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                style={passwordInputStyle}
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
              <div
                style={eyeIconStyle}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon width={20} height={20} />
                ) : (
                  <EyeIcon width={20} height={20} />
                )}
              </div>
            </div>

            <button
              style={{
                ...buttonStyle,
                opacity: loading ? 0.7 : 1,
              }}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p style={linkTextStyle}>
          <Link href="/login" style={linkStyle}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}