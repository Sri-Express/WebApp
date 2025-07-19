// src/app/dashboard/page.tsx - ENHANCED PRODUCTION VERSION
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

// Flexible Booking interface to handle various possible structures
interface Booking {
  _id?: string;
  id?: string;
  bookingId?: string;
  routeId?: string;
  travelDate?: string;
  date?: string; // fallback for travelDate
  departureTime?: string;
  passengerInfo?: {
    name: string;
  };
  passenger?: { // fallback for passengerInfo
    name: string;
  };
  pricing?: {
    totalAmount: number;
  };
  amount?: { // fallback for pricing
    total: number;
  };
  price?: number; // fallback for amount
  status?: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no_show' | string; // allow string for unknown statuses
  qrCode?: string;
}


// Flexible Payment interface to handle various possible structures
interface Payment {
  _id?: string;
  id?: string;
  paymentId?: string;
  amount?: {
    total: number;
    currency: string;
  };
  total?: number;
  currency?: string;
  status?: string;
  createdAt?: string;
  date?: string;
}


interface DashboardStats {
  totalTrips: number;
  totalSpent: number;
  upcomingTrips: number;
  onTimeRate: number;
  totalBookings?: number;
  confirmedBookings?: number;
  totalPayments?: number;
  averagePayment?: number;
  recentActivity?: number;
  favoriteRoutes?: string[];
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

export default function EnhancedDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [upcomingTrips, setUpcomingTrips] = useState<Trip[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  
  // UI states
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [apiErrors, setApiErrors] = useState<string[]>([]);

  const getToken = () => localStorage.getItem('token');

  // Enhanced API call helper with better error handling
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    if (!token) {
      console.log('No token found, redirecting to login');
      router.push('/login');
      return null;
    }

    let baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    if (baseURL.endsWith('/api')) baseURL = baseURL.slice(0, -4);
    
    const fullURL = `${baseURL}/api${endpoint}`;
    console.log(`Making API call to: ${fullURL}`);

    try {
      const response = await fetch(fullURL, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers
        }
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
      console.log(`API Response Data for ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`API call error for ${endpoint}:`, error);
      setApiErrors(prev => [...prev, `Failed to load ${endpoint}`]);
      return null;
    }
  }, [router]);

  const loadDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setApiErrors([]);
  
    try {
      console.log('🔄 Loading comprehensive dashboard data...');
  
      // Load user profile if not cached
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        console.log('👤 Loading user profile...');
        const userProfile = await apiCall('/auth/profile');
        if (userProfile) {
          setUser(userProfile);
          localStorage.setItem('user', JSON.stringify(userProfile));
        }
      }
  
      // Load dashboard stats
      console.log('📊 Loading dashboard stats...');
      const dashboardStats = await apiCall('/dashboard/stats');
      if (dashboardStats) {
        setStats(dashboardStats);
      }
  
      // Load trip data
      console.log('🚌 Loading trips data...');
      const [recentTripsData, upcomingTripsData] = await Promise.all([
        apiCall('/dashboard/recent-trips'),
        apiCall('/dashboard/upcoming-trips')
      ]);
  
      if (recentTripsData && Array.isArray(recentTripsData)) {
        setRecentTrips(recentTripsData);
      }
      if (upcomingTripsData && Array.isArray(upcomingTripsData)) {
        setUpcomingTrips(upcomingTripsData);
      }
  
      // Load booking data - FIXED VERSION
      console.log('🎫 Loading bookings data...');
      const bookingsResponse = await apiCall('/bookings?limit=5');
      console.log('🎫 Raw bookings response:', bookingsResponse);

      if (bookingsResponse) {
        let bookingsArray = [];
        
        // Handle different response formats
        if (Array.isArray(bookingsResponse)) {
          // Direct array response
          bookingsArray = bookingsResponse;
          console.log('🎫 Using direct array format');
        } else if (bookingsResponse.data && Array.isArray(bookingsResponse.data)) {
          // Response with data property
          bookingsArray = bookingsResponse.data;
          console.log('🎫 Using response.data format');
        } else if (bookingsResponse.bookings && Array.isArray(bookingsResponse.bookings)) {
          // Response with bookings property
          bookingsArray = bookingsResponse.bookings;
          console.log('🎫 Using response.bookings format');
        } else if (bookingsResponse.success && bookingsResponse.data) {
          // Success response format
          bookingsArray = Array.isArray(bookingsResponse.data) ? bookingsResponse.data : [];
          console.log('🎫 Using success.data format');
        } else if (typeof bookingsResponse === 'object' && !Array.isArray(bookingsResponse)) {
          // If it's an object but not an array, try to extract booking data
          console.log('🎫 Response is object, checking properties:', Object.keys(bookingsResponse));
          
          // Try common property names
          const possibleArrays = ['data', 'bookings', 'history', 'results', 'items'];
          for (const prop of possibleArrays) {
            if (bookingsResponse[prop] && Array.isArray(bookingsResponse[prop])) {
              bookingsArray = bookingsResponse[prop];
              console.log(`🎫 Found bookings in response.${prop}`);
              break;
            }
          }
        }
        
        console.log('🎫 Final bookings array:', bookingsArray);
        console.log('🎫 Bookings array length:', bookingsArray.length);
        
        // Validate booking objects before setting
        const validBookings = bookingsArray.filter(booking => {
          return booking && 
                 typeof booking === 'object' && 
                 (booking._id || booking.id || booking.bookingId);
        });
        
        console.log('🎫 Valid bookings:', validBookings.length);
        setRecentBookings(validBookings);
      } else {
        console.log('🎫 No bookings response received');
        setRecentBookings([]);
      }
  
      // Load payment data - FIXED VERSION
      console.log('💳 Loading payments data...');
      const paymentsResponse = await apiCall('/payments/history?limit=5');
      console.log('💳 Raw payments response:', paymentsResponse);
      
      if (paymentsResponse) {
        let paymentsArray = [];
        
        // Handle different response formats
        if (Array.isArray(paymentsResponse)) {
          // Direct array response
          paymentsArray = paymentsResponse;
          console.log('💳 Using direct array format');
        } else if (paymentsResponse.data && Array.isArray(paymentsResponse.data)) {
          // Response with data property
          paymentsArray = paymentsResponse.data;
          console.log('💳 Using response.data format');
        } else if (paymentsResponse.payments && Array.isArray(paymentsResponse.payments)) {
          // Response with payments property
          paymentsArray = paymentsResponse.payments;
          console.log('💳 Using response.payments format');
        } else if (paymentsResponse.success && paymentsResponse.data) {
          // Success response format
          paymentsArray = Array.isArray(paymentsResponse.data) ? paymentsResponse.data : [];
          console.log('💳 Using success.data format');
        } else if (typeof paymentsResponse === 'object' && !Array.isArray(paymentsResponse)) {
          // If it's an object but not an array, try to extract payment data
          console.log('💳 Response is object, checking properties:', Object.keys(paymentsResponse));
          
          // Try common property names
          const possibleArrays = ['data', 'payments', 'history', 'results', 'items'];
          for (const prop of possibleArrays) {
            if (paymentsResponse[prop] && Array.isArray(paymentsResponse[prop])) {
              paymentsArray = paymentsResponse[prop];
              console.log(`💳 Found payments in response.${prop}`);
              break;
            }
          }
        }
        
        console.log('💳 Final payments array:', paymentsArray);
        console.log('💳 Payments array length:', paymentsArray.length);
        
        // Validate payment objects before setting
        const validPayments = paymentsArray.filter(payment => {
          return payment && 
                 typeof payment === 'object' && 
                 (payment._id || payment.id || payment.paymentId);
        });
        
        console.log('💳 Valid payments:', validPayments.length);
        setRecentPayments(validPayments);
      } else {
        console.log('💳 No payments response received');
        setRecentPayments([]);
      }
  
      setLastRefresh(new Date());
    } catch (error) {
      console.error('💥 Error loading dashboard data:', error);
      setApiErrors(prev => [...prev, 'Failed to load dashboard data']);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [apiCall]);

  // Initial data load
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    loadDashboardData();
  }, [loadDashboardData, router]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [loadDashboardData]);

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
        phone: user.phone
      })
    });

    if (result) {
      setProfileSuccess('Profile updated successfully!');
      setUser(result);
      localStorage.setItem('user', JSON.stringify(result));
      setTimeout(() => setProfileSuccess(''), 3000);
    } else {
      setProfileError('Failed to update profile');
    }

    setProfileLoading(false);
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  const formatDateTime = (dateString: string) => new Date(dateString).toLocaleString();
  const formatPrice = (price: number) => `Rs. ${price.toLocaleString()}`;

  const quickActions = [
    { name: 'Search Routes', href: '/search', color: '#F59E0B', icon: '🔍' },
    { name: 'My Bookings', href: '/bookings', color: '#10B981', icon: '🎫' },
    { name: 'Track Vehicle', href: '/track', color: '#3B82F6', icon: '📍' },
    { name: 'Payment History', href: '/payments', color: '#8B5CF6', icon: '💳' }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #F59E0B', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <div style={{ color: '#6B7280', fontSize: '16px' }}>Loading dashboard...</div>
        </div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const renderOverview = () => (
    <div>
      {/* API Errors */}
      {apiErrors.length > 0 && (
        <div style={{ backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid #fecaca' }}>
          <h4 style={{ color: '#b91c1c', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Connection Issues:</h4>
          {apiErrors.map((error, index) => (
            <div key={index} style={{ color: '#b91c1c', fontSize: '0.8rem' }}>• {error}</div>
          ))}
        </div>
      )}

      {/* Refresh Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>
          Last updated: {formatDateTime(lastRefresh.toString())}
        </div>
        <button 
          onClick={() => loadDashboardData(true)} 
          disabled={refreshing}
          style={{ 
            backgroundColor: refreshing ? '#9CA3AF' : '#F59E0B', 
            color: 'white', 
            padding: '0.5rem 1rem', 
            border: 'none', 
            borderRadius: '0.5rem', 
            cursor: refreshing ? 'not-allowed' : 'pointer',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Enhanced Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🎫</span>
            <h3 style={{ color: '#F59E0B', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
              {stats?.totalBookings || stats?.totalTrips || 0}
            </h3>
          </div>
          <p style={{ color: '#6B7280', margin: 0 }}>Total Bookings</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>💰</span>
            <h3 style={{ color: '#10B981', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
              {formatPrice(stats?.totalSpent || 0)}
            </h3>
          </div>
          <p style={{ color: '#6B7280', margin: 0 }}>Total Spent</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🚌</span>
            <h3 style={{ color: '#3B82F6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
              {stats?.upcomingTrips || 0}
            </h3>
          </div>
          <p style={{ color: '#6B7280', margin: 0 }}>Upcoming Trips</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>⏰</span>
            <h3 style={{ color: '#8B5CF6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
              {stats?.onTimeRate || 0}%
            </h3>
          </div>
          <p style={{ color: '#6B7280', margin: 0 }}>On-Time Rate</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
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
              boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
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
            <span style={{ fontSize: '1.5rem' }}>{action.icon}</span>
            {action.name}
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {/* Recent Bookings - SAFE RENDERING VERSION */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '600' }}>Recent Bookings</h3>
          
          {/* Debug info for development */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ backgroundColor: '#f3f4f6', padding: '0.5rem', borderRadius: '0.25rem', marginBottom: '1rem', fontSize: '0.75rem', color: '#6B7280' }}>
              Debug: {recentBookings.length} bookings | Type: {typeof recentBookings} | IsArray: {Array.isArray(recentBookings).toString()}
            </div>
          )}
          
          {Array.isArray(recentBookings) && recentBookings.length > 0 ? (
            recentBookings.slice(0, 3).map((booking, index) => {
              // Safe extraction of booking data
              const bookingId = booking?.bookingId || booking?._id || booking?.id || `booking-${index}`;
              const amount = booking?.pricing?.totalAmount || booking?.amount?.total || booking?.price || 0;
              const status = booking?.status || 'unknown';
              const travelDate = booking?.travelDate || booking?.date || new Date().toISOString();
              const passengerName = booking?.passengerInfo?.name || booking?.passenger?.name || 'Unknown';
              
              return (
                <div key={bookingId as string} style={{ padding: '0.75rem', border: '1px solid #f3f4f6', borderRadius: '0.5rem', marginBottom: '0.5rem', backgroundColor: '#f9fafb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1F2937', fontSize: '0.9rem' }}>
                        Booking #{typeof bookingId === 'string' ? bookingId.slice(-8) : bookingId}
                      </div>
                      <div style={{ color: '#6B7280', fontSize: '0.8rem' }}>
                        {formatDate(travelDate)} • {passengerName}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#F59E0B', fontWeight: '600', fontSize: '0.9rem' }}>
                        {formatPrice(amount)}
                      </div>
                      <div style={{ 
                        fontSize: '0.7rem', 
                        color: status === 'confirmed' ? '#10B981' : '#6B7280', 
                        textTransform: 'capitalize' 
                      }}>
                        {status}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#6B7280', fontSize: '0.9rem' }}>
              {apiErrors.some(error => error.includes('booking')) ? (
                <div style={{ color: '#EF4444' }}>⚠️ Error loading bookings</div>
              ) : (
                <>
                  <div>🎫 No recent bookings</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    Bookings will appear here after making reservations
                  </div>
                </>
              )}
            </div>
          )}
          
          {Array.isArray(recentBookings) && recentBookings.length > 0 && (
            <Link href="/bookings" style={{ color: '#F59E0B', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>
              View all bookings →
            </Link>
          )}
        </div>

        {/* Recent Payments - SAFE RENDERING VERSION */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '600' }}>Recent Payments</h3>
          
          {/* Debug info for development */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ backgroundColor: '#f3f4f6', padding: '0.5rem', borderRadius: '0.25rem', marginBottom: '1rem', fontSize: '0.75rem', color: '#6B7280' }}>
              Debug: {recentPayments.length} payments | Type: {typeof recentPayments} | IsArray: {Array.isArray(recentPayments).toString()}
            </div>
          )}
          
          {Array.isArray(recentPayments) && recentPayments.length > 0 ? (
            recentPayments.slice(0, 3).map((payment, index) => {
              // Safe extraction of payment data
              const paymentId = payment?.paymentId || payment?._id || payment?.id || `payment-${index}`;
              const amount = payment?.amount?.total || payment?.total || 0;
              const currency = payment?.amount?.currency || payment?.currency || 'LKR';
              const status = payment?.status || 'unknown';
              const createdAt = payment?.createdAt || payment?.date || new Date().toISOString();
              
              return (
                <div key={paymentId as string} style={{ padding: '0.75rem', border: '1px solid #f3f4f6', borderRadius: '0.5rem', marginBottom: '0.5rem', backgroundColor: '#f9fafb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#1F2937', fontSize: '0.9rem' }}>
                        Payment #{typeof paymentId === 'string' ? paymentId.slice(-8) : paymentId}
                      </div>
                      <div style={{ color: '#6B7280', fontSize: '0.8rem' }}>
                        {formatDate(createdAt)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#10B981', fontWeight: '600', fontSize: '0.9rem' }}>
                        {formatPrice(amount)}
                      </div>
                      <div style={{ 
                        fontSize: '0.7rem', 
                        color: status === 'completed' ? '#10B981' : '#6B7280', 
                        textTransform: 'capitalize' 
                      }}>
                        {status}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#6B7280', fontSize: '0.9rem' }}>
              {apiErrors.some(error => error.includes('payment')) ? (
                <div style={{ color: '#EF4444' }}>⚠️ Error loading payments</div>
              ) : (
                <>
                  <div>💳 No recent payments</div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    Payments will appear here after booking trips
                  </div>
                </>
              )}
            </div>
          )}
          
          {Array.isArray(recentPayments) && recentPayments.length > 0 && (
            <Link href="/payments" style={{ color: '#F59E0B', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>
              View all payments →
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  const renderTrips = () => (
    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>My Trips</h3>
        <Link href="/bookings" style={{ color: '#F59E0B', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600' }}>
          View all bookings →
        </Link>
      </div>
      
      {/* Upcoming Trips */}
      {upcomingTrips.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ color: '#1F2937', fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Upcoming Trips</h4>
          {upcomingTrips.map(trip => (
            <div key={trip._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #f3f4f6', borderRadius: '0.5rem', marginBottom: '0.5rem', backgroundColor: '#f0f9ff' }}>
              <div>
                <div style={{ fontWeight: '600', color: '#1F2937' }}>{trip.route}</div>
                <div style={{ color: '#6B7280', fontSize: '0.9rem' }}>{trip.fromLocation} → {trip.toLocation}</div>
                <div style={{ color: '#6B7280', fontSize: '0.8rem' }}>{formatDate(trip.date)} {trip.time && `at ${trip.time}`} {trip.seat && `• Seat: ${trip.seat}`}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#F59E0B', fontWeight: '600' }}>{formatPrice(trip.price)}</div>
                <div style={{ fontSize: '0.8rem', color: '#3B82F6', textTransform: 'capitalize' }}>{trip.status}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Trips */}
      {recentTrips.length > 0 ? (
        <div>
          <h4 style={{ color: '#1F2937', fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Recent Trips</h4>
          {recentTrips.map(trip => (
            <div key={trip._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #f3f4f6', borderRadius: '0.5rem', marginBottom: '0.5rem', backgroundColor: '#f9fafb' }}>
              <div>
                <div style={{ fontWeight: '600', color: '#1F2937' }}>{trip.route}</div>
                <div style={{ color: '#6B7280', fontSize: '0.9rem' }}>{trip.fromLocation} → {trip.toLocation}</div>
                <div style={{ color: '#6B7280', fontSize: '0.8rem' }}>{formatDate(trip.date)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: trip.status === 'completed' ? '#10B981' : trip.status === 'cancelled' ? '#EF4444' : '#F59E0B', fontWeight: '600', fontSize: '0.9rem', textTransform: 'capitalize', marginBottom: '0.25rem' }}>{trip.status}</div>
                <div style={{ color: '#1F2937', fontWeight: '600' }}>{formatPrice(trip.price)}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6B7280', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚌</div>
          <p style={{ margin: 0 }}>No trips yet</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>Book your first journey!</p>
          <Link href="/search" style={{ display: 'inline-block', marginTop: '1rem', backgroundColor: '#F59E0B', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: '600' }}>
            Search Routes
          </Link>
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: '600' }}>Profile Information</h3>
      
      {profileError && (
        <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid #fecaca' }}>
          {profileError}
        </div>
      )}
      {profileSuccess && (
        <div style={{ padding: '1rem', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid #a7f3d0' }}>
          {profileSuccess}
        </div>
      )}

      <form onSubmit={handleProfileUpdate}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>Full Name</label>
          <input 
            type="text" 
            value={user?.name || ''} 
            onChange={(e) => setUser(user ? {...user, name: e.target.value} : null)} 
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box', fontSize: '1rem' }} 
            placeholder="Enter your full name" 
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>Email Address</label>
          <input 
            type="email" 
            value={user?.email || ''} 
            onChange={(e) => setUser(user ? {...user, email: e.target.value} : null)} 
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box', fontSize: '1rem' }} 
            placeholder="Enter your email address" 
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>Phone Number</label>
          <input 
            type="tel" 
            value={user?.phone || ''} 
            onChange={(e) => setUser(user ? {...user, phone: e.target.value} : null)} 
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', boxSizing: 'border-box', fontSize: '1rem' }} 
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
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem 0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
            <span style={{ color: '#F59E0B' }}>ශ්‍රී</span><span style={{ color: '#1F2937' }}>Express</span>
          </Link>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ color: '#6B7280' }}>Welcome, {user?.name || 'User'}</span>
            <button 
              onClick={handleLogout} 
              style={{ backgroundColor: '#EF4444', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease' }} 
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#DC2626'} 
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#EF4444'}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1F2937', margin: 0 }}>Dashboard</h1>
          <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>Manage your trips and account settings</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '2rem', borderBottom: '1px solid #e5e7eb', backgroundColor: 'white', borderRadius: '0.5rem 0.5rem 0 0', overflow: 'hidden' }}>
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
              onMouseOver={(e) => { if (activeTab !== tab.id) { e.currentTarget.style.backgroundColor = '#f9fafb'; } }} 
              onMouseOut={(e) => { if (activeTab !== tab.id) { e.currentTarget.style.backgroundColor = 'transparent'; } }}
            >
              <span>{tab.icon}</span>{tab.name}
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