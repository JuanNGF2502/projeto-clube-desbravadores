'use client';

import { motion } from 'framer-motion';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-sm"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 rounded-3xl bg-card flex items-center justify-center mx-auto mb-6 gold-glow"
        >
          <WifiOff className="w-12 h-12 text-primary" />
        </motion.div>

        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Sem conexão
        </h1>
        <p className="text-muted mb-8">
          Você está offline. Verifique sua conexão com a internet e tente novamente.
        </p>

        <AppCard padding="md" className="mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm text-text-primary font-medium mb-1">
                Funcionalidades limitadas
              </p>
              <p className="text-xs text-muted">
                Algumas páginas podem não estar disponíveis no modo offline.
                Dados já carregados permanecem acessíveis.
              </p>
            </div>
          </div>
        </AppCard>

        <div className="flex gap-3">
          <AppButton
            variant="secondary"
            onClick={handleGoHome}
            leftIcon={<Home className="w-4 h-4" />}
            className="flex-1"
          >
            Ir para login
          </AppButton>
          <AppButton
            onClick={handleRefresh}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            className="flex-1"
          >
            Tentar novamente
          </AppButton>
        </div>

        <p className="text-xs text-muted mt-8">
          O app será atualizado automaticamente quando a conexão voltar.
        </p>
      </motion.div>
    </div>
  );
}