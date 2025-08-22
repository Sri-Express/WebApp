"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MockPaymentGatewayPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bookingData, setBookingData] = useState<any>(null);

  // Mock booking data for testing
  const mockBookingData = {
    routeId: 'RT001',
    scheduleId: 'SCH001',
    travelDate: '2024-12-25',
    departureTime: '08:00',
    passengerInfo: {
      name: 'John Doe',
      phone: '+94771234567',
      email: 'john@example.com',
      idType: 'nic',
      idNumber: '123456789V',
      passengerType: 'regular'
    },
    seatInfo: {
      seatNumber: 'A15',
      seatType: 'window',
      preferences: ['AC', 'WiFi']
    },
    pricing: {
      basePrice: 1500,
      taxes: 150,
      discounts: 0,
      totalAmount: 1650,
      currency: 'LKR'
    },
    routeInfo: {
      name: 'Colombo to Kandy Express',
      startLocation: {
        name: 'Colombo Central',
        address: 'Colombo 01, Sri Lanka'
      },
      endLocation: {
        name: 'Kandy Bus Station',
        address: 'Kandy, Sri Lanka'
      },
      operatorInfo: {
        companyName: 'Sri Express',
        contactNumber: '+94 11 234 5678'
      }
    }
  };

  useEffect(() => {
    // Try to get booking data from localStorage, otherwise use mock data
    const pendingBooking = localStorage.getItem('pendingBooking');
    if (pendingBooking) {
      try {
        setBookingData(JSON.parse(pendingBooking));
      } catch {
        setBookingData(mockBookingData);
      }
    } else {
      setBookingData(mockBookingData);
    }
  }, []);

  const processPayment = async (paymentMethod: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Generate unique IDs
      const bookingId = `BK${Date.now()}`;
      const paymentId = `PAY${Date.now()}`;
      const transactionId = `TXN${Date.now()}`;

      setSuccess('🔄 Processing payment...');
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create the complete booking data
      const completeBookingData = {
        bookingId: bookingId,
        userId: 'mock-user-' + Date.now(),
        ...bookingData,
        paymentInfo: {
          paymentId: paymentId,
          method: paymentMethod,
          status: 'completed',
          paidAt: new Date().toISOString(),
          transactionId: transactionId
        },
        status: 'confirmed',
        checkInInfo: {
          checkedIn: false
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setSuccess('💳 Payment completed! Creating booking...');

      // Get token (if available)
      const token = localStorage.getItem('token');
      
      // Create booking via API
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const bookingResponse = await fetch(`${baseURL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(completeBookingData)
      });

      let bookingResult;
      if (bookingResponse.ok) {
        bookingResult = await bookingResponse.json();
        setSuccess('✅ Booking created successfully!');
      } else {
        // If API fails, create mock booking locally
        console.warn('API booking failed, creating mock booking');
        bookingResult = { booking: completeBookingData };
        setSuccess('✅ Mock booking created successfully!');
      }

      // Create payment record
      const paymentData = {
        bookingId: bookingId,
        amount: bookingData.pricing.totalAmount,
        currency: bookingData.pricing.currency,
        method: paymentMethod,
        status: 'completed',
        userId: completeBookingData.userId,
        transactionId: transactionId,
        createdAt: new Date().toISOString(),
        booking: completeBookingData
      };

      try {
        const paymentResponse = await fetch(`${baseURL}/api/payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify(paymentData)
        });

        if (!paymentResponse.ok) {
          console.warn('Payment API failed, but booking was created');
        }
      } catch (paymentError) {
        console.warn('Payment recording failed:', paymentError);
      }

      // Clear any pending booking data
      localStorage.removeItem('pendingBooking');

      // Show success message for 2 seconds then redirect
      setTimeout(() => {
        router.push(`/bookings/${bookingId}`);
      }, 2000);

    } catch (error) {
      console.error('Payment processing failed:', error);
      setError(`❌ Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!bookingData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#1f2937' }}>
        🏦 Sri Express Mock Payment Gateway
      </h1>

      {/* Booking Summary */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '1.5rem', 
        borderRadius: '0.75rem', 
        marginBottom: '2rem',
        border: '1px solid #e9ecef'
      }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#495057' }}>
          Payment Summary
        </h2>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Route:</span>
            <span style={{ fontWeight: 'bold' }}>{bookingData.routeInfo?.name || 'Express Route'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Date:</span>
            <span>{bookingData.travelDate}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Time:</span>
            <span>{bookingData.departureTime}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Passenger:</span>
            <span>{bookingData.passengerInfo?.name || 'Mock Passenger'}</span>
          </div>
          <hr style={{ margin: '1rem 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', color: '#F59E0B' }}>
            <span>Total Amount:</span>
            <span>Rs. {bookingData.pricing?.totalAmount?.toLocaleString() || '1,650'}</span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#495057' }}>Select Payment Method</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { id: 'card', name: '💳 Credit/Debit Card', desc: 'Visa, MasterCard, American Express' },
            { id: 'bank', name: '🏦 Online Banking', desc: 'Direct bank transfer' },
            { id: 'digital_wallet', name: '📱 Digital Wallet', desc: 'PayPal, Google Pay, Apple Pay' },
            { id: 'cash', name: '💵 Cash Payment', desc: 'Pay on boarding' }
          ].map(method => (
            <button
              key={method.id}
              onClick={() => processPayment(method.id)}
              disabled={loading}
              style={{
                padding: '1rem',
                border: '2px solid #e9ecef',
                borderRadius: '0.5rem',
                backgroundColor: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                opacity: loading ? 0.6 : 1
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.currentTarget.style.borderColor = '#F59E0B';
                  e.currentTarget.style.backgroundColor = '#fffbeb';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.currentTarget.style.borderColor = '#e9ecef';
                  e.currentTarget.style.backgroundColor = 'white';
                }
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                {method.name}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                {method.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Status Messages */}
      {(success || error) && (
        <div style={{
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          backgroundColor: error ? '#fee2e2' : '#d1fae5',
          border: `1px solid ${error ? '#fca5a5' : '#a7f3d0'}`,
          color: error ? '#dc2626' : '#059669'
        }}>
          {error || success}
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <p style={{ fontSize: '0.875rem', color: '#6c757d', marginBottom: '1rem' }}>
          🔒 This is a mock payment gateway for testing purposes
        </p>
        <Link href="/book" style={{ color: '#F59E0B', textDecoration: 'underline' }}>
          ← Back to Booking
        </Link>
      </div>
    </div>
  );
}
