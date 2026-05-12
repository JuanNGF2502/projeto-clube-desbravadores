'use client';

import { ReactNode, MouseEventHandler } from 'react';
import { cn } from '@/utils/cn';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost';
type BadgeSize = 'sm' | 'md' | 'lg';

interface AppBadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  dot?: boolean;
  onClick?: MouseEventHandler<HTMLSpanElement>;
  color?: string;
}

export function AppBadge({
  children,
  variant = 'primary',
  size = 'md',
  className,
  dot = false,
  onClick,
  color,
}: AppBadgeProps) {
  const variants = {
    primary: 'bg-primary/20 text-primary border-primary/30',
    secondary: 'bg-card border border-border text-text-secondary',
    success: 'bg-success/20 text-success border-success/30',
    danger: 'bg-danger/20 text-danger border-danger/30',
    warning: 'bg-warning/20 text-warning border-warning/30',
    info: 'bg-info/20 text-info border-info/30',
    ghost: 'bg-transparent text-muted border-transparent',
  };

  const customColor = color ? {
    backgroundColor: `${color}20`,
    color: color,
    borderColor: `${color}30`,
  } : {};

  const sizes = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        'transition-colors duration-200',
        onClick && 'cursor-pointer hover:opacity-80',
        !color && variants[variant],
        sizes[size],
        className
      )}
      style={color ? customColor : undefined}
      onClick={onClick}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            variant === 'primary' && 'bg-primary',
            variant === 'secondary' && 'bg-text-secondary',
            variant === 'success' && 'bg-success',
            variant === 'danger' && 'bg-danger',
            variant === 'warning' && 'bg-warning',
            variant === 'info' && 'bg-info',
            variant === 'ghost' && 'bg-muted'
          )}
        />
      )}
      {children}
    </span>
  );
}
