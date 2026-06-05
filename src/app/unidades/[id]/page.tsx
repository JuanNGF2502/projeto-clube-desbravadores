'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { Users, Calendar, User, Home, Trophy, ChevronRight, Loader2, ClipboardCheck, Plus, Play, Square, Trash2, Clock } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { UnitHeader, TabsNavigation, ScoreCard, RankingModal } from '@/components/unidades';
import { MembroDetailModal } from '@/components/membros';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppStatsCard } from '@/components/ui/AppStatsCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { useToast } from '@/components/ui/Toast';
import { Usuario } from '@/types';
import { getUnidadeById, getMembrosPorUnidade } from '@/lib/queries';
import { getClasseById } from '@/lib/queries/classes';
import { getEstatisticasUnidade, getAtividadeRecente } from '@/lib/queries/dashboard';
import { DEFAULT_CLASSES } from '@/types';
import { useClubId, useAuth } from '@/hooks';
import { getSessoesPorUnidade, getSessaoAtiva, criarSessao, ativarSessao, deleteSessao, SessaoAvaliacao } from '@/lib/queries/sessoes-avaliacao';

interface Tab {
  id: string;
  label: string;
}

const tabs: Tab[] = [
  { id: 'resumo', label: 'Resumo' },
  { id: 'integrantes', label: 'Integrantes' },
  { id: 'sobre', label: 'Sobre' },
];

interface Params {
  id: string;
}

