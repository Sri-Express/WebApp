"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import { 
  ShieldCheckIcon, MagnifyingGlassIcon, ExclamationTriangleIcon,
  CheckCircleIcon, XCircleIcon, InformationCircleIcon, WrenchScrewdriverIcon,
  DocumentTextIcon, CreditCardIcon, TrashIcon, PlusCircleIcon,
  ArrowPathIcon, DocumentArrowDownIcon, ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

interface BookingRecord {
  _id?: string;
  bookingId: string;
  userId?: string;
  routeId?: string;
  scheduleId?: string;
  travelDate?: string;
  departureTime?: string;
  passengerInfo?: any;
  seatInfo?: any;
  pricing?: any;
  paymentInfo?: any;
  status?: string;
  checkInInfo?: any;
  routeInfo?: any;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface PaymentRecord {
  _id?: string;
  id?: string;
  bookingId?: string;
  amount?: number;
  currency?: string;
  method?: string;
  status?: string;
  transactionId?: string;
  paymentId?: string;
  authCode?: string;
  reference?: string;
  gateway?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  paidAt?: string;
  booking?: BookingRecord;
}

interface DiagnosticLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export default function BookingDiagnosticPage() {
  const { theme } = useTheme();
  const [targetBookingId, setTargetBookingId] = useState('BK17558510471719241');
  const [logs, setLogs] = useState<DiagnosticLog[]>([]);
  const [localBookings, setLocalBookings] = useState<BookingRecord[]>([]);
  const [localPayments, setLocalPayments] = useState<PaymentRecord[]>([]);
  const [investigationResults, setInvestigationResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Theme styles
  const lightTheme = {
    mainBg: '#fffbeb',
    bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    glassPanelBg: 'rgba(255, 255, 255, 0.95)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
    glassPanelShadow: '0 20px 40px rgba(0,0,0,0.1)',
    textPrimary: '#1f2937',
    textSecondary: '#4B5563',
    textMuted: '#6B7280'
  };

  const darkTheme = {
    mainBg: '#0f172a',
    bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    glassPanelBg: 'rgba(30, 41, 59, 0.8)',
    glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)',
    glassPanelShadow: '0 20px 40px rgba(0,0,0,0.2)',
    textPrimary: '#f9fafb',
    textSecondary: '#9ca3af',
    textMuted: '#9ca3af'
  };

  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;

