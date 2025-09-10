// src/services/payhere.ts - PayHere Payment Gateway Integration

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
    
    console.log('🏗️ PayHere Service initialized:', {
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
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = this.isSandbox 
        ? 'https://www.payhere.lk/lib/payhere.js'
        : 'https://www.payhere.lk/lib/payhere.js';
      
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
      console.warn('⚠️ PayHere hash generation failed - payment may not work properly');
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

    const hash = await this.generateHash(orderId, amount, 'LKR');
    
    return {
      merchant_id: this.merchantId,
      return_url: `${baseUrl}/payment-gateway?status=success`,
      cancel_url: `${baseUrl}/payment-gateway?status=cancel`,
      notify_url: `${baseUrl}/api/payment/webhook/payhere`,
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

      // Start the payment
      if (this.isSandbox) {
        console.log('🔧 Using PayHere SANDBOX mode');
      }

      window.payhere.startPayment(payment);

    } catch (error) {
      console.error('💥 PayHere service error:', error);
      onError(`Payment initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

      const result = await response.json();
      return result.verified || false;
    } catch (error) {
      console.error('Payment verification failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const payHereService = new PayHereService();

export default payHereService;