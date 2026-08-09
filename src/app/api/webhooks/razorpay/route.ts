import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-razorpay-signature');
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

  const body = await request.text();

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    console.error('Invalid Razorpay webhook signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(body);
  const supabase = createAdminClient();

  switch (event.event) {
    case 'payment.captured': {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;
      const razorpayPaymentId = payment.id;

      // Update order payment status to 'paid'
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          fulfillment_status: 'processing',
          razorpay_payment_id: razorpayPaymentId,
          updated_at: new Date().toISOString(),
        })
        .eq('razorpay_order_id', razorpayOrderId);

      if (error) {
        console.error('Failed to update order:', error);
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
      }

      // Add order timeline event
      const { data: order } = await supabase
        .from('orders')
        .select('id')
        .eq('razorpay_order_id', razorpayOrderId)
        .single();

      if (order) {
        await supabase.from('order_timeline').insert({
          order_id: order.id,
          status: 'Payment Confirmed',
          note: `Payment received via Razorpay. ID: ${razorpayPaymentId}`,
        });
      }
      break;
    }

    case 'payment.failed': {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;

      await supabase
        .from('orders')
        .update({ payment_status: 'failed', updated_at: new Date().toISOString() })
        .eq('razorpay_order_id', razorpayOrderId);
      break;
    }

    case 'refund.created': {
      const refund = event.payload.refund.entity;
      const razorpayPaymentId = refund.payment_id;

      await supabase
        .from('orders')
        .update({ payment_status: 'refunded', updated_at: new Date().toISOString() })
        .eq('razorpay_payment_id', razorpayPaymentId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
