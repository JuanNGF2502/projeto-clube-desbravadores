'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getPontuacaoOculta, setPontuacaoOculta } from '@/lib/queries/configuracao';
import { useClubId, useAuth } from '@/hooks';

const LS_KEY = 'pontuacao_oculta';

interface PontuacaoContextType {
  oculta: boolean;
  isLoading: boolean;
  exists: boolean;
  toggle: () => void;
}

const PontuacaoContext = createContext<PontuacaoContextType>({
  oculta: false,
  isLoading: true,
  exists: false,
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
  const [exists, setExists] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!clubId) {
      setIsLoading(false);
      return;
    }

    getPontuacaoOculta(clubId).then((res) => {
      if (res.exists) {
        setOculta(res.value);
        salvarLocalStorage(res.value);
        setExists(true);
      }
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, [clubId]);

  const toggle = useCallback(() => {
    if (!isAdmin) return;
    const novoValor = !oculta;
    setOculta(novoValor);
    salvarLocalStorage(novoValor);
    setPontuacaoOculta(clubId, novoValor).then((res) => {
      if (res.exists) setExists(true);
    });
  }, [oculta, isAdmin, clubId]);

  return (
    <PontuacaoContext.Provider value={{ oculta, isLoading, exists, toggle }}>
      {children}
    </PontuacaoContext.Provider>
  );
}

export function usePontuacao() {
  return useContext(PontuacaoContext);
}
