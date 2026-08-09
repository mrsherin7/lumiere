'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@lumiere.com');
  const [password, setPassword] = useState('Lumiere@2026');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    try {
      const demoUser = { id: 'admin-user-1', email: 'admin@lumiere.com' };
      const demoProfile = {
        id: 'admin-user-1',
        email: 'admin@lumiere.com',
        full_name: 'System Admin',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem('lumiere_demo_session', JSON.stringify({ user: demoUser, profile: demoProfile }));
    } catch { /* ignore */ }

    window.location.href = '/admin';
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const demoUser = { id: 'admin-user-1', email: email.trim() || 'admin@lumiere.com' };
      const demoProfile = {
        id: 'admin-user-1',
        email: email.trim() || 'admin@lumiere.com',
        full_name: 'System Admin',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem('lumiere_demo_session', JSON.stringify({ user: demoUser, profile: demoProfile }));
    } catch { /* ignore */ }

    window.location.href = '/admin';
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-foreground rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="font-serif text-white text-xl">L</span>
          </div>
          <h1 className="font-semibold text-foreground">Admin Sign In</h1>
          <p className="text-sm text-foreground-secondary mt-1">Access the Lumière admin panel</p>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-card p-8 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <div className="p-3 bg-background rounded-xl text-xs text-foreground-secondary space-y-0.5">
              <p className="font-medium text-foreground">Admin Credentials:</p>
              <p>Email: <code className="font-mono bg-white px-1 rounded">admin@lumiere.com</code></p>
              <p>Password: <code className="font-mono bg-white px-1 rounded">Lumiere@2026</code></p>
            </div>
            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              className="mt-2"
            >
              Sign In to Admin
            </Button>
          </form>

          <div className="pt-2 border-t border-border">
            <a
              href="/admin"
              className="block w-full text-center py-2.5 px-4 text-xs font-semibold rounded-xl bg-background border border-border text-foreground hover:bg-white transition-colors"
            >
              Direct Access to Admin Dashboard →
            </a>
          </div>
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-xs text-foreground-secondary hover:text-foreground transition-colors">
            ← Back to storefront
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
