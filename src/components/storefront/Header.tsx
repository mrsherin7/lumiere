'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import {
  ShoppingBag,
  Search,
  User,
  Menu,
  X,
  Heart,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/providers/CartProvider';
import { useAuth } from '@/providers/AuthProvider';
import { useWishlist } from '@/providers/WishlistProvider';

const navLinks = [
  { label: 'New Tech', href: '/products?sort=newest' },
  {
    label: 'Audio',
    href: '/products?category=audio',
    children: [
      { label: 'All Audio', href: '/products?category=audio' },
      { label: 'Headphones', href: '/products?category=audio&tag=headphones' },
      { label: 'Wireless Earpods', href: '/products?category=audio&tag=earpods' },
      { label: 'Bluetooth Speakers', href: '/products?category=audio&tag=speakers' },
    ],
  },
  {
    label: 'Smartwatches',
    href: '/products?category=wearables',
    children: [
      { label: 'All Wearables', href: '/products?category=wearables' },
      { label: 'Smartwatches', href: '/products?category=wearables&tag=smartwatch' },
      { label: 'Fitness Bands', href: '/products?category=wearables&tag=fitness' },
      { label: 'Watch Accessories', href: '/products?category=wearables&tag=accessories' },
    ],
  },
  {
    label: 'Keyboards & Mice',
    href: '/products?category=keyboards-mice',
    children: [
      { label: 'All Keyboards & Mice', href: '/products?category=keyboards-mice' },
      { label: 'Mechanical Keyboards', href: '/products?category=keyboards-mice&tag=keyboards' },
      { label: 'Precision Mice', href: '/products?category=keyboards-mice&tag=mice' },
      { label: 'Desk Mats & Keycaps', href: '/products?category=keyboards-mice&tag=mats' },
    ],
  },
  { label: 'Desk Setup', href: '/products?category=desk-essentials' },
  { label: 'Sale', href: '/products?sale=true' },
];

interface HeaderProps {
  onSearchOpen?: () => void;
}

export function Header({ onSearchOpen }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { itemCount, openDrawer, isFlying, flyingItemRef } = useCart();
  const { user } = useAuth();
  const { wishlistCount } = useWishlist();
  const pathname = usePathname();
  const cartIconControls = useAnimation();

  const handleLinkClick = useCallback((e: React.MouseEvent, href: string) => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
    window.location.href = href;
  }, []);

  // Animate cart icon on add
  useEffect(() => {
    if (isFlying) {
      cartIconControls.start({
        scale: [1, 1.3, 1],
        transition: { type: 'spring', stiffness: 400, damping: 15, delay: 0.7 },
      });
    }
  }, [isFlying, cartIconControls]);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleDropdown = useCallback((label: string | null) => {
    setActiveDropdown(label);
  }, []);

  return (
    <>
      {/* Flying cart animation */}
      <AnimatePresence>
        {isFlying && flyingItemRef.current && (
          <FlyingCartItem
            startX={flyingItemRef.current.x}
            startY={flyingItemRef.current.y}
            imageUrl={flyingItemRef.current.imageUrl}
          />
        )}
      </AnimatePresence>

      <motion.header
        animate={{
          height: scrolled ? 60 : 80,
          backgroundColor: scrolled ? 'rgba(250, 250, 250, 0.92)' : 'rgba(250, 250, 250, 0)',
          borderBottomColor: scrolled ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0)',
        }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ borderBottomWidth: 1 }}
        className="fixed top-0 left-0 right-0 z-40 backdrop-blur-glass"
      >
        <div className="container-site h-full flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            onClick={() => {
              setActiveDropdown(null);
              setMobileMenuOpen(false);
              window.location.href = '/';
            }}
            className="font-serif text-xl sm:text-2xl font-medium text-foreground tracking-wide hover:opacity-80 transition-opacity cursor-pointer"
          >
            Lumière
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.children && handleDropdown(link.label)}
                onMouseLeave={() => handleDropdown(null)}
              >
                <Link
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className={cn(
                    'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 cursor-pointer',
                    'hover:text-foreground hover:bg-background',
                    pathname === link.href
                      ? 'text-foreground'
                      : 'text-foreground-secondary'
                  )}
                >
                  {link.label}
                  {link.children && <ChevronDown size={13} />}
                </Link>

                {/* Dropdown */}
                <AnimatePresence>
                  {link.children && activeDropdown === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-modal border border-border min-w-[160px] py-1 z-50"
                    >
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          onClick={(e) => handleLinkClick(e, child.href)}
                          className="block px-4 py-2 text-sm text-foreground-secondary hover:text-foreground hover:bg-background transition-colors cursor-pointer"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search */}
            <button
              type="button"
              onClick={onSearchOpen}
              id="header-search-btn"
              aria-label="Open search"
              className="relative z-10 p-2 text-foreground-secondary hover:text-foreground hover:bg-background rounded-lg transition-colors cursor-pointer"
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <Link
              href="/account/wishlist"
              aria-label="Wishlist"
              className="relative z-10 flex p-2 text-foreground-secondary hover:text-foreground hover:bg-background rounded-lg transition-colors cursor-pointer"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center pointer-events-none">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Account */}
            <Link
              href={user ? '/account' : '/account/login'}
              aria-label="Account"
              className="relative z-10 flex p-2 text-foreground-secondary hover:text-foreground hover:bg-background rounded-lg transition-colors cursor-pointer"
            >
              <User size={20} />
            </Link>

            {/* Cart */}
            <button
              type="button"
              onClick={openDrawer}
              id="header-cart-btn"
              aria-label="Open cart"
              className="relative z-10 p-2 text-foreground-secondary hover:text-foreground hover:bg-background rounded-lg transition-colors cursor-pointer"
            >
              <motion.div animate={cartIconControls}>
                <ShoppingBag size={20} />
              </motion.div>
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center pointer-events-none"
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="relative z-10 lg:hidden p-2 text-foreground-secondary hover:text-foreground rounded-lg transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-white flex flex-col pt-20 px-6 pb-8 lg:hidden"
          >
            <nav className="flex flex-col gap-1 flex-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    href={link.href}
                    className="flex items-center py-4 text-xl font-medium text-foreground border-b border-border hover:text-accent transition-colors cursor-pointer"
                    onClick={(e) => handleLinkClick(e, link.href)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="flex gap-4 pt-6">
              <Link
                href={user ? '/account' : '/account/login'}
                className="flex-1 h-12 bg-foreground text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User size={16} />
                {user ? 'My Account' : 'Sign In'}
              </Link>
              <Link
                href="/account/wishlist"
                className="h-12 w-12 border border-border-strong rounded-xl flex items-center justify-center text-foreground-secondary"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart size={18} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Flying cart animation overlay
function FlyingCartItem({
  startX,
  startY,
  imageUrl,
}: {
  startX: number;
  startY: number;
  imageUrl: string;
}) {
  // Get cart icon position (top-right area)
  const endX = typeof window !== 'undefined' ? window.innerWidth - 60 : 1380;
  const endY = 40;

  return (
    <motion.div
      initial={{ x: startX - 32, y: startY - 32, scale: 1, opacity: 1, rotate: 0 }}
      animate={{
        x: endX,
        y: endY,
        scale: 0.15,
        opacity: 0,
        rotate: 12,
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.75,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="fixed z-50 w-16 h-16 rounded-lg overflow-hidden shadow-lg pointer-events-none"
      style={{ top: 0, left: 0 }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-foreground flex items-center justify-center">
          <ShoppingBag size={20} className="text-white" />
        </div>
      )}
    </motion.div>
  );
}
