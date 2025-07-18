// src/app/bookings/[id]/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

interface Booking {
  _id: string;
  bookingId: string;
  userId: string;
  routeId: string;
  scheduleId: string;
  travelDate: string;
  departureTime: string;
  passengerInfo: {
    name: string;
    phone: string;
    email: string;
    idType: 'nic' | 'passport';
    idNumber: string;
    passengerType: 'regular' | 'student' | 'senior' | 'military';
  };
  seatInfo: {
    seatNumber: string;
    seatType: 'window' | 'aisle' | 'middle';
    preferences: string[];
  };
  pricing: {
    basePrice: number;
    taxes: number;
    discounts: number;
    totalAmount: number;
    currency: string;
  };
  paymentInfo: {
    paymentId: string;
    method: 'card' | 'bank' | 'digital_wallet' | 'cash';
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    paidAt?: string;
    transactionId: string;
  };
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no_show';
  qrCode?: string;
  cancellationInfo?: {
    reason: string;
    cancelledAt: string;
    refundAmount: number;
    refundStatus: 'pending' | 'processed';
    processedBy?: string;
  };
  checkInInfo: {
    checkedIn: boolean;
    checkInTime?: string;
    checkInLocation?: string;
  };
  routeInfo?: {
    name: string;
    startLocation: { name: string; address: string };
    endLocation: { name: string; address: string };
    operatorInfo: { companyName: string; contactNumber: string };
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function BookingDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const getToken = () => localStorage.getItem('token');

  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    if (!token) { router.push('/login'); return null; }
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const fullURL = `${baseURL}/api${endpoint}`;
    try {
      const response = await fetch(fullURL, { ...options, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...options.headers } });
      if (!response.ok) { if (response.status === 401) { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/login'); return null; } throw new Error(`API Error: ${response.status}`); }
      return await response.json();
    } catch (error) { console.error('API call error:', error); return null; }
  }, [router]);

  const loadBookingDetails = useCallback(async () => {
    if (!bookingId) return;
    setLoading(true); setError('');
    try {
      const response = await apiCall(`/bookings/${bookingId}`);
      if (response) { setBooking(response.booking); } else { setError('Booking not found'); }
    } catch (error) { console.error('Error loading booking details:', error); setError('Failed to load booking details'); } finally { setLoading(false); }
  }, [bookingId, apiCall]);

  useEffect(() => { loadBookingDetails(); }, [loadBookingDetails]);

