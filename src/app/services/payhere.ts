// app/services/payhere.ts - Simplified PayHere Integration

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
  private isSandbox: boolean;

  constructor() {
    this.merchantId = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID || '1231971';
    this.isSandbox = process.env.NEXT_PUBLIC_PAYHERE_SANDBOX === 'true';
    
    console.log('🗝️ PayHere Service initialized:', {
      merchantId: this.merchantId,
      isSandbox: this.isSandbox
    });
  }

  // Load PayHere JS SDK
  loadPayHereScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.payhere) {
        console.log('✅ PayHere already loaded');
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://www.payhere.lk/lib/payhere.js';
      
      script.onload = () => {
        console.log('✅ PayHere JS SDK loaded');
        resolve();
      };
      
      script.onerror = () => {
        console.error('❌ Failed to load PayHere SDK');
        reject(new Error('Failed to load PayHere SDK'));
      };
      
      document.head.appendChild(script);
    });
  }

  // Generate hash - Try API first, fallback to simple hash for sandbox
  private async generateHash(orderId: string, amount: string, currency: string = 'LKR'): Promise<string> {
    try {
      console.log('🔐 Requesting hash from API...');
      
      const response = await fetch('/api/payment/generate-hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount, currency })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.hash) {
          console.log('✅ Hash received from API');
          return data.hash;
        }
      }
    } catch (error) {
      console.log('⚠️ API hash generation failed, using fallback');
    }
    
    // Fallback for sandbox - generate a simple hash
    if (this.isSandbox) {
      console.log('🔧 Using sandbox test hash');
      // For sandbox testing, PayHere sometimes accepts a simple hash
      const simpleHash = btoa(`${this.merchantId}${orderId}${amount}${currency}`).replace(/[^A-Z0-9]/gi, '').toUpperCase();
      return simpleHash.substring(0, 32).padEnd(32, '0');
    }
    
    throw new Error('Hash generation failed');
  }

  // Create payment object
  async createPayment(bookingData: BookingData, orderId: string): Promise<PayHerePayment> {
    const baseUrl = window.location.origin;
    const amount = (bookingData.pricing?.totalAmount || 100).toFixed(2);
    const passengerName = bookingData.passengerInfo?.name || 'Customer';
    const [firstName, ...lastNameParts] = passengerName.split(' ');
    const lastName = lastNameParts.join(' ') || 'Customer';

    // Generate hash
    let hash = '';
    try {
      hash = await this.generateHash(orderId, amount, 'LKR');
    } catch (error) {
      console.error('Hash generation failed:', error);
      // Use a dummy hash for sandbox
      hash = 'SANDBOX_' + Date.now().toString(16).toUpperCase();
    }
    
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

  // Start payment
  async startPayment(
    bookingData: BookingData, 
    onSuccess: (paymentResult: any) => void,
    onError: (error: string) => void,
    onCancel: () => void
  ) {
    try {
      // Load PayHere SDK
      await this.loadPayHereScript();

      // Generate order ID
      const orderId = `BK_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

      // Create payment
      const payment = await this.createPayment(bookingData, orderId);

      console.log('🚀 Starting PayHere payment:', {
        orderId,
        amount: payment.amount,
        merchant_id: this.merchantId,
        isSandbox: this.isSandbox
      });

      // Setup callbacks
      window.payhere.onCompleted = function (paymentId: string) {
        console.log('✅ Payment completed:', paymentId);
        onSuccess({
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
        });
      };

      window.payhere.onDismissed = function () {
        console.log('⚠️ Payment cancelled');
        onCancel();
      };

      window.payhere.onError = function (error: string) {
        console.error('❌ Payment error:', error);
        onError(`PayHere Error: ${error}`);
      };

      // Start payment
      window.payhere.startPayment(payment);

    } catch (error) {
      console.error('💥 PayHere error:', error);
      onError(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Verify payment
  async verifyPayment(paymentId: string, orderId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, orderId }),
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.verified || false;
      }
      return false;
    } catch (error) {
      console.error('Verification failed:', error);
      return false;
    }
  }
}

const payHereService = new PayHereService();
export default payHereService;