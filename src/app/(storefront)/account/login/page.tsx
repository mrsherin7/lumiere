'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Lock, User } from 'lucide-react';

type AuthTab = 'signin' | 'signup';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
      <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
      <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
    </svg>
  );
}

function LoginForm() {
  const [tab, setTab] = useState<AuthTab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});

  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { success, error: showError } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/account';

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Minimum 6 characters';
    if (tab === 'signup' && !fullName.trim()) newErrors.fullName = 'Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);

    if (tab === 'signin') {
      const { error: err } = await signIn(email, password);
      if (err) {
        showError('Sign in failed', err.message);
      } else {
        success('Welcome back!');
        router.push(redirect);
      }
    } else {
      const { error: err } = await signUp(email, password, fullName);
      if (err) {
        showError('Sign up failed', err.message);
      } else {
        success('Account created!', 'Please check your email to verify your account.');
      }
    }
    setIsLoading(false);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signInWithGoogle();
    setGoogleLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-2xl font-medium text-foreground">
            Lumière
          </Link>
          <p className="text-foreground-secondary text-sm mt-2">
            {tab === 'signin' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {/* Card */}
        <div className="card p-8">
          {/* Tab switcher */}
          <div className="flex rounded-xl bg-background p-1 mb-6">
            {(['signin', 'signup'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setErrors({}); }}
                className={`flex-1 h-9 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                  tab === t ? 'bg-white shadow-sm text-foreground' : 'text-foreground-secondary hover:text-foreground'
                }`}
              >
                {t === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Google button */}
          <Button
            variant="secondary"
            fullWidth
            isLoading={googleLoading}
            onClick={handleGoogle}
            leftIcon={<GoogleIcon />}
            className="mb-5"
          >
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border-strong" />
            <span className="text-xs text-foreground-muted">or</span>
            <div className="flex-1 h-px bg-border-strong" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {tab === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Input
                    label="Full Name"
                    leftIcon={<User size={15} />}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    error={errors.fullName}
                    autoComplete="name"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Input
              label="Email Address"
              type="email"
              leftIcon={<Mail size={15} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              leftIcon={<Lock size={15} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
            />

            {tab === 'signin' && (
              <div className="text-right">
                <Link href="/account/forgot-password" className="text-xs text-foreground-secondary hover:text-accent transition-colors">
                  Forgot password?
                </Link>
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              shimmer
              isLoading={isLoading}
              className="mt-2"
            >
              {tab === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <p className="text-xs text-foreground-muted text-center mt-5">
            {tab === 'signup' ? (
              <>
                By creating an account you agree to our{' '}
                <Link href="/policies/terms" className="text-foreground hover:text-accent transition-colors">Terms</Link>{' '}
                and{' '}
                <Link href="/policies/privacy" className="text-foreground hover:text-accent transition-colors">Privacy Policy</Link>.
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <button onClick={() => setTab('signup')} className="text-foreground hover:text-accent transition-colors font-medium cursor-pointer">
                  Sign up
                </button>
              </>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><span className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
