'use client';

import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronDown, Eye, Package } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import type { Order } from '@/types';

const PAGE_SIZE = 20;
const STATUS_OPTIONS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_OPTIONS = ['all', 'pending', 'paid', 'failed', 'refunded'];

const SAMPLE_ADMIN_ORDERS: Order[] = [
  {
    id: 101,
    order_number: 'LUM-84920',
    user_id: 'user-1',
    email: 'aarav@example.com',
    shipping_address: {
      full_name: 'Aarav Sharma',
      address_line1: '42 MG Road, Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      zip: '560034',
      country: 'India',
      phone: '+91 98765 43210',
    },
    billing_address: {
      full_name: 'Aarav Sharma',
      address_line1: '42 MG Road, Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      zip: '560034',
      country: 'India',
    },
    shipping_method: 'Standard Delivery',
    shipping_cost: 0,
    subtotal: 14999,
    discount_amount: 2000,
    tax_amount: 0,
    total: 12999,
    coupon_code: null,
    payment_status: 'paid',
    fulfillment_status: 'shipped',
    razorpay_order_id: 'order_M12345',
    razorpay_payment_id: 'pay_M67890',
    tracking_number: 'BLR-TRK-9920',
    tracking_carrier: 'BlueDart Express',
    notes: null,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      {
        id: 'item-1',
        order_id: 101,
        product_id: 'prod-1',
        variant_id: null,
        title: 'Acoustic Pro ANC Wireless Headphones',
        variant_info: { Color: 'Matte Black' },
        quantity: 1,
        unit_price: 12999,
        line_total: 12999,
      },
    ],
  },
  {
    id: 102,
    order_number: 'LUM-84921',
    user_id: 'user-2',
    email: 'priya@example.com',
    shipping_address: {
      full_name: 'Priya Patel',
      address_line1: '15 Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      zip: '400050',
      country: 'India',
    },
    billing_address: {
      full_name: 'Priya Patel',
      address_line1: '15 Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      zip: '400050',
      country: 'India',
    },
    shipping_method: 'Express Shipping',
    shipping_cost: 250,
    subtotal: 8999,
    discount_amount: 0,
    tax_amount: 0,
    total: 9249,
    coupon_code: null,
    payment_status: 'paid',
    fulfillment_status: 'processing',
    razorpay_order_id: 'order_M12346',
    razorpay_payment_id: 'pay_M67891',
    tracking_number: null,
    tracking_carrier: null,
    notes: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      {
        id: 'item-2',
        order_id: 102,
        product_id: 'prod-2',
        variant_id: null,
        title: 'Pulse Earpods Pro Active Noise Canceling',
        variant_info: {},
        quantity: 1,
        unit_price: 8999,
        line_total: 8999,
      },
    ],
  },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [fulfillmentFilter, setFulfillmentFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { success } = useToast();
  const supabase = createClient();

  const fetchOrders = async () => {
    setIsLoading(true);

    let allOrders: Order[] = [];

    // 1. Check local storage saved orders
    try {
      const saved = localStorage.getItem('lumiere_user_orders');
      if (saved) {
        const parsed: Order[] = JSON.parse(saved);
        allOrders = [...parsed];
      }
    } catch { /* ignore */ }

    // Merge sample admin orders if list is empty or small
    if (allOrders.length === 0) {
      allOrders = [...SAMPLE_ADMIN_ORDERS];
    } else {
      SAMPLE_ADMIN_ORDERS.forEach((so) => {
        if (!allOrders.some((o) => o.order_number === so.order_number)) {
          allOrders.push(so);
        }
      });
    }

    // 2. Try Supabase
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*)', { count: 'exact' });

      if (!error && data && data.length > 0) {
        allOrders = data as unknown as Order[];
      }
    } catch { /* use fallback */ }

    let filtered = [...allOrders];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (o) => o.order_number.toLowerCase().includes(q) || o.email.toLowerCase().includes(q)
      );
    }

    if (fulfillmentFilter !== 'all') {
      filtered = filtered.filter((o) => o.fulfillment_status === fulfillmentFilter);
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter((o) => o.payment_status === paymentFilter);
    }

    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const start = (page - 1) * PAGE_SIZE;
    const paginated = filtered.slice(start, start + PAGE_SIZE);

    setOrders(paginated);
    setTotal(filtered.length);
    setIsLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(fetchOrders, 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page, fulfillmentFilter, paymentFilter]);

  const handleStatusChange = async (orderId: number | string, newStatus: string) => {
    // 1. Try Supabase update
    try {
      await supabase.from('orders').update({ fulfillment_status: newStatus }).eq('id', orderId);
    } catch { /* ignore */ }

    // 2. Persist update in local storage
    try {
      const saved = localStorage.getItem('lumiere_user_orders');
      const customOrders: Order[] = saved ? JSON.parse(saved) : [...SAMPLE_ADMIN_ORDERS];
      const idx = customOrders.findIndex((o) => String(o.id) === String(orderId));
      if (idx >= 0) {
        customOrders[idx].fulfillment_status = newStatus as Order['fulfillment_status'];
      } else {
        const sampleMatch = SAMPLE_ADMIN_ORDERS.find((s) => String(s.id) === String(orderId));
        if (sampleMatch) {
          customOrders.push({ ...sampleMatch, fulfillment_status: newStatus as Order['fulfillment_status'] });
        }
      }
      localStorage.setItem('lumiere_user_orders', JSON.stringify(customOrders));
    } catch { /* ignore */ }

    setOrders((prev) =>
      prev.map((o) => (String(o.id) === String(orderId) ? { ...o, fulfillment_status: newStatus as Order['fulfillment_status'] } : o))
    );
    if (selectedOrder && String(selectedOrder.id) === String(orderId)) {
      setSelectedOrder((prev) => (prev ? { ...prev, fulfillment_status: newStatus as Order['fulfillment_status'] } : null));
    }

    success('Status updated', `Fulfillment status changed to "${newStatus}".`);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Orders & Workflow</h1>
        <p className="text-sm text-foreground-secondary mt-0.5">{total} order{total !== 1 ? 's' : ''} total</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-border shadow-card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-secondary" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search order # or email..."
            className="w-full h-10 pl-9 pr-3 text-sm border border-border-strong rounded-xl focus:outline-none focus:border-accent"
          />
        </div>
        {[
          { label: 'Fulfillment', value: fulfillmentFilter, options: STATUS_OPTIONS, onChange: (v: string) => { setFulfillmentFilter(v); setPage(1); } },
          { label: 'Payment', value: paymentFilter, options: PAYMENT_OPTIONS, onChange: (v: string) => { setPaymentFilter(v); setPage(1); } },
        ].map(({ label, value, options, onChange }) => (
          <div key={label} className="relative">
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="h-10 pl-3 pr-8 text-sm border border-border-strong rounded-xl focus:outline-none focus:border-accent appearance-none cursor-pointer bg-white capitalize"
            >
              {options.map((o) => <option key={o} value={o} className="capitalize">{o === 'all' ? `All ${label}` : o}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground-secondary" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4"><TableSkeleton rows={10} cols={6} /></div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  {['Order', 'Customer', 'Total', 'Payment', 'Fulfillment Workflow', 'Date', 'Action'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-foreground-secondary">No orders found.</td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const orderTotal = order.total ?? (order as unknown as { total_amount: number }).total_amount ?? 0;
                    return (
                      <tr key={order.id} className="hover:bg-background/50 transition-colors">
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="font-mono text-sm font-semibold text-accent hover:underline cursor-pointer"
                          >
                            {order.order_number}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-foreground-secondary font-medium">{order.email}</td>
                        <td className="px-5 py-4 font-semibold">{formatCurrency(orderTotal)}</td>
                        <td className="px-5 py-4">
                          <span className={cn('status-badge', getStatusColor(order.payment_status))}>{order.payment_status}</span>
                        </td>
                        <td className="px-5 py-4">
                          {/* Workflow status selector */}
                          <div className="relative inline-block">
                            <select
                              value={order.fulfillment_status ?? 'pending'}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className={cn(
                                'h-8 pl-2.5 pr-7 text-xs font-semibold rounded-lg border appearance-none cursor-pointer focus:outline-none capitalize transition-colors',
                                getStatusColor(order.fulfillment_status)
                              )}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                          </div>
                        </td>
                        <td className="px-5 py-4 text-foreground-secondary text-xs">{formatDate(order.created_at)}</td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 text-foreground-secondary hover:text-foreground rounded-lg hover:bg-background transition-colors cursor-pointer"
                            title="View order details"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-border">
            <p className="text-xs text-foreground-secondary">Page {page} of {totalPages}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="h-8 w-8 flex items-center justify-center rounded-lg border border-border disabled:opacity-40 cursor-pointer hover:bg-background">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 w-8 flex items-center justify-center rounded-lg border border-border disabled:opacity-40 cursor-pointer hover:bg-background">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order Details — ${selectedOrder?.order_number}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6 pt-2">
            {/* Status overview */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-background border border-border">
              <div>
                <p className="text-xs text-foreground-muted uppercase">Payment Status</p>
                <span className={cn('status-badge mt-1', getStatusColor(selectedOrder.payment_status))}>
                  {selectedOrder.payment_status}
                </span>
              </div>
              <div>
                <p className="text-xs text-foreground-muted uppercase">Fulfillment Status</p>
                <select
                  value={selectedOrder.fulfillment_status ?? 'pending'}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  className="mt-1 h-8 pl-3 pr-7 text-xs font-semibold rounded-lg border bg-white appearance-none cursor-pointer capitalize"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <p className="text-xs text-foreground-muted uppercase">Total Amount</p>
                <p className="font-semibold text-foreground text-sm mt-1">
                  {formatCurrency(selectedOrder.total ?? (selectedOrder as unknown as { total_amount: number }).total_amount ?? 0)}
                </p>
              </div>
            </div>

            {/* Shipping Address & Customer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border space-y-1">
                <p className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-2">Customer Info</p>
                <p className="text-sm font-medium">{selectedOrder.shipping_address?.full_name ?? 'Customer'}</p>
                <p className="text-xs text-foreground-secondary">{selectedOrder.email}</p>
                {selectedOrder.shipping_address?.phone && (
                  <p className="text-xs text-foreground-secondary">{selectedOrder.shipping_address.phone}</p>
                )}
              </div>
              <div className="p-4 rounded-xl border border-border space-y-1">
                <p className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-2">Shipping Address</p>
                <p className="text-xs text-foreground">{selectedOrder.shipping_address?.address_line1}</p>
                <p className="text-xs text-foreground-secondary">
                  {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} {selectedOrder.shipping_address?.zip}
                </p>
                <p className="text-xs text-foreground-secondary">{selectedOrder.shipping_address?.country}</p>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <p className="text-xs font-semibold text-foreground-secondary uppercase tracking-wider mb-3">Order Items</p>
              <div className="space-y-3">
                {selectedOrder.items?.map((item) => {
                  const itemImg = (item as unknown as { image_url?: string }).image_url ?? item.product?.images?.[0]?.image_url;
                  return (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl border border-border">
                      <div className="w-12 h-12 rounded-lg bg-background overflow-hidden relative shrink-0">
                        {itemImg ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={itemImg} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <Package size={16} className="text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-foreground-secondary">Qty: {item.quantity} × {formatCurrency(item.unit_price)}</p>
                      </div>
                      <p className="text-sm font-semibold">{formatCurrency(item.line_total)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
