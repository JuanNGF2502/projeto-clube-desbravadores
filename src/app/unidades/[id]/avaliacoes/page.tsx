'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Save, Loader2, Check, X, Calendar, Trophy, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppSelect, type SelectOption } from '@/components/ui/AppSelect';
import { useToast } from '@/components/ui/Toast';
import { getUnidadeById, getMembrosPorUnidade } from '@/lib/queries';
import { getCriteriosAvaliacao, criarAvaliacoesBatch, getAvaliacoesPorUnidadeData, CriterioAvaliacaoDB } from '@/lib/queries/avaliacoes';

interface Membro {
  id: string;
  nome: string;
  foto?: string;
  membros_cargos?: { cargo_tipo: string; cargo?: { nome: string }; ativo: boolean }[];
  membros_classes_atuais?: { classe_id: string; classe?: { nome: string } }[];
}

interface AvaliacaoMembro {
  membroId: string;
  criterioId: string;
  nivel: 'A' | 'B' | 'C';
  pontos: number;
}

const CLUB_ID = '00000000-0000-0000-0000-000000000001';

interface Params {
  id: string;
}

export default function AvaliacoesPage({ params }: { params: Promise<Params> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [unidade, setUnidade] = useState<any>(null);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [criterios, setCriterios] = useState<CriterioAvaliacaoDB[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Record<string, Record<string, { nivel: 'A' | 'B' | 'C'; pontos: number }>>>({});
  const [dataAvaliacao, setDataAvaliacao] = useState(new Date().toISOString().split('T')[0]);
  const [expandedMembros, setExpandedMembros] = useState<Set<string>>(new Set());
  const [avaliacoesAnteriores, setAvaliacoesAnteriores] = useState<any[]>([]);

  const carregarDados = async () => {
    try {
      setIsLoading(true);

      // Buscar unidade
      const unidadeData = await getUnidadeById(resolvedParams.id);
      if (!unidadeData) {
        addToast({ type: 'error', title: 'Erro', message: 'Unidade não encontrada' });
        router.push('/unidades');
        return;
      }
      setUnidade(unidadeData);

      // Buscar membros
      const membrosData = await getMembrosPorUnidade(resolvedParams.id);
      setMembros(membrosData || []);

      // Buscar critérios
      const criteriosData = await getCriteriosAvaliacao(true);
      setCriterios(criteriosData);

      // Buscar avaliações do dia
      const avaliacoesData = await getAvaliacoesPorUnidadeData(resolvedParams.id, dataAvaliacao);
      setAvaliacoesAnteriores(avaliacoesData);

      // Montar mapa de avaliações existentes
      const avaliacoesMap: Record<string, Record<string, { nivel: 'A' | 'B' | 'C'; pontos: number }>> = {};
      (avaliacoesData || []).forEach((av: any) => {
        if (!avaliacoesMap[av.membro_id]) {
          avaliacoesMap[av.membro_id] = {};
        }
        avaliacoesMap[av.membro_id][av.criterio_id] = {
          nivel: av.nivel,
          pontos: av.pontos,
        };
      });
      setAvaliacoes(avaliacoesMap);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao carregar dados' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [resolvedParams.id, dataAvaliacao]);

  const getPontosPorNivel = (criterio: CriterioAvaliacaoDB, nivel: 'A' | 'B' | 'C'): number => {
    if (nivel === 'A') return criterio.pontos_a;
    if (nivel === 'B') return criterio.pontos_b;
    return criterio.pontos_c;
  };

  const handleNivelChange = (membroId: string, criterioId: string, nivel: 'A' | 'B' | 'C') => {
    const criterio = criterios.find(c => c.id === criterioId);
    if (!criterio) return;

    const pontos = getPontosPorNivel(criterio, nivel);

    setAvaliacoes(prev => {
      const novo = { ...prev };
      if (!novo[membroId]) {
        novo[membroId] = {};
      }
      novo[membroId][criterioId] = { nivel, pontos };
      return novo;
    });
  };

  const calcularTotalMembro = (membroId: string): number => {
    const membroAvaliacoes = avaliacoes[membroId] || {};
    return Object.values(membroAvaliacoes).reduce((sum, av) => sum + av.pontos, 0);
  };

  const calcularTotalGeral = (): number => {
    return membros.reduce((sum, m) => sum + calcularTotalMembro(m.id), 0);
  };

  const handleSalvar = async () => {
    try {
      setIsSaving(true);

      // Montar lista de avaliações para salvar
      const avaliacoesParaSalvar: any[] = [];

      membros.forEach(membro => {
        const membroAvaliacoes = avaliacoes[membro.id] || {};
        Object.entries(membroAvaliacoes).forEach(([criterioId, av]) => {
          avaliacoesParaSalvar.push({
            membro_id: membro.id,
            unidade_id: resolvedParams.id,
            criterio_id: criterioId,
            nivel: av.nivel,
            pontos: av.pontos,
          });
        });
      });

      if (avaliacoesParaSalvar.length === 0) {
        addToast({ type: 'warning', title: 'Atenção', message: 'Nenhuma avaliação preenchida' });
        return;
      }

      await criarAvaliacoesBatch(avaliacoesParaSalvar);

      addToast({
        type: 'success',
        title: 'Sucesso',
        message: `${avaliacoesParaSalvar.length} avaliações salvas`,
      });

      // Recarregar avaliações
      await carregarDados();

    } catch (error) {
      console.error('Erro ao salvar:', error);
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao salvar avaliações' });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleMembroExpand = (membroId: string) => {
    const newExpanded = new Set(expandedMembros);
    if (newExpanded.has(membroId)) {
      newExpanded.delete(membroId);
    } else {
      newExpanded.add(membroId);
    }
    setExpandedMembros(newExpanded);
  };

  const getCargoLabel = (tipo: string | undefined) => {
    if (!tipo) return 'Desbravador';
    const labels: Record<string, string> = {
      CAPITAO: 'Capitão', CONSELHEIRO: 'Conselheiro',
      SECRETARIO: 'Secretário', TESOUREIRO: 'Tesoureiro',
      DIRETOR_CLUBE: 'Diretor(a)', ALMOXARIFE: 'Almoxarife',
    };
    return labels[tipo] || 'Desbravador';
  };

  const getClassificacao = (pontos: number): { label: string; cor: string } => {
    if (pontos >= 120) return { label: 'A', cor: '#22C55E' };
    if (pontos >= 90) return { label: 'B', cor: '#3B82F6' };
    return { label: 'C', cor: '#F59E0B' };
  };

  if (isLoading) {
    return (
      <AppLayout title="Avaliações Semanais" backHref={`/unidades/${resolvedParams.id}`}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const totalGeral = calcularTotalGeral();
  const totalAvaliacoes = Object.values(avaliacoes).reduce((sum, m) => sum + Object.keys(m).length, 0);
  const mediaGeral = membros.length > 0 ? Math.round(totalGeral / membros.length) : 0;

  return (
    <AppLayout
      title="Avaliações Semanais"
      backHref={`/unidades/${resolvedParams.id}`}
      subtitle={unidade?.nome}
      actions={
        <AppButton
          onClick={handleSalvar}
          isLoading={isSaving}
          disabled={totalAvaliacoes === 0}
        >
          <Save className="w-4 h-4 mr-2" />
          Salvar Avaliações
        </AppButton>
      }
    >
      <div className="space-y-4">
        {/* Data da Avaliação */}
        <AppCard>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-text-primary">Data da Avaliação</p>
                <p className="text-xs text-muted">{new Date(dataAvaliacao).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
            </div>
            <input
              type="date"
              value={dataAvaliacao}
              onChange={(e) => setDataAvaliacao(e.target.value)}
              className="p-2 rounded-lg border border-border bg-card text-text-primary text-sm"
            />
          </div>
        </AppCard>

        {/* Estatísticas do Dia */}
        <div className="grid grid-cols-3 gap-3">
          <AppCard className="text-center">
            <Trophy className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-text-primary">{totalGeral}</p>
            <p className="text-xs text-muted">Pontos Totais</p>
          </AppCard>
          <AppCard className="text-center">
            <Users className="w-5 h-5 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-text-primary">{membros.length}</p>
            <p className="text-xs text-muted">Membros</p>
          </AppCard>
          <AppCard className="text-center">
            <Calendar className="w-5 h-5 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-text-primary">{mediaGeral}</p>
            <p className="text-xs text-muted">Média</p>
          </AppCard>
        </div>

        {/* Critérios */}
        <AppCard>
          <h3 className="font-semibold text-text-primary mb-3">Critérios de Avaliação</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {criterios.map(c => (
              <div key={c.id} className="text-xs p-2 rounded bg-surface">
                <p className="font-medium text-text-primary">{c.nome}</p>
                <p className="text-muted">A: {c.pontos_a} | B: {c.pontos_b} | C: {c.pontos_c}</p>
              </div>
            ))}
          </div>
        </AppCard>

        {/* Lista de Membros com Avaliações */}
        <div className="space-y-3">
          <h3 className="font-semibold text-text-primary">Avaliações por Membro</h3>
          {membros.length === 0 ? (
            <AppCard>
              <p className="text-center text-muted py-8">Nenhum membro nesta unidade</p>
            </AppCard>
          ) : (
            membros.map(membro => {
              const isExpanded = expandedMembros.has(membro.id);
              const totalMembro = calcularTotalMembro(membro.id);
              const cargoAtivo = membro.membros_cargos?.find((c: any) => c.ativo);
              const classeAtual = membro.membros_classes_atuais?.[0];

              return (
                <AppCard key={membro.id} className="overflow-hidden">
                  {/* Header do membro */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface/50 transition-colors"
                    onClick={() => toggleMembroExpand(membro.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${unidade?.cores?.[0] || '#3B82F6'}20` }}
                      >
                        {membro.foto ? (
                          <img src={membro.foto} alt={membro.nome} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="font-medium" style={{ color: unidade?.cores?.[0] || '#3B82F6' }}>
                            {membro.nome.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{membro.nome}</p>
                        <p className="text-xs text-muted">
                          {getCargoLabel(cargoAtivo?.cargo_tipo)}
                          {classeAtual?.classe?.nome && ` • ${classeAtual.classe.nome}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-bold text-text-primary">{totalMembro}</p>
                        <p className="text-xs text-muted">pontos</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-muted" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted" />
                      )}
                    </div>
                  </div>

                  {/* Avaliações do membro */}
                  {isExpanded && (
                    <div className="border-t border-border p-4 space-y-3">
                      {criterios.map(criterio => {
                        const avaliacao = avaliacoes[membro.id]?.[criterio.id];
                        const nivel = avaliacao?.nivel || 'C';

                        return (
                          <div key={criterio.id} className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-text-primary">{criterio.nome}</p>
                              <div className="flex gap-2 mt-1">
                                <button
                                  onClick={() => handleNivelChange(membro.id, criterio.id, 'A')}
                                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                    nivel === 'A'
                                      ? 'bg-success text-white'
                                      : 'bg-surface text-muted hover:bg-success/20'
                                  }`}
                                >
                                  A ({criterio.pontos_a})
                                </button>
                                <button
                                  onClick={() => handleNivelChange(membro.id, criterio.id, 'B')}
                                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                    nivel === 'B'
                                      ? 'bg-primary text-white'
                                      : 'bg-surface text-muted hover:bg-primary/20'
                                  }`}
                                >
                                  B ({criterio.pontos_b})
                                </button>
                                <button
                                  onClick={() => handleNivelChange(membro.id, criterio.id, 'C')}
                                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                    nivel === 'C'
                                      ? 'bg-warning text-white'
                                      : 'bg-surface text-muted hover:bg-warning/20'
                                  }`}
                                >
                                  C ({criterio.pontos_c})
                                </button>
                              </div>
                            </div>
                            <div className="text-right w-16">
                              <p className="text-lg font-bold text-text-primary">
                                {avaliacao?.pontos || 0}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </AppCard>
              );
            })
          )}
        </div>

        {/* Avaliações Anteriores */}
        {avaliacoesAnteriores && avaliacoesAnteriores.length > 0 && (
          <AppCard>
            <h3 className="font-semibold text-text-primary mb-3">Avaliações do Dia</h3>
            <p className="text-sm text-muted">
              {avaliacoesAnteriores.length} avaliações registradas para esta data
            </p>
          </AppCard>
        )}
      </div>
    </AppLayout>
  );
}