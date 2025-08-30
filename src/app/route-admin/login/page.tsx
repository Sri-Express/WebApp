// src/app/route-admin/login/page.tsx - Route Admin Login
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  UserIcon
} from '@heroicons/react/24/outline';

export default function RouteAdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
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

      // Check if user is route admin or system admin
      if (data.user.role !== 'route_admin' && data.user.role !== 'system_admin') {
        throw new Error('Access denied. Route administrator privileges required.');
      }

      localStorage.setItem('token', data.token);
      router.push('/route-admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        padding: '3rem',
        borderRadius: '0.75rem',
        border: '1px solid #334155',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <div style={{
              backgroundColor: '#8b5cf6',
              padding: '1rem',
              borderRadius: '0.75rem'
            }}>
              <MapIcon width={32} height={32} color="white" />
            </div>
          </div>
          <h1 style={{
            color: '#f1f5f9',
            fontSize: '1.875rem',
            fontWeight: 'bold',
            marginBottom: '0.5rem'
          }}>
            Route Administrator
          </h1>
          <p style={{
            color: '#94a3b8',
            fontSize: '0.875rem'
          }}>
            Sign in to manage your assigned route
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              color: '#f1f5f9',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.5rem',
              display: 'block'
            }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
                style={{
                  width: '100%',
                  backgroundColor: '#334155',
                  border: '1px solid #475569',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  paddingLeft: '3rem',
                  color: '#f1f5f9',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease-in-out'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = '#475569'}
              />
              <UserIcon 
                width={20} 
                height={20} 
                color="#94a3b8"
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              color: '#f1f5f9',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.5rem',
              display: 'block'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%',
                  backgroundColor: '#334155',
                  border: '1px solid #475569',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  paddingRight: '3rem',
                  color: '#f1f5f9',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease-in-out'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = '#475569'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8'
                }}
              >
                {showPassword ? (
                  <EyeSlashIcon width={20} height={20} />
                ) : (
                  <EyeIcon width={20} height={20} />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              backgroundColor: 'rgba(127, 29, 29, 0.5)',
              border: '1px solid #991b1b',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <ExclamationTriangleIcon width={20} height={20} color="#fca5a5" />
              <span style={{ color: '#fecaca', fontSize: '0.875rem' }}>
                {error}
              </span>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#6b7280' : '#8b5cf6',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease-in-out',
              marginBottom: '1.5rem'
            }}
          >
            {loading ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #ffffff40',
                  borderTop: '2px solid #ffffff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div style={{
          textAlign: 'center',
          paddingTop: '1.5rem',
          borderTop: '1px solid #334155'
        }}>
          <p style={{
            color: '#94a3b8',
            fontSize: '0.875rem',
            marginBottom: '1rem'
          }}>
            Need help accessing your account?
          </p>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            <Link href="/forgot-password" style={{
              color: '#8b5cf6',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Reset Password
            </Link>
            <Link href="/login" style={{
              color: '#6b7280',
              textDecoration: 'none',
              fontSize: '0.875rem'
            }}>
              ← Back to Main Login
            </Link>
          </div>
        </div>

        {/* Admin Contact Info */}
        <div style={{
          backgroundColor: '#334155',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginTop: '1.5rem',
          textAlign: 'center'
        }}>
          <p style={{
            color: '#94a3b8',
            fontSize: '0.75rem',
            margin: 0
          }}>
            Route Admin access is assigned by System Administrators.
            <br />
            Contact your admin if you don't have access.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}