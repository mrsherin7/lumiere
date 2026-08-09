'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useWishlist } from '@/providers/WishlistProvider';
import { Package, Heart, User as UserIcon, LogOut, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AccountPage() {
  const { user, profile, isLoading, signOut } = useAuth();
  const { wishlistCount } = useWishlist();

  if (isLoading) {
    return (
      <div className="container-site py-20 text-center flex flex-col items-center justify-center">
        <span className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-foreground-secondary">Loading account details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-site py-16 max-w-md mx-auto text-center">
        <div className="card p-10 space-y-5">
          <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mx-auto">
            <UserIcon size={32} className="text-foreground-secondary" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-medium text-foreground">Sign in to your account</h1>
            <p className="text-sm text-foreground-secondary mt-2 leading-relaxed">
              Access your saved digital accessories, view past orders, and manage profile preferences.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <Link href="/account/login">
              <Button fullWidth shimmer rightIcon={<ArrowRight size={16} />}>
                Sign In or Register
              </Button>
            </Link>
            <Link href="/products" className="text-xs text-foreground-muted hover:text-foreground transition-colors">
              Continue as guest →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-site py-12 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-medium">My Account</h1>
            {profile?.role === 'admin' && (
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-accent text-white rounded-full">
                Admin
              </span>
            )}
          </div>
          <p className="text-sm text-foreground-secondary mt-1">
            Welcome back, <span className="font-medium text-foreground">{profile?.full_name ?? user.email}</span>
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={signOut} leftIcon={<LogOut size={14} />}>
          Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/account/orders" className="card card-hover p-6 space-y-3 block group">
          <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center group-hover:bg-foreground group-hover:text-white transition-colors duration-200">
            <Package size={20} className="text-foreground-secondary group-hover:text-white transition-colors" />
          </div>
          <div>
            <h2 className="font-medium text-base group-hover:text-accent transition-colors">Order History</h2>
            <p className="text-xs text-foreground-secondary mt-1 leading-relaxed">
              Track shipments, order receipts, and status timeline.
            </p>
          </div>
          <p className="text-xs font-medium text-accent flex items-center gap-1 pt-1">
            View Orders <ArrowRight size={12} />
          </p>
        </Link>

        <Link href="/account/wishlist" className="card card-hover p-6 space-y-3 block group">
          <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center group-hover:bg-foreground group-hover:text-white transition-colors duration-200">
            <Heart size={20} className="text-foreground-secondary group-hover:text-white transition-colors" />
          </div>
          <div>
            <h2 className="font-medium text-base group-hover:text-accent transition-colors">Saved Wishlist</h2>
            <p className="text-xs text-foreground-secondary mt-1 leading-relaxed">
              {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved in your wishlist.
            </p>
          </div>
          <p className="text-xs font-medium text-accent flex items-center gap-1 pt-1">
            View Wishlist ({wishlistCount}) <ArrowRight size={12} />
          </p>
        </Link>

        <div className="card p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">
            <UserIcon size={20} className="text-foreground-secondary" />
          </div>
          <div>
            <h2 className="font-medium text-base">Profile Details</h2>
            <p className="text-xs text-foreground-secondary truncate mt-1">{user.email}</p>
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            <ShieldCheck size={14} className="text-success" />
            <span className="text-xs text-success font-medium">Verified Customer</span>
          </div>
        </div>
      </div>
    </div>
  );
}
