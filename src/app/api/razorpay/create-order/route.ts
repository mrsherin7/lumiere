import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = 'INR', receipt } = body;

    return NextResponse.json({
      id: `order_mock_${Date.now()}`,
      amount: Math.round((amount || 100) * 100),
      currency,
      receipt: receipt ?? `receipt_${Date.now()}`,
      status: 'created',
    });
  } catch {
    return NextResponse.json({ error: 'Order creation failed' }, { status: 400 });
  }
}
