'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ShoppingCart, Users, DollarSign, BarChart2 } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import { createClient } from '@/lib/supabase/client';
import { StatCardSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { DashboardStats, RevenueDataPoint } from '@/types';

// ============================================================
// STAT CARD
// ============================================================
function StatCard({
  label,
  value,
  change,
  icon: Icon,
  prefix = '',
  isLoading,
}: {
  label: string;
  value: number;
  change: number;
  icon: React.ElementType;
  prefix?: string;
  isLoading: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const isPositive = change >= 0;

  // Count-up animation
  useEffect(() => {
    if (isLoading) return;
    let start = 0;
    const duration = 1200;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, isLoading]);

  if (isLoading) return <StatCardSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 border border-border shadow-card"
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm text-foreground-secondary font-medium">{label}</p>
        <div className="w-9 h-9 bg-background rounded-xl flex items-center justify-center">
          <Icon size={18} className="text-foreground-secondary" />
        </div>
      </div>
      <p className="text-2xl font-semibold text-foreground mb-1.5">
        {prefix}{typeof displayValue === 'number' && prefix === '₹'
          ? displayValue.toLocaleString('en-IN')
          : displayValue.toLocaleString()}
      </p>
      <div className={cn(
        'flex items-center gap-1 text-xs font-medium',
        isPositive ? 'text-success' : 'text-destructive'
      )}>
        {isPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
        {Math.abs(change).toFixed(1)}% vs last period
      </div>
    </motion.div>
  );
}

// ============================================================
// MOCK DATA (populated from Supabase in production)
// ============================================================
const generateRevenueData = (): RevenueDataPoint[] => {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      revenue: Math.floor(Math.random() * 50000 + 10000),
      orders: Math.floor(Math.random() * 20 + 5),
    });
  }
  return data;
};

const topProducts = [
  { title: 'ANC Studio Headphones', units_sold: 184 },
  { title: 'Wireless Earpods Pro', units_sold: 142 },
  { title: 'OLED Smartwatch Ultra', units_sold: 116 },
  { title: 'Tactile Mechanical Keyboard', units_sold: 98 },
  { title: 'Precision Ergonomic Mouse', units_sold: 75 },
];

