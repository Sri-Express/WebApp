"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import PaymentGateway from '@/app/components/PaymentGateway';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import Link from 'next/link';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function PaymentGatewayPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [bookingData, setBookingData] = useState<any>(null);
  const [error, setError] = useState('');

  // Theme styles
  const lightTheme = { mainBg: '#fffbeb', bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)', glassPanelBg: 'rgba(255, 255, 255, 0.92)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)', textPrimary: '#1f2937', textSecondary: '#4B5563' };
  const darkTheme = { mainBg: '#0f172a', bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)', glassPanelBg: 'rgba(30, 41, 59, 0.8)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)', textPrimary: '#f9fafb', textSecondary: '#9ca3af' };
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    // Get booking data from localStorage
    const pendingBooking = localStorage.getItem('pendingBooking');
    if (!pendingBooking) {
      setError('No booking data found. Please start the booking process again.');
      return;
    }
    
    try {
      const booking = JSON.parse(pendingBooking);
      setBookingData(booking);
    } catch (err) {
      setError('Invalid booking data. Please start the booking process again.');
    }
  }, []);

  const handlePaymentSuccess = async (paymentResult: any) => {
    if (!bookingData) return;

    try {
      console.log('🎉 Payment successful, processing booking...');
      
      // Get token for API calls
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Generate a unique booking ID
      const bookingId = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      console.log('🎫 Generated booking ID:', bookingId);

      // Step 1: Create booking with payment info (confirmed status)
      const bookingWithPayment = {
        ...bookingData,
        bookingId: bookingId,
        paymentInfo: {
          paymentId: paymentResult.paymentId,
          transactionId: paymentResult.transactionId,
          method: paymentResult.method,
          status: 'completed', // ✅ Payment completed
          paidAt: paymentResult.paidAt
        },
        status: 'confirmed', // ✅ Booking confirmed
        checkInInfo: {
          checkedIn: false
        },
        isActive: true
      };

      // Step 2: Store locally FIRST (ensures data safety)
      console.log('💾 Storing booking locally (primary backup)...');
      const existingBookings = JSON.parse(localStorage.getItem('localBookings') || '[]');
      const filteredBookings = existingBookings.filter((b: any) => 
        b.bookingId !== bookingId && b._id !== bookingId
      );
      filteredBookings.push(bookingWithPayment);
      localStorage.setItem('localBookings', JSON.stringify(filteredBookings));
      console.log('✅ Booking safely stored locally');

      // Step 3: Create payment record locally
      const paymentRecord = {
        _id: `payment_${Date.now()}`,
        bookingId: bookingId,
        amount: bookingData.pricing.totalAmount,
        currency: bookingData.pricing.currency || 'LKR',
        method: paymentResult.method,
        status: 'completed',
        transactionId: paymentResult.transactionId,
        paymentId: paymentResult.paymentId,
        userId: bookingData.userId,
        createdAt: paymentResult.paidAt,
        booking: bookingWithPayment // Full booking data for recovery
      };

      const existingPayments = JSON.parse(localStorage.getItem('localPayments') || '[]');
      existingPayments.push(paymentRecord);
      localStorage.setItem('localPayments', JSON.stringify(existingPayments));
      console.log('✅ Payment record safely stored locally');

      // Step 4: Try to sync with backend (best effort)
      let backendSyncSuccess = false;
      
      try {
        console.log('🔄 Attempting backend sync...');
        
        // 4a. Create booking via API
        const bookingResponse = await fetch(`${baseURL}/api/bookings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(bookingWithPayment)
        });

        if (bookingResponse.ok) {
          const bookingResult = await bookingResponse.json();
          console.log('✅ Booking synced to backend:', bookingResult.booking?.bookingId);
          
          // 4b. Confirm payment via API to ensure status is updated
          const paymentConfirmResponse = await fetch(`${baseURL}/api/payments/confirm`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              bookingId: bookingId,
              transactionId: paymentResult.transactionId,
              paymentData: paymentResult
            })
          });

          if (paymentConfirmResponse.ok) {
            console.log('✅ Payment status confirmed in backend');
            backendSyncSuccess = true;
          } else {
            console.warn('⚠️ Payment confirmation failed, but booking exists');
          }
        } else {
          console.warn('⚠️ Backend booking creation failed, using local storage');
        }
      } catch (apiError) {
        console.warn('⚠️ Backend sync failed, but data is safe locally:', apiError);
      }

      // Step 5: Clean up and navigate
      localStorage.removeItem('pendingBooking');
      
      console.log('🎊 Booking process completed!');
      console.log('📊 Backend sync status:', backendSyncSuccess ? 'Success' : 'Failed (using local storage)');
      console.log('🎫 Final booking ID:', bookingId);

      // Small delay to ensure all operations complete
      await new Promise(resolve => setTimeout(resolve, 200));

      // Navigate to booking details
      router.push(`/bookings/${bookingId}`);

    } catch (error) {
      console.error('💥 Critical error in payment processing:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Payment processing failed: ${errorMessage}. Please contact support with your payment reference: ${paymentResult?.reference || 'N/A'}`);
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('💥 Payment error:', error);
    setError(error);
  };

  const handlePaymentCancel = () => {
    console.log('❌ Payment cancelled by user');
    router.push('/book');
  };

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: currentThemeStyles.mainBg, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', border: currentThemeStyles.glassPanelBorder, boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', maxWidth: '500px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
          <h2 style={{ color: '#DC2626', marginBottom: '1rem' }}>Booking Error</h2>
          <p style={{ color: currentThemeStyles.textSecondary, marginBottom: '1.5rem' }}>{error}</p>
          
          <div style={{ backgroundColor: '#FEF3C7', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid #F59E0B' }}>
            <h4 style={{ color: '#92400E', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>💡 This might happen if:</h4>
            <ul style={{ color: '#92400E', fontSize: '0.8rem', textAlign: 'left', margin: 0, paddingLeft: '1.2rem' }}>
              <li>You navigated directly to this page</li>
              <li>Your booking session expired</li>
              <li>Browser data was cleared</li>
              <li>There was an error during booking</li>
            </ul>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link href="/book" style={{ 
              backgroundColor: '#F59E0B', 
              color: 'white', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '0.5rem', 
              textDecoration: 'none', 
              fontWeight: '600',
              display: 'inline-block'
            }}>
              🎫 Start New Booking
            </Link>
            <Link href="/search" style={{ 
              backgroundColor: '#6B7280', 
              color: 'white', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '0.5rem', 
              textDecoration: 'none', 
              fontWeight: '600',
              display: 'inline-block'
            }}>
              🔍 Search Routes
            </Link>
            <Link href="/bookings" style={{ 
              backgroundColor: '#8B5CF6', 
              color: 'white', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '0.5rem', 
              textDecoration: 'none', 
              fontWeight: '600',
              display: 'inline-block'
            }}>
              📋 View Existing Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: currentThemeStyles.mainBg }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #fef3c7', borderTop: '4px solid #F59E0B', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <div style={{ color: currentThemeStyles.textPrimary, fontSize: '16px', fontWeight: 600 }}>Loading payment gateway...</div>
        </div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative' }}>
      <style jsx global>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
      
      {/* Navigation */}
      <nav style={{ backgroundColor: 'rgba(30, 41, 59, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <ShieldCheckIcon width={32} height={32} color="#dc2626" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              <span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>ශ්‍රී</span>Express
            </h1>
          </Link>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <ThemeSwitcher />
            <Link href="/book" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: '500' }}>
              ← Back to Booking
            </Link>
          </div>
        </div>
      </nav>

      {/* Payment Gateway */}
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <PaymentGateway
          bookingData={bookingData}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentCancel={handlePaymentCancel}
          onPaymentError={handlePaymentError}
        />
      </div>
    </div>
  );
}