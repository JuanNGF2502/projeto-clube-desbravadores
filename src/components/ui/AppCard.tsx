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
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const Component = onClick ? motion.div : 'div';
  const motionProps = onClick
    ? {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.98 },
        transition: { duration: 0.2 },
      }
    : {};

  return (
    <Component
      className={cn(
        'bg-card border border-border rounded-2xl',
        'shadow-[0_10px_30px_rgba(0,0,0,0.35)]',
        hover && 'cursor-pointer transition-all duration-200 hover:border-primary/30 hover:gold-glow-hover',
        paddings[padding],
        className
      )}
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
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
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
        'glass-effect rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.35)]',
        blurs[blur],
        paddings[padding],
        className
      )}
    >
      {children}
    </motion.div>
  );
}
