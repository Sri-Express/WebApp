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
        maxWidth: '420px',
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
            <span>ශ්‍රී</span> E<span style={{ color: '#DC2626' }}>x</span>press
          </h1>
          <p style={{
            marginTop: '0.5rem',
            color: '#4b5563',
          }}>Create a new account</p>
        </div>
        
        {error && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            border: '1px solid #fecaca',
            fontSize: '0.9rem',
            textAlign: 'center' as const,
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          
          <div style={{
            marginBottom: '1.25rem',
          }}>
            <label htmlFor="name" style={{
              display: 'block' as const,
              fontSize: '0.875rem',
              fontWeight: '600' as const,
              color: '#374151',
              marginBottom: '0.5rem',
            }}>Full Name</label>
            <div style={{
              position: 'relative' as const,
            }}>
              <span style={{
                position: 'absolute' as const,
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
              }}><UserIcon width={20} height={20} /></span>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
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
            marginBottom: '1.25rem',
          }}>
            <label htmlFor="email" style={{
              display: 'block' as const,
              fontSize: '0.875rem',
              fontWeight: '600' as const,
              color: '#374151',
              marginBottom: '0.5rem',
            }}>Email</label>
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
            marginBottom: '1.25rem',
          }}>
            <label htmlFor="password" style={{
              display: 'block' as const,
              fontSize: '0.875rem',
              fontWeight: '600' as const,
              color: '#374151',
              marginBottom: '0.5rem',
            }}>Password</label>
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
                minLength={6}
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
            marginBottom: '1.25rem',
          }}>
            <label htmlFor="confirmPassword" style={{
              display: 'block' as const,
              fontSize: '0.875rem',
              fontWeight: '600' as const,
              color: '#374151',
              marginBottom: '0.5rem',
            }}>Confirm Password</label>
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
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={6}
                value={formData.confirmPassword}
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
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{
                position: 'absolute' as const,
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer' as const,
                color: '#9ca3af',
              }}>
                {showConfirmPassword ? <EyeSlashIcon width={20} height={20} /> : <EyeIcon width={20} height={20} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%',
            backgroundColor: '#F59E0B',
            color: 'white',
            fontWeight: '700' as const,
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer' as const,
            fontSize: '1rem',
            opacity: loading ? 0.7 : 1,
            marginTop: '1.5rem',
          }}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div style={{
          textAlign: 'center' as const,
          marginTop: '1.5rem',
          color: '#4b5563',
          fontSize: '0.9rem',
        }}>
          <p>
            Already have an account?{' '}
            <Link href="/login" style={{
              color: '#D97706',
              textDecoration: 'none' as const,
              fontWeight: '600' as const,
            }}>
              Sign in here
            </Link>
          </p>
        </div>
        
      </div>
    </div>
  );
}