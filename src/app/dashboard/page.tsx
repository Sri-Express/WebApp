"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Trip {
  _id: string;
  route: string;
  fromLocation: string;
  toLocation: string;
  date: string;
  time?: string;
  seat?: string;
  price: number;
  status: 'upcoming' | 'completed' | 'cancelled';
}

interface DashboardStats {
  totalTrips: number;
  totalSpent: number;
  upcomingTrips: number;
  onTimeRate: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Get auth token
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // API call helper - wrapped in useCallback to fix dependency warning
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return null;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
          return null;
        }
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call error:', error);
      return null;
    }
  }, [router]);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      
      try {
        // Load user profile
        const userProfile = await apiCall('/auth/profile');
        if (userProfile) {
          setUser(userProfile);
        }

        // Load dashboard stats
        const dashboardStats = await apiCall('/dashboard/stats');
        if (dashboardStats) {
          setStats(dashboardStats);
        }

        // Load recent trips
        const recentTripsData = await apiCall('/dashboard/recent-trips');
        if (recentTripsData) {
          setRecentTrips(recentTripsData);
        }

        // Load upcoming trips
        const upcomingTripsData = await apiCall('/dashboard/upcoming-trips');
        if (upcomingTripsData) {
          setUpcomingTrips(upcomingTripsData);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [apiCall]);

  // Create demo data for testing
  const createDemoData = async () => {
    const result = await apiCall('/dashboard/demo-trip', {
      method: 'POST',
    });
    
    if (result) {
      // Refresh data
      window.location.reload();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    const result = await apiCall('/dashboard/profile', {
      method: 'PUT',
      body: JSON.stringify({
        name: user.name,
        email: user.email,
      }),
    });

    if (result) {
      setProfileSuccess('Profile updated successfully!');
      setUser(result);
    } else {
      setProfileError('Failed to update profile');
    }

    setProfileLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  const quickActions = [
    { name: 'Book Ticket', href: '/book', color: '#F59E0B' },
    { name: 'Track Bus', href: '/track', color: '#10B981' },
    { name: 'View Routes', href: '/routes', color: '#3B82F6' },
    { name: 'Payment History', href: '/payments', color: '#8B5CF6' }
  ];

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

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
          <h3 style={{ color: '#F59E0B', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
            {stats?.totalTrips || 0}
          </h3>
          <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>Total Trips</p>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ color: '#10B981', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
            {formatPrice(stats?.totalSpent || 0)}
          </h3>
          <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>Total Spent</p>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ color: '#3B82F6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
            {stats?.upcomingTrips || 0}
          </h3>
          <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>Upcoming Trips</p>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ color: '#8B5CF6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
            {stats?.onTimeRate || 0}%
          </h3>
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

      {/* Demo Data Button */}
      {(!stats || stats.totalTrips === 0) && (
        <div style={{
          backgroundColor: '#FEF3C7',
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #FCD34D',
          marginBottom: '2rem'
        }}>
          <p style={{ margin: 0, color: '#92400E' }}>
            No trip data found. 
            <button
              onClick={createDemoData}
              style={{
                backgroundColor: '#F59E0B',
                color: 'white',
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '0.5rem',
                marginLeft: '1rem',
                cursor: 'pointer'
              }}
            >
              Create Demo Data
            </button>
          </p>
        </div>
      )}

      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '600' }}>Upcoming Trips</h3>
        {upcomingTrips.length > 0 ? (
          upcomingTrips.map(trip => (
            <div key={trip._id} style={{
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
                  {formatDate(trip.date)} {trip.time && `at ${trip.time}`} {trip.seat && `• Seat: ${trip.seat}`}
                </div>
              </div>
              <div style={{ color: '#F59E0B', fontWeight: '600' }}>{formatPrice(trip.price)}</div>
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
      {recentTrips.length > 0 ? (
        recentTrips.map(trip => (
          <div key={trip._id} style={{
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
              <div style={{ color: '#6B7280', fontSize: '0.9rem' }}>{formatDate(trip.date)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ 
                color: trip.status === 'completed' ? '#10B981' : 
                      trip.status === 'cancelled' ? '#EF4444' : '#F59E0B',
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'capitalize'
              }}>
                {trip.status}
              </div>
              <div style={{ color: '#1F2937', fontWeight: '600' }}>{formatPrice(trip.price)}</div>
            </div>
          </div>
        ))
      ) : (
        <p style={{ color: '#6B7280' }}>No recent trips</p>
      )}
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
      
      {profileError && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fee2e2',
          color: '#b91c1c',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          border: '1px solid #fecaca',
        }}>
          {profileError}
        </div>
      )}

      {profileSuccess && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#d1fae5',
          color: '#065f46',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          border: '1px solid #a7f3d0',
        }}>
          {profileSuccess}
        </div>
      )}

      <form onSubmit={handleProfileUpdate}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Name</label>
          <input
            type="text"
            value={user?.name || ''}
            onChange={(e) => setUser(user ? {...user, name: e.target.value} : null)}
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
            value={user?.email || ''}
            onChange={(e) => setUser(user ? {...user, email: e.target.value} : null)}
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
          disabled={profileLoading}
          style={{
            backgroundColor: '#F59E0B',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: '600',
            cursor: 'pointer',
            opacity: profileLoading ? 0.7 : 1
          }}
        >
          {profileLoading ? 'Updating...' : 'Update Profile'}
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
            <span style={{ color: '#6B7280' }}>Welcome, {user?.name || 'User'}</span>
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
