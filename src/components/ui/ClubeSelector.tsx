'use client';

import { useState, useEffect } from 'react';
import { Building2, ChevronDown, Loader2 } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { supabase } from '@/lib/supabase/client';

interface ClubeData {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
}

export function ClubeSelector() {
  const { ClubeAtual, setClubeAtual } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [clubes, setClubes] = useState<ClubeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    carregarClubes();
  }, []);

  const carregarClubes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('clubes')
        .select('id, nome, cidade, estado')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setClubes(data || []);

      if (!ClubeAtual && data && data.length > 0) {
        setClubeAtual(data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar clubes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectClube = (clubeItem: ClubeData) => {
    setClubeAtual(clubeItem);
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-surface">
        <Loader2 className="w-4 h-4 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors hover:bg-surface"
        style={{ backgroundColor: 'var(--card-color)', border: '1px solid var(--border-color)' }}
      >
        <Building2 className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-text-primary max-w-[120px] truncate">
          {ClubeAtual?.nome || 'Selecionar'}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            className="absolute top-full left-0 mt-2 w-64 rounded-xl shadow-lg z-50 overflow-hidden"
            style={{ backgroundColor: 'var(--card-color)', border: '1px solid var(--border-color)' }}
          >
            <div className="p-2 border-b border-border">
              <p className="text-xs font-medium text-muted px-2">Selecionar Clube</p>
            </div>
            <div className="max-h-60 overflow-y-auto p-1">
              {clubes.length === 0 ? (
                <p className="text-sm text-muted text-center py-4">Nenhum clube encontrado</p>
              ) : (
                clubes.map((clubeItem) => (
                  <button
                    key={clubeItem.id}
                    onClick={() => handleSelectClube(clubeItem)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      ClubeAtual?.id === clubeItem.id
                        ? 'bg-primary/20 text-primary'
                        : 'hover:bg-surface text-text-primary'
                    }`}
                  >
                    <p className="text-sm font-medium">{clubeItem.nome}</p>
                    <p className="text-xs text-muted">{clubeItem.cidade} - {clubeItem.estado}</p>
                  </button>
                ))
              )}
            </div>
            <div className="p-2 border-t border-border">
              <a
                href="/clubes"
                className="block text-center text-xs text-primary hover:underline py-1"
                onClick={() => setIsOpen(false)}
              >
                Gerenciar Clubes
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}