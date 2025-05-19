// src/app/register/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Redirect to login page after successful registration
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

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
        <p style={subtitleStyle}>Create a new account</p>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={labelStyle} htmlFor="name">
            Full Name
          </label>
          <input
            style={inputStyle}
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label style={labelStyle} htmlFor="email">
            Email
          </label>
          <input
            style={inputStyle}
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label style={labelStyle} htmlFor="password">
            Password
          </label>
          <input
            style={inputStyle}
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />

          <label style={labelStyle} htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            style={inputStyle}
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength={6}
          />

          <button
            style={{
              ...buttonStyle,
              opacity: loading ? 0.7 : 1,
            }}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={linkTextStyle}>
          Already have an account?{' '}
          <Link href="/login" style={linkStyle}>
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}