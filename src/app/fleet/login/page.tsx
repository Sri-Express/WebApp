// src/app/fleet/login/page.tsx - Clean Fleet Login Page
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FleetLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Store authentication data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Check if user has fleet management permissions
        const allowedRoles = ['fleet_manager', 'company_admin', 'system_admin'];
        if (!allowedRoles.includes(data.user.role)) {
          setError('Access denied. Fleet management permissions required.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return;
        }
        
        // Redirect to fleet dashboard
        router.push('/fleet/dashboard');
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Connection error. Please check your network connection and try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setError('');
    setFormData({ email: '', password: '' });
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
        maxWidth: '400px', 
        width: '100%',
        backgroundColor: '#1e293b',
        padding: '2rem',
        borderRadius: '0.75rem',
        border: '1px solid #334155',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#f59e0b',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '24px'
          }}>
            🚛
          </div>
          <h1 style={{ 
            color: '#f1f5f9',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            margin: '0 0 0.5rem 0'
          }}>
            Fleet Manager Login
          </h1>
          <p style={{ 
            color: '#94a3b8',
            fontSize: '0.875rem',
            margin: 0
          }}>
            Access your fleet management dashboard
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ 
            backgroundColor: '#7f1d1d',
            border: '1px solid #991b1b',
            color: '#fecaca',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <div onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block',
              color: '#f1f5f9',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.5rem'
            }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#334155',
                border: '1px solid #475569',
                borderRadius: '0.5rem',
                color: '#f1f5f9',
                fontSize: '0.875rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block',
              color: '#f1f5f9',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginBottom: '0.5rem'
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#334155',
                border: '1px solid #475569',
                borderRadius: '0.5rem',
                color: '#f1f5f9',
                fontSize: '0.875rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !formData.email || !formData.password}
            style={{
              width: '100%',
              backgroundColor: loading || !formData.email || !formData.password ? '#6b7280' : '#f59e0b',
              color: 'white',
              border: 'none',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: loading || !formData.email || !formData.password ? 'not-allowed' : 'pointer',
              marginBottom: '1rem',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Clear Storage Button */}
          <button
            onClick={clearStorage}
            type="button"
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              color: '#94a3b8',
              border: '1px solid #475569',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              cursor: 'pointer',
              marginBottom: '1rem'
            }}
          >
            Clear Stored Data
          </button>
        </div>

        {/* Footer Links */}
        <div style={{ 
          textAlign: 'center',
          paddingTop: '1.5rem',
          borderTop: '1px solid #334155'
        }}>
          <button
            onClick={() => router.push('/')}
            style={{
              backgroundColor: 'transparent',
              color: '#3b82f6',
              border: 'none',
              fontSize: '0.875rem',
              cursor: 'pointer',
              textDecoration: 'none'
            }}
          >
            ← Back to Main Site
          </button>
        </div>

        {/* Help Text */}
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#334155',
          borderRadius: '0.5rem',
          border: '1px solid #475569'
        }}>
          <h4 style={{ 
            color: '#f1f5f9',
            fontSize: '0.875rem',
            margin: '0 0 0.5rem 0'
          }}>
            Need Help?
          </h4>
          <p style={{ 
            color: '#94a3b8',
            fontSize: '0.75rem',
            margin: 0,
            lineHeight: '1.4'
          }}>
            Contact your system administrator if you don't have fleet management credentials or need access to the platform.
          </p>
        </div>
      </div>
    </div>
  );
}