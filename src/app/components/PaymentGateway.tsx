import { useState, useEffect } from 'react';

interface PaymentGatewayProps {
  bookingData?: any;
  bookingId?: string;
  onPaymentSuccess: (paymentResult?: any) => void;
  onPaymentCancel?: () => void;
  onPaymentError?: (error: string) => void;
  currentThemeStyles?: any; // Add theme support
}

interface BookingData {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: string;
  paymentStatus: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  fee: number;
  available: boolean;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ 
  bookingData,
  bookingId, 
  onPaymentSuccess, 
  onPaymentCancel,
  onPaymentError,
  currentThemeStyles // Receive theme styles as prop
}) => {
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('card');
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Default theme styles if not provided (fallback to light theme)
  const defaultThemeStyles = {
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

  const themeStyles = currentThemeStyles || defaultThemeStyles;

  const getToken = () => localStorage.getItem('token');

  // Load payment gateway data
  useEffect(() => {
    const loadGatewayData = async () => {
      try {
        // If bookingData is provided directly, use it
        if (bookingData) {
          setBooking({
            id: bookingData.routeId || 'new-booking',
            bookingId: `BK${Date.now()}`,
            amount: bookingData.pricing?.totalAmount || 0,
            currency: 'LKR',
            status: 'pending',
            paymentStatus: 'pending'
          });
          
          // Set default payment methods
          setPaymentMethods([
            { id: 'card', name: 'Credit/Debit Card', fee: 0, available: true },
            { id: 'bank', name: 'Bank Transfer', fee: 0, available: true },
            { id: 'digital_wallet', name: 'Digital Wallet', fee: 25, available: true },
            { id: 'cash', name: 'Cash on Booking', fee: 0, available: true }
          ]);
          
          setLoading(false);
          return;
        }

        // Otherwise, load from API
        if (!bookingId) {
          setError('No booking information provided');
          setLoading(false);
          return;
        }

        const token = getToken();
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:5000/api/payment-simulation/gateway/${bookingId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setBooking(data.booking);
          setPaymentMethods(data.paymentMethods || [
            { id: 'card', name: 'Credit/Debit Card', fee: 0, available: true },
            { id: 'bank', name: 'Bank Transfer', fee: 0, available: true },
            { id: 'digital_wallet', name: 'Digital Wallet', fee: 25, available: true },
            { id: 'cash', name: 'Cash on Booking', fee: 0, available: true }
          ]);
        } else {
          setError('Failed to load payment information');
        }
      } catch (error) {
        console.error('Error loading payment gateway:', error);
        setError('Failed to load payment gateway');
      } finally {
        setLoading(false);
      }
    };

    loadGatewayData();
  }, [bookingData, bookingId]);

  const handlePayment = async () => {
    if (!booking) return;

    setProcessing(true);
    setError('');

    try {
      console.log('🚀 Starting payment processing...');
      console.log('💳 Payment method:', selectedMethod);
      console.log('💰 Amount:', booking.amount);
      
      // Step 1: Validate payment method
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('✅ Payment method validated...');

      // Step 2: Process payment (SIMULATION - no real money charged)
      await new Promise(resolve => setTimeout(resolve, 1200));
      console.log('✅ Payment processed (SIMULATED)...');

      // Step 3: Create realistic payment result
      const paymentResult = {
        paymentId: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        transactionId: `TXN_${Date.now()}_mpwln${Math.floor(Math.random() * 1000)}`,
        method: selectedMethod,
        status: 'completed',
        amount: booking.amount,
        currency: booking.currency,
        paidAt: new Date().toISOString(),
        gateway: 'sri-express-gateway',
        authCode: `AUTH_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        reference: `REF_${Date.now()}`
      };

      console.log('💎 Payment result generated:', paymentResult);

      // Step 4: Show success notification
      alert(`✅ Payment Successful!

💳 Payment Method: ${getPaymentMethodName(selectedMethod)}
🆔 Transaction ID: ${paymentResult.transactionId}
💰 Amount: Rs. ${paymentResult.amount.toLocaleString()}
📋 Reference: ${paymentResult.reference}

✨ This was a simulated payment - no real money was charged.`);
      
      console.log('🎉 Calling payment success callback...');
      
      // Step 5: Call success callback to trigger booking creation/update
      onPaymentSuccess(paymentResult);
      
    } catch (error) {
      console.error('💥 Payment processing error:', error);
      const errorMsg = 'Payment processing failed. Please try again.';
      setError(errorMsg);
      if (onPaymentError) {
        onPaymentError(errorMsg);
      }
    } finally {
      setProcessing(false);
    }
  };

  // Helper function to get payment method display name
  const getPaymentMethodName = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    return method ? method.name : methodId;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '300px',
        backgroundColor: themeStyles.glassPanelBg,
        borderRadius: '0.75rem',
        boxShadow: themeStyles.glassPanelShadow,
        backdropFilter: 'blur(12px)',
        border: themeStyles.glassPanelBorder
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: `4px solid ${themeStyles.quickActionBorder.split(' ')[3]}`,
            borderTop: '4px solid #F59E0B',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <div style={{ color: themeStyles.textSecondary }}>Loading payment gateway...</div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div style={{ 
        backgroundColor: themeStyles.glassPanelBg, 
        padding: '2rem', 
        borderRadius: '0.75rem', 
        textAlign: 'center',
        boxShadow: themeStyles.glassPanelShadow,
        backdropFilter: 'blur(12px)',
        border: themeStyles.glassPanelBorder
      }}>
        <h3 style={{ color: '#DC2626', marginBottom: '1rem' }}>Payment Error</h3>
        <p style={{ color: themeStyles.textSecondary }}>Unable to load booking information</p>
        <button 
          onClick={onPaymentCancel}
          style={{
            backgroundColor: '#6B7280',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: themeStyles.glassPanelBg, 
      padding: '2rem', 
      borderRadius: '0.75rem',
      boxShadow: themeStyles.glassPanelShadow,
      backdropFilter: 'blur(12px)',
      border: themeStyles.glassPanelBorder,
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: themeStyles.textPrimary, margin: 0 }}>
          🏦 Sri Express Payment Gateway
        </h2>
        <p style={{ color: themeStyles.textSecondary, marginTop: '0.5rem' }}>
          Secure Payment Processing (Simulation)
        </p>
      </div>

      {/* Booking Summary */}
      <div style={{ 
        backgroundColor: themeStyles.alertBg, 
        padding: '1rem', 
        borderRadius: '0.5rem', 
        marginBottom: '1.5rem',
        border: themeStyles.quickActionBorder
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: themeStyles.textPrimary }}>
          Payment Summary
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span style={{ color: themeStyles.textSecondary }}>Booking ID:</span>
          <span style={{ fontFamily: 'monospace', color: themeStyles.textPrimary }}>{booking.bookingId}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span style={{ color: themeStyles.textSecondary }}>Amount:</span>
          <span style={{ fontWeight: '600', color: '#F59E0B' }}>
            Rs. {booking.amount.toLocaleString()}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: themeStyles.textSecondary }}>Status:</span>
          <span style={{ 
            color: booking.paymentStatus === 'completed' ? '#10B981' : '#F59E0B',
            textTransform: 'capitalize'
          }}>
            {booking.paymentStatus}
          </span>
        </div>
      </div>

      {/* Payment Methods */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: themeStyles.textPrimary }}>
          Select Payment Method
        </h3>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {paymentMethods.filter(method => method.available).map(method => (
            <label
              key={method.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                border: '2px solid',
                borderColor: selectedMethod === method.id ? '#F59E0B' : themeStyles.quickActionBorder.split(' ')[3],
                borderRadius: '0.5rem',
                cursor: 'pointer',
                backgroundColor: selectedMethod === method.id ? 'rgba(245, 158, 11, 0.1)' : themeStyles.quickActionBg,
                transition: 'all 0.2s'
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={selectedMethod === method.id}
                onChange={(e) => setSelectedMethod(e.target.value)}
                style={{ marginRight: '0.75rem' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500', color: themeStyles.textPrimary }}>{method.name}</div>
                {method.fee > 0 && (
                  <div style={{ fontSize: '0.8rem', color: themeStyles.textMuted }}>
                    Processing fee: Rs. {method.fee}
                  </div>
                )}
              </div>
              <div style={{ fontSize: '1.5rem' }}>
                {method.id === 'card' && '💳'}
                {method.id === 'bank' && '🏦'}
                {method.id === 'digital_wallet' && '📱'}
                {method.id === 'cash' && '💵'}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          backgroundColor: 'rgba(254, 226, 226, 0.8)',
          color: '#DC2626',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          border: '1px solid #FCA5A5'
        }}>
          {error}
        </div>
      )}

      {/* Payment Buttons */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={onPaymentCancel}
          disabled={processing}
          style={{
            flex: 1,
            backgroundColor: '#6B7280',
            color: 'white',
            padding: '0.75rem',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: processing ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            opacity: processing ? 0.7 : 1
          }}
        >
          Cancel
        </button>
        
        <button
          onClick={handlePayment}
          disabled={processing || booking.paymentStatus === 'completed'}
          style={{
            flex: 2,
            backgroundColor: booking.paymentStatus === 'completed' ? '#10B981' : 
                           processing ? '#9CA3AF' : '#F59E0B',
            color: 'white',
            padding: '0.75rem',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: (processing || booking.paymentStatus === 'completed') ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '1rem'
          }}
        >
          {booking.paymentStatus === 'completed' ? '✅ Already Paid' :
           processing ? '🔄 Processing...' : 
           `💳 Pay Rs. ${booking.amount.toLocaleString()}`}
        </button>
      </div>

      {/* Security Notice */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '1.5rem', 
        fontSize: '0.8rem', 
        color: themeStyles.textMuted 
      }}>
        🔒 This is a simulation environment. No real money will be charged.
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PaymentGateway;