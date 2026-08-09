'use client';

import React, { useState, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightElement,
  inputSize = 'md',
  className,
  type,
  value,
  defaultValue,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const id = useId();

  const hasValue = Boolean(value !== undefined ? value : defaultValue);
  const isFloated = isFocused || hasValue || Boolean(props.placeholder);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const heightClass = inputSize === 'sm' ? 'h-12' : inputSize === 'lg' ? 'h-16' : 'h-14';

  return (
    <div className="space-y-1">
      <div className="relative">
        {/* Left icon */}
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-secondary pointer-events-none z-10">
            {leftIcon}
          </div>
        )}

        <input
          id={id}
          type={inputType}
          value={value}
          defaultValue={defaultValue}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={cn(
            'peer w-full bg-white text-foreground rounded-xl border transition-all duration-200',
            'focus:outline-none focus:ring-0',
            heightClass,
            leftIcon ? 'pl-11 pr-4' : 'px-4',
            isPassword || rightElement ? 'pr-12' : '',
            'pt-5 pb-1 text-sm',
            error
              ? 'border-destructive focus:border-destructive'
              : 'border-border-strong focus:border-accent',
            isFocused && !error ? 'shadow-[0_0_0_3px_rgba(37,99,235,0.08)]' : '',
            className
          )}
          placeholder=" "
          {...props}
        />

        {/* Floating label */}
        <motion.label
          htmlFor={id}
          animate={{
            y: isFloated ? -10 : 0,
            scale: isFloated ? 0.78 : 1,
            color: isFocused && !error ? '#2563EB' : error ? '#DC2626' : '#6B6B6B',
          }}
          transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
          style={{ originX: 0 }}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 pointer-events-none text-sm font-normal',
            leftIcon ? 'left-11' : 'left-4'
          )}
        >
          {label}
        </motion.label>

        {/* Right: password toggle or custom element */}
        {isPassword ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground-secondary hover:text-foreground transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        ) : (
          rightElement && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightElement}</div>
          )
        )}
      </div>

      {/* Error / hint */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-1.5 text-xs text-destructive"
          >
            <AlertCircle size={12} />
            {error}
          </motion.p>
        )}
        {!error && hint && (
          <p className="text-xs text-foreground-muted">{hint}</p>
        )}
      </AnimatePresence>
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className, value, defaultValue, ...props }: TextareaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const id = useId();
  const hasValue = Boolean(value !== undefined ? value : defaultValue);
  const isFloated = isFocused || hasValue;

  return (
    <div className="space-y-1">
      <div className="relative">
        <textarea
          id={id}
          value={value}
          defaultValue={defaultValue}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'peer w-full bg-white text-foreground rounded-xl border transition-all duration-200',
            'focus:outline-none focus:ring-0 resize-none',
            'px-4 pt-6 pb-3 text-sm min-h-[120px]',
            error
              ? 'border-destructive'
              : 'border-border-strong focus:border-accent',
            isFocused && !error ? 'shadow-[0_0_0_3px_rgba(37,99,235,0.08)]' : '',
            className
          )}
          placeholder=" "
          {...props}
        />
        <motion.label
          htmlFor={id}
          animate={{
            y: isFloated ? -8 : 0,
            scale: isFloated ? 0.78 : 1,
            color: isFocused && !error ? '#2563EB' : error ? '#DC2626' : '#6B6B6B',
          }}
          transition={{ duration: 0.15 }}
          style={{ originX: 0 }}
          className="absolute top-4 left-4 pointer-events-none text-sm font-normal"
        >
          {label}
        </motion.label>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-1.5 text-xs text-destructive"
          >
            <AlertCircle size={12} />
            {error}
          </motion.p>
        )}
        {!error && hint && <p className="text-xs text-foreground-muted">{hint}</p>}
      </AnimatePresence>
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, hint, options, className, ...props }: SelectProps) {
  const id = useId();
  return (
    <div className="space-y-1">
      <div className="relative">
        <label
          htmlFor={id}
          className="absolute top-2 left-4 text-xs text-foreground-secondary pointer-events-none"
        >
          {label}
        </label>
        <select
          id={id}
          className={cn(
            'w-full bg-white text-foreground rounded-xl border border-border-strong h-14 pt-5 pb-1 px-4 text-sm',
            'focus:outline-none focus:border-accent appearance-none cursor-pointer',
            error ? 'border-destructive' : '',
            className
          )}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-foreground-secondary">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 8L1 3h10L6 8z" />
          </svg>
        </div>
      </div>
      {hint && !error && <p className="text-xs text-foreground-muted">{hint}</p>}
      {error && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
    </div>
  );
}
