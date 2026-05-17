'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface SyncResult {
  success: boolean;
  synced?: any;
  data?: any;
  error?: string;
}

interface UseSyncOptions {
  clubId: string;
  onSyncComplete?: (result: SyncResult) => void;
}

export function useSync({ clubId, onSyncComplete }: UseSyncOptions) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Salvar último sync no localStorage
  const saveLastSync = useCallback(() => {
    const now = new Date().toISOString();
    localStorage.setItem(`sync_${clubId}`, now);
    setLastSync(now);
  }, [clubId]);

  // Carregar último sync do localStorage
  const loadLastSync = useCallback(() => {
    const saved = localStorage.getItem(`sync_${clubId}`);
    if (saved) {
      setLastSync(saved);
    }
  }, [clubId]);

  // Sincronizar dados
  const syncData = useCallback(async (changes?: any): Promise<SyncResult> => {
    try {
      setIsSyncing(true);
      setSyncError(null);

      const lastSyncTime = lastSync || undefined;

      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clubId,
          lastSync: lastSyncTime,
          changes,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro na sincronização');
      }

      saveLastSync();

      if (onSyncComplete) {
        onSyncComplete(result);
      }

      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Erro desconhecido';
      setSyncError(errorMessage);

      if (onSyncComplete) {
        onSyncComplete({ success: false, error: errorMessage });
      }

      return { success: false, error: errorMessage };
    } finally {
      setIsSyncing(false);
    }
  }, [clubId, lastSync, saveLastSync, onSyncComplete]);

  // Sincronizar apenas avaliações (offline)
  const syncAvaliacoesOffline = useCallback(async (avaliacoes: any[]) => {
    return syncData({ avaliacoes });
  }, [syncData]);

  // Sincronizar apenas membros (offline)
  const syncMembrosOffline = useCallback(async (membros: any[]) => {
    return syncData({ membros });
  }, [syncData]);

  // Forçar download de dados do servidor
  const pullFromServer = useCallback(async (): Promise<SyncResult> => {
    try {
      setIsSyncing(true);
      setSyncError(null);

      const url = `/api/sync?clubId=${clubId}${lastSync ? `&lastSync=${lastSync}` : ''}`;
      const response = await fetch(url);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro ao baixar dados');
      }

      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Erro desconhecido';
      setSyncError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSyncing(false);
    }
  }, [clubId, lastSync]);

  // Inicializar - carregar último sync
  const initSync = useCallback(() => {
    loadLastSync();
  }, [loadLastSync]);

  return {
    isSyncing,
    lastSync,
    syncError,
    syncData,
    syncAvaliacoesOffline,
    syncMembrosOffline,
    pullFromServer,
    initSync,
  };
}

// Hook para verificar se há dados pendentes para sincronizar
export function usePendingSync(clubId: string) {
  const [hasPendingData, setHasPendingData] = useState(false);

  const checkPendingData = useCallback(() => {
    // Verificar localStorage por dados offline pendentes
    const pendingKey = `pending_sync_${clubId}`;
    const pending = localStorage.getItem(pendingKey);

    if (pending) {
      try {
        const data = JSON.parse(pending);
        setHasPendingData(data.length > 0);
      } catch {
        setHasPendingData(false);
      }
    } else {
      setHasPendingData(false);
    }
  }, [clubId]);

  // Salvar dados para sincronizar depois
  const savePendingData = useCallback((data: any[]) => {
    const pendingKey = `pending_sync_${clubId}`;
    const existing = localStorage.getItem(pendingKey);
    const existingData = existing ? JSON.parse(existing) : [];

    const newData = [...existingData, ...data];
    localStorage.setItem(pendingKey, JSON.stringify(newData));
    setHasPendingData(true);
  }, [clubId]);

  // Limpar dados pendentes (após sincronizar)
  const clearPendingData = useCallback(() => {
    const pendingKey = `pending_sync_${clubId}`;
    localStorage.removeItem(pendingKey);
    setHasPendingData(false);
  }, [clubId]);

  return {
    hasPendingData,
    checkPendingData,
    savePendingData,
    clearPendingData,
  };
}