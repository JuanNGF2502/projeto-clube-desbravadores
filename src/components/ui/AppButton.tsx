'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const variants = {
      primary: `
        bg-primary text-background font-semibold
        hover:bg-primary-light active:bg-primary-dark
        gold-glow-hover
      `,
      secondary: `
        bg-card text-text-primary font-medium
        hover:bg-surface border border-border
      `,
      ghost: `
        bg-transparent text-text-secondary font-medium
        hover:text-primary hover:bg-primary/5
      `,
      danger: `
        bg-danger text-white font-semibold
        hover:bg-danger/90 active:bg-danger/80
      `,
      success: `
        bg-success text-white font-semibold
        hover:bg-success/90 active:bg-success/80
      `,
      outline: `
        bg-transparent border border-primary text-primary font-medium
        hover:bg-primary/10 active:bg-primary/15
      `,
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-5 py-2.5 text-sm gap-2',
      lg: 'px-8 py-3 text-base gap-2.5',
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        whileTap={{ scale: 0.98 }}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'rounded-2xl font-medium transition-all duration-200',
          'flex items-center justify-center',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        onClick={props.onClick}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : leftIcon ? (
          <span className="flex-shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {!isLoading && rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </motion.button>
    );
  }
);

AppButton.displayName = 'AppButton';

export { AppButton };
