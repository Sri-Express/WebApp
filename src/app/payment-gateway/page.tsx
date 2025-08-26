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
    console.log('=== PAYMENT GATEWAY INITIALIZATION ===');
    
    // Get booking data from localStorage
    const pendingBooking = localStorage.getItem('pendingBooking');
    console.log('Pending booking from localStorage:', pendingBooking);
    
    if (!pendingBooking) {
      console.error('No booking data found in localStorage');
      setError('No booking data found. Please start the booking process again.');
      return;
    }
    
    try {
      const booking = JSON.parse(pendingBooking);
      console.log('Parsed booking data:', booking);
      setBookingData(booking);
    } catch (err) {
      console.error('Error parsing booking data:', err);
      setError('Invalid booking data. Please start the booking process again.');
    }
  }, []);

  const handlePaymentSuccess = async (paymentResult: any) => {
    if (!bookingData) {
      console.error('No booking data available');
      return;
    }

    try {
      console.log('=== PAYMENT SUCCESS PROCESSING START ===');
      console.log('Payment successful, processing booking...');
      console.log('Booking data:', JSON.stringify(bookingData, null, 2));
      console.log('Payment result:', JSON.stringify(paymentResult, null, 2));
      
      // Get token for API calls
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      console.log('Authentication check:', {
        tokenExists: !!token,
        tokenLength: token?.length || 0,
        userExists: !!user
      });
      
      if (!token) {
        console.error('No authentication token found');
        router.push('/login');
        return;
      }
      
      if (!user) {
        console.error('No user data found');
        router.push('/login');
        return;
      }
      
      const userData = JSON.parse(user);
      console.log('User data:', {
        id: userData._id || userData.id,
        email: userData.email,
        name: userData.name
      });

      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      console.log('API Base URL:', baseURL);

      // Create booking data in the format the backend expects
      const bookingPayload = {
        routeId: bookingData.routeId,
        scheduleId: bookingData.scheduleId || '0', // Default to first schedule
        travelDate: bookingData.travelDate,
        departureTime: bookingData.departureTime,
        passengerInfo: {
          name: bookingData.passengerInfo.name,
          phone: bookingData.passengerInfo.phone,
          email: bookingData.passengerInfo.email,
          idType: bookingData.passengerInfo.idType,
          idNumber: bookingData.passengerInfo.idNumber,
          passengerType: bookingData.passengerInfo.passengerType
        },
        seatInfo: {
          seatNumber: bookingData.seatInfo.seatNumber || `${Math.floor(Math.random() * 50) + 1}W`,
          seatType: bookingData.seatInfo.seatType,
          preferences: bookingData.seatInfo.preferences || []
        },
        paymentMethod: bookingData.paymentMethod,
        // Additional fields for confirmed booking
        status: 'confirmed',
        paymentInfo: {
          method: paymentResult.method || bookingData.paymentMethod,
          status: 'completed',
          transactionId: paymentResult.transactionId,
          paidAt: new Date().toISOString()
        }
      };

      console.log('Final booking payload:', JSON.stringify(bookingPayload, null, 2));

      // STEP 1: Create booking via API with detailed error handling
      console.log('=== CREATING BOOKING VIA API ===');
      console.log('Making API request to:', `${baseURL}/api/bookings`);
      console.log('Request headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.substring(0, 10)}...`
      });
      
      const bookingResponse = await fetch(`${baseURL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingPayload)
      });

      console.log('Booking API response status:', bookingResponse.status);
      console.log('Booking API response status text:', bookingResponse.statusText);
      console.log('Booking API response headers:', Object.fromEntries(bookingResponse.headers));

      let bookingResult;
      const responseText = await bookingResponse.text();
      console.log('Raw API response:', responseText);

      if (!bookingResponse.ok) {
        console.error('Booking API Error - Status:', bookingResponse.status);
        console.error('Booking API Error - Response:', responseText);
        
        // Try to parse as JSON for better error details
        try {
          const errorJson = JSON.parse(responseText);
          console.error('Parsed Error Details:', errorJson);
          throw new Error(`Booking creation failed: ${errorJson.message || responseText}`);
        } catch (parseError) {
          console.error('Could not parse error response as JSON:', parseError);
          throw new Error(`Booking creation failed (${bookingResponse.status}): ${responseText}`);
        }
      }

      try {
        bookingResult = JSON.parse(responseText);
        console.log('Parsed booking result:', JSON.stringify(bookingResult, null, 2));
      } catch (parseError) {
        console.error('Could not parse successful response as JSON:', parseError);
        throw new Error('Invalid response format from server');
      }

      console.log('Booking created successfully:', {
        bookingId: bookingResult.booking?.bookingId,
        _id: bookingResult.booking?._id,
        status: bookingResult.booking?.status
      });

      // STEP 2: Confirm payment status (backup step)
      if (bookingResult.booking) {
        console.log('=== CONFIRMING PAYMENT STATUS ===');
        
        try {
          const paymentConfirmPayload = {
            bookingId: bookingResult.booking.bookingId || bookingResult.booking._id,
            transactionId: paymentResult.transactionId,
            paymentData: paymentResult
          };
          
          console.log('Payment confirmation payload:', paymentConfirmPayload);
          
          const paymentConfirmResponse = await fetch(`${baseURL}/api/payments/confirm`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(paymentConfirmPayload)
          });

          console.log('Payment confirm response status:', paymentConfirmResponse.status);
          
          if (paymentConfirmResponse.ok) {
            const confirmResult = await paymentConfirmResponse.json();
            console.log('Payment confirmation successful:', confirmResult);
          } else {
            const confirmErrorText = await paymentConfirmResponse.text();
            console.warn('Payment confirmation failed (non-critical):', {
              status: paymentConfirmResponse.status,
              response: confirmErrorText
            });
          }
        } catch (confirmError) {
          console.warn('Payment confirmation error (non-critical):', confirmError);
        }
      }

      // STEP 3: Store locally as backup (after successful API call)
      console.log('=== STORING BACKUP LOCALLY ===');
      const bookingWithLocalData = {
        ...bookingResult.booking,
        localBackup: true,
        apiSyncStatus: 'synced',
        lastUpdated: new Date().toISOString()
      };
      
      const existingBookings = JSON.parse(localStorage.getItem('localBookings') || '[]');
      console.log('Existing local bookings count:', existingBookings.length);
      
      const filteredBookings = existingBookings.filter((b: any) => 
        b.bookingId !== bookingWithLocalData.bookingId && b._id !== bookingWithLocalData._id
      );
      filteredBookings.push(bookingWithLocalData);
      localStorage.setItem('localBookings', JSON.stringify(filteredBookings));
      console.log('Updated local bookings count:', filteredBookings.length);

      // Clean up
      localStorage.removeItem('pendingBooking');
      console.log('Cleaned up pending booking from localStorage');
      
      console.log('=== BOOKING PROCESS COMPLETED SUCCESSFULLY ===');
      const finalBookingId = bookingResult.booking.bookingId || bookingResult.booking._id;
      console.log('Final booking ID:', finalBookingId);
      console.log('Redirecting to booking details...');

      // Navigate to booking details
      router.push(`/bookings/${finalBookingId}`);

    } catch (error) {
      console.error('=== CRITICAL ERROR IN PAYMENT PROCESSING ===');
      console.error('Error object:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error occurred');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Enhanced error reporting
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const debugInfo = {
        bookingDataExists: !!bookingData,
        tokenExists: !!localStorage.getItem('token'),
        userExists: !!localStorage.getItem('user'),
        paymentResult: paymentResult || 'None',
        timestamp: new Date().toISOString(),
        bookingDataSummary: bookingData ? {
          routeId: bookingData.routeId,
          passengerName: bookingData.passengerInfo?.name,
          paymentMethod: bookingData.paymentMethod
        } : 'None'
      };
      
      console.error('Debug Information:', JSON.stringify(debugInfo, null, 2));
      
      // Store error info for support
      localStorage.setItem('lastBookingError', JSON.stringify({
        error: errorMessage,
        debugInfo,
        bookingData: bookingData || null,
        paymentResult: paymentResult || null
      }));
      
      setError(`Payment processing failed: ${errorMessage}

Debug Information:
${JSON.stringify(debugInfo, null, 2)}

This error has been saved to your browser. Please contact support with your payment reference: ${paymentResult?.transactionId || 'N/A'}`);
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    setError(error);
  };

  const handlePaymentCancel = () => {
    console.log('Payment cancelled by user');
    router.push('/book');
  };

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: currentThemeStyles.mainBg, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', border: currentThemeStyles.glassPanelBorder, boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', maxWidth: '600px', width: '100%' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ color: '#DC2626', marginBottom: '1rem' }}>Booking Error</h2>
          <div style={{ 
            backgroundColor: '#FEF2F2', 
            border: '1px solid #FCA5A5', 
            borderRadius: '0.5rem', 
            padding: '1rem', 
            marginBottom: '1.5rem',
            textAlign: 'left',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            <pre style={{ 
              color: '#DC2626', 
              fontSize: '0.8rem', 
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              margin: 0
            }}>
              {error}
            </pre>
          </div>
          
          <div style={{ backgroundColor: '#FEF3C7', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid #F59E0B' }}>
            <h4 style={{ color: '#92400E', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>This might happen if:</h4>
            <ul style={{ color: '#92400E', fontSize: '0.8rem', textAlign: 'left', margin: 0, paddingLeft: '1.2rem' }}>
              <li>You navigated directly to this page</li>
              <li>Your booking session expired</li>
              <li>Browser data was cleared</li>
              <li>Backend server is not running</li>
              <li>Database connection issues</li>
              <li>Authentication token expired</li>
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
              Start New Booking
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
              Search Routes
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
              View Existing Bookings
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