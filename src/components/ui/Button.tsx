'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  shimmer?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-foreground text-white hover:bg-foreground/90 border border-transparent',
  secondary:
    'bg-white text-foreground border border-border-strong hover:bg-background',
  ghost:
    'bg-transparent text-foreground-secondary hover:bg-background hover:text-foreground border border-transparent',
  destructive:
    'bg-destructive text-white hover:bg-destructive/90 border border-transparent',
  outline:
    'bg-transparent text-foreground border border-foreground hover:bg-foreground hover:text-white',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-sm gap-2 rounded-xl',
  xl: 'h-14 px-8 text-base gap-2.5 rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  shimmer = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      transition={{ duration: 0.1 }}
      className={cn(
        'relative inline-flex items-center justify-center font-medium cursor-pointer',
        'transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'overflow-hidden',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {/* Shimmer overlay on hover */}
      {shimmer && !disabled && !isLoading && (
        <span
          className="absolute inset-0 btn-shimmer opacity-0 hover:opacity-100 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {isLoading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span className="ml-2">Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
}
