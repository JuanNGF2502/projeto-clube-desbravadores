'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface AppCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

export function AppCard({
  children,
  className,
  padding = 'md',
  hover = false,
  onClick,
}: AppCardProps) {
  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };

  const Component = onClick ? motion.div : 'div';
  const motionProps = onClick
    ? {
        whileTap: { scale: 0.98 },
        transition: { duration: 0.15 },
      }
    : {};

  return (
    <Component
      className={cn(
        'rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.2)]',
        paddings[padding],
        className
      )}
      style={{
        backgroundColor: 'var(--card-color)',
        border: '1px solid var(--border-color)',
      }}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </Component>
  );
}

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  blur?: 'sm' | 'md' | 'lg';
}

export function GlassCard({
  children,
  className,
  padding = 'md',
  blur = 'md',
}: GlassCardProps) {
  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };

  const blurs = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.2)]',
        blurs[blur],
        paddings[padding],
        className
      )}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--glass-border)',
      }}
    >
      {children}
    </motion.div>
  );
}