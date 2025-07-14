"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EnvelopeIcon, KeyIcon, EyeIcon, EyeSlashIcon, UserIcon } from '@heroicons/react/24/outline';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
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

      router.push('/login?registered=true');
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

  // Basic styles for a clean, modern look
  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      fontFamily: 'sans-serif',
      padding: '1rem',
    },
    formWrapper: {
      width: '100%',
      maxWidth: '420px', // Slightly wider for the extra field
      backgroundColor: 'white',
      padding: '2.5rem',
      borderRadius: '0.75rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem',
    },
    title: {
      fontSize: '2.25rem',
      fontWeight: 'bold',
      color: '#111827',
    },
    subtitle: {
      marginTop: '0.5rem',
      color: '#4b5563',
    },
    errorBox: {
      padding: '1rem',
      backgroundColor: '#fee2e2',
      color: '#b91c1c',
      borderRadius: '0.5rem',
      marginBottom: '1rem',
      border: '1px solid #fecaca',
      fontSize: '0.9rem',
      textAlign: 'center',
    },
    inputGroup: {
      marginBottom: '1.25rem', // Slightly reduced margin
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem',
    },
    inputContainer: {
      position: 'relative',
    },
    input: {
      width: '100%',
      padding: '0.75rem 2.5rem',
      borderRadius: '0.5rem',
      border: '1px solid #d1d5db',
      backgroundColor: '#ffffff',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      fontSize: '1rem',
      boxSizing: 'border-box',
    },
    icon: {
      position: 'absolute',
      left: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af',
    },
    passwordToggle: {
      position: 'absolute',
      right: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#9ca3af',
    },
    submitButton: {
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
      marginTop: '1.5rem',
    },
    footerText: {
      textAlign: 'center',
      marginTop: '1.5rem',
      color: '#4b5563',
      fontSize: '0.9rem',
    },
    link: {
      color: '#D97706',
      textDecoration: 'none',
      fontWeight: '600',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        
        <div style={styles.header}>
          <h1 style={styles.title}>
            <span>ශ්‍රී</span> E<span style={{ color: '#DC2626' }}>x</span>press
          </h1>
          <p style={styles.subtitle}>Create a new account</p>
        </div>
        
        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          
          <div style={styles.inputGroup}>
            <label htmlFor="name" style={styles.label}>Full Name</label>
            <div style={styles.inputContainer}>
              <span style={styles.icon}><UserIcon width={20} height={20} /></span>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <div style={styles.inputContainer}>
              <span style={styles.icon}><EnvelopeIcon width={20} height={20} /></span>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <div style={styles.inputContainer}>
              <span style={styles.icon}><KeyIcon width={20} height={20} /></span>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                style={styles.input}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
                {showPassword ? <EyeSlashIcon width={20} height={20} /> : <EyeIcon width={20} height={20} />}
              </button>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="confirmPassword" style={styles.label}>Confirm Password</label>
            <div style={styles.inputContainer}>
              <span style={styles.icon}><KeyIcon width={20} height={20} /></span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={6}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                style={styles.input}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.passwordToggle}>
                {showConfirmPassword ? <EyeSlashIcon width={20} height={20} /> : <EyeIcon width={20} height={20} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.submitButton}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div style={styles.footerText}>
          <p>
            Already have an account?{' '}
            <Link href="/login" style={styles.link}>
              Sign in here
            </Link>
          </p>
        </div>
        
      </div>
    </div>
  );
}