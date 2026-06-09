'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { Users, User, Home, Trophy, ChevronRight, Loader2, Clock, ShieldCheck, BookOpen, Heart, ClipboardCheck, Sparkles } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { UnitHeader, TabsNavigation, ScoreCard, RankingModal } from '@/components/unidades';
import { MembroDetailModal } from '@/components/membros';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppStatsCard } from '@/components/ui/AppStatsCard';
import { AppButton } from '@/components/ui/AppButton';
import { useToast } from '@/components/ui/Toast';
import { Usuario } from '@/types';
import { getUnidadeById, getMembrosPorUnidade } from '@/lib/queries';
import { getClasseById } from '@/lib/queries/classes';
import { getEstatisticasUnidade, getAtividadeRecente, CriterioSoma } from '@/lib/queries/dashboard';
import { DEFAULT_CLASSES } from '@/types';
import { useClubId, useAuth } from '@/hooks';
import { getSessaoAtiva } from '@/lib/queries/sessoes-avaliacao';

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
  const [sessaoAtiva, setSessaoAtiva] = useState<any>(null);

  const carregarDados = useCallback(async () => {
    try {
      setIsLoading(true);

      const unidadeData = await getUnidadeById(resolvedParams.id);
      if (!unidadeData) {
        addToast({ type: 'error', title: 'Erro', message: 'Unidade não encontrada' });
        router.push('/unidades');
        return;
      }
      setUnidade(unidadeData);

      const membrosData = await getMembrosPorUnidade(resolvedParams.id);
      setMembros(membrosData || []);

      const statsData = await getEstatisticasUnidade(resolvedParams.id);
      setEstatisticasUnidade(statsData);

      const atividadesData = await getAtividadeRecente(CLUB_ID, 5);
      setAtividadesRecentes(atividadesData);

      const ativa = await getSessaoAtiva(resolvedParams.id);
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

  const criteriaIcons: Record<string, any> = {
    'Pontualidade': Clock,
    'Uniforme': ShieldCheck,
    'Material': BookOpen,
    'Disciplina': ShieldCheck,
    'Leitura Bíblica': BookOpen,
    'Classe': Trophy,
    'Boa Ação': Heart,
  };

  interface ScoreItemType { id: string; icon: any; name: string; score: number; maxScore: number; }
  const scoreItems: ScoreItemType[] = (estatisticasUnidade?.criterios || []).map((c: CriterioSoma) => ({
    id: c.criterioId,
    icon: criteriaIcons[c.nome] || Trophy,
    name: c.nome,
    score: c.totalPontos,
    maxScore: c.maxPontos * (estatisticasUnidade.totalMembros || 1),
  }));

  const totalScore = scoreItems.reduce((acc: number, item: ScoreItemType) => acc + (item.score || 0), 0);

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
                label="Total Pontos"
                value={totalScore}
                icon={Trophy}
                color="success"
              />
            </div>

            <ScoreCard items={scoreItems} total={totalScore} />

            
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
            {unidade.significado_logo && (
              <AppCard>
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-text-primary">Significado do Logo</h3>
                </div>
                <p className="text-sm text-muted leading-relaxed">{unidade.significado_logo}</p>
              </AppCard>
            )}

            {unidade.historia_nome && (
              <AppCard>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-text-primary">História do Nome</h3>
                </div>
                <p className="text-sm text-muted leading-relaxed">{unidade.historia_nome}</p>
              </AppCard>
            )}

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

        <div className="grid grid-cols-2 gap-3">
          <AppButton
            variant="primary"
            onClick={() => setShowRanking(true)}
          >
            <Trophy className="w-5 h-5 mr-2" />
            Ranking
          </AppButton>
          <div className="relative">
            <AppButton
              variant={sessaoAtiva ? 'primary' : 'secondary'}
              onClick={() => router.push(`/unidades/${unidade.id}/avaliacoes`)}
              className="w-full"
            >
              <ClipboardCheck className="w-5 h-5 mr-2" />
              Avaliar
            </AppButton>
            {sessaoAtiva && (
              <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-success animate-pulse ring-2 ring-card" />
            )}
          </div>
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
    </AppLayout>
  );
}
