'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getPontuacaoOculta, setPontuacaoOculta } from '@/lib/queries/configuracao';
import { useClubId, useAuth } from '@/hooks';

interface PontuacaoContextType {
  oculta: boolean;
  isLoading: boolean;
  toggle: () => void;
}

const PontuacaoContext = createContext<PontuacaoContextType>({
  oculta: false,
  isLoading: true,
  toggle: () => {},
});

export function PontuacaoProvider({ children }: { children: ReactNode }) {
  const clubId = useClubId();
  const { isAdmin } = useAuth();
  const [oculta, setOculta] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!clubId) {
      setIsLoading(false);
      return;
    }

    getPontuacaoOculta(clubId)
      .then((val) => setOculta(val))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [clubId]);

  const toggle = useCallback(() => {
    if (!clubId || !isAdmin) return;
    const novoValor = !oculta;
    setOculta(novoValor);
    setPontuacaoOculta(clubId, novoValor).catch(() => {});
  }, [clubId, oculta, isAdmin]);

  return (
    <PontuacaoContext.Provider value={{ oculta, isLoading, toggle }}>
      {children}
    </PontuacaoContext.Provider>
  );
}

export function usePontuacao() {
  return useContext(PontuacaoContext);
}
