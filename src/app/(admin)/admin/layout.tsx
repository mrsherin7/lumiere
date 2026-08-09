'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Percent,
  Settings,
  Search,
  Image as ImageIcon,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Categories', href: '/admin/categories', icon: Tag },
  { label: 'Coupons', href: '/admin/coupons', icon: Percent },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Media', href: '/admin/media', icon: ImageIcon },
  { label: 'SEO', href: '/admin/seo', icon: Search },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

function AdminSidebar({ isCollapsed, onClose }: { isCollapsed: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { signOut, profile } = useAuth();
  const router = useRouter();

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleSignOut = async () => {
    await signOut();
    router.push('/admin/login');
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-border">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
            <span className="font-serif text-white text-sm">L</span>
          </div>
          {!isCollapsed && (
            <div>
              <p className="font-semibold text-sm">Lumière</p>
              <p className="text-[10px] text-foreground-muted uppercase tracking-wider">Admin</p>
            </div>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto text-foreground-secondary cursor-pointer lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer',
                active
                  ? 'bg-foreground text-white'
                  : 'text-foreground-secondary hover:text-foreground hover:bg-background'
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
              {!isCollapsed && active && <ChevronRight size={14} className="ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* User + sign out */}
      <div className="border-t border-border p-3 shrink-0">
        {!isCollapsed && profile && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-foreground text-white text-xs font-semibold flex items-center justify-center shrink-0">
              {(profile.full_name ?? profile.email).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{profile.full_name ?? 'Admin'}</p>
              <p className="text-[10px] text-foreground-muted truncate">{profile.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground-secondary hover:text-destructive hover:bg-destructive/5 transition-colors cursor-pointer"
        >
          <LogOut size={18} className="shrink-0" />
          {!isCollapsed && 'Sign Out'}
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage && !isLoading && !isAdmin) {
      router.replace('/admin/login');
    }
  }, [isAdmin, isLoading, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-60 shrink-0 flex-col h-screen sticky top-0">
        <AdminSidebar isCollapsed={false} />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25 }}
              className="fixed left-0 top-0 bottom-0 w-60 z-50 lg:hidden"
            >
              <AdminSidebar isCollapsed={false} onClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <div className="h-14 bg-white border-b border-border flex items-center px-4 gap-3 lg:hidden sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-foreground-secondary hover:text-foreground cursor-pointer"
          >
            <Menu size={20} />
          </button>
          <span className="font-serif font-medium">Lumière Admin</span>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
