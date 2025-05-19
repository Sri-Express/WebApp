// src/app/forgot-password/page.tsx (improved flow)
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EnvelopeIcon, HashtagIcon } from '@heroicons/react/24/outline';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setMessage('Password reset OTP has been sent to your email. Please check your inbox and spam folders.');
      setShowOtpField(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const goToResetPage = () => {
    if (!otp) {
      setError('Please enter the OTP sent to your email');
      return;
    }
    router.push(`/reset-password/otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);
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

  const otpInputStyle = {
    ...inputStyle,
    fontFamily: 'monospace',
    letterSpacing: '0.25rem',
    textAlign: 'center' as const,
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

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={headingStyle}>ශ්‍රී Express</h1>
        <p style={subtitleStyle}>Forgot Password</p>

        {error && <div style={errorStyle}>{error}</div>}
        {message && <div style={messageStyle}>{message}</div>}

        {!showOtpField ? (
          // Step 1: Request OTP form
          <form onSubmit={handleRequestOtp}>
            <label style={labelStyle} htmlFor="email">
              Email
            </label>
            <input
              style={inputStyle}
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              style={{
                ...buttonStyle,
                opacity: loading ? 0.7 : 1,
              }}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset OTP'}
            </button>
          </form>
        ) : (
          // Step 2: Enter OTP form
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
              required
            />

            <button
              style={{
                ...buttonStyle,
                marginTop: '1rem',
              }}
              onClick={goToResetPage}
            >
              Continue to Reset Password
            </button>
          </div>
        )}

        <p style={linkTextStyle}>
          Remember your password?{' '}
          <Link href="/login" style={linkStyle}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}