// app/services/payhere.ts - Complete PayHere Payment Gateway Integration

interface PayHerePayment {
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  amount: string;
  currency: string;
  hash: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

interface BookingData {
  routeId?: string;
  passengerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  pricing?: {
    totalAmount?: number;
  };
}

declare global {
  interface Window {
    payhere: any;
  }
}

class PayHereService {
  private merchantId: string;
  private merchantSecret: string;
  private isSandbox: boolean;

  constructor() {
    this.merchantId = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID || '';
    this.merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || '';
    this.isSandbox = process.env.NEXT_PUBLIC_PAYHERE_SANDBOX === 'true';
    
    console.log('🗝️ PayHere Service initialized:', {
      merchantId: this.merchantId || 'NOT SET',
      hasSecret: !!this.merchantSecret,
      isSandbox: this.isSandbox
    });

    if (!this.merchantId) {
      console.error('❌ NEXT_PUBLIC_PAYHERE_MERCHANT_ID not configured');
    }
  }

  // Load PayHere JS SDK
  loadPayHereScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.payhere) {
        console.log('✅ PayHere already loaded');
        resolve();
        return;
      }

      const script = document.createElement('script');
      // Both sandbox and live use the same JS file
      script.src = 'https://www.payhere.lk/lib/payhere.js';
      
      script.onload = () => {
        console.log('✅ PayHere JS SDK loaded successfully');
        resolve();
      };
      
      script.onerror = () => {
        console.error('❌ Failed to load PayHere JS SDK');
        reject(new Error('Failed to load PayHere SDK'));
      };
      
