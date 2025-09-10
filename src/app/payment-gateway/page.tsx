"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import PaymentGateway from '@/app/components/PaymentGateway';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/components/AnimatedBackground';
import Link from 'next/link';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function PaymentGatewayPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [bookingData, setBookingData] = useState<any>(null);
  const [error, setError] = useState('');

  // --- Theme and Style Definitions (consistent with dashboard) ---
  const lightTheme = { 
    mainBg: '#fffbeb', 
    bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)', 
    glassPanelBg: 'rgba(255, 255, 255, 0.92)', 
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', 
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)', 
    textPrimary: '#1f2937', 
    textSecondary: '#4B5563', 
    textMuted: '#6B7280', 
    quickActionBg: 'rgba(249, 250, 251, 0.8)', 
    quickActionBorder: '1px solid rgba(209, 213, 219, 0.5)', 
    alertBg: 'rgba(249, 250, 251, 0.6)' 
  };
  
  const darkTheme = { 
    mainBg: '#0f172a', 
    bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)', 
    glassPanelBg: 'rgba(30, 41, 59, 0.8)', 
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', 
    glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)', 
    textPrimary: '#f9fafb', 
    textSecondary: '#9ca3af', 
    textMuted: '#9ca3af', 
    quickActionBg: 'rgba(51, 65, 85, 0.8)', 
    quickActionBorder: '1px solid rgba(75, 85, 99, 0.5)', 
    alertBg: 'rgba(51, 65, 85, 0.6)' 
  };
  
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;
  
  // Animation styles (consistent with dashboard)
  const animationStyles = `
    @keyframes road-marking { 
      0% { transform: translateX(-200%); } 
      100% { transform: translateX(500%); } 
    } 
    .animate-road-marking { animation: road-marking 10s linear infinite; } 
    
    @keyframes car-right { 
      0% { transform: translateX(-100%); } 
      100% { transform: translateX(100vw); } 
    } 
    .animate-car-right { animation: car-right 15s linear infinite; } 
    
    @keyframes car-left { 
      0% { transform: translateX(100vw) scaleX(-1); } 
      100% { transform: translateX(-200px) scaleX(-1); } 
    } 
    .animate-car-left { animation: car-left 16s linear infinite; } 
    
    @keyframes light-blink { 
      0%, 100% { opacity: 1; box-shadow: 0 0 15px #fcd34d; } 
      50% { opacity: 0.6; box-shadow: 0 0 5px #fcd34d; } 
    } 
    .animate-light-blink { animation: light-blink 1s infinite; } 
    
    @keyframes fade-in-down { 
      from { opacity: 0; transform: translateY(-20px); } 
      to { opacity: 1; transform: translateY(0); } 
    } 
    .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; } 
    
    @keyframes fade-in-up { 
      from { opacity: 0; transform: translateY(20px); } 
      to { opacity: 1; transform: translateY(0); } 
    } 
    .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; } 
    
    @keyframes trainMove { 
      from { left: 100%; } 
      to { left: -300px; } 
    } 
    
    @keyframes slight-bounce { 
      0%, 100% { transform: translateY(0px); } 
      50% { transform: translateY(-1px); } 
    } 
    .animate-slight-bounce { animation: slight-bounce 2s ease-in-out infinite; } 
    
    @keyframes steam { 
      0% { opacity: 0.8; transform: translateY(0) scale(1); } 
      100% { opacity: 0; transform: translateY(-20px) scale(2.5); } 
    } 
    .animate-steam { animation: steam 2s ease-out infinite; } 
    
    @keyframes wheels { 
      0% { transform: rotate(0deg); } 
      100% { transform: rotate(-360deg); } 
    } 
    .animate-wheels { animation: wheels 2s linear infinite; } 
    
    @keyframes spin { 
      0% { transform: rotate(0deg); } 
      100% { transform: rotate(360deg); } 
    }
    
    .animation-delay-100 { animation-delay: 0.1s; } 
    .animation-delay-200 { animation-delay: 0.2s; } 
    .animation-delay-300 { animation-delay: 0.3s; } 
    .animation-delay-400 { animation-delay: 0.4s; } 
    .animation-delay-500 { animation-delay: 0.5s; } 
    .animation-delay-600 { animation-delay: 0.6s; } 
    .animation-delay-700 { animation-delay: 0.7s; } 
    .animation-delay-800 { animation-delay: 0.8s; } 
    .animation-delay-1000 { animation-delay: 1s; } 
    .animation-delay-1200 { animation-delay: 1.2s; } 
    .animation-delay-1500 { animation-delay: 1.5s; } 
    .animation-delay-2000 { animation-delay: 2s; } 
    .animation-delay-2500 { animation-delay: 2.5s; } 
    .animation-delay-3000 { animation-delay: 3s; } 
    
    @media (max-width: 768px) { 
      .animated-vehicle { display: none; } 
      .nav-user-welcome { display: none; }
    }
  `;

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
        scheduleId: bookingData.scheduleId || '0',
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
      
      const bookingResponse = await fetch(`${baseURL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingPayload)
      });

      console.log('Booking API response status:', bookingResponse.status);

      let bookingResult;
      const responseText = await bookingResponse.text();
      console.log('Raw API response:', responseText);

      if (!bookingResponse.ok) {
        console.error('Booking API Error - Status:', bookingResponse.status);
        console.error('Booking API Error - Response:', responseText);
        
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

      // STEP 2: Store locally as backup (after successful API call)
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
      <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
        <style jsx>{animationStyles}</style>
        <AnimatedBackground currentThemeStyles={currentThemeStyles} />
        
        <div style={{ position: 'relative', zIndex: 10 }}>
          {/* Navigation */}
          <nav style={{ backgroundColor: 'rgba(30, 41, 59, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem 0' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
                <ShieldCheckIcon width={32} height={32} color="#dc2626" />
                <div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    <span style={{ color: '#F59E0B', fontSize: '2rem', marginRight: '0.5rem' }}>ශ්‍රී</span>Express
                  </h1>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Payment Gateway</p>
                </div>
              </Link>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <ThemeSwitcher />
                <Link href="/book" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: '500' }}>
                  Back to Booking
                </Link>
              </div>
            </div>
          </nav>

          <main style={{ width: '100%', minHeight: 'calc(100vh - 90px)', display: 'flex', justifyContent: 'center', padding: '2rem 1.5rem' }}>
            <div className="animate-fade-in-down" style={{ 
              width: '100%', 
              maxWidth: '800px',
              backgroundColor: currentThemeStyles.glassPanelBg,
              padding: '2rem',
              borderRadius: '1rem',
              boxShadow: currentThemeStyles.glassPanelShadow,
              backdropFilter: 'blur(16px)',
              border: currentThemeStyles.glassPanelBorder
            }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
                <h2 style={{ color: '#DC2626', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>Payment Processing Error</h2>
              </div>
              
              <div style={{ 
                backgroundColor: currentThemeStyles.alertBg, 
                border: currentThemeStyles.quickActionBorder, 
                borderRadius: '0.75rem', 
                padding: '1.5rem', 
                marginBottom: '1.5rem',
                textAlign: 'left',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                <pre style={{ 
                  color: '#DC2626', 
                  fontSize: '0.8rem', 
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  margin: 0,
                  fontFamily: 'monospace'
                }}>
                  {error}
                </pre>
              </div>
              
              <div style={{ 
                backgroundColor: 'rgba(254, 243, 199, 0.8)', 
                padding: '1.5rem', 
                borderRadius: '0.75rem', 
                marginBottom: '1.5rem', 
                border: '1px solid #F59E0B' 
              }}>
                <h4 style={{ color: '#92400E', margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: '600' }}>Common Issues:</h4>
                <ul style={{ color: '#92400E', fontSize: '0.9rem', textAlign: 'left', margin: 0, paddingLeft: '1.5rem', lineHeight: '1.6' }}>
                  <li>You navigated directly to this page</li>
                  <li>Your booking session expired</li>
                  <li>Browser data was cleared</li>
                  <li>Backend server is not running</li>
                  <li>Database connection issues</li>
                  <li>Authentication token expired</li>
                </ul>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <Link href="/book" style={{ 
                  backgroundColor: '#F59E0B', 
                  color: 'white', 
                  padding: '0.75rem 1.5rem', 
                  borderRadius: '0.5rem', 
                  textDecoration: 'none', 
                  fontWeight: '600',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
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
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
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
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}>
                  View Bookings
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
        <style jsx>{animationStyles}</style>
        <AnimatedBackground currentThemeStyles={currentThemeStyles} />
        
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid rgba(251, 191, 36, 0.3)', 
              borderTop: '4px solid #F59E0B', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite', 
              margin: '0 auto 16px' 
            }}></div>
            <div style={{ color: currentThemeStyles.textPrimary, fontSize: '16px', fontWeight: '600' }}>
              Loading payment gateway...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <style jsx>{animationStyles}</style>
      <style jsx global>{`
        .payment-gateway-container:hover { transform: translateY(-2px); }
        @media (max-width: 768px) { 
          .nav-links { display: none; } 
          .payment-gateway-container { margin: 1rem; }
        }
      `}</style>
      
      {/* Animated Background */}
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Navigation */}
        <nav style={{ backgroundColor: 'rgba(30, 41, 59, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem 0' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
              <ShieldCheckIcon width={32} height={32} color="#dc2626" />
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  <span style={{ color: '#F59E0B', fontSize: '2rem', marginRight: '0.5rem' }}>ශ්‍රී</span>Express
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: 0 }}>Secure Payment Gateway</p>
              </div>
            </Link>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div className="nav-links" style={{ display: 'flex', gap: '1.5rem' }}>
                <Link href="/dashboard" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: '500' }}>Dashboard</Link>
                <Link href="/bookings" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: '500' }}>My Bookings</Link>
              </div>
              <ThemeSwitcher />
              <Link href="/book" style={{ 
                backgroundColor: '#374151', 
                color: '#f9fafb', 
                padding: '0.5rem 1rem', 
                borderRadius: '0.5rem', 
                textDecoration: 'none', 
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}>
                ← Back to Booking
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main style={{ width: '100%', minHeight: 'calc(100vh - 90px)', display: 'flex', justifyContent: 'center', padding: '2rem 1.5rem' }}>
          <div className="animate-fade-in-down payment-gateway-container" style={{ 
            width: '100%', 
            maxWidth: '600px',
            transition: 'all 0.3s ease'
          }}>
            {/* Page Header */}
            <div style={{ 
              backgroundColor: currentThemeStyles.glassPanelBg,
              padding: '2rem',
              borderRadius: '1rem',
              boxShadow: currentThemeStyles.glassPanelShadow,
              backdropFilter: 'blur(16px)',
              border: currentThemeStyles.glassPanelBorder,
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              <h1 style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                margin: '0 0 0.5rem 0', 
                color: currentThemeStyles.textPrimary,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)' 
              }}>
                Complete Your Payment
              </h1>
              <p style={{ 
                color: currentThemeStyles.textSecondary, 
                margin: 0, 
                fontSize: '1.1rem' 
              }}>
                Secure payment processing for your travel booking.
              </p>
            </div>

            {/* Payment Gateway Component */}
            <div style={{ 
              backgroundColor: currentThemeStyles.glassPanelBg,
              borderRadius: '1rem',
              boxShadow: currentThemeStyles.glassPanelShadow,
              backdropFilter: 'blur(16px)',
              border: currentThemeStyles.glassPanelBorder,
              overflow: 'hidden'
            }}>
              <PaymentGateway
                bookingData={bookingData}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentCancel={handlePaymentCancel}
                onPaymentError={handlePaymentError}
                currentThemeStyles={currentThemeStyles}
              />
            </div>

            {/* Security Notice */}
            <div style={{ 
              backgroundColor: currentThemeStyles.alertBg,
              padding: '1.5rem',
              borderRadius: '1rem',
              border: currentThemeStyles.quickActionBorder,
              marginTop: '2rem',
              textAlign: 'center'
            }}>
              <h3 style={{ 
                color: currentThemeStyles.textPrimary, 
                margin: '0 0 0.75rem 0', 
                fontSize: '1rem', 
                fontWeight: '600' 
              }}>
                🔒 Secure Payment Environment
              </h3>
              <p style={{ 
                color: currentThemeStyles.textSecondary, 
                margin: 0, 
                fontSize: '0.9rem', 
                lineHeight: '1.6' 
              }}>
                Your payment information is protected with bank-level security. 
                All transactions are processed through secure SSL encryption. 
                We never store your card details on our servers.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
