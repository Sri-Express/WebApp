// src/app/payments/page.tsx - THE COMPLETE, FINAL, AND FULLY STYLED VERSION
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import ThemeSwitcher from '@/app/components/ThemeSwitcher';
import AnimatedBackground from '@/app/components/AnimatedBackground';
import { ShieldCheckIcon, TicketIcon, CurrencyDollarIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

// --- Data Interfaces ---
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

interface ApiStatusHistory {
  status?: unknown;
  timestamp?: unknown;
  reason?: unknown;
}

interface ApiPayment {
  _id?: unknown;
  paymentId?: unknown;
  userId?: unknown;
  bookingId?: unknown | { bookingId?: string; _id?: string; id?: string };
  amount?: { subtotal?: unknown; taxes?: unknown; fees?: unknown; discounts?: unknown; total?: unknown; currency?: unknown; };
  paymentMethod?: { type?: unknown; provider?: unknown; lastFourDigits?: unknown; walletType?: unknown; };
  transactionInfo?: { transactionId?: unknown; gatewayTransactionId?: unknown; gatewayProvider?: unknown; authorizationCode?: unknown; };
  status?: unknown;
  statusHistory?: unknown[];
  billingInfo?: { name?: unknown; email?: unknown; phone?: unknown; };
  refundInfo?: { refundId?: unknown; refundAmount?: unknown; refundReason?: unknown; refundMethod?: unknown; refundDate?: unknown; };
  timestamps?: { initiatedAt?: unknown; processedAt?: unknown; completedAt?: unknown; failedAt?: unknown; refundedAt?: unknown; };
  createdAt?: unknown;
  updatedAt?: unknown;
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
  const { theme } = useTheme();
  
  // --- State Management ---
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // --- Theme and Style Definitions ---
  const lightTheme = { mainBg: '#fffbeb', bgGradient: 'linear-gradient(to bottom right, #fffbeb, #fef3c7, #fde68a)', glassPanelBg: 'rgba(255, 255, 255, 0.92)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 20px -5px rgba(0, 0, 0, 0.1)', textPrimary: '#1f2937', textSecondary: '#4B5563', textMuted: '#6B7280', quickActionBg: 'rgba(249, 250, 251, 0.8)', quickActionBorder: '1px solid rgba(209, 213, 219, 0.5)', alertBg: 'rgba(249, 250, 251, 0.6)' };
  const darkTheme = { mainBg: '#0f172a', bgGradient: 'linear-gradient(to bottom right, #0f172a, #1e293b, #334155)', glassPanelBg: 'rgba(30, 41, 59, 0.8)', glassPanelBorder: '1px solid rgba(251, 191, 36, 0.3)', glassPanelShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 10px 20px -5px rgba(0, 0, 0, 0.2)', textPrimary: '#f9fafb', textSecondary: '#9ca3af', textMuted: '#9ca3af', quickActionBg: 'rgba(51, 65, 85, 0.8)', quickActionBorder: '1px solid rgba(75, 85, 99, 0.5)', alertBg: 'rgba(51, 65, 85, 0.6)' };
  const currentThemeStyles = theme === 'dark' ? darkTheme : lightTheme;
  const animationStyles = `
    @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
  `;

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
        let paymentsArray: ApiPayment[] = [];
        
        if (Array.isArray(response)) {
          paymentsArray = response;
        } else if (response.payments && Array.isArray(response.payments)) {
          paymentsArray = response.payments;
        } else if (response.data && Array.isArray(response.data)) {
          paymentsArray = response.data;
        }
        
        const cleanPayments = paymentsArray.map((payment: ApiPayment, index: number): Payment => {
          const safeString = (value: unknown): string => {
            if (typeof value === 'string') return value;
            if (typeof value === 'number') return value.toString();
            return '';
          };
          
          const safeNumber = (value: unknown): number => {
            if (typeof value === 'number') return value;
            if (typeof value === 'string') return parseFloat(value) || 0;
            return 0;
          };

          const extractBookingId = (bookingData: ApiPayment['bookingId']): string => {
            if (typeof bookingData === 'string') return bookingData;
            if (bookingData && typeof bookingData === 'object') {
              const bookingObj = bookingData as { bookingId?: string; _id?: string; id?: string };
              return bookingObj.bookingId || bookingObj._id || bookingObj.id || '';
            }
            return '';
          };
          
          return {
            _id: safeString(payment?._id) || `payment-${index}`,
            paymentId: safeString(payment?.paymentId) || `PAY-${Date.now()}-${index}`,
            userId: safeString(payment?.userId),
            bookingId: extractBookingId(payment?.bookingId),
            
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
              (payment.statusHistory as ApiStatusHistory[]).map((s: ApiStatusHistory) => ({
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
      'completed': '#10B981', 'successful': '#10B981',
      'pending': '#F59E0B',
      'processing': '#3B82F6',
      'failed': '#EF4444',
      'cancelled': '#6B7280',
      'refunded': '#8B5CF6',
      'partially_refunded': '#A855F7'
    };
    return colors[status.toLowerCase()] || '#6B7280';
  };

  const getStatusLabel = (status: string): string => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getPaymentMethodIcon = (type: string): string => {
    const icons: { [key: string]: string } = {
      'card': '💳', 'bank_transfer': '🏦', 'digital_wallet': '📱', 'cash': '💵'
    };
    return icons[type.toLowerCase()] || '💳';
  };

  const formatPrice = (price: number): string => `Rs. ${price.toLocaleString()}`;
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return 'Invalid Date'; }
  };
  const formatDateTime = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return 'Invalid Date'; }
  };

  const handleViewDetails = (payment: Payment) => { 
    setSelectedPayment(payment); 
    setShowDetails(true); 
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: currentThemeStyles.mainBg }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: `4px solid ${currentThemeStyles.glassPanelBorder}`, borderTop: '4px solid #F59E0B', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <div style={{ color: currentThemeStyles.textSecondary, fontSize: '16px', fontWeight: '600' }}>Loading Payment History...</div>
        </div>
        <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: currentThemeStyles.mainBg, minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <style jsx>{animationStyles}</style>
      <style jsx global>{`
        .payment-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
        .action-button:hover { transform: translateY(-2px); }
        @media (max-width: 768px) { .nav-links { display: none; } .stats-grid { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
      
      <AnimatedBackground currentThemeStyles={currentThemeStyles} />
      
      <div style={{ position: 'relative', zIndex: 10 }}>
        <nav style={{ backgroundColor: 'rgba(30, 41, 59, 0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(251, 191, 36, 0.3)', padding: '1rem 0' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
              <ShieldCheckIcon width={32} height={32} color="#dc2626" />
              <div><h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffffff', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}><span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>ශ්‍රී</span>Express</h1></div>
            </Link>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div className="nav-links" style={{ display: 'flex', gap: '1.5rem' }}>
                <Link href="/dashboard" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: '500' }}>Dashboard</Link>
                <Link href="/bookings" style={{ color: '#d1d5db', textDecoration: 'none', fontWeight: '500' }}>My Bookings</Link>
              </div>
              <ThemeSwitcher />
            </div>
          </div>
        </nav>

        <main style={{ width: '100%', minHeight: 'calc(100vh - 90px)', display: 'flex', justifyContent: 'center', padding: '2rem 1.5rem' }}>
          <div className="animate-fade-in-down" style={{ width: '100%', maxWidth: '1400px' }}>
            <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: currentThemeStyles.textPrimary, margin: '0 0 0.5rem 0', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                Payment History
              </h1>
              <p style={{ color: currentThemeStyles.textSecondary, margin: 0, fontSize: '1.1rem' }}>
                View and manage all your payment transactions.
              </p>
            </div>

            {stats && (
              <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {[
                  { label: 'Total Payments', value: stats.totalPayments, icon: TicketIcon, color: '#3B82F6' },
                  { label: 'Total Spent', value: formatPrice(stats.totalAmount), icon: CurrencyDollarIcon, color: '#10B981' },
                  { label: 'Successful', value: stats.successfulPayments, icon: CheckCircleIcon, color: '#8B5CF6' },
                  { label: 'Failed/Refunded', value: (stats.failedPayments || 0) + (stats.refundedPayments || 0), icon: XCircleIcon, color: '#EF4444' }
                ].map(stat => (
                  <div key={stat.label} style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '1.5rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(12px)', border: currentThemeStyles.glassPanelBorder }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <stat.icon width={32} height={32} color={stat.color} />
                      <div>
                        <h3 style={{ color: stat.color, fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{stat.value}</h3>
                        <p style={{ color: currentThemeStyles.textPrimary, margin: '0.5rem 0 0 0', fontWeight: '600' }}>{stat.label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '1.5rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(16px)', border: currentThemeStyles.glassPanelBorder, marginBottom: '2.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: currentThemeStyles.textSecondary }}>Filter by Status</label>
                <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box', backgroundColor: currentThemeStyles.alertBg, color: currentThemeStyles.textPrimary, border: `1px solid ${currentThemeStyles.quickActionBorder}` }}>
                  <option value="all">All Transactions</option><option value="completed">Completed</option><option value="pending">Pending</option><option value="processing">Processing</option><option value="failed">Failed</option><option value="refunded">Refunded</option>
                </select>
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: currentThemeStyles.textSecondary }}>Sort By</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '1rem', boxSizing: 'border-box', backgroundColor: currentThemeStyles.alertBg, color: currentThemeStyles.textPrimary, border: `1px solid ${currentThemeStyles.quickActionBorder}` }}>
                  <option value="date">Date</option><option value="amount">Amount</option><option value="status">Status</option>
                </select>
              </div>
            </div>

            {error && <div style={{ backgroundColor: 'rgba(254, 226, 226, 0.8)', color: '#DC2626', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #FCA5A5', marginBottom: '2rem', backdropFilter: 'blur(5px)' }}>{error}</div>}

            {payments.length > 0 ? (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {payments.map((payment) => (
                  <div key={payment._id} className="payment-card" style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2rem', borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(16px)', border: currentThemeStyles.glassPanelBorder, transition: 'transform 0.3s, box-shadow 0.3s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: currentThemeStyles.textPrimary, margin: '0 0 0.75rem 0' }}>Payment #{payment.paymentId.slice(-8)}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ padding: '0.375rem 1rem', borderRadius: '2rem', fontSize: '0.875rem', fontWeight: '600', backgroundColor: getStatusColor(payment.status), color: 'white' }}>{getStatusLabel(payment.status)}</span>
                          <span style={{ fontSize: '1rem', color: currentThemeStyles.textSecondary, fontWeight: '500' }}>{getPaymentMethodIcon(payment.paymentMethod.type)} {payment.paymentMethod.provider}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '800', color: '#F59E0B', marginBottom: '0.5rem' }}>{formatPrice(payment.amount.total)}</div>
                        <div style={{ fontSize: '1rem', color: currentThemeStyles.textMuted }}>{formatDate(payment.createdAt)}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', paddingTop: '1.5rem', borderTop: `1px solid ${currentThemeStyles.quickActionBorder}` }}>
                      <button onClick={() => handleViewDetails(payment)} className="action-button" style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', transition: 'all 0.2s' }}>View Details</button>
                      {payment.bookingId && <Link href={`/bookings/${payment.bookingId}`} className="action-button" style={{ backgroundColor: '#10b981', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '600', transition: 'all 0.2s' }}>View Booking</Link>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: currentThemeStyles.textSecondary, backgroundColor: currentThemeStyles.glassPanelBg, borderRadius: '1rem', boxShadow: currentThemeStyles.glassPanelShadow, backdropFilter: 'blur(16px)', border: currentThemeStyles.glassPanelBorder }}>
                <CurrencyDollarIcon width={48} height={48} style={{ margin: '0 auto 1rem', color: currentThemeStyles.textMuted }} />
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: currentThemeStyles.textPrimary }}>No Payment History Found</h3>
                <p style={{ marginBottom: '2rem' }}>Your payment transactions will appear here once you make a booking.</p>
                <Link href="/search" style={{ backgroundColor: '#F59E0B', color: 'white', padding: '1rem 2rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: '600', display: 'inline-block' }}>Book Your First Ticket</Link>
              </div>
            )}
          </div>
        </main>
      </div>

      {showDetails && selectedPayment && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
          <div style={{ backgroundColor: currentThemeStyles.glassPanelBg, padding: '2.5rem', borderRadius: '1.5rem', border: currentThemeStyles.glassPanelBorder, maxWidth: '700px', width: '90%', maxHeight: '85vh', overflowY: 'auto', boxShadow: currentThemeStyles.glassPanelShadow }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: currentThemeStyles.textPrimary, marginBottom: '2rem' }}>Payment Details</h3>
            
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: currentThemeStyles.textPrimary }}>Status History</h4>
              {selectedPayment.statusHistory.map((status, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: currentThemeStyles.alertBg, borderRadius: '0.75rem', marginBottom: '0.5rem', border: `1px solid ${currentThemeStyles.quickActionBorder}` }}>
                  <span style={{ fontWeight: '600', textTransform: 'capitalize', color: currentThemeStyles.textPrimary }}>{getStatusLabel(status.status)}</span>
                  <span style={{ color: currentThemeStyles.textSecondary, fontSize: '0.95rem' }}>{formatDateTime(status.timestamp)}</span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: currentThemeStyles.textPrimary }}>Timestamps</h4>
              <div style={{ fontSize: '1rem', color: currentThemeStyles.textSecondary, lineHeight: '1.8', backgroundColor: currentThemeStyles.alertBg, padding: '1.5rem', borderRadius: '0.75rem', border: `1px solid ${currentThemeStyles.quickActionBorder}` }}>
                <div style={{ marginBottom: '0.75rem' }}><strong>Initiated:</strong> {formatDateTime(selectedPayment.timestamps.initiatedAt)}</div>
                {selectedPayment.timestamps.processedAt && <div style={{ marginBottom: '0.75rem' }}><strong>Processed:</strong> {formatDateTime(selectedPayment.timestamps.processedAt)}</div>}
                {selectedPayment.timestamps.completedAt && <div style={{ marginBottom: '0.75rem' }}><strong>Completed:</strong> {formatDateTime(selectedPayment.timestamps.completedAt)}</div>}
                {selectedPayment.timestamps.failedAt && <div style={{ marginBottom: '0.75rem' }}><strong>Failed:</strong> {formatDateTime(selectedPayment.timestamps.failedAt)}</div>}
                {selectedPayment.timestamps.refundedAt && <div><strong>Refunded:</strong> {formatDateTime(selectedPayment.timestamps.refundedAt)}</div>}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDetails(false)} style={{ backgroundColor: '#6B7280', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}