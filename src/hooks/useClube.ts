import { useEffect } from 'react';
import { useAppStore } from '@/stores/appStore';

export function useClube() {
  const { ClubeAtual, initClubePadrao } = useAppStore();

  useEffect(() => {
    if (!ClubeAtual) {
      initClubePadrao();
    }
  }, [ClubeAtual, initClubePadrao]);

  // Retorna o ID do club atual ou null se não disponível
  const clubId = ClubeAtual?.id || null;

  return {
    clubId,
    clubName: ClubeAtual?.nome || 'Clube',
    clubCidade: ClubeAtual?.cidade || '',
    clubEstado: ClubeAtual?.estado || '',
    isLoading: !ClubeAtual,
  };
}

// Hook para obter apenas o ID (para uso em queries)
export function useClubId(): string {
  const { ClubeAtual, initClubePadrao } = useAppStore();

  useEffect(() => {
    if (!ClubeAtual) {
      initClubePadrao();
    }
  }, [ClubeAtual, initClubePadrao]);

  return ClubeAtual?.id || '00000000-0000-0000-0000-000000000001';
}