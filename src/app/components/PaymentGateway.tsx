import { useState, useEffect } from 'react';

interface PaymentGatewayProps {
  bookingData?: any;
  bookingId?: string;
  onPaymentSuccess: (paymentResult?: any) => void;
  onPaymentCancel?: () => void;
  onPaymentError?: (error: string) => void;
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
  onPaymentError 
}) => {
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('card');
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
            { id: 'card', name: '💳 Credit/Debit Card', fee: 0, available: true },
            { id: 'bank', name: '🏦 Bank Transfer', fee: 0, available: true },
            { id: 'digital_wallet', name: '📱 Digital Wallet', fee: 25, available: true },
            { id: 'cash', name: '💵 Cash on Booking', fee: 0, available: true }
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
            { id: 'card', name: '💳 Credit/Debit Card', fee: 0, available: true },
            { id: 'bank', name: '🏦 Bank Transfer', fee: 0, available: true },
            { id: 'digital_wallet', name: '📱 Digital Wallet', fee: 25, available: true },
            { id: 'cash', name: '💵 Cash on Booking', fee: 0, available: true }
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

  // Process payment simulation
  const handlePayment = async () => {
    if (!booking) return;

    setProcessing(true);
    setError('');

    try {
      // Simulate real payment processing steps
      console.log('Starting payment processing...');
      
      // Step 1: Validate payment method
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('Payment method validated...');

      // Step 2: Process payment (MOCK - no real money charged)
      await new Promise(resolve => setTimeout(resolve, 1200));
      console.log('Payment processed (SIMULATED)...');

      // Create realistic payment result
      const paymentResult = {
        paymentId: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        method: selectedMethod,
        status: 'completed',
        amount: booking.amount,
        currency: booking.currency,
        paidAt: new Date().toISOString(),
        gateway: 'sri-express-mock',
        authCode: `AUTH_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        reference: `REF_${Date.now()}`
      };

      console.log('Payment result:', paymentResult);

      // Show realistic success message
      alert(`✅ Payment Successful!\n\n💳 Payment Method: ${getPaymentMethodName(selectedMethod)}\n🆔 Transaction ID: ${paymentResult.transactionId}\n💰 Amount: Rs. ${paymentResult.amount.toLocaleString()}\n📝 Reference: ${paymentResult.reference}\n\n✨ This was a simulated payment - no real money was charged.`);
      
      // Call success callback with real payment data
      onPaymentSuccess(paymentResult);
    } catch (error) {
      console.error('Payment error:', error);
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
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #F59E0B',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <div style={{ color: '#6B7280' }}>Loading payment gateway...</div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div style={{ 
        backgroundColor: 'white', 
        padding: '2rem', 
        borderRadius: '0.75rem', 
        textAlign: 'center',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ color: '#DC2626', marginBottom: '1rem' }}>Payment Error</h3>
        <p style={{ color: '#6B7280' }}>Unable to load booking information</p>
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
      backgroundColor: 'white', 
      padding: '2rem', 
      borderRadius: '0.75rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1F2937', margin: 0 }}>
          🏦 Sri Express Payment Gateway
        </h2>
        <p style={{ color: '#6B7280', marginTop: '0.5rem' }}>
          Secure Payment Processing (Simulation)
        </p>
      </div>

      {/* Booking Summary */}
      <div style={{ 
        backgroundColor: '#F9FAFB', 
        padding: '1rem', 
        borderRadius: '0.5rem', 
        marginBottom: '1.5rem',
        border: '1px solid #E5E7EB'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Payment Summary
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span>Booking ID:</span>
          <span style={{ fontFamily: 'monospace' }}>{booking.bookingId}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span>Amount:</span>
          <span style={{ fontWeight: '600', color: '#F59E0B' }}>
            Rs. {booking.amount.toLocaleString()}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Status:</span>
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
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
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
                borderColor: selectedMethod === method.id ? '#F59E0B' : '#E5E7EB',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                backgroundColor: selectedMethod === method.id ? '#FEF3C7' : 'white',
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
                <div style={{ fontWeight: '500' }}>{method.name}</div>
                {method.fee > 0 && (
                  <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
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
          backgroundColor: '#FEE2E2',
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
        color: '#6B7280' 
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