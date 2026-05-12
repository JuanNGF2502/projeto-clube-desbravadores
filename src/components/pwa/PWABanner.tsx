'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Wifi, WifiOff } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { AppButton } from '@/components/ui/AppButton';
import { cn } from '@/utils/cn';

export function PWABanner() {
  const { isOnline, isOffline, isStandalone, canInstall, install, dismissInstall, isInstallable } = usePWA();

  // Don't show if already installed or in standalone mode
  if (isStandalone) return null;

  // Show offline indicator
  if (isOffline) {
    return (
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-warning/90 backdrop-blur-md"
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
        className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border"
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

export function ConnectionIndicator() {
  const { isOnline, isOffline } = usePWA();

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className={cn(
            'fixed bottom-24 right-4 z-50',
            'px-3 py-2 rounded-full',
            'bg-warning/90 backdrop-blur-md',
            'flex items-center gap-2',
            'shadow-lg'
          )}
        >
          <WifiOff className="w-4 h-4 text-background" />
          <span className="text-xs font-medium text-background">Offline</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function PWASplash() {
  const { isOnline } = usePWA();

  if (typeof window === 'undefined') return null;

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center"
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4"
          >
            <WifiOff className="w-8 h-8 text-primary" />
          </motion.div>
          <p className="text-text-primary font-medium">Sem conexão</p>
          <p className="text-sm text-muted mt-1">Verifique sua internet</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
