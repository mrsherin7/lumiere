'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Minus, Plus, ArrowRight, Tag } from 'lucide-react';
import { formatCurrency, calculateShipping } from '@/lib/utils';
import { useCart } from '@/providers/CartProvider';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';

export function CartDrawer() {
  const {
    isDrawerOpen,
    closeDrawer,
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
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={closeDrawer}
          />
        )}
      </AnimatePresence>

      {/* Drawer panel */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white flex flex-col shadow-modal"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-foreground-secondary" />
                <h2 className="font-medium text-foreground">
                  Cart
                  {itemCount > 0 && (
                    <span className="ml-2 text-foreground-secondary font-normal text-sm">
                      ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                    </span>
                  )}
                </h2>
              </div>
              <button
                onClick={closeDrawer}
                className="p-2 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-background transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cart items or empty state */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <EmptyCartState onClose={closeDrawer} />
              ) : (
                <motion.ul className="divide-y divide-border">
                  <AnimatePresence initial={false}>
                    {items.map((item, i) => (
                      <CartItemRow
                        key={item.id}
                        item={item}
                        index={i}
                        onRemove={() => removeItem(item.id)}
                        onQuantityChange={(qty) => updateQuantity(item.id, qty)}
                      />
                    ))}
                  </AnimatePresence>
                </motion.ul>
              )}
            </div>

            {/* Footer: coupon + summary + CTA */}
            {items.length > 0 && (
              <div className="border-t border-border">
                {/* Coupon */}
                <div className="px-6 pt-4">
                  {couponCode ? (
                    <div className="flex items-center justify-between py-2 px-3 bg-success/5 border border-success/20 rounded-xl">
                      <div className="flex items-center gap-2 text-success text-sm">
                        <Tag size={14} />
                        <span className="font-medium">{couponCode}</span>
                        <span className="text-foreground-secondary">
                          (-{formatCurrency(couponDiscount)})
                        </span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-foreground-secondary hover:text-destructive transition-colors cursor-pointer"
                      >
                        <X size={14} />
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
                        className="flex-1 h-10 px-3 text-sm border border-border-strong rounded-xl focus:outline-none focus:border-accent transition-colors"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        isLoading={isApplyingCoupon}
                        onClick={handleApplyCoupon}
                        className="h-10 px-4"
                      >
                        Apply
                      </Button>
                    </div>
                  )}
                </div>

                {/* Order summary */}
                <div className="px-6 pt-4 pb-3 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-secondary">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-success">
                      <span>Discount</span>
                      <span>-{formatCurrency(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-secondary">Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-secondary">Tax (18%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
                    <span>Total</span>
                    <span>{formatCurrency(total + shipping + tax)}</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="px-6 pb-6 space-y-3">
                  <Link href="/checkout" onClick={closeDrawer}>
                    <Button
                      fullWidth
                      size="lg"
                      shimmer
                      rightIcon={<ArrowRight size={18} />}
                    >
                      Proceed to Checkout
                    </Button>
                  </Link>
                  <button
                    onClick={closeDrawer}
                    className="w-full text-sm text-foreground-secondary hover:text-foreground transition-colors cursor-pointer"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function CartItemRow({
  item,
  index,
  onRemove,
  onQuantityChange,
}: {
  item: import('@/types').CartItem;
  index: number;
  onRemove: () => void;
  onQuantityChange: (qty: number) => void;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50, height: 0 }}
      transition={{
        delay: index * 0.05,
        duration: 0.25,
      }}
      className="flex gap-4 px-6 py-4 overflow-hidden"
    >
      {/* Image */}
      <Link
        href={`/products/${item.slug}`}
        className="relative w-20 h-24 rounded-lg overflow-hidden bg-background-secondary shrink-0"
      >
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.title}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <ShoppingBag size={20} className="text-gray-300" />
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/products/${item.slug}`}
            className="text-sm font-medium text-foreground hover:text-accent transition-colors line-clamp-2"
          >
            {item.title}
          </Link>
          <button
            onClick={onRemove}
            className="text-foreground-muted hover:text-destructive transition-colors cursor-pointer shrink-0 p-1"
            aria-label="Remove item"
          >
            <X size={14} />
          </button>
        </div>

        {/* Variant info */}
        {Object.keys(item.variant_info).length > 0 && (
          <p className="text-xs text-foreground-secondary mt-0.5">
            {Object.entries(item.variant_info)
              .map(([k, v]) => `${k}: ${v}`)
              .join(' · ')}
          </p>
        )}

        <div className="flex items-center justify-between mt-3">
          {/* Quantity */}
          <div className="flex items-center border border-border-strong rounded-lg overflow-hidden">
            <button
              onClick={() => onQuantityChange(item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center text-foreground-secondary hover:text-foreground hover:bg-background transition-colors cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus size={13} />
            </button>
            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
            <button
              onClick={() => onQuantityChange(item.quantity + 1)}
              disabled={item.quantity >= item.max_quantity}
              className="w-8 h-8 flex items-center justify-center text-foreground-secondary hover:text-foreground hover:bg-background transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Increase quantity"
            >
              <Plus size={13} />
            </button>
          </div>
          <span className="text-sm font-semibold">{formatCurrency(item.price * item.quantity)}</span>
        </div>
      </div>
    </motion.li>
  );
}

function EmptyCartState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-16 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-24 h-24 rounded-full bg-background flex items-center justify-center mb-6"
      >
        <ShoppingBag size={36} className="text-foreground-muted" />
      </motion.div>
      <h3 className="font-serif text-xl font-medium mb-2">Your cart is empty</h3>
      <p className="text-sm text-foreground-secondary mb-8 max-w-[220px]">
        Discover our curated collections and find something you love.
      </p>
      <Button onClick={onClose} shimmer rightIcon={<ArrowRight size={16} />}>
        Continue Shopping
      </Button>
    </div>
  );
}
