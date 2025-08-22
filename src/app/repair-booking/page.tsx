"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RepairBookingPage() {
  const router = useRouter();
  const [bookingId, setBookingId] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const repairBooking = async () => {
    if (!bookingId.trim()) {
      setStatus('Please enter a booking ID');
      return;
    }

    setLoading(true);
    setStatus('Attempting to repair booking...');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setStatus('Not authenticated. Please login first.');
        setLoading(false);
        return;
      }

      // Try to find payment with this booking ID
      const paymentsResponse = await fetch('http://localhost:5000/api/payments/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!paymentsResponse.ok) {
        throw new Error('Failed to load payments');
      }

      const paymentsData = await paymentsResponse.json();
      console.log('Payments data:', paymentsData);

      const payment = paymentsData.payments?.find((p: any) => 
        p.bookingId === bookingId || 
        (p.booking && (p.booking.bookingId === bookingId || p.booking._id === bookingId))
      );

      if (!payment) {
        setStatus(`No payment found for booking ID: ${bookingId}`);
        setLoading(false);
        return;
      }

      setStatus('Found payment record! Creating booking...');

      // Create booking from payment data
      const bookingData = {
        bookingId: bookingId,
        userId: payment.userId || 'unknown',
        routeId: payment.booking?.routeId || 'repair-route',
        scheduleId: payment.booking?.scheduleId || 'repair-schedule',
        travelDate: payment.booking?.travelDate || new Date().toISOString(),
        departureTime: payment.booking?.departureTime || '08:00',
        passengerInfo: payment.booking?.passengerInfo || {
          name: 'Repaired Booking',
          phone: 'N/A',
          email: 'N/A',
          idType: 'nic',
          idNumber: 'N/A',
          passengerType: 'regular'
        },
        seatInfo: payment.booking?.seatInfo || {
          seatNumber: 'N/A',
          seatType: 'window',
          preferences: []
        },
        pricing: {
          basePrice: payment.amount || 0,
          taxes: 0,
          discounts: 0,
          totalAmount: payment.amount || 0,
          currency: payment.currency || 'LKR'
        },
        paymentInfo: {
          paymentId: payment._id || payment.id,
          method: payment.method || 'card',
          status: 'completed',
          paidAt: payment.createdAt || new Date().toISOString(),
          transactionId: payment.transactionId || payment._id
        },
        status: 'confirmed',
        checkInInfo: {
          checkedIn: false
        },
        routeInfo: {
          name: 'Repaired Route',
          startLocation: {
            name: 'Origin',
            address: 'Unknown'
          },
          endLocation: {
            name: 'Destination', 
            address: 'Unknown'
          },
          operatorInfo: {
            companyName: 'Sri Express',
            contactNumber: '+94 11 234 5678'
          }
        }
      };

      // Create the booking
      const bookingResponse = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      if (!bookingResponse.ok) {
        const errorText = await bookingResponse.text();
        throw new Error(`Failed to create booking: ${errorText}`);
      }

      const bookingResult = await bookingResponse.json();
      console.log('Booking created:', bookingResult);

      setStatus('✅ Booking repaired successfully!');
      
      // Redirect to booking page after 2 seconds
      setTimeout(() => {
        router.push(`/bookings/${bookingId}`);
      }, 2000);

    } catch (error) {
      console.error('Repair failed:', error);
      setStatus(`❌ Repair failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Repair Booking</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          Booking ID:
        </label>
        <input
          type="text"
          value={bookingId}
          onChange={(e) => setBookingId(e.target.value)}
          placeholder="e.g., BK17558441780196007"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ccc',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <button
        onClick={repairBooking}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#9CA3AF' : '#F59E0B',
          color: 'white',
          padding: '0.75rem 1.5rem',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '1rem',
          width: '100%'
        }}
      >
        {loading ? 'Repairing...' : 'Repair Booking'}
      </button>

      {status && (
        <div style={{
          padding: '1rem',
          border: '1px solid #ccc',
          borderRadius: '0.5rem',
          backgroundColor: '#f9f9f9',
          marginBottom: '1rem'
        }}>
          {status}
        </div>
      )}

      <div style={{ textAlign: 'center' }}>
        <Link href="/payments" style={{ color: '#F59E0B', textDecoration: 'underline' }}>
          ← Back to Payments
        </Link>
      </div>
    </div>
  );
}
