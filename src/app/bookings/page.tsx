// src/app/bookings/page.tsx - ENHANCED VERSION WITH LOCAL STORAGE FALLBACK
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/components/AnimatedBackground';
import { ShieldCheckIcon, TicketIcon, CheckCircleIcon, ClockIcon, XCircleIcon, QrCodeIcon, CalendarDaysIcon, CurrencyDollarIcon, UserIcon, DevicePhoneMobileIcon, AtSymbolIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

// --- Data Interfaces ---
interface Booking { 
  _id: string; 
  bookingId: string; 
  routeId: string; 
  routeName?: string; 
  travelDate: string; 
  departureTime: string; 
  passengerInfo: { 
    name: string; 
    phone: string; 
    email: string; 
    passengerType: string; 
  }; 
  seatInfo: { 
    seatNumber: string; 
    seatType: string; 
  }; 
  pricing: { 
    totalAmount: number; 
    currency: string; 
  }; 
  paymentInfo: { 
    method: string; 
    status: 'pending' | 'completed' | 'failed' | 'refunded'; 
    transactionId: string; 
  }; 
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no_show'; 
  qrCode?: string; 
  checkInInfo: { 
    checkedIn: boolean; 
    checkInTime?: string; 
  }; 
  createdAt: string; 
  updatedAt: string;
}

interface BookingStats { 
  totalBookings: number; 
  confirmedBookings: number; 
  completedBookings: number; 
  cancelledBookings: number; 
}

export default function BookingsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  
  // State Management
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // --- Theme and Style Definitions ---
  const lightTheme = { mainBg: '#fffbeb', bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)', glassPanelBg: 'rgba(255, 255, 255, 0.92)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)', textPrimary: '#1f2937', textSecondary: '#4B5563', textMuted: '#6B7280', quickActionBg: 'rgba(249, 250, 251, 0.8)', quickActionBorder: '1px solid rgba(209, 213, 219, 0.5)', alertBg: 'rgba(249, 250, 251, 0.6)' };
  const darkTheme = { mainBg: '#0f172a', bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)', glassPanelBg: 'rgba(30, 41, 59, 0.8)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)', textPrimary: '#f9fafb', textSecondary: '#9ca3af', textMuted: '#9ca3af', quickActionBg: 'rgba(51, 65, 85, 0.8)', quickActionBorder: '1px solid rgba(75, 85, 99, 0.5)', alertBg: 'rgba(51, 65, 85, 0.6)' };
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;
  const animationStyles = ` @keyframes road-marking { 0% { transform: translateX(-200%); } 100% { transform: translateX(500%); } } .animate-road-marking { animation: road-marking 10s linear infinite; } @keyframes car-right { 0% { transform: translateX(-100%); } 100% { transform: translateX(100vw); } } .animate-car-right { animation: car-right 15s linear infinite; } @keyframes car-left { 0% { transform: translateX(100vw) scaleX(-1); } 100% { transform: translateX(-200px) scaleX(-1); } } .animate-car-left { animation: car-left 16s linear infinite; } @keyframes light-blink { 0%, 100% { opacity: 1; box-shadow: 0 0 15px #fcd34d; } 50% { opacity: 0.6; box-shadow: 0 0 5px #fcd34d; } } .animate-light-blink { animation: light-blink 1s infinite; } @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; } @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; } @keyframes trainMove { from { left: 100%; } to { left: -300px; } } @keyframes slight-bounce { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-1px); } } .animate-slight-bounce { animation: slight-bounce 2s ease-in-out infinite; } @keyframes steam { 0% { opacity: 0.8; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-20px) scale(2.5); } } .animate-steam { animation: steam 2s ease-out infinite; } @keyframes wheels { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } } .animate-wheels { animation: wheels 2s linear infinite; } .animation-delay-100 { animation-delay: 0.1s; } .animation-delay-200 { animation-delay: 0.2s; } .animation-delay-300 { animation-delay: 0.3s; } .animation-delay-400 { animation-delay: 0.4s; } .animation-delay-500 { animation-delay: 0.5s; } .animation-delay-600 { animation-delay: 0.6s; } .animation-delay-700 { animation-delay: 0.7s; } .animation-delay-800 { animation-delay: 0.8s; } .animation-delay-1000 { animation-delay: 1s; } .animation-delay-1200 { animation-delay: 1.2s; } .animation-delay-1500 { animation-delay: 1.5s; } .animation-delay-2000 { animation-delay: 2s; } .animation-delay-2500 { animation-delay: 2.5s; } .animation-delay-3000 { animation-delay: 3s; } @media (max-width: 768px) { .animated-vehicle { display: none; } } `;

  // --- API and Data Logic ---
  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    if (!token) { 
      console.log('No token found, redirecting to login');
      router.push('/login'); 
      return null; 
    }
    
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const fullURL = `${baseURL}/api${endpoint}`;
    
    console.log('Making API call to:', fullURL);
    console.log('Request options:', {
      method: options.method || 'GET',
      hasToken: !!token,
      tokenLength: token?.length || 0
    });
    
    try {
      const response = await fetch(fullURL, { 
        ...options, 
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}`, 
          ...options.headers 
        } 
      });
      
      console.log('API response status:', response.status);
      console.log('API response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        if (response.status === 401) { 
          console.log('Unauthorized, clearing auth and redirecting');
          localStorage.removeItem('token'); 
          localStorage.removeItem('user'); 
          router.push('/login'); 
          return null; 
        }
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API response data keys:', Object.keys(data));
      console.log('Bookings count in response:', data.bookings?.length || 0);
      
      return data;
    } catch (error) { 
      console.error('API call error:', {
        endpoint: fullURL,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack'
      }); 
      throw error;
    }
  }, [router]);

  // Simple loadBookings function - just API call
  const loadBookings = useCallback(async () => {
    console.log('Loading bookings...');
    setLoading(true); 
    setError('');

    try {
      const params = new URLSearchParams({ sortBy, sortOrder: 'desc' });
      if (filter !== 'all') params.append('status', filter);
      
      const response = await apiCall(`/bookings?${params.toString()}`);
      
      if (response) {
        console.log('Bookings loaded:', response.bookings?.length || 0);
        console.log('Sample booking statuses:', response.bookings?.slice(0, 3).map((b: any) => ({
          id: b.bookingId,
          status: b.status,
          paymentStatus: b.paymentInfo?.status
        })) || []);
        
        setBookings(response.bookings || []);
        setStats(response.stats || null);
      } else {
        setError('Failed to load bookings');
      }
    } catch (apiError) {
      console.error('Failed to load bookings:', apiError);
      setError(`Failed to load bookings: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [filter, sortBy, apiCall]);

  useEffect(() => { 
    loadBookings(); 
  }, [loadBookings]);

  const handleCancelBooking = async (bookingId: string) => {
    console.log('=== CANCEL BOOKING REQUEST ===');
    console.log('Booking ID:', bookingId);
    
    setCancelling(true); 
    setError('');
    
    try {
      const response = await apiCall(`/bookings/${bookingId}/cancel`, { 
        method: 'PUT', 
        body: JSON.stringify({ reason: 'User requested cancellation' }) 
      });
      
      if (response) { 
        console.log('Booking cancelled successfully via API');
        setShowCancelModal(false); 
        setBookingToCancel(null); 
        loadBookings(); 
      } else {
        setError('Failed to cancel booking');
      }
    } catch (error) { 
      console.error('Cancellation failed:', error);
      setError('Failed to cancel booking');
    } finally { 
      setCancelling(false); 
    }
  };

  const handleGenerateQR = async (bookingId: string) => {
    console.log('=== GENERATE QR CODE REQUEST ===');
    console.log('Booking ID:', bookingId);
    
    // Navigate to dedicated QR page
    router.push(`/qr/${bookingId}`);
  };

  // --- Helper Functions ---
  const getStatusStyle = (status: string) => {
    const styles = { 
      confirmed: { color: '#10B981', label: 'Confirmed' }, 
      pending: { color: '#F59E0B', label: 'Pending' }, 
      cancelled: { color: '#EF4444', label: 'Cancelled' }, 
      completed: { color: '#3B82F6', label: 'Completed' }, 
      no_show: { color: '#6B7280', label: 'No Show' } 
    };
    return styles[status as keyof typeof styles] || { color: '#6B7280', label: 'Unknown' };
  };
  
  const getPaymentStatusStyle = (status: string) => {
    const styles = { 
      completed: { color: '#10B981' }, 
      pending: { color: '#F59E0B' }, 
      failed: { color: '#EF4444' }, 
      refunded: { color: '#8B5CF6' } 
    };
    return styles[status as keyof typeof styles] || { color: '#6B7280' };
  };
  
  const formatPrice = (price: number) => `Rs. ${price.toLocaleString()}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  const formatDateTime = (dateString: string) => new Date(dateString).toLocaleString();
  const canCancelBooking = (booking: Booking) => {
    try {
      return new Date(booking.travelDate).getTime() - new Date().getTime() > 7200000 && booking.status === 'confirmed';
    } catch {
      return false;
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: currentThemeStyles.mainBg }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid rgba(251, 191, 36, 0.3)', borderTop: '4px solid #F59E0B', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <div style={{ color: currentThemeStyles.textSecondary, fontSize: '16px' }}>Loading your bookings...</div>
        </div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <style jsx>{animationStyles}</style>
      <style jsx global>{`
        .form-select { width: 100%; padding: 0.75rem; border-radius: 0.5rem; font-size: 1rem; box-sizing: border-box; transition: border-color 0.3s, box-shadow 0.3s; }
        .form-select:focus { outline: none; border-color: #F59E0B; box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.3); }
        @media (max-width: 768px) { .nav-links { display: none; } .stats-grid { grid-template-columns: 1fr 1fr !important; } .booking-card-grid { grid-template-columns: 1fr !important; } }
      `}</style>
      
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <nav style={{ backgroundColor: 'rgba(30, 41, 59, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem 0' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
              <ShieldCheckIcon width={32} height={32} color="#dc2626" />
              <div><h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}><span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>ශ්‍රී</span>Express</h1></div>
            </Link>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div className="nav-links" style={{ display: 'flex', gap: '1.5rem' }}>
                <Link href="/dashboard" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: '500' }}>Dashboard</Link>
                <Link href="/search" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: '500' }}>Search</Link>
              </div>
              <ThemeSwitcher />
            </div>
          </div>
        </nav>

        <main style={{ width: '100%', minHeight: 'calc(100vh - 90px)', display: 'flex', justifyContent: 'center', padding: '2rem 1.5rem' }}>
          <div className="animate-fade-in-down" style={{ width: '100%', maxWidth: '1400px' }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center', color: currentThemeStyles.textPrimary }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>My Bookings</h1>
              <p style={{ color: currentThemeStyles.textSecondary, margin: '0.5rem 0 0 0', fontSize: '1.1rem' }}>View and manage all your ticket reservations.</p>
            </div>

            {stats && (
              <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                {[
                  { label: 'Total Bookings', value: stats.totalBookings, color: '#3B82F6', icon: TicketIcon },
                  { label: 'Confirmed', value: stats.confirmedBookings, color: '#10B981', icon: CheckCircleIcon },
                  { label: 'Completed', value: stats.completedBookings, color: '#8B5CF6', icon: ClockIcon },
                  { label: 'Cancelled', value: stats.cancelledBookings, color: '#EF4444', icon: XCircleIcon }
                ].map(stat => (
                  <div key={stat.label} style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '1.5rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <stat.icon width={32} height={32} color={stat.color} />
                      <div>
                        <h3 style={{ color: stat.color, fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{stat.value}</h3>
                        <p style={{ color: currentThemeStyles.textPrimary, margin: '0.5rem 0 0 0', fontWeight: '600' }}>{stat.label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '1.5rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(16px)', border: currentThemeStyles.glassPanelBorder, marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: currentThemeStyles.textSecondary }}>Filter by Status</label>
                <select value={filter} onChange={(e) => setFilter(e.target.value)} className="form-select" style={{ backgroundColor: currentThemeStyles.alertBg, color: currentThemeStyles.textPrimary, border: `1px solid ${currentThemeStyles.quickActionBorder}` }}>
                  <option value="all">All Bookings</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: currentThemeStyles.textSecondary }}>Sort By</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="form-select" style={{ backgroundColor: currentThemeStyles.alertBg, color: currentThemeStyles.textPrimary, border: `1px solid ${currentThemeStyles.quickActionBorder}` }}>
                  <option value="date">Travel Date</option>
                  <option value="created">Booking Date</option>
                  <option value="amount">Amount</option>
                </select>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <button 
                  onClick={loadBookings} 
                  disabled={loading}
                  style={{ 
                    backgroundColor: loading ? '#9CA3AF' : '#F59E0B', 
                    color: 'white', 
                    padding: '0.75rem 1rem', 
                    border: 'none', 
                    borderRadius: '0.5rem', 
                    cursor: loading ? 'not-allowed' : 'pointer', 
                    fontSize: '0.9rem', 
                    fontWeight: '500' 
                  }}
                >
                  {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ backgroundColor: 'rgba(254, 226, 226, 0.8)', color: '#DC2626', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #FCA5A5', marginBottom: '2rem', backdropFilter: 'blur(5px)' }}>
                <strong>Note:</strong> {error}
              </div>
            )}

            {bookings.length > 0 ? (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {bookings.map((booking) => (
                  <div key={booking._id} style={{ 
                    backgroundColor: currentThemeStyles.glassPanelBg, 
                    padding: '1.5rem', 
                    borderRadius: '1rem', 
                    boxShadow: currentThemeStyles.glassPanelShadow, 
                    backdropFilter: 'blur(16px)', 
                    border: currentThemeStyles.glassPanelBorder,
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: currentThemeStyles.textPrimary, margin: '0 0 0.5rem 0' }}>Booking #{booking.bookingId}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                          <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '600', backgroundColor: getStatusStyle(booking.status).color, color: 'white' }}>{getStatusStyle(booking.status).label}</span>
                          <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '500', backgroundColor: getPaymentStatusStyle(booking.paymentInfo.status).color, color: 'white' }}>Payment: {booking.paymentInfo.status}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#F59E0B', marginBottom: '0.5rem' }}>{formatPrice(booking.pricing.totalAmount)}</div>
                        <div style={{ fontSize: '0.9rem', color: currentThemeStyles.textMuted }}>{booking.paymentInfo.method}</div>
                      </div>
                    </div>
                    <div className="booking-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1rem', paddingTop: '1rem', borderTop: `1px solid ${currentThemeStyles.quickActionBorder}` }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600', color: currentThemeStyles.textPrimary, margin: '0 0 0.5rem 0' }}>Travel Details</h4>
                        <div style={{ fontSize: '0.9rem', color: currentThemeStyles.textSecondary, lineHeight: '1.6' }}>
                          <div><InformationCircleIcon width={16} style={{ display: 'inline', marginRight: '0.5rem' }} />{booking.routeName || 'N/A'}</div>
                          <div><CalendarDaysIcon width={16} style={{ display: 'inline', marginRight: '0.5rem' }} />{formatDate(booking.travelDate)} at {booking.departureTime}</div>
                          <div><TicketIcon width={16} style={{ display: 'inline', marginRight: '0.5rem' }} />Seat: {booking.seatInfo.seatNumber} ({booking.seatInfo.seatType})</div>
                        </div>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600', color: currentThemeStyles.textPrimary, margin: '0 0 0.5rem 0' }}>Passenger</h4>
                        <div style={{ fontSize: '0.9rem', color: currentThemeStyles.textSecondary, lineHeight: '1.6' }}>
                          <div><UserIcon width={16} style={{ display: 'inline', marginRight: '0.5rem' }} />{booking.passengerInfo.name}</div>
                          <div><DevicePhoneMobileIcon width={16} style={{ display: 'inline', marginRight: '0.5rem' }} />{booking.passengerInfo.phone}</div>
                          <div><AtSymbolIcon width={16} style={{ display: 'inline', marginRight: '0.5rem' }} />{booking.passengerInfo.email}</div>
                        </div>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600', color: currentThemeStyles.textPrimary, margin: '0 0 0.5rem 0' }}>Booking Info</h4>
                        <div style={{ fontSize: '0.9rem', color: currentThemeStyles.textSecondary, lineHeight: '1.6' }}>
                          <div>Booked: {formatDateTime(booking.createdAt)}</div>
                          <div><CurrencyDollarIcon width={16} style={{ display: 'inline', marginRight: '0.5rem' }} />Txn: {booking.paymentInfo.transactionId}</div>
                          <div>Check-in: {booking.checkInInfo.checkedIn ? `Yes at ${formatDateTime(booking.checkInInfo.checkInTime || '')}` : 'No'}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: `1px solid ${currentThemeStyles.quickActionBorder}`, flexWrap: 'wrap' }}>
                      <Link href={`/bookings/${booking.bookingId || booking._id}`} style={{ backgroundColor: 'rgba(59, 130, 246, 0.8)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>View Details</Link>
                      {booking.status === 'confirmed' && (
                        <button 
                          onClick={() => handleGenerateQR(booking.bookingId || booking._id)} 
                          style={{ backgroundColor: 'rgba(16, 185, 129, 0.8)', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                          <QrCodeIcon width={16} /> Get QR Code
                        </button>
                      )}
                      {canCancelBooking(booking) && (
                        <button 
                          onClick={() => { 
                            setBookingToCancel(booking.bookingId || booking._id); 
                            setShowCancelModal(true); 
                          }} 
                          style={{ backgroundColor: 'rgba(239, 68, 68, 0.8)', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem', color: currentThemeStyles.textSecondary, backgroundColor: currentThemeStyles.glassPanelBg, borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(16px)', border: currentThemeStyles.glassPanelBorder }}>
                <TicketIcon width={48} height={48} style={{ margin: '0 auto 1rem', color: currentThemeStyles.textMuted }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: currentThemeStyles.textPrimary }}>No Bookings Found</h3>
                <p style={{ marginBottom: '1rem' }}>Start your journey by booking your first ticket.</p>
                <Link href="/search" style={{ backgroundColor: '#F59E0B', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: '500', display: 'inline-block' }}>Book Your First Ticket</Link>
              </div>
            )}
          </div>
        </main>
      </div>

      {showCancelModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, border: currentThemeStyles.glassPanelBorder, maxWidth: '400px', width: '90%' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: currentThemeStyles.textPrimary, marginBottom: '1rem' }}>Cancel Booking</h3>
            <p style={{ color: currentThemeStyles.textSecondary, marginBottom: '2rem' }}>Are you sure you want to cancel this booking? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCancelModal(false)} disabled={cancelling} style={{ backgroundColor: '#6B7280', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', opacity: cancelling ? 0.7 : 1 }}>Keep Booking</button>
              <button onClick={() => bookingToCancel && handleCancelBooking(bookingToCancel)} disabled={cancelling} style={{ backgroundColor: '#EF4444', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', opacity: cancelling ? 0.7 : 1 }}>{cancelling ? 'Cancelling...' : 'Yes, Cancel'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}