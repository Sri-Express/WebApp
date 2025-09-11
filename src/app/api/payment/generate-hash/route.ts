// app/api/payment/generate-hash/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { orderId, amount, currency } = await request.json();

    console.log('Hash generation request received:', { orderId, amount, currency });

    // Get merchant credentials
    const merchantId = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID || '1231971';
    // This is server-side, so we can access the non-public env var
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || 'MjYwMDUxOTgzMDMwNzYwNjk5OTgzNjAyMDY2OTk1NDIzMjYyNjAwNg==';

    console.log('Using merchant ID:', merchantId);
    console.log('Merchant secret available:', !!merchantSecret);

    if (!merchantId || !merchantSecret) {
      console.error('Missing PayHere credentials:', { 
        merchantId: !!merchantId, 
        merchantSecret: !!merchantSecret 
      });
      return NextResponse.json(
        { error: 'Payment configuration error' },
        { status: 500 }
      );
    }

    // Format amount to 2 decimal places
    const formattedAmount = parseFloat(amount).toFixed(2);

    // Generate hash according to PayHere documentation
    // Hash = MD5(merchant_id + order_id + amount + currency + MD5(merchant_secret).toUpperCase()).toUpperCase()
    const hashedSecret = crypto
      .createHash('md5')
      .update(merchantSecret)
      .digest('hex')
      .toUpperCase();
    
    const hashString = merchantId + orderId + formattedAmount + currency + hashedSecret;
    
    console.log('Hash string format:', `${merchantId}${orderId}${formattedAmount}${currency}[HASHED_SECRET]`);
    
    const hash = crypto
      .createHash('md5')
      .update(hashString)
      .digest('hex')
      .toUpperCase();

    console.log('Generated hash:', hash);

    return NextResponse.json({ 
      hash,
      debug: {
        merchantId,
        orderId,
        amount: formattedAmount,
        currency
      }
    });
  } catch (error) {
    console.error('Hash generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate payment hash', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Also handle GET for testing
export async function GET() {
  return NextResponse.json({ 
    status: 'Hash generation endpoint is working',
    merchant_id: process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID || 'Not set',
    has_secret: !!process.env.PAYHERE_MERCHANT_SECRET 
  });
}