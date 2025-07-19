// src/app/login/page.tsx - FIXED VERSION WITH CORRECT API URL
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { EnvelopeIcon, KeyIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

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
      // ✅ FIXED: Correct API URL with /api prefix
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const apiURL = `${baseURL}/api/auth/login`;
      
      console.log('🔐 Login API Call:', apiURL);
      console.log('📦 Login Data:', formData);

      const response = await fetch(apiURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      console.log('📡 Login Response Status:', response.status);
      
      const data = await response.json();
      console.log('📋 Login Response Data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user info
      localStorage.setItem('token', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      console.log('✅ Login successful, redirecting to dashboard...');
      router.push('/dashboard');
    } catch (err: unknown) {
      console.error('❌ Login error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      fontFamily: 'sans-serif',
      padding: '1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'white',
        padding: '2.5rem',
        borderRadius: '0.75rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }}>
        
        <div style={{
          textAlign: 'center' as const,
          marginBottom: '2rem',
        }}>
          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: 'bold' as const,
            color: '#111827',
          }}>
            <span style={{ color: '#F59E0B' }}>ශ්‍රී</span> E<span style={{ color: '#DC2626' }}>x</span>press
          </h1>
          <p style={{
            marginTop: '0.5rem',
            color: '#4b5563',
          }}>Sign in to your account</p>
        </div>
        
        {error && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            border: '1px solid #fecaca',
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          
          <div style={{
            marginBottom: '1.5rem',
          }}>
            <label htmlFor="email" style={{
              display: 'block' as const,
              fontSize: '0.875rem',
              fontWeight: '600' as const,
              color: '#374151',
              marginBottom: '0.5rem',
            }}>Email *</label>
            <div style={{
              position: 'relative' as const,
            }}>
              <span style={{
                position: 'absolute' as const,
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
              }}><EnvelopeIcon width={20} height={20} /></span>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                style={{
                  width: '100%',
                  padding: '0.75rem 2.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  fontSize: '1rem',
                  boxSizing: 'border-box' as const,
                }}
              />
            </div>
          </div>

          <div style={{
            marginBottom: '1.5rem',
          }}>
            <label htmlFor="password" style={{
              display: 'block' as const,
              fontSize: '0.875rem',
              fontWeight: '600' as const,
              color: '#374151',
              marginBottom: '0.5rem',
            }}>Password *</label>
            <div style={{
              position: 'relative' as const,
            }}>
              <span style={{
                position: 'absolute' as const,
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
              }}><KeyIcon width={20} height={20} /></span>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem 2.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                  fontSize: '1rem',
                  boxSizing: 'border-box' as const,
                }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                position: 'absolute' as const,
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer' as const,
                color: '#9ca3af',
              }}>
                {showPassword ? <EyeSlashIcon width={20} height={20} /> : <EyeIcon width={20} height={20} />}
              </button>
            </div>
          </div>

          <div style={{
            display: 'flex' as const,
            justifyContent: 'space-between' as const,
            alignItems: 'center' as const,
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
          }}>
            <label htmlFor="remember-me" style={{
              display: 'flex' as const,
              alignItems: 'center' as const,
              color: '#4b5563',
              cursor: 'pointer' as const,
            }}>
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                style={{
                  marginRight: '0.5rem',
                  accentColor: '#F59E0B',
                }}
              />
              Remember me
            </label>
            <Link href="/forgot-password" style={{
              color: '#D97706',
              textDecoration: 'none' as const,
              fontWeight: '600' as const,
            }}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%',
            backgroundColor: loading ? '#9CA3AF' : '#F59E0B',
            color: 'white',
            fontWeight: '700' as const,
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer' as const,
            fontSize: '1rem',
            transition: 'background-color 0.2s',
          }}>
            {loading ? '🔄 Signing in...' : '🔐 Sign In'}
          </button>
        </form>
        
        <div style={{
          textAlign: 'center' as const,
          marginTop: '1.5rem',
          color: '#4b5563',
        }}>
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={{
              color: '#D97706',
              textDecoration: 'none' as const,
              fontWeight: '600' as const,
            }}>
              Register here
            </Link>
          </p>
        </div>
        
        {/* Debug info (remove in production) */}
        <div style={{
          marginTop: '1rem',
          padding: '0.5rem',
          backgroundColor: '#f9fafb',
          borderRadius: '0.25rem',
          fontSize: '0.75rem',
          color: '#6b7280',
          textAlign: 'center' as const,
        }}>
          API URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login
        </div>
        
      </div>
    </div>
  );
}