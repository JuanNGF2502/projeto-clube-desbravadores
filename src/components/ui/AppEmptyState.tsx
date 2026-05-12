'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';
import { cn } from '@/utils/cn';
import { AppButton } from './AppButton';

interface AppEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function AppEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: AppEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-4',
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className={cn(
          'p-4 mb-4 rounded-full',
          'bg-card border border-border',
          'shadow-[0_10px_30px_rgba(0,0,0,0.35)]'
        )}
      >
        {icon || <Inbox className="w-8 h-8 text-muted" />}
      </motion.div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted max-w-sm mb-4">{description}</p>
      )}
      {action && (
        <AppButton onClick={action.onClick} size="sm">
          {action.label}
        </AppButton>
      )}
    </motion.div>
  );
}