  const handleGenerateQR = async () => {
    if (!booking) return;
    setQrLoading(true);
    try {
      const response = await apiCall(`/bookings/${booking._id}/qr`, { method: 'POST' });
      if (response) {
        setBooking(prev => prev ? { ...prev, qrCode: response.qrCode } : null);
        // Open QR code in new tab
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head><title>QR Code - Booking ${booking.bookingId}</title></head>
              <body style="text-align: center; padding: 2rem; font-family: Arial, sans-serif;">
                <h2>Your Ticket QR Code</h2>
                <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
                <p><strong>Passenger:</strong> ${booking.passengerInfo.name}</p>
                <p><strong>Travel Date:</strong> ${new Date(booking.travelDate).toLocaleDateString()}</p>
                <img src="${response.qrCode}" alt="QR Code" style="max-width: 300px; margin: 2rem 0;" />
                <p>Show this QR code to the conductor</p>
                <button onclick="window.print()" style="background: #F59E0B; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.5rem; cursor: pointer;">Print Ticket</button>
              </body>
            </html>
          `);
        }
      } else { alert('Failed to generate QR code'); }
    } catch (error) { console.error('Error generating QR code:', error); alert('Failed to generate QR code'); } finally { setQrLoading(false); }
  };

  const handleCancelBooking = async () => {
    if (!booking || !cancelReason) return;
    setCancelling(true);
    try {
      const response = await apiCall(`/bookings/${booking._id}/cancel`, { method: 'PUT', body: JSON.stringify({ reason: cancelReason }) });
      if (response) { setShowCancelModal(false); loadBookingDetails(); alert('Booking cancelled successfully'); } else { alert('Failed to cancel booking'); }
    } catch (error) { console.error('Error cancelling booking:', error); alert('Failed to cancel booking'); } finally { setCancelling(false); }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      case 'completed': return '#3B82F6';
      case 'no_show': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      case 'completed': return 'Completed';
      case 'no_show': return 'No Show';
      default: return 'Unknown';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'failed': return '#EF4444';
      case 'refunded': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const canCancelBooking = (booking: Booking) => {
    const travelDate = new Date(booking.travelDate);
    const now = new Date();
    const timeDiff = travelDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    return booking.status === 'confirmed' && hoursDiff > 2;
  };

  const formatPrice = (price: number) => `Rs. ${price.toLocaleString()}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  const formatDateTime = (dateString: string) => new Date(dateString).toLocaleString();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #F59E0B', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <div style={{ color: '#6B7280', fontSize: '16px' }}>Loading booking details...</div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem' }}>
        <div style={{ textAlign: 'center', color: '#DC2626' }}>
          <h2>Error</h2>
          <p>{error || 'Booking not found'}</p>
          <Link href="/bookings" style={{ color: '#F59E0B', textDecoration: 'underline' }}>
            Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Navigation */}
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem 0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
            <span style={{ color: '#F59E0B' }}>ශ්‍රී</span><span style={{ color: '#1F2937' }}>Express</span>
          </Link>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/bookings" style={{ color: '#6B7280', textDecoration: 'none', fontWeight: '500' }}>← Back to Bookings</Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1F2937', margin: 0 }}>
                Booking #{booking.bookingId}
              </h1>
              <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>
                {booking.routeInfo?.name || 'Route information'}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.8rem', fontWeight: '500', backgroundColor: getStatusColor(booking.status), color: 'white' }}>
                  {getStatusLabel(booking.status)}
                </span>
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.8rem', fontWeight: '500', backgroundColor: getPaymentStatusColor(booking.paymentInfo.status), color: 'white' }}>
                  Payment: {booking.paymentInfo.status}
                </span>
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#F59E0B' }}>
                {formatPrice(booking.pricing.totalAmount)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {booking.status === 'confirmed' && (
            <button onClick={handleGenerateQR} disabled={qrLoading} style={{ backgroundColor: '#10B981', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '0.5rem', cursor: qrLoading ? 'not-allowed' : 'pointer', fontWeight: '500', opacity: qrLoading ? 0.7 : 1 }}>
              {qrLoading ? 'Generating...' : '📱 Get QR Code'}
            </button>
          )}
          {canCancelBooking(booking) && (
            <button onClick={() => setShowCancelModal(true)} style={{ backgroundColor: '#EF4444', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500' }}>
              ❌ Cancel Booking
            </button>
          )}
          <Link href="/track" style={{ backgroundColor: '#3B82F6', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: '500' }}>
            📍 Track Vehicle
          </Link>
          <Link href={`/payments`} style={{ backgroundColor: '#8B5CF6', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: '500' }}>
            💳 View Payments
          </Link>
        </div>

        {/* Booking Details */}
        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* Trip Information */}
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1F2937', marginBottom: '1rem' }}>Trip Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Journey Details</h4>
                <div style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: '1.6' }}>
                  <div><strong>From:</strong> {booking.routeInfo?.startLocation.name}</div>
                  <div><strong>To:</strong> {booking.routeInfo?.endLocation.name}</div>
                  <div><strong>Travel Date:</strong> {formatDate(booking.travelDate)}</div>
                  <div><strong>Departure:</strong> {booking.departureTime}</div>
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Seat Information</h4>
                <div style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: '1.6' }}>
                  <div><strong>Seat Number:</strong> {booking.seatInfo.seatNumber}</div>
                  <div><strong>Seat Type:</strong> {booking.seatInfo.seatType}</div>
                  {booking.seatInfo.preferences.length > 0 && (
                    <div><strong>Preferences:</strong> {booking.seatInfo.preferences.join(', ')}</div>
                  )}
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Operator</h4>
                <div style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: '1.6' }}>
                  <div><strong>Company:</strong> {booking.routeInfo?.operatorInfo.companyName}</div>
                  <div><strong>Contact:</strong> {booking.routeInfo?.operatorInfo.contactNumber}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Passenger Information */}
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1F2937', marginBottom: '1rem' }}>Passenger Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Personal Details</h4>
                <div style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: '1.6' }}>
                  <div><strong>Name:</strong> {booking.passengerInfo.name}</div>
                  <div><strong>Type:</strong> {booking.passengerInfo.passengerType}</div>
                  <div><strong>ID Type:</strong> {booking.passengerInfo.idType}</div>
                  <div><strong>ID Number:</strong> {booking.passengerInfo.idNumber}</div>
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Contact Information</h4>
                <div style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: '1.6' }}>
                  <div><strong>Phone:</strong> {booking.passengerInfo.phone}</div>
                  <div><strong>Email:</strong> {booking.passengerInfo.email}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1F2937', marginBottom: '1rem' }}>Payment Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Amount Breakdown</h4>
                <div style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: '1.6' }}>
                  <div><strong>Base Price:</strong> {formatPrice(booking.pricing.basePrice)}</div>
                  <div><strong>Taxes:</strong> {formatPrice(booking.pricing.taxes)}</div>
                  {booking.pricing.discounts > 0 && (
                    <div style={{ color: '#10B981' }}><strong>Discount:</strong> -{formatPrice(booking.pricing.discounts)}</div>
                  )}
                  <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #e5e7eb', fontWeight: '600', color: '#1F2937' }}>
                    <strong>Total:</strong> {formatPrice(booking.pricing.totalAmount)}
                  </div>
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Payment Details</h4>
                <div style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: '1.6' }}>
                  <div><strong>Method:</strong> {booking.paymentInfo.method}</div>
                  <div><strong>Transaction ID:</strong> {booking.paymentInfo.transactionId}</div>
                  <div><strong>Payment ID:</strong> {booking.paymentInfo.paymentId}</div>
                  {booking.paymentInfo.paidAt && (
                    <div><strong>Paid At:</strong> {formatDateTime(booking.paymentInfo.paidAt)}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Check-in Information */}
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1F2937', marginBottom: '1rem' }}>Check-in Status</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: booking.checkInInfo.checkedIn ? '#10B981' : '#6B7280', borderRadius: '50%' }}></div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: '600', color: booking.checkInInfo.checkedIn ? '#10B981' : '#6B7280' }}>
                  {booking.checkInInfo.checkedIn ? 'Checked In' : 'Not Checked In'}
                </div>
                {booking.checkInInfo.checkedIn && booking.checkInInfo.checkInTime && (
                  <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>
                    Check-in Time: {formatDateTime(booking.checkInInfo.checkInTime)}
                  </div>
                )}
                {booking.checkInInfo.checkedIn && booking.checkInInfo.checkInLocation && (
                  <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>
                    Location: {booking.checkInInfo.checkInLocation}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cancellation Information */}
          {booking.cancellationInfo && (
            <div style={{ backgroundColor: '#FEF2F2', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #FECACA' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#B91C1C', marginBottom: '1rem' }}>Cancellation Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#7F1D1D', marginBottom: '0.5rem' }}>Cancellation Info</h4>
                  <div style={{ fontSize: '0.9rem', color: '#991B1B', lineHeight: '1.6' }}>
                    <div><strong>Reason:</strong> {booking.cancellationInfo.reason}</div>
                    <div><strong>Cancelled At:</strong> {formatDateTime(booking.cancellationInfo.cancelledAt)}</div>
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#7F1D1D', marginBottom: '0.5rem' }}>Refund Information</h4>
                  <div style={{ fontSize: '0.9rem', color: '#991B1B', lineHeight: '1.6' }}>
                    <div><strong>Refund Amount:</strong> {formatPrice(booking.cancellationInfo.refundAmount)}</div>
                    <div><strong>Refund Status:</strong> {booking.cancellationInfo.refundStatus}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Booking Timeline */}
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1F2937', marginBottom: '1rem' }}>Booking Timeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: '#F0FDF4', borderRadius: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#10B981', borderRadius: '50%' }}></div>
                <div>
                  <div style={{ fontWeight: '600', color: '#065F46' }}>Booking Created</div>
                  <div style={{ fontSize: '0.9rem', color: '#047857' }}>{formatDateTime(booking.createdAt)}</div>
                </div>
              </div>
              {booking.paymentInfo.paidAt && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: '#EFF6FF', borderRadius: '0.5rem' }}>
                  <div style={{ width: '8px', height: '8px', backgroundColor: '#3B82F6', borderRadius: '50%' }}></div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1E40AF' }}>Payment Completed</div>
                    <div style={{ fontSize: '0.9rem', color: '#2563EB' }}>{formatDateTime(booking.paymentInfo.paidAt)}</div>
                  </div>
                </div>
              )}
              {booking.checkInInfo.checkedIn && booking.checkInInfo.checkInTime && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: '#FEF3C7', borderRadius: '0.5rem' }}>
                  <div style={{ width: '8px', height: '8px', backgroundColor: '#F59E0B', borderRadius: '50%' }}></div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#92400E' }}>Checked In</div>
                    <div style={{ fontSize: '0.9rem', color: '#B45309' }}>{formatDateTime(booking.checkInInfo.checkInTime)}</div>
                  </div>
                </div>
              )}
              {booking.cancellationInfo && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: '#FEF2F2', borderRadius: '0.5rem' }}>
                  <div style={{ width: '8px', height: '8px', backgroundColor: '#EF4444', borderRadius: '50%' }}></div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#B91C1C' }}>Booking Cancelled</div>
                    <div style={{ fontSize: '0.9rem', color: '#DC2626' }}>{formatDateTime(booking.cancellationInfo.cancelledAt)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', maxWidth: '500px', width: '90%' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1F2937', marginBottom: '1rem' }}>Cancel Booking</h3>
            <p style={{ color: '#6B7280', marginBottom: '1rem' }}>Are you sure you want to cancel this booking? This action cannot be undone.</p>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>Reason for cancellation</label>
              <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Please provide a reason for cancellation..." style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.9rem', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical' }}></textarea>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCancelModal(false)} disabled={cancelling} style={{ backgroundColor: '#6B7280', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: cancelling ? 'not-allowed' : 'pointer', opacity: cancelling ? 0.7 : 1 }}>
                Keep Booking
              </button>
              <button onClick={handleCancelBooking} disabled={cancelling || !cancelReason} style={{ backgroundColor: '#EF4444', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: (cancelling || !cancelReason) ? 'not-allowed' : 'pointer', opacity: (cancelling || !cancelReason) ? 0.7 : 1 }}>
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