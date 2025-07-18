// src/app/bookings/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Get auth token
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // API call helper
  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return null;
    }

    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const fullURL = `${baseURL}/api${endpoint}`;

    try {
      const response = await fetch(fullURL, {
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
          localStorage.removeItem('user');
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

  // Load bookings
  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      params.append('sortBy', sortBy);
      params.append('sortOrder', 'desc');

      const response = await apiCall(`/bookings?${params.toString()}`);
      
      if (response) {
        setBookings(response.bookings || []);
        setStats(response.stats || null);
      } else {
        setError('Failed to load bookings');
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [filter, sortBy, apiCall]);

  // Initial load
  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Cancel booking
  const handleCancelBooking = async (bookingId: string) => {
    setCancelling(true);
    setError('');

    try {
      const response = await apiCall(`/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        body: JSON.stringify({
          reason: 'User requested cancellation'
        })
      });

      if (response) {
        setShowCancelModal(false);
        setBookingToCancel(null);
        loadBookings(); // Refresh bookings
        alert('Booking cancelled successfully');
      } else {
        setError('Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setError('Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  // Generate QR code for booking
  const handleGenerateQR = async (bookingId: string) => {
    try {
      const response = await apiCall(`/bookings/${bookingId}/qr`, {
        method: 'POST'
      });

      if (response) {
        // Open QR code in new tab or display in modal
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head><title>QR Code - Booking ${bookingId}</title></head>
              <body style="text-align: center; padding: 2rem;">
                <h2>Your Ticket QR Code</h2>
                <img src="${response.qrCode}" alt="QR Code" style="max-width: 300px;" />
                <p>Show this QR code to the conductor</p>
                <button onclick="window.print()">Print</button>
              </body>
            </html>
          `);
        }
      } else {
        alert('Failed to generate QR code');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      case 'completed':
        return '#3B82F6';
      case 'no_show':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      case 'completed':
        return 'Completed';
      case 'no_show':
        return 'No Show';
      default:
        return 'Unknown';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'failed':
        return '#EF4444';
      case 'refunded':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const formatPrice = (price: number) => {
    return `Rs. ${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const canCancelBooking = (booking: Booking) => {
    const travelDate = new Date(booking.travelDate);
    const now = new Date();
    const timeDiff = travelDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    
    return booking.status === 'confirmed' && hoursDiff > 2; // Can cancel if travel is more than 2 hours away
  };

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
          <div style={{ color: '#6B7280', fontSize: '16px' }}>Loading your bookings...</div>
        </div>
      </div>
    );
  }

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
            <Link href="/dashboard" style={{
              color: '#6B7280',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Dashboard
            </Link>
            <Link href="/search" style={{
              backgroundColor: '#F59E0B',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Book New Ticket
            </Link>
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
            My Bookings
          </h1>
          <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>
            View and manage your ticket bookings
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
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
              <h3 style={{ color: '#3B82F6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                {stats.totalBookings}
              </h3>
              <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>Total Bookings</p>
            </div>
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ color: '#10B981', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                {stats.confirmedBookings}
              </h3>
              <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>Confirmed</p>
            </div>
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ color: '#8B5CF6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                {stats.completedBookings}
              </h3>
              <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>Completed</p>
            </div>
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ color: '#EF4444', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                {stats.cancelledBookings}
              </h3>
              <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>Cancelled</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Filter by Status
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              >
                <option value="all">All Bookings</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
              >
                <option value="date">Travel Date</option>
                <option value="created">Booking Date</option>
                <option value="amount">Amount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #FCA5A5',
            marginBottom: '2rem'
          }}>
            {error}
          </div>
        )}

        {/* Bookings List */}
        {bookings.length > 0 ? (
          <div style={{
            display: 'grid',
            gap: '1rem'
          }}>
            {bookings.map((booking) => (
              <div key={booking._id} style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: '#1F2937',
                      margin: '0 0 0.5rem 0'
                    }}>
                      Booking #{booking.bookingId}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        backgroundColor: getStatusColor(booking.status),
                        color: 'white'
                      }}>
                        {getStatusLabel(booking.status)}
                      </span>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        backgroundColor: getPaymentStatusColor(booking.paymentInfo.status),
                        color: 'white'
                      }}>
                        Payment: {booking.paymentInfo.status}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    textAlign: 'right'
                  }}>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: '#F59E0B',
                      marginBottom: '0.5rem'
                    }}>
                      {formatPrice(booking.pricing.totalAmount)}
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#6B7280'
                    }}>
                      {booking.paymentInfo.method}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <h4 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#1F2937',
                      margin: '0 0 0.5rem 0'
                    }}>
                      Travel Details
                    </h4>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#6B7280',
                      lineHeight: '1.4'
                    }}>
                      <div>Route: {booking.routeName || 'N/A'}</div>
                      <div>Date: {formatDate(booking.travelDate)}</div>
                      <div>Departure: {booking.departureTime}</div>
                      <div>Seat: {booking.seatInfo.seatNumber} ({booking.seatInfo.seatType})</div>
                    </div>
                  </div>

                  <div>
                    <h4 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#1F2937',
                      margin: '0 0 0.5rem 0'
                    }}>
                      Passenger
                    </h4>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#6B7280',
                      lineHeight: '1.4'
                    }}>
                      <div>Name: {booking.passengerInfo.name}</div>
                      <div>Phone: {booking.passengerInfo.phone}</div>
                      <div>Email: {booking.passengerInfo.email}</div>
                      <div>Type: {booking.passengerInfo.passengerType}</div>
                    </div>
                  </div>

                  <div>
                    <h4 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#1F2937',
                      margin: '0 0 0.5rem 0'
                    }}>
                      Booking Info
                    </h4>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#6B7280',
                      lineHeight: '1.4'
                    }}>
                      <div>Booked: {formatDateTime(booking.createdAt)}</div>
                      <div>Transaction: {booking.paymentInfo.transactionId}</div>
                      <div>Check-in: {booking.checkInInfo.checkedIn ? 'Yes' : 'No'}</div>
                      {booking.checkInInfo.checkedIn && booking.checkInInfo.checkInTime && (
                        <div>Check-in Time: {formatDateTime(booking.checkInInfo.checkInTime)}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #f3f4f6'
                }}>
                  <Link
                    href={`/bookings/${booking._id}`}
                    style={{
                      backgroundColor: '#3B82F6',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}
                  >
                    View Details
                  </Link>
                  
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleGenerateQR(booking._id)}
                      style={{
                        backgroundColor: '#10B981',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      Get QR Code
                    </button>
                  )}
                  
                  {canCancelBooking(booking) && (
                    <button
                      onClick={() => {
                        setBookingToCancel(booking._id);
                        setShowCancelModal(true);
                      }}
                      style={{
                        backgroundColor: '#EF4444',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '4rem',
            color: '#6B7280'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎫</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No bookings found</h3>
            <p style={{ marginBottom: '1rem' }}>Start your journey by booking your first ticket</p>
            <Link
              href="/search"
              style={{
                backgroundColor: '#F59E0B',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: '500',
                display: 'inline-block'
              }}
            >
              Book Your First Ticket
            </Link>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#1F2937',
              marginBottom: '1rem'
            }}>
              Cancel Booking
            </h3>
            <p style={{
              color: '#6B7280',
              marginBottom: '2rem'
            }}>
              Are you sure you want to cancel this booking? This action cannot be undone, but you may be eligible for a refund.
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                style={{
                  backgroundColor: '#6B7280',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: cancelling ? 'not-allowed' : 'pointer',
                  opacity: cancelling ? 0.7 : 1
                }}
              >
                Keep Booking
              </button>
              <button
                onClick={() => bookingToCancel && handleCancelBooking(bookingToCancel)}
                disabled={cancelling}
                style={{
                  backgroundColor: '#EF4444',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: cancelling ? 'not-allowed' : 'pointer',
                  opacity: cancelling ? 0.7 : 1
                }}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}