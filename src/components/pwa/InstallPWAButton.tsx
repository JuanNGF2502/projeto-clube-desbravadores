'use client';

import { Download, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePWA } from '@/hooks/usePWA';
import { AppButton } from '@/components/ui/AppButton';
import { cn } from '@/utils/cn';

interface InstallPWAButtonProps {
  variant?: 'button' | 'icon' | 'fab';
  className?: string;
  label?: string;
}

export function InstallPWAButton({
  variant = 'button',
  className,
  label = 'Instalar App',
}: InstallPWAButtonProps) {
  const { canInstall, install, isStandalone, isInstallable } = usePWA();

  // Don't show if already installed
  if (isStandalone) return null;

  // Don't show if can't install or already dismissed
  if (!canInstall || !isInstallable) return null;

  if (variant === 'icon') {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={install}
        className={cn(
          'w-12 h-12 rounded-full bg-primary flex items-center justify-center',
          'shadow-lg gold-glow',
          className
        )}
        title={label}
      >
        <Download className="w-6 h-6 text-background" />
      </motion.button>
    );
  }

  if (variant === 'fab') {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onClick={install}
        className={cn(
          'fixed bottom-24 right-4 z-50',
          'w-14 h-14 rounded-full bg-primary flex items-center justify-center',
          'shadow-lg gold-glow',
          className
        )}
        title={label}
      >
        <Download className="w-7 h-7 text-background" />
      </motion.button>
    );
  }

  return (
    <AppButton
      onClick={install}
      leftIcon={<Download className="w-4 h-4" />}
      className={className}
    >
      {label}
    </AppButton>
  );
}

export function PWAStatus() {
  const { isOnline, isStandalone, isInstallable } = usePWA();

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2">
      {/* Online/Offline */}
      <div
        className={cn(
          'w-2 h-2 rounded-full',
          isOnline ? 'bg-success' : 'bg-warning'
        )}
        title={isOnline ? 'Online' : 'Offline'}
      />

      {/* Installable */}
      {isInstallable && !isStandalone && (
        <div className="text-xs text-muted">PWA disponível</div>
      )}

      {/* Installed */}
      {isStandalone && (
        <div className="flex items-center gap-1 text-xs text-success">
          <Check className="w-3 h-3" />
          App instalado
        </div>
      )}
    </div>
  );
}
