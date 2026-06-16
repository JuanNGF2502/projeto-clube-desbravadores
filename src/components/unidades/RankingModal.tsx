'use client';

import { useState, useMemo, useEffect } from 'react';
import { Trophy, Medal, Star, Users, Calendar, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppModal } from '@/components/ui/AppModal';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/utils/cn';
import { formatDateBR } from '@/utils/date';
import {
  getRankingMembrosDaUnidade,
  getEstatisticasUnidade,
  getUltimaAvaliacaoDaUnidade,
} from '@/lib/queries/dashboard';

interface RankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  unidadeId: string;
  unidadeNome: string;
  unidadeCores: string[];
  membros: { id: string; nome: string; funcao?: string }[];
}

type TabMode = 'ranking';

interface RankingMembroData {
  id: string;
  nome: string;
  foto?: string;
  totalPontos: number;
  classificacao: 'A' | 'B' | 'C';
  ultimaAvaliacao: string | null;
  posicao: number;
  cargo?: string;
  classe?: string;
}

interface EstatisticasUnidade {
  totalMembros: number;
  mediaPontos: number;
  totalPontos: number;
  ultimaAvaliacao: string | null;
  distribuicaoClassificacao: { A: number; B: number; C: number };
}

export function RankingModal({
  isOpen,
  onClose,
  unidadeId,
  unidadeNome,
  unidadeCores,
  membros,
}: RankingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [rankingData, setRankingData] = useState<RankingMembroData[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasUnidade | null>(null);
  const [ultimaAvaliacao, setUltimaAvaliacao] = useState<string | null>(null);
  const { addToast } = useToast();

  // Carregar dados do ranking quando o modal abre
  useEffect(() => {
    if (!isOpen || !unidadeId) return;

    const carregarDados = async () => {
      try {
        setIsLoading(true);
        const [ranking, stats, ultima] = await Promise.all([
          getRankingMembrosDaUnidade(unidadeId),
          getEstatisticasUnidade(unidadeId),
          getUltimaAvaliacaoDaUnidade(unidadeId),
        ]);
        setRankingData(ranking);
        setEstatisticas(stats);
        setUltimaAvaliacao(ultima);
      } catch (error) {
        console.error('Erro ao carregar ranking:', error);
        addToast({ type: 'error', title: 'Erro', message: 'Falha ao carregar ranking' });
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();
  }, [isOpen, unidadeId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsLoading(false);
    }
  }, [isOpen]);

  // Mock ranking data (para fallback se banco vazio)
  const mockRankingData: RankingMembroData[] = [
      {
        id: '1',
        nome: 'Lucas Silva',
        cargo: 'Capitão',
        totalPontos: 142,
        classificacao: 'A',
        ultimaAvaliacao: '2026-05-11',
        posicao: 1,
      },
      {
        id: '2',
        nome: 'Ana Costa',
        cargo: 'Conselheiro',
        totalPontos: 135,
        classificacao: 'A',
        ultimaAvaliacao: '2026-05-11',
        posicao: 2,
      },
      {
        id: '3',
        nome: 'Pedro Santos',
        cargo: 'Secretário',
        totalPontos: 118,
        classificacao: 'B',
        ultimaAvaliacao: '2026-05-11',
        posicao: 3,
      },
      {
        id: '4',
        nome: 'Maria Oliveira',
        cargo: 'Desbravador',
        totalPontos: 105,
        classificacao: 'B',
        ultimaAvaliacao: '2026-05-11',
        posicao: 4,
      },
      {
        id: '5',
        nome: 'João Ferreira',
        cargo: 'Desbravador',
        totalPontos: 78,
        classificacao: 'C',
        ultimaAvaliacao: '2026-05-11',
        posicao: 5,
      },
    ];

  // Usar dados reais do banco ou mock como fallback
  const dadosExibir = rankingData.length > 0 ? rankingData : mockRankingData;
  const totalUnidade = estatisticas?.totalPontos || dadosExibir.reduce((acc, m) => acc + m.totalPontos, 0);
  const mediaUnidade = estatisticas?.mediaPontos || Math.round(totalUnidade / (dadosExibir.length || 1));

  const getClassificacaoInfo = (nivel: string) => {
    const classificacoes: Record<string, { label: string; cor: string }> = {
      A: { label: 'A', cor: '#22C55E' },
      B: { label: 'B', cor: '#3B82F6' },
      C: { label: 'C', cor: '#F59E0B' },
    };
    return classificacoes[nivel] || classificacoes['C'];
  };

  const getMedalha = (posicao: number) => {
    switch (posicao) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <Star className="w-6 h-6 text-muted" />;
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Ranking da Unidade"
      size="xl"
      scrollable
    >
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-xl bg-card border border-border p-3 text-center">
          <p className="text-[10px] text-muted uppercase tracking-wider font-medium mb-1">Total</p>
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mx-auto text-primary" />
          ) : (
            <p className="text-lg font-bold text-primary leading-none">{totalUnidade}</p>
          )}
          <p className="text-[10px] text-muted mt-0.5">pts</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-3 text-center">
          <p className="text-[10px] text-muted uppercase tracking-wider font-medium mb-1">Média</p>
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mx-auto text-success" />
          ) : (
            <p className="text-lg font-bold text-success leading-none">{mediaUnidade}</p>
          )}
          <p className="text-[10px] text-muted mt-0.5">pts</p>
        </div>
        <div className="rounded-xl bg-card border border-border p-3 text-center">
          <p className="text-[10px] text-muted uppercase tracking-wider font-medium mb-1">Última</p>
          <p className="text-sm font-bold text-text-primary leading-none flex items-center justify-center gap-1">
            <Calendar className="w-3 h-3" />
            {ultimaAvaliacao
              ? formatDateBR(ultimaAvaliacao, { day: '2-digit', month: '2-digit' })
              : '—'}
          </p>
          <p className="text-[10px] text-muted mt-0.5">avaliação</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : dadosExibir.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-muted">Nenhum dado de ranking disponível</p>
            <p className="text-xs text-muted mt-1">Realize avaliações para ver o ranking</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {dadosExibir.map((membro, index) => {
              const classInfo = getClassificacaoInfo(membro.classificacao);
              const isPodium = index < 3;
              return (
                <motion.div
                  key={membro.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AppCard
                    hover
                    padding="sm"
                    className={cn(
                      'flex items-center gap-3 transition-all',
                      isPodium && 'border-l-4',
                      index === 0 && 'border-l-yellow-400 ring-1 ring-yellow-400/30',
                      index === 1 && 'border-l-gray-400',
                      index === 2 && 'border-l-amber-600',
                    )}
                  >
                    {/* Avatar com posição sobreposta */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${unidadeCores[0]}, ${unidadeCores[2] || unidadeCores[0]})`,
                        }}
                      >
                        {membro.foto ? (
                          <img src={membro.foto} alt={membro.nome} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-white font-bold text-lg">
                            {membro.nome.charAt(0)}
                          </span>
                        )}
                      </div>
                      {isPodium ? (
                        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/30">
                          {index === 0 ? (
                            <Trophy className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <Medal className="w-3.5 h-3.5 text-white" />
                          )}
                        </div>
                      ) : (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-muted/30 flex items-center justify-center border-2 border-card">
                          <span className="text-[10px] font-bold text-muted">{index + 1}</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-semibold text-sm text-text-primary leading-tight">
                          {membro.nome}
                        </h4>
                        <AppBadge
                          size="sm"
                          color={classInfo.cor}
                          className="text-white"
                        >
                          {classInfo.label}
                        </AppBadge>
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        {(membro as any).cargo || (membro as any).funcao || 'Desbravador'}
                      </p>
                    </div>

                    {/* Pontos */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-xl font-bold text-text-primary leading-none">{membro.totalPontos}</p>
                      <p className="text-[10px] text-muted mt-0.5">pts</p>
                    </div>
                  </AppCard>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Legenda */}
      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-[10px] text-muted uppercase tracking-wider font-medium mb-2">Classificação</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {['A', 'B', 'C'].map((nivel) => {
            const info = getClassificacaoInfo(nivel);
            return (
              <div key={nivel} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full ring-1 ring-black/10"
                  style={{ backgroundColor: info.cor }}
                />
                <span className="text-xs text-muted">
                  {info.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AppModal>
  );
}
