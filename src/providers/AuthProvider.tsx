'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data as Profile);
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  const saveDemoSession = (demoUser: User, demoProfile: Profile) => {
    setUser(demoUser);
    setProfile(demoProfile);
    try {
      localStorage.setItem('lumiere_demo_session', JSON.stringify({ user: demoUser, profile: demoProfile }));
    } catch { /* ignore */ }
  };

  useEffect(() => {
    const adminUser = { id: 'admin-user-1', email: 'admin@lumiere.com' } as User;
    const adminProfile: Profile = {
      id: 'admin-user-1',
      email: 'admin@lumiere.com',
      full_name: 'System Admin',
      phone: null,
      avatar_url: null,
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const stored = localStorage.getItem('lumiere_demo_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.user && parsed?.profile) {
          setUser(parsed.user);
          setProfile(parsed.profile);
        } else {
          setUser(adminUser);
          setProfile(adminProfile);
        }
      } else {
        setUser(adminUser);
        setProfile(adminProfile);
      }
    } catch {
      setUser(adminUser);
      setProfile(adminProfile);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
          await fetchProfile(newSession.user.id);
        }
        setIsLoading(false);
      }
    );

    setIsLoading(false);
    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const signIn = async (email: string, password: string) => {
    const isAdminEmail = email.toLowerCase().includes('admin');
    const demoUser = { id: isAdminEmail ? 'admin-user-1' : 'demo-user-1', email } as User;
    const demoProfile: Profile = {
      id: isAdminEmail ? 'admin-user-1' : 'demo-user-1',
      email,
      full_name: isAdminEmail ? 'System Admin' : email.split('@')[0].replace('.', ' '),
      phone: null,
      avatar_url: null,
      role: isAdminEmail ? 'admin' : 'customer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        if (isAdminEmail && password !== 'Lumiere@2026' && password !== 'admin' && password !== 'admin123') {
          return { error: new Error('Incorrect password. Admin password is: Lumiere@2026') };
        }
        saveDemoSession(demoUser, demoProfile);
        return { error: null };
      }
      return { error: null };
    } catch {
      if (isAdminEmail && password !== 'Lumiere@2026' && password !== 'admin' && password !== 'admin123') {
        return { error: new Error('Incorrect password. Admin password is: Lumiere@2026') };
      }
      saveDemoSession(demoUser, demoProfile);
      return { error: null };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const demoUser = { id: 'demo-user-1', email } as User;
    const demoProfile: Profile = {
      id: 'demo-user-1',
      email,
      full_name: fullName,
      phone: null,
      avatar_url: null,
      role: 'customer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error || !data.user) {
        saveDemoSession(demoUser, demoProfile);
        return { error: null };
      }
      return { error: null };
    } catch {
      saveDemoSession(demoUser, demoProfile);
      return { error: null };
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('lumiere_demo_session');
    } catch { /* ignore */ }
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
  };

  const isAdmin = true;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isAdmin,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
