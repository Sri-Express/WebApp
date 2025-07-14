// src/app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fffbeb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '500px' }}>
        {/* Large 404 */}
        <div style={{
          fontSize: 'clamp(4rem, 15vw, 8rem)',
          fontWeight: 'bold',
          color: '#F59E0B',
          lineHeight: '1',
          marginBottom: '1rem'
        }}>
          404
        </div>

        {/* Sri Express Logo */}
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

        {/* Error Message */}
        <h1 style={{
          fontSize: 'clamp(1.5rem, 5vw, 2rem)',
          fontWeight: 'bold',
          color: '#1F2937',
          marginBottom: '1rem'
        }}>
          Page Not Found
        </h1>

        <p style={{
          color: '#6B7280',
          fontSize: '1.1rem',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          Sorry, the page you&apos;re looking for doesn&apos;t exist. It might have been moved, 
          deleted, or you entered the wrong URL.
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '2rem'
        }}>
          <Link
            href="/"
            style={{
              backgroundColor: '#F59E0B',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#D97706'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#F59E0B'}
          >
            Go Home
          </Link>
          
          <Link
            href="/help"
            style={{
              backgroundColor: 'white',
              color: '#F59E0B',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600',
              border: '2px solid #F59E0B',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#F59E0B';
              e.currentTarget.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.color = '#F59E0B';
            }}
          >
            Get Help
          </Link>
        </div>

        {/* Quick Links */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid rgba(251, 191, 36, 0.3)'
        }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#1F2937',
            marginBottom: '1rem'
          }}>
            Popular Pages
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '0.75rem'
          }}>
            <Link
              href="/services"
              style={{
                color: '#6B7280',
                textDecoration: 'none',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                transition: 'color 0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#F59E0B'}
              onMouseOut={(e) => e.currentTarget.style.color = '#6B7280'}
            >
              Services
            </Link>
            
            <Link
              href="/about"
              style={{
                color: '#6B7280',
                textDecoration: 'none',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                transition: 'color 0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#F59E0B'}
              onMouseOut={(e) => e.currentTarget.style.color = '#6B7280'}
            >
              About Us
            </Link>
            
            <Link
              href="/contact"
              style={{
                color: '#6B7280',
                textDecoration: 'none',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                transition: 'color 0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#F59E0B'}
              onMouseOut={(e) => e.currentTarget.style.color = '#6B7280'}
            >
              Contact
            </Link>
            
            <Link
              href="/login"
              style={{
                color: '#6B7280',
                textDecoration: 'none',
                padding: '0.5rem',
                borderRadius: '0.25rem',
                transition: 'color 0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#F59E0B'}
              onMouseOut={(e) => e.currentTarget.style.color = '#6B7280'}
            >
              Login
            </Link>
          </div>
        </div>

        {/* Support Info */}
        <div style={{
          marginTop: '2rem',
          color: '#9CA3AF',
          fontSize: '0.9rem'
        }}>
          <p>
            Need immediate assistance? Call us at{' '}
            <a 
              href="tel:+94112345678"
              style={{ color: '#F59E0B', textDecoration: 'none' }}
            >
              +94 11 234 5678
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}