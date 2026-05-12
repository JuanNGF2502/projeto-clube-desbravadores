'use client';

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, useId } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { useState } from 'react';

interface AppInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

interface AppTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const AppInput = forwardRef<HTMLInputElement, AppInputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      size = 'md',
      className,
      type,
      ...props
    },
    ref
  ) => {
    const id = useId();
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const sizes = {
      sm: 'px-3 py-2 text-xs',
      md: 'px-4 py-3 text-sm',
      lg: 'px-5 py-4 text-base',
    };

    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-text-secondary ml-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div
              className={cn(
                'absolute left-4 top-1/2 -translate-y-1/2 text-muted',
                iconSizes[size]
              )}
            >
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            type={inputType}
            className={cn(
              'bg-card border border-border text-text-primary placeholder:text-muted/50',
              'rounded-2xl outline-none transition-all duration-200 w-full',
              'focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:gold-glow-hover',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              leftIcon && 'pl-11',
              (rightIcon || isPassword) && 'pr-11',
              sizes[size],
              error && 'border-danger focus:border-danger/50 focus:ring-danger/20',
              className
            )}
            {...props}
          />
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={cn(
                'absolute right-4 top-1/2 -translate-y-1/2 text-muted',
                'hover:text-primary transition-colors duration-200',
                iconSizes[size]
              )}
            >
              <AnimatePresence mode="wait">
                {showPassword ? (
                  <motion.span
                    key="eye-off"
                    initial={{ opacity: 0, rotateX: -90 }}
                    animate={{ opacity: 1, rotateX: 0 }}
                    exit={{ opacity: 0, rotateX: 90 }}
                  >
                    <EyeOff />
                  </motion.span>
                ) : (
                  <motion.span
                    key="eye"
                    initial={{ opacity: 0, rotateX: -90 }}
                    animate={{ opacity: 1, rotateX: 0 }}
                    exit={{ opacity: 0, rotateX: 90 }}
                  >
                    <Eye />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          ) : (
            rightIcon && (
              <div
                className={cn(
                  'absolute right-4 top-1/2 -translate-y-1/2 text-muted',
                  iconSizes[size]
                )}
              >
                {rightIcon}
              </div>
            )
          )}
        </div>
        <AnimatePresence mode="wait">
          {error && (
            <motion.span
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-danger ml-1"
            >
              {error}
            </motion.span>
          )}
        </AnimatePresence>
        {helperText && !error && (
          <span className="text-xs text-muted ml-1">{helperText}</span>
        )}
      </div>
    );
  }
);

AppInput.displayName = 'AppInput';

const AppTextarea = forwardRef<HTMLTextAreaElement, AppTextareaProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    const id = useId();

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-text-secondary ml-1"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            'bg-card border border-border text-text-primary placeholder:text-muted/50',
            'rounded-2xl px-4 py-3 outline-none transition-all duration-200 w-full',
            'focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:gold-glow-hover',
            'disabled:opacity-50 disabled:cursor-not-allowed resize-none',
            error && 'border-danger focus:border-danger/50 focus:ring-danger/20',
            className
          )}
          {...props}
        />
        <AnimatePresence mode="wait">
          {error && (
            <motion.span
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-danger ml-1"
            >
              {error}
            </motion.span>
          )}
        </AnimatePresence>
        {helperText && !error && (
          <span className="text-xs text-muted ml-1">{helperText}</span>
        )}
      </div>
    );
  }
);

AppTextarea.displayName = 'AppTextarea';

export { AppInput, AppTextarea };
