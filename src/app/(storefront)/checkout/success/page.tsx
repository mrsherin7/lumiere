'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function AnimatedCheckmark() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-lg"
    >
      {/* Circle */}
      <motion.circle
        cx="40"
        cy="40"
        r="36"
        stroke="#16A34A"
        strokeWidth="4"
        fill="white"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      {/* Checkmark */}
      <motion.path
        d="M24 40l11 11 21-22"
        stroke="#16A34A"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
      />
    </svg>
  );
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');

  return (
    <div className="container-site py-20 max-w-xl text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Animated checkmark */}
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          >
            <AnimatedCheckmark />
          </motion.div>
        </div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <h1 className="font-serif text-4xl font-medium">Order Confirmed!</h1>
          {orderNumber && (
            <p className="text-foreground-secondary">
              Order <span className="font-semibold text-foreground">{orderNumber}</span> has been placed successfully.
            </p>
          )}
          <p className="text-foreground-secondary text-sm leading-relaxed">
            Thank you for shopping with Lumière. You will receive a confirmation email shortly.
            Estimated delivery: 3–5 business days.
          </p>
        </motion.div>

        {/* Timeline visual */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-4 py-4"
        >
          {[
            { label: 'Order Placed', done: true },
            { label: 'Processing', done: false },
            { label: 'Shipped', done: false },
            { label: 'Delivered', done: false },
          ].map((status, i) => (
            <React.Fragment key={status.label}>
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full ${status.done ? 'bg-success' : 'bg-gray-200'}`} />
                <span className="text-[10px] text-foreground-secondary text-center">{status.label}</span>
              </div>
              {i < 3 && <div className="w-8 h-px bg-gray-200 mb-3" />}
            </React.Fragment>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link href="/account/orders">
            <Button variant="secondary" size="lg" leftIcon={<Package size={16} />}>
              Track Order
            </Button>
          </Link>
          <Link href="/products">
            <Button size="lg" shimmer rightIcon={<ArrowRight size={16} />}>
              Continue Shopping
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="container-site py-20 text-center text-foreground-secondary">Loading order details...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
