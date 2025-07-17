// src/app/sysadmin/login/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheckIcon, KeyIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function SystemAdminLoginPage() {
  const router = useRouter();
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        // Check if MFA is required
        if (data.requiresMfa && !mfaRequired) {
          setMfaRequired(true);
          setError('Please enter your MFA code to continue');
          return;
        }
        throw new Error(data.message || 'Login failed');
      }

      // Check if user is system admin
      if (data.role !== 'system_admin') {
        throw new Error('Access denied. System administrator privileges required.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      router.push('/sysadmin/dashboard');
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
      backgroundColor: '#0f172a',
      fontFamily: 'sans-serif',
      padding: '1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '450px',
        backgroundColor: '#1e293b',
        padding: '3rem',
        borderRadius: '1rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid #334155',
      }}>
        
        <div style={{
          textAlign: 'center' as const,
          marginBottom: '2.5rem',
        }}>
          <div style={{
            backgroundColor: '#dc2626',
            padding: '1rem',
            borderRadius: '50%',
            display: 'inline-block',
            marginBottom: '1rem'
          }}>
            <ShieldCheckIcon width={32} height={32} color="white" />
          </div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold' as const,
            color: '#f1f5f9',
            marginBottom: '0.5rem'
          }}>
            System Administrator
          </h1>
          <p style={{
            color: '#94a3b8',
            fontSize: '0.9rem'
          }}>
            Secure access to system management
          </p>
        </div>

        {error && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#991b1b',
            color: '#fecaca',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            border: '1px solid #dc2626',
            fontSize: '0.9rem'
          }}>
            {error}
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
              color: '#e2e8f0',
              marginBottom: '0.5rem',
            }}>Administrator Email</label>
            <div style={{
              position: 'relative' as const,
            }}>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@sriexpress.com"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #475569',
                  backgroundColor: '#334155',
                  color: '#f1f5f9',
                  fontSize: '1rem',
                  boxSizing: 'border-box' as const,
                  outline: 'none'
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
              color: '#e2e8f0',
              marginBottom: '0.5rem',
            }}>Password</label>
            <div style={{
              position: 'relative' as const,
            }}>
              <span style={{
                position: 'absolute' as const,
                left: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}><KeyIcon width={20} height={20} /></span>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem 0.875rem 3rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #475569',
                  backgroundColor: '#334155',
                  color: '#f1f5f9',
                  fontSize: '1rem',
                  boxSizing: 'border-box' as const,
                  outline: 'none'
                }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                style={{
                  position: 'absolute' as const,
                  right: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer' as const,
                  color: '#94a3b8',
                }}
              >
                {showPassword ? <EyeSlashIcon width={20} height={20} /> : <EyeIcon width={20} height={20} />}
              </button>
            </div>
          </div>

          {mfaRequired && (
            <div style={{
              marginBottom: '1.5rem',
            }}>
              <label htmlFor="mfaCode" style={{
                display: 'block' as const,
                fontSize: '0.875rem',
                fontWeight: '600' as const,
                color: '#e2e8f0',
                marginBottom: '0.5rem',
              }}>MFA Code</label>
              <input
                id="mfaCode"
                name="mfaCode"
                type="text"
                required={mfaRequired}
                value={formData.mfaCode}
                onChange={handleChange}
                placeholder="123456"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #475569',
                  backgroundColor: '#334155',
                  color: '#f1f5f9',
                  fontSize: '1rem',
                  boxSizing: 'border-box' as const,
                  outline: 'none',
                  textAlign: 'center' as const,
                  letterSpacing: '0.2em'
                }}
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            style={{
              width: '100%',
              backgroundColor: '#dc2626',
              color: 'white',
              fontWeight: '700' as const,
              padding: '0.875rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer' as const,
              fontSize: '1rem',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'Authenticating...' : 'Access System'}
          </button>
        </form>

        <div style={{
          textAlign: 'center' as const,
          marginTop: '2rem',
          fontSize: '0.8rem',
          color: '#64748b'
        }}>
          <p>
            Restricted access • System administrators only
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            All actions are logged and monitored
          </p>
        </div>
      </div>
    </div>
  );
}
