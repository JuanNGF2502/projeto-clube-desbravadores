'use client';

import { ReactNode } from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { AppCard } from './AppCard';

interface AppStatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  color?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
  className?: string;
}

export function AppStatsCard({
  label,
  value,
  icon: Icon,
  trend,
  color = 'primary',
  className,
}: AppStatsCardProps) {
  const colors = {
    primary: 'text-primary bg-primary/10',
    success: 'text-success bg-success/10',
    danger: 'text-danger bg-danger/10',
    warning: 'text-warning bg-warning/10',
    info: 'text-info bg-info/10',
  };

  const trendColors = {
    positive: 'text-success',
    negative: 'text-danger',
    neutral: 'text-muted',
  };

  const isPositive = trend && trend.value > 0;
  const isNegative = trend && trend.value < 0;

  return (
    <AppCard hover className={cn('group', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm text-muted font-medium">{label}</p>
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-text-primary"
          >
            {value}
          </motion.p>
          {trend && (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'flex items-center gap-1 text-sm font-medium',
                  isPositive && trendColors.positive,
                  isNegative && trendColors.negative,
                  !isPositive && !isNegative && trendColors.neutral
                )}
              >
                {isPositive && <TrendingUp className="w-4 h-4" />}
                {isNegative && <TrendingDown className="w-4 h-4" />}
                {Math.abs(trend.value)}%
              </span>
              {trend.label && (
                <span className="text-xs text-muted">{trend.label}</span>
              )}
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', colors[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </AppCard>
  );
}
