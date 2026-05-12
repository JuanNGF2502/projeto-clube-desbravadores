'use client';

import { useState, useMemo } from 'react';
import { Trophy, Medal, Star, Users, Calendar, Check, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppModal } from '@/components/ui/AppModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { cn } from '@/utils/cn';
import {
  CRITERIOS_AVALIACAO,
  CLASSIFICACOES,
  RankingMembro,
  PontuacaoNivel,
  calcularClassificacao,
  calcularTotalPontos,
} from '@/types';

interface RankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  unidadeId: string;
  unidadeNome: string;
  unidadeCores: string[];
  membros: { id: string; nome: string; funcao?: string }[];
}

type TabMode = 'ranking' | 'avaliar';

export function RankingModal({
  isOpen,
  onClose,
  unidadeId,
  unidadeNome,
  unidadeCores,
  membros,
}: RankingModalProps) {
  const [activeTab, setActiveTab] = useState<TabMode>('ranking');
  const [selectedMembro, setSelectedMembro] = useState<string | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Record<string, Record<string, PontuacaoNivel>>>({});
  const [showResults, setShowResults] = useState(false);

  // Mock ranking data
  const rankingData: RankingMembro[] = useMemo(() => {
    return [
      {
        id: '1',
        nome: 'Lucas Silva',
        funcao: 'Capitão',
        totalPontos: 142,
        classificacao: 'A',
        ultimaAvaliacao: new Date('2026-05-11'),
        historico: [
          { data: new Date('2026-05-11'), pontos: 142, classificacao: 'A' },
          { data: new Date('2026-05-04'), pontos: 138, classificacao: 'A' },
          { data: new Date('2026-04-27'), pontos: 130, classificacao: 'A' },
        ],
      },
      {
        id: '2',
        nome: 'Ana Costa',
        funcao: 'Conselheiro',
        totalPontos: 135,
        classificacao: 'A',
        ultimaAvaliacao: new Date('2026-05-11'),
        historico: [
          { data: new Date('2026-05-11'), pontos: 135, classificacao: 'A' },
          { data: new Date('2026-05-04'), pontos: 140, classificacao: 'A' },
          { data: new Date('2026-04-27'), pontos: 128, classificacao: 'A' },
        ],
      },
      {
        id: '3',
        nome: 'Pedro Santos',
        funcao: 'Secretário',
        totalPontos: 118,
        classificacao: 'B',
        ultimaAvaliacao: new Date('2026-05-11'),
        historico: [
          { data: new Date('2026-05-11'), pontos: 118, classificacao: 'B' },
          { data: new Date('2026-05-04'), pontos: 125, classificacao: 'A' },
          { data: new Date('2026-04-27'), pontos: 110, classificacao: 'B' },
        ],
      },
      {
        id: '4',
        nome: 'Maria Oliveira',
        funcao: 'Membro',
        totalPontos: 105,
        classificacao: 'B',
        ultimaAvaliacao: new Date('2026-05-11'),
        historico: [
          { data: new Date('2026-05-11'), pontos: 105, classificacao: 'B' },
          { data: new Date('2026-05-04'), pontos: 95, classificacao: 'B' },
          { data: new Date('2026-04-27'), pontos: 88, classificacao: 'C' },
        ],
      },
      {
        id: '5',
        nome: 'João Ferreira',
        funcao: 'Membro',
        totalPontos: 78,
        classificacao: 'C',
        ultimaAvaliacao: new Date('2026-05-11'),
        historico: [
          { data: new Date('2026-05-11'), pontos: 78, classificacao: 'C' },
          { data: new Date('2026-05-04'), pontos: 65, classificacao: 'C' },
          { data: new Date('2026-04-27'), pontos: 72, classificacao: 'C' },
        ],
      },
    ];
  }, []);

  const totalUnidade = rankingData.reduce((acc, m) => acc + m.totalPontos, 0);
  const mediaUnidade = Math.round(totalUnidade / rankingData.length);

  const handleAvaliar = (membroId: string, criterioId: string, nivel: PontuacaoNivel) => {
    setAvaliacoes((prev) => {
      const newAvaliacao = { ...(prev[membroId] || {}) };
      newAvaliacao[criterioId] = nivel;

      // Se pontualidade for 0 (ausente), zera todos os outros critérios
      if (criterioId === 'pontualidade' && nivel === 'C') {
        CRITERIOS_AVALIACAO.forEach((c) => {
          if (c.id !== 'pontualidade') {
            newAvaliacao[c.id] = 'C';
          }
        });
      }

      // Se pontualidade não for maisausente, limpa os zeros forcados
      if (criterioId === 'pontualidade' && nivel !== 'C') {
        CRITERIOS_AVALIACAO.forEach((c) => {
          if (c.id !== 'pontualidade' && prev[membroId]?.[c.id] === 'C') {
            delete newAvaliacao[c.id];
          }
        });
      }

      return {
        ...prev,
        [membroId]: newAvaliacao,
      };
    });
  };

  const isMembroAusente = (membroId: string) => {
    return avaliacoes[membroId]?.pontualidade === 'C';
  };

  const getPontosMembro = (membroId: string) => {
    const avaliacao = avaliacoes[membroId];
    if (!avaliacao) return 0;

    let total = 0;
    CRITERIOS_AVALIACAO.forEach((criterio) => {
      const nivel = avaliacao[criterio.id];
      if (nivel) {
        const opcao = criterio.opcoes.find((o) => o.opcao === nivel);
        if (opcao) total += opcao.pontos;
      }
    });
    return total;
  };

  const todosAvaliados = membros.every((m) => {
    // Se membro está ausente, só precisa avaliar pontualidade
    if (isMembroAusente(m.id)) {
      return !!avaliacoes[m.id]?.pontualidade;
    }
    return CRITERIOS_AVALIACAO.every((c) => avaliacoes[m.id]?.[c.id]);
  });

  const handleSalvarAvaliacoes = () => {
    // In production: save to Supabase
    console.log('Salvando avaliações:', avaliacoes);
    setShowResults(true);
  };

  const getClassificacaoInfo = (nivel: PontuacaoNivel) => {
    return CLASSIFICACOES.find((c) => c.nivel === nivel) || CLASSIFICACOES[2];
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
      <div className="grid grid-cols-3 gap-3 mb-4">
        <AppCard padding="sm" className="text-center">
          <p className="text-xs text-muted mb-1">Total da Unidade</p>
          <p className="text-xl font-bold text-primary">{totalUnidade}</p>
        </AppCard>
        <AppCard padding="sm" className="text-center">
          <p className="text-xs text-muted mb-1">Média</p>
          <p className="text-xl font-bold text-success">{mediaUnidade}</p>
        </AppCard>
        <AppCard padding="sm" className="text-center">
          <p className="text-xs text-muted mb-1">Última Avaliação</p>
          <p className="text-sm font-bold text-text-primary flex items-center justify-center gap-1">
            <Calendar className="w-3 h-3" />
            11/05
          </p>
        </AppCard>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <AppButton
          variant={activeTab === 'ranking' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveTab('ranking')}
          className="flex-1"
        >
          <Trophy className="w-4 h-4 mr-2" />
          Ranking
        </AppButton>
        <AppButton
          variant={activeTab === 'avaliar' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveTab('avaliar')}
          className="flex-1"
        >
          <Check className="w-4 h-4 mr-2" />
          Avaliar
        </AppButton>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
        <AnimatePresence mode="wait">
          {activeTab === 'ranking' ? (
            <motion.div
              key="ranking"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3"
            >
              {rankingData.map((membro, index) => {
                const classInfo = getClassificacaoInfo(membro.classificacao);
                return (
                  <motion.div
                    key={membro.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <AppCard
                      hover
                      className={cn(
                        'flex items-center gap-3 transition-all',
                        index === 0 && 'ring-2 ring-yellow-400/50'
                      )}
                    >
                      {/* Posição */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/20">
                        {getMedalha(index + 1)}
                      </div>

                      {/* Avatar */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${unidadeCores[0]}, ${unidadeCores[2]})`,
                        }}
                      >
                        <span className="text-white font-bold text-sm">
                          {membro.nome.charAt(0)}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-text-primary truncate">
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
                        <p className="text-xs text-muted">{membro.funcao}</p>
                      </div>

                      {/* Pontos */}
                      <div className="text-right">
                        <p className="text-xl font-bold text-text-primary">{membro.totalPontos}</p>
                        <p className="text-xs text-muted">pontos</p>
                      </div>
                    </AppCard>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : showResults ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="text-center p-6 bg-success/10 rounded-xl">
                <Check className="w-12 h-12 text-success mx-auto mb-2" />
                <h3 className="text-lg font-bold text-text-primary">Avaliação Salva!</h3>
                <p className="text-sm text-muted">As avaliações foram registradas com sucesso.</p>
              </div>

              {membros.map((membro) => {
                const pontos = getPontosMembro(membro.id);
                const classInfo = getClassificacaoInfo(calcularClassificacao(pontos));
                return (
                  <AppCard key={membro.id}>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${unidadeCores[0]}, ${unidadeCores[2]})`,
                        }}
                      >
                        <span className="text-white font-bold">{membro.nome.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-text-primary">{membro.nome}</h4>
                        <AppBadge
                          size="sm"
                          color={classInfo.cor}
                          className="text-white mt-1"
                        >
                          {classInfo.label} ({pontos} pts)
                        </AppBadge>
                      </div>
                    </div>
                  </AppCard>
                );
              })}

              <AppButton variant="primary" className="w-full" onClick={onClose}>
                Fechar
              </AppButton>
            </motion.div>
          ) : (
            <motion.div
              key="avaliar"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              {/* Seletor de membro */}
              {!selectedMembro ? (
                <>
                  <p className="text-sm text-muted text-center mb-3">
                    Selecione um desbravador para avaliar
                  </p>
                  {membros.map((membro) => (
                    <AppCard
                      key={membro.id}
                      hover
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => setSelectedMembro(membro.id)}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${unidadeCores[0]}, ${unidadeCores[2]})`,
                        }}
                      >
                        <span className="text-white font-bold">{membro.nome.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-text-primary">{membro.nome}</h4>
                        <p className="text-xs text-muted">{membro.funcao}</p>
                      </div>
                      <AppButton variant="secondary" size="sm">
                        Avaliar
                      </AppButton>
                    </AppCard>
                  ))}
                </>
              ) : (
                <>
                  <AppButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMembro(null)}
                    className="mb-2"
                  >
                    ← Voltar
                  </AppButton>

                  <div className="flex items-center gap-3 mb-4 p-3 bg-muted/20 rounded-xl">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${unidadeCores[0]}, ${unidadeCores[2]})`,
                      }}
                    >
                      <span className="text-white font-bold">
                        {membros.find((m) => m.id === selectedMembro)?.nome.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-text-primary">
                        {membros.find((m) => m.id === selectedMembro)?.nome}
                      </h4>
                      <p className="text-xs text-muted">
                        Pontuação atual: {getPontosMembro(selectedMembro)} pts
                      </p>
                    </div>
                  </div>

                  {CRITERIOS_AVALIACAO.map((criterio) => {
                    const isBlocked = criterio.id !== 'pontualidade' && isMembroAusente(selectedMembro);
                    return (
                      <AppCard key={criterio.id} padding="sm" className={isBlocked ? 'opacity-50' : ''}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-text-primary">{criterio.nome}</h4>
                          {isBlocked && (
                            <AppBadge variant="danger" size="sm">
                              Ausente
                            </AppBadge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {criterio.opcoes.map((opcao) => (
                            <button
                              key={opcao.opcao}
                              onClick={() => !isBlocked && handleAvaliar(selectedMembro, criterio.id, opcao.opcao)}
                              disabled={isBlocked}
                              className={cn(
                                'flex-1 p-2 rounded-lg border-2 text-center transition-all text-xs',
                                avaliacoes[selectedMembro]?.[criterio.id] === opcao.opcao
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-border hover:border-primary/50',
                                isBlocked && 'cursor-not-allowed opacity-50'
                              )}
                            >
                              <span className="font-bold">{opcao.pontos}pts</span>
                              <p className="mt-1 text-muted line-clamp-2">{opcao.descricao}</p>
                            </button>
                          ))}
                        </div>
                      </AppCard>
                    );
                  })}

                  {/* Preview da pontuação */}
                  <AppCard className="bg-primary/10 border-primary/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted">Pontuação Estimada</p>
                        <p className="text-2xl font-bold text-primary">
                          {getPontosMembro(selectedMembro)} pts
                        </p>
                      </div>
                      <div className="text-right">
                        {getPontosMembro(selectedMembro) > 0 && (
                          <>
                            <p className="text-sm text-muted">Classificação</p>
                            <AppBadge
                              size="sm"
                              color={
                                getClassificacaoInfo(calcularClassificacao(getPontosMembro(selectedMembro))).cor
                              }
                              className="text-white"
                            >
                              {getClassificacaoInfo(calcularClassificacao(getPontosMembro(selectedMembro))).label}
                            </AppBadge>
                          </>
                        )}
                      </div>
                    </div>
                  </AppCard>

                  <AppButton
                    variant="primary"
                    className="w-full"
                    disabled={!avaliacoes[selectedMembro]}
                    onClick={() => setSelectedMembro(null)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Salvar e Voltar
                  </AppButton>
                </>
              )}

              {selectedMembro === null && membros.length > 0 && !showResults && (
                <AppButton
                  variant="primary"
                  className="w-full mt-4"
                  disabled={!todosAvaliados}
                  onClick={handleSalvarAvaliacoes}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Finalizar Avaliação da Semana
                </AppButton>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legenda */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted mb-2">Classificação:</p>
        <div className="flex gap-3">
          {CLASSIFICACOES.map((c) => (
            <div key={c.nivel} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: c.cor }}
              />
              <span className="text-xs text-muted">
                {c.label} ({c.min}-{c.max})
              </span>
            </div>
          ))}
        </div>
      </div>
    </AppModal>
  );
}