  const log = useCallback((message: string, type: DiagnosticLog['type'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  }, []);

  const clearLogs = () => {
    setLogs([]);
  };

  const refreshStorageStatus = useCallback(() => {
    log('🔄 Refreshing storage status...', 'info');
    
    const bookings = JSON.parse(localStorage.getItem('localBookings') || '[]');
    const payments = JSON.parse(localStorage.getItem('localPayments') || '[]');
    
    setLocalBookings(bookings);
    setLocalPayments(payments);
    
    log(`📊 Storage status refreshed - Bookings: ${bookings.length}, Payments: ${payments.length}`, 'success');
  }, [log]);

  const investigateBookingId = useCallback(() => {
    if (!targetBookingId) {
      log('❌ Please enter a booking ID to investigate', 'error');
      return;
    }

    setIsLoading(true);
    log(`🔍 Starting investigation for booking ID: ${targetBookingId}`, 'info');
    
    // Check localStorage bookings
    const localMatch = localBookings.find(b => 
      b.bookingId === targetBookingId || b._id === targetBookingId
    );
    
    // Check payment records
    const paymentMatch = localPayments.find(p => 
      p.bookingId === targetBookingId || 
      (p.booking && (p.booking.bookingId === targetBookingId || p.booking._id === targetBookingId))
    );
    
    // Check booking ID format
    const idFormat = /^BK\d+$/.test(targetBookingId);
    
    // Find similar IDs
    const allIds = [
      ...localBookings.map(b => b.bookingId || b._id),
      ...localPayments.map(p => p.bookingId || (p.booking && p.booking.bookingId))
    ].filter(Boolean);
    
    const similarIds = allIds.filter(id => id && id.includes(targetBookingId.substring(0, 10)));
    
    const results = {
      foundInBookings: !!localMatch,
      foundInPayments: !!paymentMatch,
      validFormat: idFormat,
      similarIds,
      bookingData: localMatch,
      paymentData: paymentMatch
    };
    
    setInvestigationResults(results);
    
    if (localMatch) {
      log(`✅ Found booking in localStorage: ${JSON.stringify(localMatch)}`, 'success');
    } else {
      log(`❌ Booking not found in localStorage`, 'error');
    }
    
    if (paymentMatch) {
      log(`✅ Found in payment records: ${JSON.stringify(paymentMatch)}`, 'success');
    } else {
      log(`❌ Booking not found in payment records`, 'error');
    }
    
    log(`🏁 Investigation completed for ${targetBookingId}`, 'info');
    setIsLoading(false);
  }, [targetBookingId, localBookings, localPayments, log]);

  const repairBookingFromPayment = () => {
    if (!targetBookingId) {
      log('❌ Please enter a booking ID to repair', 'error');
      return;
    }

    log(`🔧 Attempting to repair booking: ${targetBookingId}`, 'info');
    
    const payment = localPayments.find(p => 
      p.bookingId === targetBookingId || 
      (p.booking && p.booking.bookingId === targetBookingId)
    );
    
    if (!payment) {
      log(`❌ Cannot repair: Payment record not found for ${targetBookingId}`, 'error');
      return;
    }
    
    // Create a synthetic booking from payment data
    const repairedBooking: BookingRecord = {
      _id: targetBookingId,
      bookingId: targetBookingId,
      userId: payment.userId || payment.booking?.userId || 'unknown',
      routeId: payment.booking?.routeId || 'repaired-route',
      scheduleId: payment.booking?.scheduleId || 'unknown',
      travelDate: payment.booking?.travelDate || new Date(Date.now() + 86400000).toISOString(),
      departureTime: payment.booking?.departureTime || '08:00',
      passengerInfo: payment.booking?.passengerInfo || {
        name: 'Recovered Passenger',
        phone: '+94771234567',
        email: 'recovered@example.com',
        idType: 'nic',
        idNumber: 'RECOVERED',
        passengerType: 'regular'
      },
      seatInfo: payment.booking?.seatInfo || {
        seatNumber: 'A12',
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
        paymentId: payment._id || payment.id || 'unknown',
        method: payment.method || 'card',
        status: 'completed',
        paidAt: payment.createdAt || new Date().toISOString(),
        transactionId: payment.transactionId || 'recovered'
      },
      status: 'confirmed',
      checkInInfo: {
        checkedIn: false
      },
      routeInfo: payment.booking?.routeInfo || {
        name: 'Recovered Route',
        startLocation: {
          name: 'Colombo',
          address: 'Colombo Central Station'
        },
        endLocation: {
          name: 'Kandy',
          address: 'Kandy Railway Station'
        },
        operatorInfo: {
          companyName: 'Sri Express',
          contactNumber: '+94 11 234 5678'
        }
      },
      isActive: true,
      createdAt: payment.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to local bookings
    const updatedBookings = localBookings.filter(b => 
      b.bookingId !== targetBookingId && b._id !== targetBookingId
    );
    
    updatedBookings.push(repairedBooking);
    localStorage.setItem('localBookings', JSON.stringify(updatedBookings));
    setLocalBookings(updatedBookings);
    
    log(`✅ Successfully repaired booking ${targetBookingId}`, 'success');
    refreshStorageStatus();
    investigateBookingId();
  };

  const cancelBookingById = async () => {
    if (!targetBookingId) {
      log('❌ Please enter a booking ID to cancel', 'error');
      return;
    }

    log(`🚫 Attempting to cancel booking: ${targetBookingId}`, 'info');
    
    // First check if booking exists
    const booking = localBookings.find(b => 
      b.bookingId === targetBookingId || b._id === targetBookingId
    );
    
    if (!booking) {
      log(`❌ Cannot cancel: Booking not found for ${targetBookingId}`, 'error');
      return;
    }
    
    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      log(`❌ Booking ${targetBookingId} is already cancelled`, 'warning');
      return;
    }
    
    if (booking.status !== 'confirmed') {
      log(`❌ Cannot cancel booking with status: ${booking.status}`, 'error');
      return;
    }
    
    // Check if it's not too late to cancel (2 hours before departure)
    if (booking.travelDate && booking.departureTime) {
      const travelDateTime = new Date(`${booking.travelDate.split('T')[0]}T${booking.departureTime}`);
      const now = new Date();
      const hoursUntilTravel = (travelDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilTravel < 2) {
        log(`❌ Cannot cancel: Only ${hoursUntilTravel.toFixed(1)} hours until departure (minimum 2 hours required)`, 'error');
        return;
      }
    }
    
    // Try API cancellation first if available
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${baseURL}/api/bookings/${booking._id}/cancel`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ reason: 'Cancelled via diagnostic tool' })
        });

        if (response.ok) {
          const result = await response.json();
          log(`✅ Booking cancelled successfully via API`, 'success');
          log(`💰 Refund amount: Rs. ${result.refundInfo?.refundAmount || 0}`, 'info');
          refreshStorageStatus();
          investigateBookingId();
          return;
        } else {
          log(`⚠️ API cancellation failed, updating local records...`, 'warning');
        }
      } catch (error) {
        log(`⚠️ API not available, updating local records...`, 'warning');
      }
    }
    
    // Fallback to local cancellation
    const updatedBookings = localBookings.map(b => {
      if (b.bookingId === targetBookingId || b._id === targetBookingId) {
        return {
          ...b,
          status: 'cancelled',
          cancellationInfo: {
            reason: 'Cancelled via diagnostic tool',
            cancelledAt: new Date().toISOString(),
            refundAmount: Math.floor((b.pricing?.totalAmount || 0) * 0.8), // 80% refund
            refundStatus: 'pending'
          }
        };
      }
      return b;
    });
    
    localStorage.setItem('localBookings', JSON.stringify(updatedBookings));
    setLocalBookings(updatedBookings);
    
    log(`✅ Successfully cancelled booking ${targetBookingId} locally`, 'success');
    log(`💰 80% refund will be processed: Rs. ${Math.floor((booking.pricing?.totalAmount || 0) * 0.8)}`, 'info');
    refreshStorageStatus();
    investigateBookingId();
  };

  const createTestBooking = () => {
    const testBooking: BookingRecord = {
      _id: 'test-' + Date.now(),
      bookingId: `BK${Date.now()}`,
      userId: 'test-user',
      routeId: 'test-route',
      scheduleId: 'test-schedule',
      travelDate: new Date(Date.now() + 86400000).toISOString(),
      departureTime: '08:00',
      passengerInfo: {
        name: 'Test Passenger',
        phone: '+94771234567',
        email: 'test@example.com',
        idType: 'nic',
        idNumber: '123456789V',
        passengerType: 'regular'
      },
      seatInfo: {
        seatNumber: 'A12',
        seatType: 'window',
        preferences: []
      },
      pricing: {
        basePrice: 500,
        taxes: 50,
        discounts: 0,
        totalAmount: 550,
        currency: 'LKR'
      },
      paymentInfo: {
        paymentId: 'test-payment',
        method: 'card',
        status: 'completed',
        paidAt: new Date().toISOString(),
        transactionId: 'test-txn'
      },
      status: 'confirmed',
      checkInInfo: { checkedIn: false },
      routeInfo: {
        name: 'Test Route - Colombo to Kandy',
        startLocation: { name: 'Colombo', address: 'Colombo Central' },
        endLocation: { name: 'Kandy', address: 'Kandy Station' },
        operatorInfo: { companyName: 'Sri Express', contactNumber: '+94 11 234 5678' }
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedBookings = [...localBookings, testBooking];
    localStorage.setItem('localBookings', JSON.stringify(updatedBookings));
    setLocalBookings(updatedBookings);
    
    log(`✅ Created test booking: ${testBooking.bookingId}`, 'success');
    refreshStorageStatus();
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data?')) {
      localStorage.clear();
      setLocalBookings([]);
      setLocalPayments([]);
      log('🗑️ All localStorage data cleared', 'warning');
      refreshStorageStatus();
    }
  };

  const exportAllData = () => {
    const data = {
      localBookings,
      localPayments,
      pendingBooking: localStorage.getItem('pendingBooking'),
      token: localStorage.getItem('token'),
      user: localStorage.getItem('user'),
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sri-express-debug-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    log('📤 All data exported successfully', 'success');
  };

  useEffect(() => {
    log('🔍 Booking Diagnostic Tool initialized', 'info');
    refreshStorageStatus();
    investigateBookingId();
  }, [investigateBookingId, refreshStorageStatus, log]);

  const getStatusColor = (type: DiagnosticLog['type']) => {
    switch (type) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      case 'warning': return '#F59E0B';
      default: return currentThemeStyles.textPrimary;
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: currentThemeStyles.bgGradient,
      padding: '20px'
    }}>
      {/* Navigation */}
      <nav style={{ 
        backgroundColor: 'rgba(30, 41, 59, 0.92)', 
        backdropFilter: 'blur(12px)', 
        borderBottom: '1px solid rgba(251, 191, 36, 0.3)', 
        padding: '1rem 0',
        borderRadius: '15px',
        marginBottom: '20px'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1.5rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <ShieldCheckIcon width={32} height={32} color="#dc2626" />
            <h1 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: '#ffffff', 
              margin: 0, 
              textShadow: '0 2px 4px rgba(0,0,0,0.5)' 
            }}>
              <span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>ශ්‍රී</span>Express
            </h1>
          </Link>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/bookings" style={{ 
              color: '#d1d5db', 
              textDecoration: 'none', 
              fontWeight: '500' 
            }}>
              Back to Bookings
            </Link>
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        backgroundColor: currentThemeStyles.glassPanelBg,
        borderRadius: '15px',
        padding: '30px',
        boxShadow: currentThemeStyles.glassPanelShadow,
        border: currentThemeStyles.glassPanelBorder,
        backdropFilter: 'blur(12px)'
      }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '30px', 
          paddingBottom: '20px', 
          borderBottom: `2px solid ${currentThemeStyles.glassPanelBorder}` 
        }}>
          <h1 style={{ 
            color: currentThemeStyles.textPrimary, 
            marginBottom: '10px',
            fontSize: '2rem',
            fontWeight: 'bold'
          }}>
            🔍 Sri Express Booking Diagnostic Tool
          </h1>
          <p style={{ color: currentThemeStyles.textSecondary }}>
            Advanced debugging tool to diagnose booking ID issues
          </p>
        </div>

        {/* Target Booking Investigation */}
        <div style={{ 
          marginBottom: '25px', 
          padding: '20px', 
          border: '1px solid #f44336', 
          borderRadius: '10px', 
          backgroundColor: '#ffebee' 
        }}>
          <h3 style={{ color: '#d32f2f', marginBottom: '15px' }}>
            🎯 Target Booking Investigation
          </h3>
          <p style={{ marginBottom: '15px' }}>
            <strong>Problem Booking ID:</strong> 
            <span style={{ 
              background: 'yellow', 
              padding: '2px 4px', 
              borderRadius: '3px', 
              fontWeight: 'bold' 
            }}>
              {targetBookingId}
            </span>
          </p>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={targetBookingId}
              onChange={(e) => setTargetBookingId(e.target.value)}
              placeholder="Enter booking ID to investigate"
              style={{
                flex: 1,
                minWidth: '300px',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
            <button
              onClick={investigateBookingId}
              disabled={isLoading}
              style={{
                backgroundColor: '#ff9800',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <MagnifyingGlassIcon width={16} />
              {isLoading ? 'Investigating...' : 'Investigate'}
            </button>
          </div>

          {/* Investigation Results */}
          {investigationResults && (
            <div style={{ marginTop: '15px' }}>
              <h4>Investigation Results:</h4>
              <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ 
                  padding: '10px', 
                  borderRadius: '8px', 
                  borderLeft: `4px solid ${investigationResults.foundInBookings ? '#4caf50' : '#f44336'}`,
                  backgroundColor: 'white'
                }}>
                  {investigationResults.foundInBookings ? '✅' : '❌'} 
                  {investigationResults.foundInBookings ? ' Found in Local Bookings!' : ' Not found in Local Bookings'}
                </div>
                <div style={{ 
                  padding: '10px', 
                  borderRadius: '8px', 
                  borderLeft: `4px solid ${investigationResults.foundInPayments ? '#4caf50' : '#f44336'}`,
                  backgroundColor: 'white'
                }}>
                  {investigationResults.foundInPayments ? '✅' : '❌'} 
                  {investigationResults.foundInPayments ? ' Found in Payment Records!' : ' Not found in Payment Records'}
                </div>
                <div style={{ 
                  padding: '10px', 
                  borderRadius: '8px', 
                  borderLeft: `4px solid ${investigationResults.validFormat ? '#4caf50' : '#ff9800'}`,
                  backgroundColor: 'white'
                }}>
                  {investigationResults.validFormat ? '✅' : '⚠️'} 
                  Booking ID Format: {investigationResults.validFormat ? 'Valid' : 'Invalid format'}
                </div>
                {investigationResults.similarIds.length > 0 && (
                  <div style={{ 
                    padding: '10px', 
                    borderRadius: '8px', 
                    borderLeft: '4px solid #ff9800',
                    backgroundColor: 'white'
                  }}>
                    🔍 Similar IDs found: {investigationResults.similarIds.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Storage Status */}
        <div style={{ 
          marginBottom: '25px', 
          padding: '20px', 
          border: '1px solid #ddd', 
          borderRadius: '10px', 
          backgroundColor: '#f9f9f9' 
        }}>
          <h3 style={{ color: currentThemeStyles.textPrimary, marginBottom: '15px' }}>
            📊 Current Browser Storage Status
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginBottom: '15px' }}>
            <div style={{ 
              padding: '15px', 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              borderLeft: '4px solid #2196f3' 
            }}>
              <h4 style={{ margin: '0 0 10px 0' }}>🎫 Local Bookings</h4>
              <p><strong>Count:</strong> {localBookings.length}</p>
              <p style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}>
                <strong>IDs:</strong> {localBookings.map(b => b.bookingId || b._id).join(', ') || 'None'}
              </p>
            </div>
            
            <div style={{ 
              padding: '15px', 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              borderLeft: '4px solid #2196f3' 
            }}>
              <h4 style={{ margin: '0 0 10px 0' }}>💳 Local Payments</h4>
              <p><strong>Count:</strong> {localPayments.length}</p>
              <p style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}>
                <strong>Related Booking IDs:</strong> {localPayments.map(p => p.bookingId || (p.booking && p.booking.bookingId)).filter(Boolean).join(', ') || 'None'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={refreshStorageStatus}
              style={{
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ArrowPathIcon width={16} />
              Refresh Status
            </button>
            <button
              onClick={exportAllData}
              style={{
                backgroundColor: '#10B981',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <DocumentArrowDownIcon width={16} />
              Export Data
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ 
          marginBottom: '25px', 
          padding: '20px', 
          border: '1px solid #2196f3', 
          borderRadius: '10px', 
          backgroundColor: '#e3f2fd' 
        }}>
          <h3 style={{ color: '#1976d2', marginBottom: '15px' }}>
            🛠️ Quick Fix Actions
          </h3>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={createTestBooking}
              style={{
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <PlusCircleIcon width={16} />
              Create Test Booking
            </button>
            
            <button
              onClick={repairBookingFromPayment}
              style={{
                backgroundColor: '#9c27b0',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <WrenchScrewdriverIcon width={16} />
              Repair from Payment
            </button>
            
            <button
              onClick={cancelBookingById}
              style={{
                backgroundColor: '#ff9800',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <XCircleIcon width={16} />
              Cancel Booking
            </button>
            
            <button
              onClick={clearAllData}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <TrashIcon width={16} />
              Clear All Data
            </button>
          </div>
        </div>

        {/* Diagnostic Logs */}
        <div style={{ 
          padding: '20px', 
          border: '1px solid #ddd', 
          borderRadius: '10px', 
          backgroundColor: '#f9f9f9' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ color: currentThemeStyles.textPrimary, margin: 0 }}>
              📝 Diagnostic Logs
            </h3>
            <button
              onClick={clearLogs}
              style={{
                backgroundColor: '#6B7280',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ClipboardDocumentIcon width={16} />
              Clear Logs
            </button>
          </div>
          
          <div style={{
            backgroundColor: '#f5f5f5',
            padding: '15px',
            borderRadius: '8px',
            maxHeight: '300px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}>
            {logs.length === 0 ? (
              <p style={{ color: currentThemeStyles.textMuted, fontStyle: 'italic' }}>
                No logs yet. Use the investigation tools above to generate diagnostic information.
              </p>
            ) : (
              logs.map((log, index) => (
                <div key={index} style={{ 
                  marginBottom: '5px',
                  color: getStatusColor(log.type)
                }}>
                  [{log.timestamp}] {log.type.toUpperCase()}: {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
