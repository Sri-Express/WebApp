import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { orderId, amount, currency = 'LKR' } = await request.json();

    // Get merchant details from environment
    const merchantId = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID;
    const merchantSecretEncoded = process.env.PAYHERE_MERCHANT_SECRET;
    
    // Decode the base64 merchant secret
    const merchantSecret = Buffer.from(merchantSecretEncoded || '', 'base64').toString('utf-8');

    if (!merchantId || !merchantSecret) {
      console.error('❌ PayHere configuration missing:', {
        merchantId: !!merchantId,
        merchantSecret: !!merchantSecret
      });
      return NextResponse.json(
        { error: 'PayHere configuration incomplete' },
        { status: 500 }
      );
    }

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: 'Missing required parameters: orderId and amount' },
        { status: 400 }
      );
    }

    // Create hash string for PayHere (format: merchantId + orderId + amount + currency + merchantSecret)
    const hashString = `${merchantId}${orderId}${parseFloat(amount).toFixed(2)}${currency}${merchantSecret}`;
    
    console.log('🔐 Generating PayHere hash:', {
      merchantId,
      orderId,
      amount: parseFloat(amount).toFixed(2),
      currency,
      hashStringLength: hashString.length
    });

    // Generate MD5 hash
    const hash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();

    console.log('✅ PayHere hash generated successfully');

    return NextResponse.json({ 
      hash,
      success: true,
      debug: {
        merchantId,
        orderId,
        amount: parseFloat(amount).toFixed(2),
        currency
      }
    });

  } catch (error) {
    console.error('❌ Hash generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate payment hash',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}