export default function UnitDetailPage({ params }: { params: Promise<Params> }) {
  const CLUB_ID = useClubId();
  const resolvedParams = use(params);
  const router = useRouter();
  const { addToast } = useToast();
  const { isAdmin, profile } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [unidade, setUnidade] = useState<any>(null);
  const [membros, setMembros] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('resumo');
  const [showRanking, setShowRanking] = useState(false);
  const [selectedMembro, setSelectedMembro] = useState<Usuario | null>(null);
  const [estatisticasUnidade, setEstatisticasUnidade] = useState<any>(null);
  const [atividadesRecentes, setAtividadesRecentes] = useState<any[]>([]);
  // Sessões de avaliação
  const [sessoes, setSessoes] = useState<SessaoAvaliacao[]>([]);
  const [sessaoAtiva, setSessaoAtiva] = useState<SessaoAvaliacao | null>(null);
  const [showSessaoModal, setShowSessaoModal] = useState(false);
  const [novaDataReuniao, setNovaDataReuniao] = useState(new Date().toISOString().split('T')[0]);
  const [criandoSessao, setCriandoSessao] = useState(false);

  const carregarDados = useCallback(async () => {
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

      // Buscar estatísticas da unidade (inclui avaliações)
      const statsData = await getEstatisticasUnidade(resolvedParams.id);
      setEstatisticasUnidade(statsData);

      // Buscar atividades recentes reais
      const atividadesData = await getAtividadeRecente(CLUB_ID, 5);
      setAtividadesRecentes(atividadesData);

      // Buscar sessões de avaliação
      const [sessoesData, ativa] = await Promise.all([
        getSessoesPorUnidade(resolvedParams.id),
        getSessaoAtiva(resolvedParams.id),
      ]);
      setSessoes(sessoesData);
      setSessaoAtiva(ativa);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao carregar dados da unidade' });
    } finally {
      setIsLoading(false);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  if (isLoading) {
    return (
      <AppLayout title="Unidade" backHref="/unidades">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!unidade) {
    return (
      <AppLayout title="Unidade" backHref="/unidades">
        <div className="text-center py-20">
          <p className="text-muted">Unidade não encontrada</p>
        </div>
      </AppLayout>
    );
  }

  // Scores baseados em estatísticas reais (será null inicialmente, depois carrega)
  const scoreItems = estatisticasUnidade ? [
    { id: 'total', icon: Trophy, name: 'Total', score: estatisticasUnidade.totalPontos },
    { id: 'media', icon: Users, name: 'Média', score: estatisticasUnidade.mediaPontos },
    { id: 'membros', icon: User, name: 'Membros', score: estatisticasUnidade.totalMembros },
    { id: 'classA', icon: Calendar, name: 'Class A', score: estatisticasUnidade.distribuicaoClassificacao.A },
    { id: 'classB', icon: Home, name: 'Class B', score: estatisticasUnidade.distribuicaoClassificacao.B },
  ] : [];

  const totalScore = scoreItems.reduce((acc, item) => acc + (item.score || 0), 0);

  // Converter membros do banco para formato da UI
  const membrosFormatados: Usuario[] = membros.map((m) => {
    const classeAtual = m.membros_classes_atuais?.[0];
    const cargoAtivo = m.membros_cargos?.find((c: any) => c.ativo);

    return {
      id: m.id,
      nome: m.nome,
      sexo: m.sexo as 'M' | 'F',
      dataNascimento: new Date(m.data_nascimento),
      telefone: m.telefone,
      email: m.email,
      foto: m.foto,
      ativo: m.ativo,
      clubeId: CLUB_ID,
      dataCadastro: new Date(m.data_cadastro || new Date()),
      classesAtuais: classeAtual ? [{
        classeId: classeAtual.classe_id,
        dataInicio: new Date(classeAtual.data_inicio),
      }] : [],
      classesConcluidas: [],
      cargos: cargoAtivo ? [{
        tipo: cargoAtivo.cargo_tipo,
        dataAtribuicao: new Date(cargoAtivo.data_atribuicao),
        unidadeId: m.unidade_id,
        ativo: cargoAtivo.ativo,
      }] : [],
      unidadeAtualId: m.unidade_id,
      unidadesAnteriores: [],
      especialidadesConcluidas: [],
      transicoes: [],
    };
  });

  const getCargoLabel = (tipo: string | undefined) => {
    if (!tipo) return 'Desbravador';
    const labels: Record<string, string> = {
      CAPITAO: 'Capitão',
      CONSELHEIRO: 'Conselheiro',
      SECRETARIO: 'Secretário',
      TESOUREIRO: 'Tesoureiro',
      DIRETOR_CLUBE: 'Diretor(a)',
      ALMOXARIFE: 'Almoxarife',
      DESBRAVADOR: 'Desbravador',
    };
    return labels[tipo] || 'Desbravador';
  };

  const getClasseNome = (classeId: string | undefined) => {
    if (!classeId) return '';
    const classe = DEFAULT_CLASSES.find(c => c.id === classeId);
    return classe?.nome || '';
  };

  const getClasseCor = (classeId: string | undefined) => {
    if (!classeId) return '#64748B';
    const classe = DEFAULT_CLASSES.find(c => c.id === classeId);
    return classe?.cor || '#64748B';
  };

  const handleCriarSessao = async () => {
    try {
      setCriandoSessao(true);
      await criarSessao(resolvedParams.id, novaDataReuniao);
      addToast({ type: 'success', title: 'Sessão criada', message: `Sessão para ${new Date(novaDataReuniao).toLocaleDateString('pt-BR')}` });
      setShowSessaoModal(false);
      const [sessoesData, ativa] = await Promise.all([
        getSessoesPorUnidade(resolvedParams.id),
        getSessaoAtiva(resolvedParams.id),
      ]);
      setSessoes(sessoesData);
      setSessaoAtiva(ativa);
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao criar sessão' });
    } finally {
      setCriandoSessao(false);
    }
  };

  const handleAtivarSessao = async (sessaoId: string, ativo: boolean) => {
    try {
      await ativarSessao(sessaoId, ativo);
      addToast({ type: 'success', title: ativo ? 'Sessão ativada' : 'Sessão desativada', message: '' });
      const [sessoesData, ativa] = await Promise.all([
        getSessoesPorUnidade(resolvedParams.id),
        getSessaoAtiva(resolvedParams.id),
      ]);
      setSessoes(sessoesData);
      setSessaoAtiva(ativa);
    } catch (error) {
      console.error('Erro ao alternar sessão:', error);
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao alternar sessão' });
    }
  };

  const handleDeleteSessao = async (sessao: SessaoAvaliacao) => {
    if (!confirm(`Excluir sessão de ${new Date(sessao.data_reuniao).toLocaleDateString('pt-BR')}?`)) return;
    try {
      await deleteSessao(sessao.id);
      addToast({ type: 'success', title: 'Sessão excluída', message: '' });
      const [sessoesData, ativa] = await Promise.all([
        getSessoesPorUnidade(resolvedParams.id),
        getSessaoAtiva(resolvedParams.id),
      ]);
      setSessoes(sessoesData);
      setSessaoAtiva(ativa);
    } catch (error) {
      console.error('Erro ao excluir sessão:', error);
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao excluir sessão' });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'resumo':
        return (
          <motion.div
            key="resumo"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <AppStatsCard
                label="Membros"
                value={membros.length}
                icon={Users}
                color="primary"
              />
              <AppStatsCard
                label="Presença média"
                value={`${Math.floor(totalScore / 5)}%`}
                icon={Calendar}
                color="success"
              />
            </div>

            <ScoreCard items={scoreItems} total={totalScore} />

            {/* Sessão Ativa - para LIDER */}
            {!isAdmin && sessaoAtiva && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-success/10 border border-success/30 flex items-center gap-3"
              >
                <div className="p-2 rounded-lg bg-success/20">
                  <ClipboardCheck className="w-5 h-5 text-success" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-success">Avaliação disponível!</p>
                  <p className="text-xs text-muted">
                    Reunião de {new Date(sessaoAtiva.data_reuniao).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
                <AppButton
                  variant="primary"
                  size="sm"
                  onClick={() => router.push(`/unidades/${unidade.id}/avaliacoes?sessao=${sessaoAtiva.id}`)}
                >
                  <ClipboardCheck className="w-4 h-4 mr-1" />
                  Avaliar
                </AppButton>
              </motion.div>
            )}

            {/* Gerenciamento de Sessões - ADMIN */}
            {isAdmin && (
              <AppCard padding="sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Sessões de Avaliação
                  </h3>
                  <AppButton variant="primary" size="sm" onClick={() => setShowSessaoModal(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Nova
                  </AppButton>
                </div>

                {sessoes.length === 0 ? (
                  <p className="text-sm text-muted text-center py-3">Nenhuma sessão criada</p>
                ) : (
                  <div className="space-y-2">
                    {sessoes.map(sessao => (
                      <div
                        key={sessao.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-border bg-card"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${sessao.ativo ? 'bg-success' : 'bg-muted'}`} />
                          <span className="text-sm text-text-primary font-medium">
                            {new Date(sessao.data_reuniao).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </span>
                          <AppBadge
                            variant={sessao.ativo ? 'success' : 'secondary'}
                            size="sm"
                          >
                            {sessao.ativo ? 'Ativa' : 'Inativa'}
                          </AppBadge>
                        </div>
                        <div className="flex items-center gap-1">
                          {sessao.ativo ? (
                            <AppButton variant="ghost" size="sm" onClick={() => handleAtivarSessao(sessao.id, false)} title="Desativar">
                              <Square className="w-4 h-4 text-warning" />
                            </AppButton>
                          ) : (
                            <AppButton variant="ghost" size="sm" onClick={() => handleAtivarSessao(sessao.id, true)} title="Ativar">
                              <Play className="w-4 h-4 text-success" />
                            </AppButton>
                          )}
                          <AppButton variant="ghost" size="sm" onClick={() => handleDeleteSessao(sessao)} title="Excluir">
                            <Trash2 className="w-4 h-4 text-danger" />
                          </AppButton>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AppCard>
            )}

            <AppCard padding="sm">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Últimas Atividades</h3>
              <div className="space-y-2">
                {atividadesRecentes.length === 0 ? (
                  <p className="text-sm text-muted text-center py-4">Nenhuma atividade recente</p>
                ) : (
                  atividadesRecentes.slice(0, 5).map((atv) => (
                    <div key={atv.id} className="flex items-center justify-between py-2">
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-text-primary">{atv.descricao}</span>
                        <p className="text-xs text-muted">{atv.membro_nome}</p>
                      </div>
                      <span className="text-xs text-muted ml-2">
                        {new Date(atv.data).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </AppCard>
          </motion.div>
        );

      case 'integrantes':
        return (
          <motion.div
            key="integrantes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {membrosFormatados.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted mx-auto mb-3" />
                <p className="text-muted">Nenhum membro nesta unidade</p>
              </div>
            ) : (
              membrosFormatados.map((member) => {
                const cargo = member.cargos?.[0];
                const classe = member.classesAtuais?.[0];
                return (
                  <AppCard
                    key={member.id}
                    hover
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => setSelectedMembro(member)}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${unidade.cores?.[0] || '#3B82F6'}, ${unidade.cores?.[2] || '#1E3A8A'})`
                      }}
                    >
                      {member.foto ? (
                        <img src={member.foto} alt={member.nome} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-white font-bold">{member.nome.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-text-primary">{member.nome}</h4>
                        <AppBadge
                          variant={member.ativo ? 'success' : 'secondary'}
                          size="sm"
                          dot
                        >
                          {member.ativo ? 'Ativo' : 'Inativo'}
                        </AppBadge>
                      </div>
                      <p className="text-sm text-muted">
                        {getCargoLabel(cargo?.tipo)}
                        {classe?.classeId && (
                          <span className="ml-2" style={{ color: getClasseCor(classe.classeId) }}>
                            • {getClasseNome(classe.classeId)}
                          </span>
                        )}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted flex-shrink-0" />
                  </AppCard>
                );
              })
            )}
          </motion.div>
        );

      case 'sobre':
        return (
          <motion.div
            key="sobre"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Significado do Logo */}
            {unidade.significado_logo && (
              <AppCard>
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-text-primary">Significado do Logo</h3>
                </div>
                <p className="text-sm text-muted leading-relaxed">{unidade.significado_logo}</p>
              </AppCard>
            )}

            {/* História do Nome */}
            {unidade.historia_nome && (
              <AppCard>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-text-primary">História do Nome</h3>
                </div>
                <p className="text-sm text-muted leading-relaxed">{unidade.historia_nome}</p>
              </AppCard>
            )}

            {/* Informações da Unidade */}
            <AppCard>
              <h3 className="text-sm font-semibold text-text-primary mb-3">Informações da Unidade</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted">Nome</span>
                  <span className="text-sm text-text-primary font-medium">{unidade.nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted">Gênero</span>
                  <span className="text-sm text-text-primary font-medium">
                    {unidade.genero === 'M' ? 'Masculina' : 'Feminina'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Cores</span>
                  <div className="flex items-center gap-1">
                    {(unidade.cores || []).map((color: string, i: number) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-lg"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted">Membros</span>
                  <span className="text-sm text-text-primary font-medium">{membros.length}</span>
                </div>
                {unidade.grito_de_guerra && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted">Grito de Guerra</span>
                    <span className="text-sm text-text-primary font-medium italic">"{unidade.grito_de_guerra}"</span>
                  </div>
                )}
              </div>
            </AppCard>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <AppLayout
      title="Unidade"
      backHref="/unidades"
    >
      <div className="space-y-4">
        <UnitHeader
          name={unidade.nome}
          cores={unidade.cores || ['#3B82F6', '#1E40AF', '#1E3A8A']}
          gender={unidade.genero}
          gritoDeGuerra={unidade.grito_de_guerra}
        />

        {/* Ranking Button */}
        <div className="grid grid-cols-2 gap-3">
          <AppButton
            variant="primary"
            onClick={() => setShowRanking(true)}
          >
            <Trophy className="w-5 h-5 mr-2" />
            Ranking
          </AppButton>
          <AppButton
            variant="secondary"
            onClick={() => router.push(`/unidades/${unidade.id}/avaliacoes${sessaoAtiva ? `?sessao=${sessaoAtiva.id}` : ''}`)}
          >
            <ClipboardCheck className="w-5 h-5 mr-2" />
            Avaliações
          </AppButton>
        </div>

        <TabsNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>

      <RankingModal
        isOpen={showRanking}
        onClose={() => setShowRanking(false)}
        unidadeId={unidade.id}
        unidadeNome={unidade.nome}
        unidadeCores={unidade.cores || ['#3B82F6']}
        membros={membrosFormatados}
      />

      <MembroDetailModal
        isOpen={!!selectedMembro}
        onClose={() => setSelectedMembro(null)}
        onUpdate={carregarDados}
        membro={selectedMembro}
        unidadeCores={unidade.cores || ['#3B82F6']}
      />

      {/* Nova Sessão Modal */}
      <AppModal
        isOpen={showSessaoModal}
        onClose={() => setShowSessaoModal(false)}
        title="Nova Sessão de Avaliação"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Data da Reunião</label>
            <input
              type="date"
              value={novaDataReuniao}
              onChange={(e) => setNovaDataReuniao(e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-card text-text-primary"
            />
          </div>
          <div className="flex gap-3">
            <AppButton variant="secondary" onClick={() => setShowSessaoModal(false)} className="flex-1">
              Cancelar
            </AppButton>
            <AppButton onClick={handleCriarSessao} isLoading={criandoSessao} className="flex-1">
              <Plus className="w-4 h-4 mr-1" />
              Criar
            </AppButton>
          </div>
        </div>
      </AppModal>
    </AppLayout>
  );
}