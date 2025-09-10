import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    
    // PayHere webhook parameters
    const merchantId = params.get('merchant_id');
    const orderId = params.get('order_id');
    const paymentId = params.get('payment_id');
    const payHereAmount = params.get('payhere_amount');
    const payHereCurrency = params.get('payhere_currency');
    const statusCode = params.get('status_code');
    const md5sig = params.get('md5sig');

    console.log('📨 PayHere webhook received:', {
      merchantId,
      orderId,
      paymentId,
      amount: payHereAmount,
      currency: payHereCurrency,
      statusCode,
      hasSignature: !!md5sig
    });

    // Verify the webhook signature
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    
    if (!merchantSecret) {
      console.error('❌ Merchant secret not configured for webhook verification');
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }

    // Create verification hash
    const verificationString = `${merchantId}${orderId}${payHereAmount}${payHereCurrency}${statusCode}${merchantSecret}`;
    const expectedHash = crypto.createHash('md5').update(verificationString).digest('hex').toUpperCase();

    if (md5sig !== expectedHash) {
      console.error('❌ Webhook signature verification failed:', {
        received: md5sig,
        expected: expectedHash
      });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('✅ Webhook signature verified successfully');

    // Process the payment based on status code
    // Status codes: 2 = Success, 0 = Pending, -1 = Cancelled, -2 = Failed, -3 = Chargedback
    let status = 'unknown';
    switch (statusCode) {
      case '2':
        status = 'completed';
        break;
      case '0':
        status = 'pending';
        break;
      case '-1':
        status = 'cancelled';
        break;
      case '-2':
        status = 'failed';
        break;
      case '-3':
        status = 'chargedback';
        break;
      default:
        status = 'unknown';
    }

    console.log(`💳 Payment ${orderId} status: ${status} (code: ${statusCode})`);

    // Here you would typically:
    // 1. Update your database with the payment status
    // 2. Send confirmation emails
    // 3. Update booking status
    // 4. Trigger any other business logic

    // For now, we'll just log and respond
    if (status === 'completed') {
      console.log('🎉 Payment completed successfully:', {
        orderId,
        paymentId,
        amount: payHereAmount,
        currency: payHereCurrency
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      orderId,
      status
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json({
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}