import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import type { AddressSnapshot } from '@/types';

interface CreateOrderPayload {
  user_id?: string;
  email: string;
  shipping_address: AddressSnapshot;
  billing_address: AddressSnapshot;
  shipping_method: string;
  shipping_cost: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  coupon_code?: string;
  razorpay_order_id: string;
  items: {
    product_id: string;
    variant_id?: string;
    title: string;
    variant_info: Record<string, string>;
    quantity: number;
    unit_price: number;
    line_total: number;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const payload: CreateOrderPayload = await request.json();
    const supabase = createAdminClient();

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: payload.user_id ?? null,
        email: payload.email,
        shipping_address: payload.shipping_address,
        billing_address: payload.billing_address,
        shipping_method: payload.shipping_method,
        shipping_cost: payload.shipping_cost,
        subtotal: payload.subtotal,
        discount_amount: payload.discount_amount,
        tax_amount: payload.tax_amount,
        total: payload.total,
        coupon_code: payload.coupon_code ?? null,
        razorpay_order_id: payload.razorpay_order_id,
        payment_status: 'pending',
        fulfillment_status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItems = payload.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id ?? null,
      title: item.title,
      variant_info: item.variant_info,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.line_total,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    // Add initial order timeline event
    await supabase.from('order_timeline').insert({
      order_id: order.id,
      status: 'Order Placed',
      note: 'Your order has been received and is awaiting payment confirmation.',
    });

    return NextResponse.json({ orderId: order.id, orderNumber: order.order_number });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
