'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ArrowLeft, ArrowRight, Clock, CheckCircle2, Truck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { formatCurrency } from '@/lib/utils';
import type { Order } from '@/types';

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      // 1. Try local storage
      let localOrders: Order[] = [];
      try {
        const saved = localStorage.getItem('lumiere_user_orders');
        if (saved) localOrders = JSON.parse(saved);
      } catch { /* ignore */ }

      // 2. Try Supabase if user logged in
      if (user) {
        try {
          const { data } = await supabase
            .from('orders')
            .select('*, items:order_items(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (active && data && data.length > 0) {
            setOrders(data as unknown as Order[]);
            setIsLoading(false);
            return;
          }
        } catch { /* ignore */ }
      }

      if (active) {
        setOrders(localOrders);
        setIsLoading(false);
      }
    };

    loadOrders();
    return () => { active = false; };
  }, [user, supabase]);

  const getStatusBadge = (status: Order['fulfillment_status'] | string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
            <CheckCircle2 size={12} /> Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
            <Truck size={12} /> Shipped
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
            <CheckCircle2 size={12} /> Processing
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 rounded-full border border-rose-200">
            <AlertCircle size={12} /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-700 rounded-full border border-amber-200">
            <Clock size={12} /> Pending
          </span>
        );
    }
  };

  return (
    <div className="container-site py-12 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/account" className="text-foreground-secondary hover:text-foreground transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-serif text-3xl font-medium">Order History</h1>
          <p className="text-sm text-foreground-secondary mt-1">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <span className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin inline-block" />
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mx-auto">
            <Package size={28} className="text-foreground-secondary" />
          </div>
          <h2 className="font-serif text-xl font-medium">No recent orders</h2>
          <p className="text-sm text-foreground-secondary leading-relaxed">
            When you place orders for digital accessories, they will appear here with live tracking.
          </p>
          <Link href="/products">
            <Button shimmer rightIcon={<ArrowRight size={16} />}>
              Explore Products
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const orderTotal = order.total ?? (order as unknown as { total_amount: number }).total_amount ?? 0;
            const status = order.fulfillment_status ?? (order as unknown as { status: string }).status ?? 'pending';

            return (
              <div key={order.id} className="card p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
                  <div>
                    <p className="text-xs text-foreground-muted uppercase tracking-wider">Order Number</p>
                    <p className="font-mono text-sm font-semibold text-foreground mt-0.5">{order.order_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground-muted uppercase tracking-wider">Date Placed</p>
                    <p className="text-sm text-foreground-secondary mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground-muted uppercase tracking-wider">Total Amount</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{formatCurrency(orderTotal)}</p>
                  </div>
                  <div>{getStatusBadge(status)}</div>
                </div>

                {/* Items list */}
                <div className="space-y-3">
                  {order.items?.map((item) => {
                    const itemImage = (item as unknown as { image_url?: string }).image_url ?? item.product?.images?.[0]?.image_url;
                    return (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-lg bg-background-secondary overflow-hidden relative shrink-0">
                          {itemImage ? (
                            <Image src={itemImage} alt={item.title} fill sizes="56px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <Package size={18} className="text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                          <p className="text-xs text-foreground-secondary mt-0.5">
                            Qty: {item.quantity} × {formatCurrency(item.unit_price)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-foreground shrink-0">
                          {formatCurrency(item.line_total)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
