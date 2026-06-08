'use client';

import { ReactNode, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { AppButton } from './AppButton';

interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string | ReactNode;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
  scrollable?: boolean;
}

export function AppModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
  scrollable = false,
}: AppModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnOverlayClick ? onClose : undefined}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className={cn(
              'relative w-full bg-card border border-border',
              'rounded-t-2xl sm:rounded-2xl',
              'shadow-[0_-10px_40px_rgba(0,0,0,0.3)]',
              'max-h-[90vh] flex flex-col',
              sizes[size],
              className
            )}
            style={{ borderBottom: 'none' }}
          >
            {/* Mobile drag handle */}
            <div className="flex justify-center pt-2 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--border-color)' }} />
            </div>

            {(title || showCloseButton) && (
              <div className="flex items-start justify-between px-5 pt-4 pb-0">
                <div className="flex-1 min-w-0">
                  {title && (
                    <h2 className="text-lg font-bold text-text-primary">{title}</h2>
                  )}
                  {description && (
                    <p className="mt-0.5 text-xs text-muted">{description}</p>
                  )}
                </div>
                {showCloseButton && (
                  <AppButton
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="!p-1.5 -mr-1.5 -mt-1.5 flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </AppButton>
                )}
              </div>
            )}
            <div className={cn(
              'flex-1 overflow-y-auto px-5 pb-5',
              (title || showCloseButton) ? 'pt-4' : 'pt-5',
              scrollable && 'max-h-[calc(90vh-80px)]'
            )}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
