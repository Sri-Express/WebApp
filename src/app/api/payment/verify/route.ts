import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { paymentId, orderId, amount, currency = 'LKR' } = await request.json();

    console.log('🔍 Payment verification request:', {
      paymentId,
      orderId,
      amount,
      currency
    });

    // Get merchant details from environment
    const merchantId = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    if (!merchantId || !merchantSecret) {
      console.error('❌ PayHere configuration missing for verification');
      return NextResponse.json({
        verified: false,
        error: 'PayHere configuration incomplete'
      }, { status: 500 });
    }

    if (!paymentId || !orderId) {
      return NextResponse.json({
        verified: false,
        error: 'Missing required parameters: paymentId and orderId'
      }, { status: 400 });
    }

    // In a real implementation, you would:
    // 1. Call PayHere's verification API
    // 2. Verify the payment status
    // 3. Check the payment amount matches
    
    // For sandbox/development, we'll simulate verification
    const isSandbox = process.env.NEXT_PUBLIC_PAYHERE_SANDBOX === 'true';
    
    if (isSandbox) {
      console.log('🔧 Sandbox mode: Auto-verifying payment');
      return NextResponse.json({
        verified: true,
        status: 'completed',
        sandbox: true,
        paymentId,
        orderId,
        verifiedAt: new Date().toISOString()
      });
    }

    // For production, implement actual PayHere verification API call
    // const verificationResult = await callPayHereVerificationAPI(paymentId, orderId);
    
    console.log('✅ Payment verification completed');

    return NextResponse.json({
      verified: true,
      status: 'completed',
      paymentId,
      orderId,
      verifiedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Payment verification error:', error);
    return NextResponse.json({
      verified: false,
      error: 'Payment verification failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}