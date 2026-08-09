'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Animated 404 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-8"
        >
          <span className="font-serif text-[120px] sm:text-[160px] text-foreground/10 leading-none block">
            404
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="space-y-4"
        >
          <h1 className="font-serif text-3xl font-medium">Page Not Found</h1>
          <p className="text-foreground-secondary">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link href="/">
              <Button variant="secondary" leftIcon={<Home size={16} />}>
                Go Home
              </Button>
            </Link>
            <Link href="/products">
              <Button shimmer rightIcon={<ArrowRight size={16} />}>
                Browse Products
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
