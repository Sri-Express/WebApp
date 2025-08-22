// src/app/admin/page.tsx
"use client";

import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      window.location.href = 'https://admin.sriexpress.lk';
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleRedirect = () => {
    window.location.href = 'https://admin.sriexpress.lk';
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '0.5rem',
        border: '1px solid #e5e7eb',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '2rem'
        }}>
          <span style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#F59E0B' 
          }}>
            ශ්‍රී
          </span>
          <span style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#1F2937' 
          }}>
            Express Admin
          </span>
        </div>

        {/* Warning Icon */}
        <div style={{
          fontSize: '3rem',
          marginBottom: '1.5rem'
        }}>
          🔐
        </div>

        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#1F2937',
          marginBottom: '1rem'
        }}>
          Admin Portal Access
        </h1>

        <p style={{
          color: '#6B7280',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          You are being redirected to the admin portal. This area is restricted to 
          authorized personnel only.
        </p>

        {/* Redirect Notice */}
        <div style={{
          backgroundColor: '#FEF3C7',
          border: '1px solid #F59E0B',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '2rem'
        }}>
          <p style={{ color: '#92400E', fontSize: '0.9rem' }}>
            ⏱️ Automatic redirect in 5 seconds...
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleRedirect}
            style={{
              backgroundColor: '#F59E0B',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#D97706'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#F59E0B'}
          >
            Go to Admin Portal
          </button>

          <Link
            href="/admin/booking-diagnostic"
            style={{
              backgroundColor: '#8B5CF6',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'all 0.3s',
              display: 'inline-block'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#7C3AED';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#8B5CF6';
            }}
          >
            🔧 Booking Diagnostics
          </Link>

          <Link
            href="/"
            style={{
              backgroundColor: 'white',
              color: '#6B7280',
              padding: '0.75rem 1.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'all 0.3s',
              display: 'inline-block'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#9ca3af';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
          >
            Back to Main Site
          </Link>
        </div>

        {/* Security Notice */}
        <div style={{
          marginTop: '2rem',
          fontSize: '0.8rem',
          color: '#9CA3AF'
        }}>
          <p>
            This system is monitored. Unauthorized access attempts are logged 
            and may result in legal action.
          </p>
        </div>
      </div>
    </div>
  );
}