// src/app/dashboard/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState({ name: 'John Doe', email: 'john@example.com' });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const recentTrips = [
    { id: 1, route: 'Colombo - Kandy', date: '2025-01-10', status: 'Completed', price: 'Rs. 450' },
    { id: 2, route: 'Kandy - Galle', date: '2025-01-08', status: 'Completed', price: 'Rs. 650' },
    { id: 3, route: 'Colombo - Jaffna', date: '2025-01-05', status: 'Cancelled', price: 'Rs. 850' }
  ];

  const upcomingTrips = [
    { id: 1, route: 'Colombo - Kandy', date: '2025-01-15', time: '08:30 AM', seat: 'A12', price: 'Rs. 450' },
    { id: 2, route: 'Galle - Colombo', date: '2025-01-18', time: '02:15 PM', seat: 'B08', price: 'Rs. 550' }
  ];

  const quickActions = [
    { name: 'Book Ticket', href: '/book', color: '#F59E0B' },
    { name: 'Track Bus', href: '/track', color: '#10B981' },
    { name: 'View Routes', href: '/routes', color: '#3B82F6' },
    { name: 'Payment History', href: '/payments', color: '#8B5CF6' }
  ];

  const renderOverview = () => (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ color: '#F59E0B', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>12</h3>
          <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>Total Trips</p>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ color: '#10B981', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Rs. 6,450</h3>
          <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>Total Spent</p>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ color: '#3B82F6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>2</h3>
          <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>Upcoming Trips</p>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ color: '#8B5CF6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>95%</h3>
          <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>On-Time Rate</p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {quickActions.map(action => (
          <Link
            key={action.name}
            href={action.href}
            style={{
              backgroundColor: action.color,
              color: 'white',
              padding: '1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: '600',
              transition: 'opacity 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            {action.name}
          </Link>
        ))}
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '600' }}>Upcoming Trips</h3>
        {upcomingTrips.length > 0 ? (
          upcomingTrips.map(trip => (
            <div key={trip.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              border: '1px solid #f3f4f6',
              borderRadius: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <div>
                <div style={{ fontWeight: '600', color: '#1F2937' }}>{trip.route}</div>
                <div style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                  {trip.date} at {trip.time} • Seat: {trip.seat}
                </div>
              </div>
              <div style={{ color: '#F59E0B', fontWeight: '600' }}>{trip.price}</div>
            </div>
          ))
        ) : (
          <p style={{ color: '#6B7280' }}>No upcoming trips</p>
        )}
      </div>
    </div>
  );

  const renderTrips = () => (
    <div style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '600' }}>Recent Trips</h3>
      {recentTrips.map(trip => (
        <div key={trip.id} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
          border: '1px solid #f3f4f6',
          borderRadius: '0.5rem',
          marginBottom: '0.5rem'
        }}>
          <div>
            <div style={{ fontWeight: '600', color: '#1F2937' }}>{trip.route}</div>
            <div style={{ color: '#6B7280', fontSize: '0.9rem' }}>{trip.date}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              color: trip.status === 'Completed' ? '#10B981' : '#EF4444',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}>
              {trip.status}
            </div>
            <div style={{ color: '#1F2937', fontWeight: '600' }}>{trip.price}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderProfile = () => (
    <div style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb'
    }}>
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: '600' }}>Profile Information</h3>
      <form>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Name</label>
          <input
            type="text"
            value={user.name}
            onChange={(e) => setUser({...user, name: e.target.value})}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Email</label>
          <input
            type="email"
            value={user.email}
            onChange={(e) => setUser({...user, email: e.target.value})}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            backgroundColor: '#F59E0B',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Update Profile
        </button>
      </form>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Navigation */}
      <nav style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}>
            <span style={{ color: '#F59E0B' }}>ශ්‍රී</span>
            <span style={{ color: '#1F2937' }}>Express</span>
          </Link>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ color: '#6B7280' }}>Welcome, {user.name}</span>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: '#EF4444',
                color: 'white',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1.5rem'
      }}>
        {/* Header */}
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#1F2937',
          marginBottom: '2rem'
        }}>
          Dashboard
        </h1>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          {[
            { id: 'overview', name: 'Overview' },
            { id: 'trips', name: 'My Trips' },
            { id: 'profile', name: 'Profile' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '1rem',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontWeight: '600',
                color: activeTab === tab.id ? '#F59E0B' : '#6B7280',
                borderBottom: activeTab === tab.id ? '2px solid #F59E0B' : '2px solid transparent'
              }}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'trips' && renderTrips()}
        {activeTab === 'profile' && renderProfile()}
      </div>
    </div>
  );
}