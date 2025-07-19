// src/app/payments/page.tsx - BEAUTIFUL STYLED VERSION
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Payment {
  _id: string; 
  paymentId: string; 
  userId: string; 
  bookingId: string;
  amount: { subtotal: number; taxes: number; fees: number; discounts: number; total: number; currency: string; };
  paymentMethod: { type: string; provider: string; lastFourDigits?: string; walletType?: string; };
  transactionInfo: { transactionId: string; gatewayTransactionId: string; gatewayProvider: string; authorizationCode: string; };
  status: string;
  statusHistory: Array<{ status: string; timestamp: string; reason?: string; }>;
  billingInfo: { name: string; email: string; phone: string; };
  refundInfo?: { refundId: string; refundAmount: number; refundReason: string; refundMethod: string; refundDate: string; };
  timestamps: { initiatedAt: string; processedAt?: string; completedAt?: string; failedAt?: string; refundedAt?: string; };
  createdAt: string; 
  updatedAt: string;
}

interface PaymentStats {
  totalPayments: number; 
  totalAmount: number; 
  successfulPayments: number; 
  failedPayments: number; 
  refundedPayments: number; 
  pendingPayments: number;
}

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const getToken = () => localStorage.getItem('token');

  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    if (!token) { router.push('/login'); return null; }
    
    let baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    if (baseURL.endsWith('/api')) baseURL = baseURL.slice(0, -4);
    
    const fullURL = `${baseURL}/api${endpoint}`;
    
    try {
      const response = await fetch(fullURL, { 
        ...options, 
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}`, 
          ...options.headers 
        } 
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

  const loadPayments = useCallback(async () => {
    setLoading(true); 
    setError('');
    
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      params.append('sortBy', sortBy); 
      params.append('sortOrder', 'desc');
      
      const response = await apiCall(`/payments/history?${params.toString()}`);
      
      if (response) {
        let paymentsArray = [];
        
        if (Array.isArray(response)) {
          paymentsArray = response;
        } else if (response.payments && Array.isArray(response.payments)) {
          paymentsArray = response.payments;
        } else if (response.data && Array.isArray(response.data)) {
          paymentsArray = response.data;
        }
        
        // ✅ CLEAN AND SAFE DATA EXTRACTION
        const cleanPayments = paymentsArray.map((payment: any, index: number): Payment => {
          const safeString = (value: any): string => {
            if (typeof value === 'string') return value;
            if (typeof value === 'number') return value.toString();
            return '';
          };
          
          const safeNumber = (value: any): number => {
            if (typeof value === 'number') return value;
            if (typeof value === 'string') return parseFloat(value) || 0;
            return 0;
          };

          // ✅ EXTRACT JUST THE BOOKING ID, NOT THE ENTIRE OBJECT
          const extractBookingId = (bookingData: any): string => {
            if (typeof bookingData === 'string') return bookingData;
            if (bookingData && typeof bookingData === 'object') {
              return bookingData.bookingId || bookingData._id || bookingData.id || '';
            }
            return '';
          };
          
          return {
            _id: safeString(payment?._id) || `payment-${index}`,
            paymentId: safeString(payment?.paymentId) || `PAY-${Date.now()}-${index}`,
            userId: safeString(payment?.userId),
            bookingId: extractBookingId(payment?.bookingId), // ✅ FIXED: Extract just the ID
            
            amount: {
              subtotal: safeNumber(payment?.amount?.subtotal),
              taxes: safeNumber(payment?.amount?.taxes),
              fees: safeNumber(payment?.amount?.fees),
              discounts: safeNumber(payment?.amount?.discounts),
              total: safeNumber(payment?.amount?.total),
              currency: safeString(payment?.amount?.currency) || 'LKR'
            },
            
            paymentMethod: {
              type: safeString(payment?.paymentMethod?.type) || 'card',
              provider: safeString(payment?.paymentMethod?.provider) || 'Unknown',
              lastFourDigits: safeString(payment?.paymentMethod?.lastFourDigits),
              walletType: safeString(payment?.paymentMethod?.walletType)
            },
            
            transactionInfo: {
              transactionId: safeString(payment?.transactionInfo?.transactionId),
              gatewayTransactionId: safeString(payment?.transactionInfo?.gatewayTransactionId),
              gatewayProvider: safeString(payment?.transactionInfo?.gatewayProvider),
              authorizationCode: safeString(payment?.transactionInfo?.authorizationCode)
            },
            
            status: safeString(payment?.status) || 'pending',
            
            statusHistory: Array.isArray(payment?.statusHistory) ? 
              payment.statusHistory.map((s: any) => ({
                status: safeString(s?.status),
                timestamp: safeString(s?.timestamp),
                reason: safeString(s?.reason)
              })) : [],
            
            billingInfo: {
              name: safeString(payment?.billingInfo?.name),
              email: safeString(payment?.billingInfo?.email),
              phone: safeString(payment?.billingInfo?.phone)
            },
            
            refundInfo: payment?.refundInfo ? {
              refundId: safeString(payment.refundInfo.refundId),
              refundAmount: safeNumber(payment.refundInfo.refundAmount),
              refundReason: safeString(payment.refundInfo.refundReason),
              refundMethod: safeString(payment.refundInfo.refundMethod),
              refundDate: safeString(payment.refundInfo.refundDate)
            } : undefined,
            
            timestamps: {
              initiatedAt: safeString(payment?.timestamps?.initiatedAt || payment?.createdAt) || new Date().toISOString(),
              processedAt: safeString(payment?.timestamps?.processedAt),
              completedAt: safeString(payment?.timestamps?.completedAt),
              failedAt: safeString(payment?.timestamps?.failedAt),
              refundedAt: safeString(payment?.timestamps?.refundedAt)
            },
            
            createdAt: safeString(payment?.createdAt) || new Date().toISOString(),
            updatedAt: safeString(payment?.updatedAt) || new Date().toISOString()
          };
        });
        
        setPayments(cleanPayments); 
        setStats(response.stats || null); 
      } else { 
        setError('Failed to load payment history'); 
      }
    } catch (error) { 
      console.error('Error loading payments:', error); 
      setError('Failed to load payment history'); 
    } finally { 
      setLoading(false); 
    }
  }, [filter, sortBy, apiCall]);

  useEffect(() => { loadPayments(); }, [loadPayments]);

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      'completed': '#10B981',
      'pending': '#F59E0B',
      'processing': '#3B82F6',
      'failed': '#EF4444',
      'cancelled': '#6B7280',
      'refunded': '#8B5CF6',
      'partially_refunded': '#A855F7'
    };
    return colors[status] || '#6B7280';
  };

  const getStatusLabel = (status: string): string => {
    const labels: { [key: string]: string } = {
      'completed': 'Completed',
      'pending': 'Pending',
      'processing': 'Processing',
      'failed': 'Failed',
      'cancelled': 'Cancelled',
      'refunded': 'Refunded',
      'partially_refunded': 'Partially Refunded'
    };
    return labels[status] || status;
  };

  const getPaymentMethodIcon = (type: string): string => {
    const icons: { [key: string]: string } = {
      'card': '💳',
      'bank_transfer': '🏦',
      'digital_wallet': '📱',
      'cash': '💵'
    };
    return icons[type] || '💳';
  };

  const formatPrice = (price: number): string => `Rs. ${price.toLocaleString()}`;
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };
  const formatDateTime = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const handleViewDetails = (payment: Payment) => { 
    setSelectedPayment(payment); 
    setShowDetails(true); 
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh', 
        backgroundColor: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid #e2e8f0', 
            borderTop: '4px solid #3b82f6', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite', 
            margin: '0 auto 20px' 
          }}></div>
          <div style={{ color: '#64748b', fontSize: '16px', fontWeight: '500' }}>Loading payment history...</div>
        </div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* ✅ BEAUTIFUL NAVIGATION */}
      <nav style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e2e8f0', 
        padding: '1rem 0', 
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 40
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
            fontSize: '1.75rem', 
            fontWeight: '800' 
          }}>
            <span style={{ color: '#f59e0b' }}>ශ්‍රී</span>
            <span style={{ color: '#1f2937' }}>Express</span>
          </Link>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Link href="/dashboard" style={{ 
              color: '#64748b', 
              textDecoration: 'none', 
              fontWeight: '500',
              transition: 'color 0.2s',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              ':hover': { color: '#f59e0b', backgroundColor: '#fef3c7' }
            }}>
              Dashboard
            </Link>
            <Link href="/bookings" style={{ 
              color: '#64748b', 
              textDecoration: 'none', 
              fontWeight: '500',
              transition: 'color 0.2s',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem'
            }}>
              My Bookings
            </Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* ✅ BEAUTIFUL HEADER */}
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '800', 
            color: '#1f2937', 
            margin: '0 0 0.5rem 0',
            background: 'linear-gradient(135deg, #1f2937 0%, #4b5563 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            💳 Payment History
          </h1>
          <p style={{ 
            color: '#64748b', 
            margin: 0, 
            fontSize: '1.1rem',
            fontWeight: '400'
          }}>
            View and manage your payment transactions
          </p>
        </div>

        {/* ✅ BEAUTIFUL STATS CARDS */}
        {stats && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: '1.5rem', 
            marginBottom: '2.5rem' 
          }}>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '2rem 1.5rem', 
              borderRadius: '1rem', 
              border: '1px solid #e2e8f0', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              ':hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 15px -3px rgba(0, 0, 0, 0.1)' }
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  backgroundColor: '#dbeafe', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  📊
                </div>
                <div>
                  <h3 style={{ color: '#3b82f6', fontSize: '2.5rem', fontWeight: '800', margin: 0, lineHeight: 1 }}>
                    {stats.totalPayments}
                  </h3>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem', fontWeight: '500' }}>Total Transactions</p>
                </div>
              </div>
            </div>
            
            <div style={{ 
              backgroundColor: 'white', 
              padding: '2rem 1.5rem', 
              borderRadius: '1rem', 
              border: '1px solid #e2e8f0', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  backgroundColor: '#d1fae5', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  💰
                </div>
                <div>
                  <h3 style={{ color: '#10b981', fontSize: '2rem', fontWeight: '800', margin: 0, lineHeight: 1 }}>
                    {formatPrice(stats.totalAmount)}
                  </h3>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem', fontWeight: '500' }}>Total Amount</p>
                </div>
              </div>
            </div>
            
            <div style={{ 
              backgroundColor: 'white', 
              padding: '2rem 1.5rem', 
              borderRadius: '1rem', 
              border: '1px solid #e2e8f0', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  backgroundColor: '#ede9fe', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  ✅
                </div>
                <div>
                  <h3 style={{ color: '#8b5cf6', fontSize: '2.5rem', fontWeight: '800', margin: 0, lineHeight: 1 }}>
                    {stats.successfulPayments}
                  </h3>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem', fontWeight: '500' }}>Successful</p>
                </div>
              </div>
            </div>
            
            <div style={{ 
              backgroundColor: 'white', 
              padding: '2rem 1.5rem', 
              borderRadius: '1rem', 
              border: '1px solid #e2e8f0', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  backgroundColor: '#fee2e2', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}>
                  ❌
                </div>
                <div>
                  <h3 style={{ color: '#ef4444', fontSize: '2.5rem', fontWeight: '800', margin: 0, lineHeight: 1 }}>
                    {stats.failedPayments}
                  </h3>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem', fontWeight: '500' }}>Failed</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ BEAUTIFUL FILTERS */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '1rem', 
          border: '1px solid #e2e8f0', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
          marginBottom: '2.5rem' 
        }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'end', flexWrap: 'wrap' }}>
            <div style={{ minWidth: '200px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.75rem', 
                fontWeight: '600', 
                color: '#374151',
                fontSize: '0.95rem'
              }}>
                Filter by Status
              </label>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)} 
                style={{ 
                  width: '100%',
                  padding: '0.875rem 1rem', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '0.75rem', 
                  fontSize: '1rem',
                  fontWeight: '500',
                  backgroundColor: '#ffffff',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
              >
                <option value="all">All Transactions</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div style={{ minWidth: '200px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.75rem', 
                fontWeight: '600', 
                color: '#374151',
                fontSize: '0.95rem'
              }}>
                Sort By
              </label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)} 
                style={{ 
                  width: '100%',
                  padding: '0.875rem 1rem', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '0.75rem', 
                  fontSize: '1rem',
                  fontWeight: '500',
                  backgroundColor: '#ffffff',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* ✅ ERROR MESSAGE */}
        {error && (
          <div style={{ 
            backgroundColor: '#fef2f2', 
            color: '#dc2626', 
            padding: '1.5rem', 
            borderRadius: '1rem', 
            border: '1px solid #fecaca', 
            marginBottom: '2rem',
            fontSize: '1rem',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}

        {/* ✅ BEAUTIFUL PAYMENT HISTORY */}
        {payments.length > 0 ? (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {payments.map((payment) => {
              if (!payment || typeof payment !== 'object') {
                return null;
              }
              
              return (
                <div 
                  key={payment._id} 
                  style={{ 
                    backgroundColor: 'white', 
                    padding: '2rem', 
                    borderRadius: '1rem', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 15px -3px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                      <h3 style={{ 
                        fontSize: '1.3rem', 
                        fontWeight: '700', 
                        color: '#1f2937', 
                        margin: '0 0 0.75rem 0' 
                      }}>
                        Payment #{payment.paymentId.slice(-8)}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <span style={{ 
                          padding: '0.375rem 1rem', 
                          borderRadius: '2rem', 
                          fontSize: '0.875rem', 
                          fontWeight: '600', 
                          backgroundColor: getStatusColor(payment.status), 
                          color: 'white',
                          textTransform: 'capitalize'
                        }}>
                          {getStatusLabel(payment.status)}
                        </span>
                        <span style={{ 
                          fontSize: '1rem', 
                          color: '#64748b',
                          fontWeight: '500'
                        }}>
                          {getPaymentMethodIcon(payment.paymentMethod.type)} {payment.paymentMethod.provider}
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontSize: '2rem', 
                        fontWeight: '800', 
                        color: '#f59e0b', 
                        marginBottom: '0.5rem',
                        lineHeight: 1
                      }}>
                        {formatPrice(payment.amount.total)}
                      </div>
                      <div style={{ 
                        fontSize: '1rem', 
                        color: '#64748b',
                        fontWeight: '500'
                      }}>
                        {formatDate(payment.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                    gap: '2rem', 
                    marginBottom: '1.5rem' 
                  }}>
                    <div style={{ 
                      padding: '1.5rem', 
                      backgroundColor: '#f8fafc', 
                      borderRadius: '0.75rem',
                      border: '1px solid #e2e8f0'
                    }}>
                      <h4 style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: '600', 
                        color: '#1f2937', 
                        margin: '0 0 1rem 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        🔗 Transaction Details
                      </h4>
                      <div style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6', fontWeight: '500' }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>ID:</strong> {payment.transactionInfo.transactionId || 'N/A'}
                        </div>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Gateway:</strong> {payment.transactionInfo.gatewayProvider || 'N/A'}
                        </div>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Auth:</strong> {payment.transactionInfo.authorizationCode || 'N/A'}
                        </div>
                        {payment.paymentMethod.lastFourDigits && (
                          <div>
                            <strong>Card:</strong> ****{payment.paymentMethod.lastFourDigits}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ 
                      padding: '1.5rem', 
                      backgroundColor: '#f0fdf4', 
                      borderRadius: '0.75rem',
                      border: '1px solid #bbf7d0'
                    }}>
                      <h4 style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: '600', 
                        color: '#1f2937', 
                        margin: '0 0 1rem 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        💰 Amount Breakdown
                      </h4>
                      <div style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6', fontWeight: '500' }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Subtotal:</strong> {formatPrice(payment.amount.subtotal)}
                        </div>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Taxes:</strong> {formatPrice(payment.amount.taxes)}
                        </div>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Fees:</strong> {formatPrice(payment.amount.fees)}
                        </div>
                        {payment.amount.discounts > 0 && (
                          <div style={{ color: '#10b981', fontWeight: '600' }}>
                            <strong>Discount:</strong> -{formatPrice(payment.amount.discounts)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ 
                      padding: '1.5rem', 
                      backgroundColor: '#f0f9ff', 
                      borderRadius: '0.75rem',
                      border: '1px solid #bae6fd'
                    }}>
                      <h4 style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: '600', 
                        color: '#1f2937', 
                        margin: '0 0 1rem 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        👤 Billing Info
                      </h4>
                      <div style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6', fontWeight: '500' }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Name:</strong> {payment.billingInfo.name || 'N/A'}
                        </div>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Email:</strong> {payment.billingInfo.email || 'N/A'}
                        </div>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Phone:</strong> {payment.billingInfo.phone || 'N/A'}
                        </div>
                        <div>
                          <strong>Booking:</strong> {payment.bookingId ? `#${payment.bookingId.slice(-8)}` : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ✅ BEAUTIFUL REFUND INFO */}
                  {payment.refundInfo && (
                    <div style={{ 
                      marginTop: '1.5rem', 
                      padding: '1.5rem', 
                      backgroundColor: '#faf5ff', 
                      borderRadius: '0.75rem', 
                      border: '1px solid #d8b4fe' 
                    }}>
                      <h4 style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: '600', 
                        color: '#7c3aed', 
                        margin: '0 0 1rem 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        🔄 Refund Information
                      </h4>
                      <div style={{ fontSize: '0.95rem', color: '#6b46c1', lineHeight: '1.6', fontWeight: '500' }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Amount:</strong> {formatPrice(payment.refundInfo.refundAmount)}
                        </div>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Method:</strong> {payment.refundInfo.refundMethod}
                        </div>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Date:</strong> {payment.refundInfo.refundDate ? formatDate(payment.refundInfo.refundDate) : 'N/A'}
                        </div>
                        <div>
                          <strong>Reason:</strong> {payment.refundInfo.refundReason}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ✅ BEAUTIFUL ACTION BUTTONS */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    paddingTop: '1.5rem', 
                    borderTop: '1px solid #e2e8f0',
                    flexWrap: 'wrap'
                  }}>
                    <button 
                      onClick={() => handleViewDetails(payment)} 
                      style={{ 
                        backgroundColor: '#3b82f6', 
                        color: 'white', 
                        padding: '0.75rem 1.5rem', 
                        border: 'none', 
                        borderRadius: '0.75rem', 
                        cursor: 'pointer', 
                        fontSize: '0.95rem', 
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#2563eb';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#3b82f6';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.2)';
                      }}
                    >
                      📊 View Details
                    </button>
                    {payment.bookingId && (
                      <Link 
                        href={`/bookings/${payment.bookingId}`} 
                        style={{ 
                          backgroundColor: '#10b981', 
                          color: 'white', 
                          padding: '0.75rem 1.5rem', 
                          borderRadius: '0.75rem', 
                          textDecoration: 'none', 
                          fontSize: '0.95rem', 
                          fontWeight: '600',
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                          display: 'inline-block'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#059669';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#10b981';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2)';
                        }}
                      >
                        🎫 View Booking
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem', 
            color: '#64748b',
            backgroundColor: 'white',
            borderRadius: '1rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>💳</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: '600', color: '#374151' }}>
              No payment history found
            </h3>
            <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
              Your payment transactions will appear here
            </p>
            <Link 
              href="/search" 
              style={{ 
                backgroundColor: '#f59e0b', 
                color: 'white', 
                padding: '1rem 2rem', 
                borderRadius: '0.75rem', 
                textDecoration: 'none', 
                fontWeight: '600', 
                display: 'inline-block',
                fontSize: '1.1rem',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#d97706';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 15px -3px rgba(245, 158, 11, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f59e0b';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(245, 158, 11, 0.2)';
              }}
            >
              🎫 Book Your First Ticket
            </Link>
          </div>
        )}
      </div>

      {/* ✅ BEAUTIFUL PAYMENT DETAILS MODAL */}
      {showDetails && selectedPayment && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.6)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '2.5rem', 
            borderRadius: '1.5rem', 
            border: '1px solid #e2e8f0', 
            maxWidth: '700px', 
            width: '90%', 
            maxHeight: '85vh', 
            overflow: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: '#1f2937', 
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              📊 Payment Details
            </h3>
            
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ 
                fontSize: '1.2rem', 
                fontWeight: '600', 
                marginBottom: '1rem',
                color: '#374151'
              }}>
                Status History
              </h4>
              {selectedPayment.statusHistory.map((status, index) => (
                <div 
                  key={index} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '1rem', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '0.75rem', 
                    marginBottom: '0.5rem',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <span style={{ 
                    fontWeight: '600', 
                    textTransform: 'capitalize',
                    color: '#374151'
                  }}>
                    {status.status}
                  </span>
                  <span style={{ 
                    color: '#64748b', 
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>
                    {formatDateTime(status.timestamp)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ 
                fontSize: '1.2rem', 
                fontWeight: '600', 
                marginBottom: '1rem',
                color: '#374151'
              }}>
                Timestamps
              </h4>
              <div style={{ 
                fontSize: '1rem', 
                color: '#475569', 
                lineHeight: '1.8',
                backgroundColor: '#f8fafc',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Initiated:</strong> {formatDateTime(selectedPayment.timestamps.initiatedAt)}
                </div>
                {selectedPayment.timestamps.processedAt && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <strong>Processed:</strong> {formatDateTime(selectedPayment.timestamps.processedAt)}
                  </div>
                )}
                {selectedPayment.timestamps.completedAt && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <strong>Completed:</strong> {formatDateTime(selectedPayment.timestamps.completedAt)}
                  </div>
                )}
                {selectedPayment.timestamps.failedAt && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <strong>Failed:</strong> {formatDateTime(selectedPayment.timestamps.failedAt)}
                  </div>
                )}
                {selectedPayment.timestamps.refundedAt && (
                  <div>
                    <strong>Refunded:</strong> {formatDateTime(selectedPayment.timestamps.refundedAt)}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowDetails(false)} 
                style={{ 
                  backgroundColor: '#64748b', 
                  color: 'white', 
                  padding: '0.875rem 2rem', 
                  border: 'none', 
                  borderRadius: '0.75rem', 
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#475569';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#64748b';
                }}
              >
                Close
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