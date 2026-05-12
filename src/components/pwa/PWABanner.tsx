'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, WifiOff } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { AppButton } from '@/components/ui/AppButton';
import { cn } from '@/utils/cn';

export function PWABanner() {
  const { isOffline, isStandalone, canInstall, install, dismissInstall, isInstallable } = usePWA();

  // Don't show if already installed or in standalone mode
  if (isStandalone) return null;

  // Show offline indicator
  if (isOffline) {
    return (
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-warning/90 backdrop-blur-md safe-area-top"
      >
        <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4 text-background" />
          <span className="text-sm font-medium text-background">
            Você está offline. Algumas funcionalidades podem estar limitadas.
          </span>
        </div>
      </motion.div>
    );
  }

  // Show install banner
  if (canInstall && isInstallable) {
    return (
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border safe-area-top"
      >
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary">Instalar App</p>
            <p className="text-xs text-muted">Adicione à tela inicial para usar offline</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={dismissInstall}
              className="p-2 text-muted hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <AppButton size="sm" onClick={install}>
              Instalar
            </AppButton>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}

// ConnectionIndicator and PWASplash removed - not used
