// src/app/payments/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Payment {
  _id: string;
  paymentId: string;
  userId: string;
  bookingId: string;
  amount: {
    subtotal: number;
    taxes: number;
    fees: number;
    discounts: number;
    total: number;
    currency: string;
  };
  paymentMethod: {
    type: 'card' | 'bank_transfer' | 'digital_wallet' | 'cash';
    provider: string;
    lastFourDigits?: string;
    walletType?: string;
  };
  transactionInfo: {
    transactionId: string;
    gatewayTransactionId: string;
    gatewayProvider: string;
    authorizationCode: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
  statusHistory: Array<{
    status: string;
    timestamp: string;
    reason?: string;
  }>;
  billingInfo: {
    name: string;
    email: string;
    phone: string;
  };
  refundInfo?: {
    refundId: string;
    refundAmount: number;
    refundReason: string;
    refundMethod: string;
    refundDate: string;
  };
  timestamps: {
    initiatedAt: string;
    processedAt?: string;
    completedAt?: string;
    failedAt?: string;
    refundedAt?: string;
  };
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
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const fullURL = `${baseURL}/api${endpoint}`;
    try {
      const response = await fetch(fullURL, { ...options, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...options.headers } });
      if (!response.ok) { if (response.status === 401) { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/login'); return null; } throw new Error(`API Error: ${response.status}`); }
      return await response.json();
    } catch (error) { console.error('API call error:', error); return null; }
  }, [router]);

  const loadPayments = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      params.append('sortBy', sortBy); params.append('sortOrder', 'desc');
      const response = await apiCall(`/payments/history?${params.toString()}`);
      if (response) { setPayments(response.payments || []); setStats(response.stats || null); } else { setError('Failed to load payment history'); }
    } catch (error) { console.error('Error loading payments:', error); setError('Failed to load payment history'); } finally { setLoading(false); }
  }, [filter, sortBy, apiCall]);

  useEffect(() => { loadPayments(); }, [loadPayments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'pending': case 'processing': return '#F59E0B';
      case 'failed': case 'cancelled': return '#EF4444';
      case 'refunded': case 'partially_refunded': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'pending': return 'Pending';
      case 'processing': return 'Processing';
      case 'failed': return 'Failed';
      case 'cancelled': return 'Cancelled';
      case 'refunded': return 'Refunded';
      case 'partially_refunded': return 'Partially Refunded';
      default: return 'Unknown';
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'card': return '💳';
      case 'bank_transfer': return '🏦';
      case 'digital_wallet': return '📱';
      case 'cash': return '💵';
      default: return '💳';
    }
  };

  const formatPrice = (price: number) => `Rs. ${price.toLocaleString()}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  const formatDateTime = (dateString: string) => new Date(dateString).toLocaleString();

  const handleViewDetails = (payment: Payment) => { setSelectedPayment(payment); setShowDetails(true); };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #F59E0B', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <div style={{ color: '#6B7280', fontSize: '16px' }}>Loading payment history...</div>
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
            <Link href="/dashboard" style={{ color: '#6B7280', textDecoration: 'none', fontWeight: '500' }}>Dashboard</Link>
            <Link href="/bookings" style={{ color: '#6B7280', textDecoration: 'none', fontWeight: '500' }}>My Bookings</Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1F2937', margin: 0 }}>Payment History</h1>
          <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>View and manage your payment transactions</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <h3 style={{ color: '#3B82F6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{stats.totalPayments}</h3>
              <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>Total Transactions</p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <h3 style={{ color: '#10B981', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{formatPrice(stats.totalAmount)}</h3>
              <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>Total Amount</p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <h3 style={{ color: '#8B5CF6', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{stats.successfulPayments}</h3>
              <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>Successful</p>
            </div>
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <h3 style={{ color: '#EF4444', fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{stats.failedPayments}</h3>
              <p style={{ color: '#6B7280', margin: '0.5rem 0 0 0' }}>Failed</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Filter by Status</label>
              <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem' }}>
                <option value="all">All Transactions</option><option value="completed">Completed</option><option value="pending">Pending</option><option value="processing">Processing</option><option value="failed">Failed</option><option value="refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Sort By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '1rem' }}>
                <option value="date">Date</option><option value="amount">Amount</option><option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #FCA5A5', marginBottom: '2rem' }}>{error}</div>
        )}

        {/* Payment History */}
        {payments.length > 0 ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {payments.map((payment) => (
              <div key={payment._id} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1F2937', margin: '0 0 0.5rem 0' }}>Payment #{payment.paymentId}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.8rem', fontWeight: '500', backgroundColor: getStatusColor(payment.status), color: 'white' }}>
                        {getStatusLabel(payment.status)}
                      </span>
                      <span style={{ fontSize: '0.9rem', color: '#6B7280' }}>{getPaymentMethodIcon(payment.paymentMethod.type)} {payment.paymentMethod.provider}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#F59E0B', marginBottom: '0.5rem' }}>{formatPrice(payment.amount.total)}</div>
                    <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>{formatDate(payment.createdAt)}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1F2937', margin: '0 0 0.5rem 0' }}>Transaction Details</h4>
                    <div style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: '1.4' }}>
                      <div>Transaction ID: {payment.transactionInfo.transactionId}</div>
                      <div>Gateway: {payment.transactionInfo.gatewayProvider}</div>
                      <div>Authorization: {payment.transactionInfo.authorizationCode}</div>
                      {payment.paymentMethod.lastFourDigits && <div>Card: ****{payment.paymentMethod.lastFourDigits}</div>}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1F2937', margin: '0 0 0.5rem 0' }}>Amount Breakdown</h4>
                    <div style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: '1.4' }}>
                      <div>Subtotal: {formatPrice(payment.amount.subtotal)}</div>
                      <div>Taxes: {formatPrice(payment.amount.taxes)}</div>
                      <div>Fees: {formatPrice(payment.amount.fees)}</div>
                      {payment.amount.discounts > 0 && <div style={{ color: '#10B981' }}>Discount: -{formatPrice(payment.amount.discounts)}</div>}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#1F2937', margin: '0 0 0.5rem 0' }}>Billing Info</h4>
                    <div style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: '1.4' }}>
                      <div>Name: {payment.billingInfo.name}</div>
                      <div>Email: {payment.billingInfo.email}</div>
                      <div>Phone: {payment.billingInfo.phone}</div>
                      <div>Booking: {payment.bookingId}</div>
                    </div>
                  </div>
                </div>

                {/* Refund Info */}
                {payment.refundInfo && (
                  <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#F3E8FF', borderRadius: '0.5rem', border: '1px solid #C4B5FD' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: '#7C3AED', margin: '0 0 0.5rem 0' }}>Refund Information</h4>
                    <div style={{ fontSize: '0.9rem', color: '#6B46C1', lineHeight: '1.4' }}>
                      <div>Refund Amount: {formatPrice(payment.refundInfo.refundAmount)}</div>
                      <div>Refund Method: {payment.refundInfo.refundMethod}</div>
                      <div>Refund Date: {formatDate(payment.refundInfo.refundDate)}</div>
                      <div>Reason: {payment.refundInfo.refundReason}</div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
                  <button onClick={() => handleViewDetails(payment)} style={{ backgroundColor: '#3B82F6', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}>
                    View Details
                  </button>
                  <Link href={`/bookings/${payment.bookingId}`} style={{ backgroundColor: '#10B981', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>
                    View Booking
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#6B7280' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No payment history found</h3>
            <p style={{ marginBottom: '1rem' }}>Your payment transactions will appear here</p>
            <Link href="/search" style={{ backgroundColor: '#F59E0B', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: '500', display: 'inline-block' }}>
              Book Your First Ticket
            </Link>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {showDetails && selectedPayment && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#1F2937', marginBottom: '1rem' }}>Payment Details</h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Status History</h4>
              {selectedPayment.statusHistory.map((status, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '0.25rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: '500', textTransform: 'capitalize' }}>{status.status}</span>
                  <span style={{ color: '#6B7280', fontSize: '0.9rem' }}>{formatDateTime(status.timestamp)}</span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Timestamps</h4>
              <div style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: '1.4' }}>
                <div>Initiated: {formatDateTime(selectedPayment.timestamps.initiatedAt)}</div>
                {selectedPayment.timestamps.processedAt && <div>Processed: {formatDateTime(selectedPayment.timestamps.processedAt)}</div>}
                {selectedPayment.timestamps.completedAt && <div>Completed: {formatDateTime(selectedPayment.timestamps.completedAt)}</div>}
                {selectedPayment.timestamps.failedAt && <div>Failed: {formatDateTime(selectedPayment.timestamps.failedAt)}</div>}
                {selectedPayment.timestamps.refundedAt && <div>Refunded: {formatDateTime(selectedPayment.timestamps.refundedAt)}</div>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDetails(false)} style={{ backgroundColor: '#6B7280', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
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