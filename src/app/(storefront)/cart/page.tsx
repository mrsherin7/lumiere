'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, X, ShoppingBag, ArrowRight, ArrowLeft, Tag } from 'lucide-react';
import { useCart } from '@/providers/CartProvider';
import { Button } from '@/components/ui/Button';
import { formatCurrency, calculateShipping } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { useState } from 'react';

export default function CartPage() {
  const {
    items,
    subtotal,
    total,
    couponCode,
    couponDiscount,
    itemCount,
    removeItem,
    updateQuantity,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { success, error } = useToast();
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const shipping = calculateShipping(subtotal);
  const tax = Math.round(subtotal * 0.18 * 100) / 100;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    const result = await applyCoupon(couponInput.trim());
    setIsApplyingCoupon(false);
    if (result.success) {
      success('Coupon applied!', result.message);
      setCouponInput('');
    } else {
      error('Invalid coupon', result.message);
    }
  };

  return (
    <div className="container-site py-12">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/products" className="text-foreground-secondary hover:text-foreground transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-serif text-section-sm">
          Shopping Cart
          {itemCount > 0 && (
            <span className="ml-3 text-lg text-foreground-secondary font-sans font-normal">
              ({itemCount} item{itemCount !== 1 ? 's' : ''})
            </span>
          )}
        </h1>
      </div>

      {items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Items list */}
          <div className="lg:col-span-2">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  exit={{ opacity: 0, x: 40, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-5 py-6 border-b border-border last:border-0 overflow-hidden"
                >
                  {/* Image */}
                  <Link href={`/products/${item.slug}`} className="relative w-28 h-36 rounded-xl overflow-hidden bg-background-secondary shrink-0">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.title} fill sizes="112px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <ShoppingBag size={24} className="text-gray-300" />
                      </div>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/products/${item.slug}`} className="font-medium hover:text-accent transition-colors">
                        {item.title}
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-foreground-muted hover:text-destructive transition-colors cursor-pointer shrink-0"
                        aria-label="Remove item"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {Object.keys(item.variant_info).length > 0 && (
                      <p className="text-sm text-foreground-secondary mt-1">
                        {Object.entries(item.variant_info).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-border-strong rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-9 h-9 flex items-center justify-center text-foreground-secondary hover:bg-background transition-colors cursor-pointer"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-9 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.max_quantity}
                          className="w-9 h-9 flex items-center justify-center text-foreground-secondary hover:bg-background transition-colors cursor-pointer disabled:opacity-40"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-foreground-muted">{formatCurrency(item.price)} each</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 space-y-4 sticky top-24">
              <h2 className="font-medium text-base">Order Summary</h2>

              {/* Coupon */}
              {couponCode ? (
                <div className="flex items-center justify-between p-3 bg-success/5 border border-success/20 rounded-xl text-success text-sm">
                  <div className="flex items-center gap-2">
                    <Tag size={14} />
                    <span className="font-medium">{couponCode}</span>
                    <span className="text-foreground-secondary">(-{formatCurrency(couponDiscount)})</span>
                  </div>
                  <button onClick={removeCoupon} className="text-foreground-secondary hover:text-destructive cursor-pointer">
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                    placeholder="Promo code"
                    className="flex-1 h-10 px-3 text-sm border border-border-strong rounded-xl focus:outline-none focus:border-accent"
                  />
                  <Button variant="secondary" size="sm" isLoading={isApplyingCoupon} onClick={handleApplyCoupon} className="h-10">
                    Apply
                  </Button>
                </div>
              )}

              <div className="space-y-3 pt-2 border-t border-border">
                {[
                  { label: 'Subtotal', value: formatCurrency(subtotal) },
                  ...(couponDiscount > 0 ? [{ label: 'Discount', value: `-${formatCurrency(couponDiscount)}`, className: 'text-success' }] : []),
                  { label: 'Shipping', value: shipping === 0 ? 'Free' : formatCurrency(shipping) },
                  { label: 'Tax (18%)', value: formatCurrency(tax) },
                ].map(({ label, value, className: cls }) => (
                  <div key={label} className={`flex justify-between text-sm ${cls ?? ''}`}>
                    <span className="text-foreground-secondary">{label}</span>
                    <span>{value}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold text-base pt-3 border-t border-border">
                  <span>Total</span>
                  <span>{formatCurrency(total + shipping + tax)}</span>
                </div>
              </div>

              <Link href="/checkout">
                <Button fullWidth size="lg" shimmer rightIcon={<ArrowRight size={18} />}>
                  Proceed to Checkout
                </Button>
              </Link>

              <div className="text-center">
                <Link href="/products" className="text-sm text-foreground-secondary hover:text-foreground transition-colors inline-flex items-center gap-1">
                  <ArrowLeft size={14} />
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyCart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-24"
    >
      <div className="w-24 h-24 rounded-full bg-background-secondary flex items-center justify-center mx-auto mb-6">
        <ShoppingBag size={40} className="text-foreground-muted" />
      </div>
      <h2 className="font-serif text-2xl mb-3">Your cart is empty</h2>
      <p className="text-foreground-secondary mb-8 max-w-xs mx-auto">
        Discover our curated collections and find something you love.
      </p>
      <Link href="/products">
        <Button size="lg" shimmer rightIcon={<ArrowRight size={18} />}>
          Explore Products
        </Button>
      </Link>
    </motion.div>
  );
}
