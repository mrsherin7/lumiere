'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/ui/ProductCard';
import { useWishlist } from '@/providers/WishlistProvider';

export default function WishlistPage() {
  const { wishlist, wishlistCount } = useWishlist();

  return (
    <div className="container-site py-12 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/account" className="text-foreground-secondary hover:text-foreground transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-medium">Saved Items</h1>
            <p className="text-sm text-foreground-secondary mt-1">
              {wishlistCount} saved digital {wishlistCount === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>
        <Link href="/products">
          <Button variant="secondary" size="sm" rightIcon={<ArrowRight size={14} />}>
            Explore Store
          </Button>
        </Link>
      </div>

      {wishlistCount === 0 ? (
        <div className="card p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mx-auto">
            <Heart size={28} className="text-foreground-secondary" />
          </div>
          <h2 className="font-serif text-xl font-medium">Your wishlist is empty</h2>
          <p className="text-sm text-foreground-secondary leading-relaxed">
            Tap the heart icon on any digital accessory to save it to your personal wishlist.
          </p>
          <Link href="/products">
            <Button shimmer rightIcon={<ArrowRight size={16} />}>
              Browse Accessories
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
