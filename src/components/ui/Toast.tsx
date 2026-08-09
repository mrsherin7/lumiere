'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  toast: (options: Omit<Toast, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} className="text-success shrink-0" />,
  error: <XCircle size={18} className="text-destructive shrink-0" />,
  warning: <AlertTriangle size={18} className="text-warning shrink-0" />,
  info: <Info size={18} className="text-accent shrink-0" />,
};

const progressColors: Record<ToastType, string> = {
  success: 'bg-success',
  error: 'bg-destructive',
  warning: 'bg-warning',
  info: 'bg-accent',
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const duration = toast.duration ?? 3000;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.96 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative flex items-start gap-3 bg-white rounded-xl shadow-toast border border-border p-4 min-w-[280px] max-w-sm overflow-hidden"
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-foreground-secondary mt-0.5">{toast.description}</p>
        )}
      </div>
      <button
        onClick={onDismiss}
        className="text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
      >
        <X size={14} />
      </button>

      {/* Progress bar */}
      <motion.div
        className={cn('absolute bottom-0 left-0 h-0.5', progressColors[toast.type])}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
      />
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (options: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { ...options, id };
      setToasts((prev) => [...prev.slice(-4), newToast]);
      const duration = options.duration ?? 3000;
      setTimeout(() => dismiss(id), duration + 300);
    },
    [dismiss]
  );

  const success = useCallback(
    (title: string, description?: string) => toast({ type: 'success', title, description }),
    [toast]
  );
  const error = useCallback(
    (title: string, description?: string) => toast({ type: 'error', title, description }),
    [toast]
  );
  const warning = useCallback(
    (title: string, description?: string) => toast({ type: 'warning', title, description }),
    [toast]
  );
  const info = useCallback(
    (title: string, description?: string) => toast({ type: 'info', title, description }),
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, warning, info, dismiss }}>
      {children}
      {/* Toast container */}
      <div
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none"
        aria-live="polite"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem toast={t} onDismiss={() => dismiss(t.id)} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}