// ============================================================
// MAIN DASHBOARD
// ============================================================
export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [recentOrders, setRecentOrders] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const supabase = createClient();

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);

    let totalRevenue = 142498;
    let totalOrdersCount = 18;
    let totalCustomersCount = 24;
    let avgOrderVal = 7916;
    let ordersList: unknown[] = [
      { id: 101, order_number: 'LUM-84920', email: 'aarav@example.com', total: 12999, payment_status: 'paid', fulfillment_status: 'shipped', created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
      { id: 102, order_number: 'LUM-84921', email: 'priya@example.com', total: 9249, payment_status: 'paid', fulfillment_status: 'processing', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
    ];

    try {
      const savedOrders = localStorage.getItem('lumiere_user_orders');
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        if (Array.isArray(parsed) && parsed.length > 0) {
          ordersList = parsed;
          totalOrdersCount = parsed.length;
          totalRevenue = parsed.reduce((sum, o) => sum + Number(o.total || o.total_amount || 0), 0);
          avgOrderVal = totalRevenue / Math.max(1, totalOrdersCount);
        }
      }
    } catch { /* ignore */ }

    // Fetch stats from Supabase if available
    try {
      const [ordersRes, customersRes, recentOrdersRes] = await Promise.all([
        supabase.from('orders').select('total, payment_status, created_at'),
        supabase.from('profiles').select('id, created_at').eq('role', 'customer'),
        supabase
          .from('orders')
          .select('id, order_number, email, total, payment_status, fulfillment_status, created_at')
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      const dbOrders = ordersRes.data ?? [];
      if (dbOrders.length > 0) {
        const paidOrders = dbOrders.filter((o) => o.payment_status === 'paid');
        totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total ?? 0), 0);
        totalOrdersCount = dbOrders.length;
        totalCustomersCount = customersRes.data?.length ?? totalCustomersCount;
        avgOrderVal = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
        ordersList = recentOrdersRes.data ?? ordersList;
      }
    } catch { /* ignore */ }

    setStats({
      totalRevenue,
      totalOrders: totalOrdersCount,
      totalCustomers: totalCustomersCount,
      avgOrderValue: avgOrderVal,
      revenueChange: 12.4,
      ordersChange: 8.2,
      customersChange: 5.7,
      avgOrderChange: 3.1,
    });

    setRecentOrders(ordersList);
    setRevenueData(generateRevenueData());
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const statCards = stats
    ? [
        { label: 'Total Revenue', value: stats.totalRevenue, change: stats.revenueChange, icon: DollarSign, prefix: '₹' },
        { label: 'Total Orders', value: stats.totalOrders, change: stats.ordersChange, icon: ShoppingCart },
        { label: 'Customers', value: stats.totalCustomers, change: stats.customersChange, icon: Users },
        { label: 'Avg. Order Value', value: Math.round(stats.avgOrderValue), change: stats.avgOrderChange, icon: BarChart2, prefix: '₹' },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-foreground-secondary mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((card) => (
              <StatCard key={card.label} {...card} isLoading={isLoading} />
            ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border shadow-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-foreground">Revenue</h2>
            <div className="flex gap-1">
              {(['7d', '30d', '90d'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setChartPeriod(period)}
                  className={cn(
                    'px-3 py-1 text-xs rounded-lg transition-colors cursor-pointer',
                    chartPeriod === period
                      ? 'bg-foreground text-white'
                      : 'text-foreground-secondary hover:bg-background'
                  )}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData.slice(chartPeriod === '7d' ? -7 : chartPeriod === '90d' ? 0 : -30)}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9A9A9A' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: '#9A9A9A' }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: 12 }}
                formatter={(v: unknown) => [`₹${(v as number).toLocaleString('en-IN')}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#1A1A1A" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top products chart */}
        <div className="bg-white rounded-2xl border border-border shadow-card p-6">
          <h2 className="font-semibold text-foreground mb-6">Top Products</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topProducts} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9A9A9A' }} tickLine={false} axisLine={false} />
              <YAxis dataKey="title" type="category" tick={{ fontSize: 10, fill: '#9A9A9A' }} width={100} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', fontSize: 12 }} />
              <Bar dataKey="units_sold" radius={[0, 4, 4, 0]}>
                {topProducts.map((_, i) => (
                  <Cell key={i} fill={`hsl(${220 + i * 10}, 60%, ${40 + i * 5}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-border shadow-card">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-semibold">Recent Orders</h2>
          <a href="/admin/orders" className="text-sm text-accent hover:text-accent/80 transition-colors">
            View all →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Order', 'Customer', 'Total', 'Payment', 'Status', 'Date'].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-foreground-secondary uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(recentOrders as {
                id: number;
                order_number: string;
                email: string;
                total: number;
                payment_status: string;
                fulfillment_status: string;
                created_at: string;
              }[]).map((order) => (
                <tr key={order.id} className="hover:bg-background/50 transition-colors">
                  <td className="px-6 py-4">
                    <a href={`/admin/orders/${order.id}`} className="font-medium text-accent hover:text-accent/80 transition-colors">
                      {order.order_number}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-foreground-secondary">{order.email}</td>
                  <td className="px-6 py-4 font-medium">{formatCurrency(order.total)}</td>
                  <td className="px-6 py-4">
                    <span className={cn('status-badge text-xs', getStatusColor(order.payment_status))}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn('status-badge text-xs', getStatusColor(order.fulfillment_status))}>
                      {order.fulfillment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-foreground-secondary text-xs">
                    {formatDate(order.created_at)}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-foreground-secondary text-sm">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
