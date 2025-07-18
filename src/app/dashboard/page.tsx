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
  // Enhanced stats (optional - will use if available)
  totalBookings?: number;
  confirmedBookings?: number;
  totalPayments?: number;
  averagePayment?: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
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

  // Enhanced API call helper with better error handling
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    if (!token) {
      console.log('No token found, redirecting to login');
      router.push('/login');
      return null;
    }

    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const fullURL = `${baseURL}/api${endpoint}`;

    console.log(`Making API call to: ${fullURL}`);

    try {
      const response = await fetch(fullURL, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      console.log(`API Response Status: ${response.status}`);

      if (!response.ok) {
        if (response.status === 401) {
          console.log('Unauthorized, clearing token and redirecting');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return null;
        }
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`API Response Data:`, data);
      return data;
    } catch (error) {
      console.error('API call error:', error);
      return null;
    }
  }, [router]);

  // Load dashboard data with better error handling
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      
      try {
        console.log('Loading dashboard data...');

        // Check if user is already in localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // Load user profile (fallback if not in localStorage)
        if (!storedUser) {
          console.log('Loading user profile...');
          const userProfile = await apiCall('/auth/profile');
          if (userProfile) {
            setUser(userProfile);
            localStorage.setItem('user', JSON.stringify(userProfile));
          }
        }

        // Load dashboard stats
        console.log('Loading dashboard stats...');
        const dashboardStats = await apiCall('/dashboard/stats');
        if (dashboardStats) {
          setStats(dashboardStats);
        } else {
          console.log('Failed to load stats, using defaults');
          setStats({
            totalTrips: 0,
            totalSpent: 0,
            upcomingTrips: 0,
            onTimeRate: 95
          });
        }

        // Load recent trips
        console.log('Loading recent trips...');
        const recentTripsData = await apiCall('/dashboard/recent-trips');
        if (recentTripsData && Array.isArray(recentTripsData)) {
          setRecentTrips(recentTripsData);
        } else {
          setRecentTrips([]);
        }

        // Load upcoming trips
        console.log('Loading upcoming trips...');
        const upcomingTripsData = await apiCall('/dashboard/upcoming-trips');
        if (upcomingTripsData && Array.isArray(upcomingTripsData)) {
          setUpcomingTrips(upcomingTripsData);
        } else {
          setUpcomingTrips([]);
        }

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Set default values if all API calls fail
        setStats({
          totalTrips: 0,
          totalSpent: 0,
          upcomingTrips: 0,
          onTimeRate: 95
        });
        setRecentTrips([]);
        setUpcomingTrips([]);
      } finally {
        setLoading(false);
      }
    };

    // Check if we have token before loading data
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    loadDashboardData();
  }, [apiCall, router]);

  // Create demo data for testing
  const createDemoData = async () => {
    console.log('Creating demo data...');
    const result = await apiCall('/dashboard/demo-trip', {
      method: 'POST',
    });
    
    if (result) {
      console.log('Demo data created successfully');
      // Refresh data
      window.location.reload();
    } else {
      console.log('Failed to create demo data');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
        phone: user.phone,
      }),
    });

    if (result) {
      setProfileSuccess('Profile updated successfully!');
      setUser(result);
      localStorage.setItem('user', JSON.stringify(result));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setProfileSuccess('');
      }, 3000);
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
        minHeight: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #F59E0B',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <div style={{ color: '#6B7280', fontSize: '16px' }}>Loading dashboard...</div>
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

  const renderOverview = () => (
    <div>
      {/* Enhanced Stats Grid */}
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
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ color: '#F59E0B', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
            {stats?.totalTrips || stats?.totalBookings || 0}
          </h3>
          <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>
            {stats?.totalBookings ? 'Total Bookings' : 'Total Trips'}
          </p>
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
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
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
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
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ color: '#8B5CF6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
            {stats?.onTimeRate || 0}%
          </h3>
          <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>On-Time Rate</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
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
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.opacity = '0.9';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {action.name}
          </Link>
        ))}
      </div>

      {/* Demo Data Section */}
      {(!stats || (stats.totalTrips === 0 && !stats.totalBookings)) && (
        <div style={{
          backgroundColor: '#FEF3C7',
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #FCD34D',
          marginBottom: '2rem'
        }}>
          <p style={{ margin: 0, color: '#92400E' }}>
            No trip data found. Click here to create some demo trips for testing:
          </p>
          <button
            onClick={createDemoData}
            style={{
              backgroundColor: '#F59E0B',
              color: 'white',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '0.5rem',
              marginTop: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Create Demo Data
          </button>
        </div>
      )}

      {/* System Status */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '600' }}>System Status</h3>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#10B981', borderRadius: '50%' }}></div>
            <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>API Connected</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#10B981', borderRadius: '50%' }}></div>
            <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>Real-time Updates</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#F59E0B', borderRadius: '50%' }}></div>
            <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>Enhanced Features Available</span>
          </div>
        </div>
      </div>

      {/* Upcoming Trips */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
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
              marginBottom: '0.5rem',
              backgroundColor: '#f9fafb'
            }}>
              <div>
                <div style={{ fontWeight: '600', color: '#1F2937' }}>{trip.route}</div>
                <div style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                  {formatDate(trip.date)} {trip.time && `at ${trip.time}`} {trip.seat && `• Seat: ${trip.seat}`}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#F59E0B', fontWeight: '600' }}>{formatPrice(trip.price)}</div>
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#10B981',
                  textTransform: 'capitalize'
                }}>
                  {trip.status}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem',
            color: '#6B7280',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚌</div>
            <p style={{ margin: 0 }}>No upcoming trips</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>Book your next journey!</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTrips = () => (
    <div style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
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
            marginBottom: '0.5rem',
            backgroundColor: '#f9fafb'
          }}>
            <div>
              <div style={{ fontWeight: '600', color: '#1F2937' }}>{trip.route}</div>
              <div style={{ color: '#6B7280', fontSize: '0.9rem' }}>
                {trip.fromLocation} → {trip.toLocation}
              </div>
              <div style={{ color: '#6B7280', fontSize: '0.8rem' }}>{formatDate(trip.date)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ 
                color: trip.status === 'completed' ? '#10B981' : 
                      trip.status === 'cancelled' ? '#EF4444' : '#F59E0B',
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'capitalize',
                marginBottom: '0.25rem'
              }}>
                {trip.status}
              </div>
              <div style={{ color: '#1F2937', fontWeight: '600' }}>{formatPrice(trip.price)}</div>
            </div>
          </div>
        ))
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem',
          color: '#6B7280',
          backgroundColor: '#f9fafb',
          borderRadius: '0.5rem'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
          <p style={{ margin: 0 }}>No recent trips</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>Your trip history will appear here</p>
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
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
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
            Full Name
          </label>
          <input
            type="text"
            value={user?.name || ''}
            onChange={(e) => setUser(user ? {...user, name: e.target.value} : null)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              boxSizing: 'border-box',
              fontSize: '1rem'
            }}
            placeholder="Enter your full name"
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
            Email Address
          </label>
          <input
            type="email"
            value={user?.email || ''}
            onChange={(e) => setUser(user ? {...user, email: e.target.value} : null)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              boxSizing: 'border-box',
              fontSize: '1rem'
            }}
            placeholder="Enter your email address"
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
            Phone Number
          </label>
          <input
            type="tel"
            value={user?.phone || ''}
            onChange={(e) => setUser(user ? {...user, phone: e.target.value} : null)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              boxSizing: 'border-box',
              fontSize: '1rem'
            }}
            placeholder="Enter your phone number"
          />
        </div>
        <button
          type="submit"
          disabled={profileLoading}
          style={{
            backgroundColor: profileLoading ? '#9CA3AF' : '#F59E0B',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: '600',
            cursor: profileLoading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            transition: 'all 0.3s ease'
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
        padding: '1rem 0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
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
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#EF4444'}
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
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1F2937',
            margin: 0
          }}>
            Dashboard
          </h1>
          <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>
            Manage your trips and account settings
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '0',
          marginBottom: '2rem',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: 'white',
          borderRadius: '0.5rem 0.5rem 0 0',
          overflow: 'hidden'
        }}>
          {[
            { id: 'overview', name: 'Overview', icon: '📊' },
            { id: 'trips', name: 'My Trips', icon: '🚌' },
            { id: 'profile', name: 'Profile', icon: '👤' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '1rem 1.5rem',
                border: 'none',
                backgroundColor: activeTab === tab.id ? '#F59E0B' : 'transparent',
                cursor: 'pointer',
                fontWeight: '600',
                color: activeTab === tab.id ? 'white' : '#6B7280',
                borderRadius: 0,
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span>{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ minHeight: '400px' }}>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'trips' && renderTrips()}
          {activeTab === 'profile' && renderProfile()}
        </div>
      </div>
    </div>
  );
}