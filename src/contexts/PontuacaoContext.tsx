'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getPontuacaoOculta, setPontuacaoOculta } from '@/lib/queries/configuracao';
import { useClubId, useAuth } from '@/hooks';

const LS_KEY = 'pontuacao_oculta';

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

function lerLocalStorage(): boolean {
  try {
    return localStorage.getItem(LS_KEY) === 'true';
  } catch {
    return false;
  }
}

function salvarLocalStorage(valor: boolean) {
  try {
    localStorage.setItem(LS_KEY, String(valor));
  } catch {}
}

export function PontuacaoProvider({ children }: { children: ReactNode }) {
  const clubId = useClubId();
  const { isAdmin } = useAuth();
  const [oculta, setOculta] = useState(lerLocalStorage);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!clubId) return;
    getPontuacaoOculta(clubId).then((val) => {
      if (val) {
        setOculta(true);
        salvarLocalStorage(true);
      }
    }).catch(() => {});
  }, [clubId]);

  const toggle = useCallback(() => {
    if (!isAdmin) return;
    const novoValor = !oculta;
    setOculta(novoValor);
    salvarLocalStorage(novoValor);
    setPontuacaoOculta(clubId, novoValor).catch(() => {});
  }, [oculta, isAdmin, clubId]);

  return (
    <PontuacaoContext.Provider value={{ oculta, isLoading, toggle }}>
      {children}
    </PontuacaoContext.Provider>
  );
}

export function usePontuacao() {
  return useContext(PontuacaoContext);
}
