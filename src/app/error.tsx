// src/app/error.tsx
"use client";

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fffbeb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '0.5rem',
        border: '1px solid #fecaca',
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
            Express
          </span>
        </div>

        {/* Error Icon */}
        <div style={{
          fontSize: '4rem',
          marginBottom: '1.5rem'
        }}>
          ⚠️
        </div>

        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: 'bold',
          color: '#DC2626',
          marginBottom: '1rem'
        }}>
          Oops! Something went wrong
        </h1>

        <p style={{
          color: '#6B7280',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          We encountered an unexpected error. Our team has been notified and 
          is working to fix the issue. Please try again.
        </p>

        {/* Error Details (for development) */}
        {process.env.NODE_ENV === 'development' && (
          <details style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            <summary style={{
              cursor: 'pointer',
              fontWeight: '600',
              color: '#DC2626',
              marginBottom: '0.5rem'
            }}>
              Error Details (Development Mode)
            </summary>
            <code style={{
              fontSize: '0.8rem',
              color: '#7F1D1D',
              backgroundColor: '#FEF2F2',
              padding: '0.5rem',
              borderRadius: '0.25rem',
              display: 'block',
              whiteSpace: 'pre-wrap',
              overflow: 'auto'
            }}>
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </code>
          </details>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => reset()}
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
            Try Again
          </button>

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
            Go Home
          </Link>
        </div>

        {/* Help Section */}
        <div style={{
          backgroundColor: '#F0F9FF',
          border: '1px solid #0EA5E9',
          borderRadius: '0.5rem',
          padding: '1rem'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#0C4A6E',
            marginBottom: '0.5rem'
          }}>
            Need Help?
          </h3>
          <p style={{
            color: '#0C4A6E',
            fontSize: '0.9rem',
            marginBottom: '0.5rem'
          }}>
            If this problem persists, please contact our support team:
          </p>
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <a
              href="tel:+94112345678"
              style={{
                color: '#0EA5E9',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              📞 +94 11 234 5678
            </a>
            <Link
              href="/contact"
              style={{
                color: '#0EA5E9',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              💬 Contact Support
            </Link>
          </div>
        </div>

        {/* Error ID for tracking */}
        {error.digest && (
          <p style={{
            fontSize: '0.8rem',
            color: '#9CA3AF',
            marginTop: '1rem'
          }}>
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}