      document.head.appendChild(script);
    });
  }

  // Generate hash via backend (secure method)
  private async generateHash(orderId: string, amount: string, currency: string = 'LKR'): Promise<string> {
    try {
      console.log('🔐 Requesting hash generation for:', { orderId, amount, currency });
      
      const response = await fetch('/api/payment/generate-hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount, currency })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Hash generation failed:', errorText);
        throw new Error(`Hash generation failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.hash) {
        throw new Error('No hash received from server');
      }
      
      console.log('✅ Hash generated successfully via API');
      return data.hash;
      
    } catch (error) {
      console.error('❌ API hash generation failed:', error);
      
      // Fallback: Generate hash client-side for testing ONLY
      // This is less secure but works for sandbox testing
      if (this.isSandbox) {
        console.warn('⚠️ Using client-side hash generation (SANDBOX ONLY)');
        return this.generateClientSideHash(orderId, amount, currency);
      }
      
      throw new Error('Hash generation failed: Payment cannot proceed without proper hash');
    }
  }

  // Create payment object
  async createPayment(bookingData: BookingData, orderId: string): Promise<PayHerePayment> {
    const baseUrl = window.location.origin;
    const amount = (bookingData.pricing?.totalAmount || 100).toFixed(2);
    const passengerName = bookingData.passengerInfo?.name || 'Bus Passenger';
    const [firstName, ...lastNameParts] = passengerName.split(' ');
    const lastName = lastNameParts.join(' ') || 'Customer';

    let hash: string;
    
    try {
      hash = await this.generateHash(orderId, amount, 'LKR');
    } catch (error) {
      console.error('Hash generation error:', error);
      // For sandbox, use a test hash
      if (this.isSandbox) {
        hash = 'TEST_HASH_' + Date.now().toString(16).toUpperCase();
        console.warn('⚠️ Using test hash for sandbox:', hash);
      } else {
        throw error;
      }
    }
    
    const payment: PayHerePayment = {
      merchant_id: this.merchantId,
      return_url: `${baseUrl}/payment-gateway?status=success`,
      cancel_url: `${baseUrl}/payment-gateway?status=cancel`,
      notify_url: this.isSandbox 
        ? `${baseUrl}/api/payment/webhook/payhere` 
        : `https://sri-express.mehara.io/api/payment/webhook/payhere`,
      order_id: orderId,
      items: `Bus Ticket - ${bookingData.routeId || 'Route'}`,
      amount: amount,
      currency: 'LKR',
      hash: hash,
      first_name: firstName,
      last_name: lastName,
      email: bookingData.passengerInfo?.email || 'customer@sriexpress.lk',
      phone: bookingData.passengerInfo?.phone || '+94771234567',
      address: 'Colombo',
      city: 'Colombo',
      country: 'Sri Lanka'
    };

    console.log('📦 Payment object created:', {
      ...payment,
      hash: payment.hash.substring(0, 8) + '...' // Show only first 8 chars of hash
    });

    return payment;
  }

  // Start payment process
  async startPayment(
    bookingData: BookingData, 
    onSuccess: (paymentResult: any) => void,
    onError: (error: string) => void,
    onCancel: () => void
  ) {
    try {
      // Load PayHere SDK
      await this.loadPayHereScript();

      // Generate unique order ID
      const orderId = `BK_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

      // Create payment object
      const payment = await this.createPayment(bookingData, orderId);

      console.log('🚀 Starting PayHere payment with:', {
        orderId,
        amount: payment.amount,
        merchant_id: this.merchantId,
        isSandbox: this.isSandbox
      });

      // Configure PayHere callbacks
      window.payhere.onCompleted = function (paymentId: string) {
        console.log('✅ PayHere payment completed:', paymentId);
        
        const paymentResult = {
          paymentId,
          orderId,
          transactionId: paymentId,
          method: 'payhere',
          status: 'completed',
          amount: parseFloat(payment.amount),
          currency: payment.currency,
          paidAt: new Date().toISOString(),
          gateway: 'payhere',
          authCode: paymentId,
          reference: orderId
        };

        onSuccess(paymentResult);
      };

      window.payhere.onDismissed = function () {
        console.log('⚠️ PayHere payment dismissed/cancelled');
        onCancel();
      };

      window.payhere.onError = function (error: string) {
        console.error('❌ PayHere payment error:', error);
        onError(`PayHere Error: ${error}`);
      };

      // Start the payment with correct sandbox/live mode
      if (this.isSandbox) {
        console.log('🔧 Using PayHere SANDBOX mode');
        // For sandbox, we need to set sandbox mode
        if (window.payhere.sandbox) {
          window.payhere.sandbox.startPayment(payment);
        } else {
          // Fallback to regular startPayment if sandbox object doesn't exist
          window.payhere.startPayment(payment);
        }
      } else {
        console.log('💳 Using PayHere LIVE mode');
        window.payhere.startPayment(payment);
      }

    } catch (error) {
      console.error('💥 PayHere service error:', error);
      
      // For sandbox mode, provide more helpful error messages
      if (this.isSandbox) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        if (errorMessage.includes('hash')) {
          onError('Hash validation failed. Please check your PayHere merchant secret in the environment variables.');
        } else if (errorMessage.includes('merchant')) {
          onError('Merchant configuration error. Please verify your PayHere merchant ID.');
        } else {
          onError(`Payment initialization failed (Sandbox Mode): ${errorMessage}`);
        }
      } else {
        onError(`Payment initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  // Verify payment (should be called from backend)
  async verifyPayment(paymentId: string, orderId: string): Promise<boolean> {
    try {
      // This should be implemented in your backend
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId, orderId }),
      });

      if (!response.ok) {
        console.error('Payment verification failed:', response.status);
        return false;
      }

      const result = await response.json();
      return result.verified || false;
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }

  // Helper method to check if PayHere is properly configured
  isConfigured(): boolean {
    return !!(this.merchantId && (this.merchantSecret || this.isSandbox));
  }

  // Get configuration status for debugging
  getConfigStatus(): object {
    return {
      merchantId: this.merchantId ? '✅ Set' : '❌ Missing',
      merchantSecret: this.merchantSecret ? '✅ Set' : '⚠️ Missing (required for production)',
      isSandbox: this.isSandbox,
      isConfigured: this.isConfigured()
    };
  }
}

// Create singleton instance
const payHereService = new PayHereService();

// Log configuration status on initialization
console.log('PayHere Configuration Status:', payHereService.getConfigStatus());

export default payHereService;