'use client';

import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

interface AppSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function AppSkeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  lines = 1,
}: AppSkeletonProps) {
  const baseClasses = 'bg-card animate-pulse';

  const variants = {
    text: 'rounded-full h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className={cn(baseClasses, variants.text)}
            style={i === lines - 1 ? { width: '70%' } : style}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(baseClasses, variants[variant], className)}
      style={style}
    />
  );
}

interface CardSkeletonProps {
  count?: number;
  className?: string;
}

export function CardSkeleton({ count = 1, className }: CardSkeletonProps) {
  return (
    <div className={cn('grid gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-card border border-border rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center gap-4">
            <AppSkeleton variant="circular" width={48} height={48} />
            <div className="flex-1 space-y-2">
              <AppSkeleton variant="text" width="60%" />
              <AppSkeleton variant="text" width="40%" />
            </div>
          </div>
          <AppSkeleton variant="rectangular" height={60} />
        </motion.div>
      ))}
    </div>
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn('bg-card border border-border rounded-2xl overflow-hidden', className)}>
      <div className="flex gap-4 p-4 border-b border-border">
        {Array.from({ length: columns }).map((_, i) => (
          <AppSkeleton key={i} variant="text" className="flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <motion.div
          key={rowIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: rowIndex * 0.05 }}
          className="flex gap-4 p-4 border-b border-border/50 last:border-0"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <AppSkeleton
              key={colIndex}
              variant="text"
              className="flex-1"
              width={colIndex === 0 ? '80%' : '60%'}
            />
          ))}
        </motion.div>
      ))}
    </div>
  );
}
