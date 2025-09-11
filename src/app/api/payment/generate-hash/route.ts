// app/api/payment/generate-hash/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { orderId, amount, currency } = await request.json();

    // Get merchant credentials from environment variables
    const merchantId = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID || '1231971';
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || 'MjYwMDUxOTgzMDMwNzYwNjk5OTgzNjAyMDY2OTk1NDIzMjYyNjAwNg==';

    if (!merchantId || !merchantSecret) {
      console.error('Missing PayHere credentials:', { merchantId: !!merchantId, merchantSecret: !!merchantSecret });
      return NextResponse.json(
        { error: 'Payment configuration error' },
        { status: 500 }
      );
    }

    // Format amount to 2 decimal places
    const formattedAmount = parseFloat(amount).toFixed(2);

    // Generate hash according to PayHere documentation
    // Hash = MD5(merchant_id + order_id + amount + currency + merchant_secret)
    const hashString = merchantId + orderId + formattedAmount + currency + merchantSecret;
    
    const hash = crypto
      .createHash('md5')
      .update(hashString)
      .digest('hex')
      .toUpperCase();

    console.log('Hash generation:', {
      merchantId,
      orderId,
      amount: formattedAmount,
      currency,
      hashString: `${merchantId}${orderId}${formattedAmount}${currency}[SECRET_HIDDEN]`,
      hash
    });

    return NextResponse.json({ hash });
  } catch (error) {
    console.error('Hash generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate payment hash' },
      { status: 500 }
    );
  }
}