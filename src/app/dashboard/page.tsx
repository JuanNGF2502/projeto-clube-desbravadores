'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Award, TrendingUp, Calendar, Star, Activity, ArrowUpRight, ArrowDownLeft, RefreshCw, GraduationCap, BadgeCheck, LogIn, LogOut } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AppStatsCard } from '@/components/ui/AppStatsCard';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppModal } from '@/components/ui/AppModal';
import { getEstatisticasClube, getRankingUnidades, getMembrosPorClasse, getAtividadeRecente } from '@/lib/queries';
import { getMembrosComProgresso } from '@/lib/queries/classes';
import { usePontuacao } from '@/contexts/PontuacaoContext';
import { formatDateBR } from '@/utils/date';
import { DEFAULT_CLASSES } from '@/types';
import { useClubId, useAuth } from '@/hooks';

interface RankingUnidade {
  id: string;
  nome: string;
  cores: string[];
  totalMembros: number;
  totalPontos: number;
  posicao: number;
}

interface MembroClasse {
  membroId: string;
  membroNome: string;
  membroUnidade: string;
  progressPercentage: number;
  completedCount: number;
  totalCount: number;
}

function getTimelineIcon(tipo: string, className: string) {
  switch (tipo) {
    case 'ENTRADA': return <LogIn className={className} />;
    case 'SAIDA': return <LogOut className={className} />;
    case 'TROCA_UNIDADE': return <RefreshCw className={className} />;
    case 'TROCA_CARGO': return <BadgeCheck className={className} />;
    case 'CONCLUIU_CLASSE':
    case 'INICIO_CLASSE': return <GraduationCap className={className} />;
    case 'PROMOCAO': return <ArrowUpRight className={className} />;
    case 'RECLASSIFICACAO': return <ArrowDownLeft className={className} />;
    default: return <Activity className={className} />;
  }
}

function getTimelineColor(tipo: string) {
  switch (tipo) {
    case 'ENTRADA': case 'CONCLUIU_CLASSE': case 'PROMOCAO': return 'text-success';
    case 'SAIDA': return 'text-danger';
    case 'TROCA_UNIDADE': case 'RECLASSIFICACAO': return 'text-warning';
    case 'TROCA_CARGO': return 'text-primary';
    case 'INICIO_CLASSE': return 'text-info';
    default: return 'text-muted';
  }
}

export default function DashboardPage() {
  const clubId = useClubId();
  const { profile } = useAuth();
  const { oculta } = usePontuacao();
  const [estatisticas, setEstatisticas] = useState({
    totalMembros: 0,
    membrosAtivos: 0,
    totalUnidades: 0,
    totalClassesConcluidas: 0,
    totalEspecialidades: 0,
  });
  const [ranking, setRanking] = useState<RankingUnidade[]>([]);
  const [membrosPorClasse, setMembrosPorClasse] = useState<any[]>([]);
  const [atividades, setAtividades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [classeModal, setClasseModal] = useState<{ id: string; nome: string; cor: string } | null>(null);
  const [membrosDaClasse, setMembrosDaClasse] = useState<MembroClasse[]>([]);
  const [loadingMembros, setLoadingMembros] = useState(false);

  useEffect(() => {
    if (!clubId) return;

    const carregarDados = async () => {
      try {
        const [stats, rankingData, classesData, atividadesData] = await Promise.all([
          getEstatisticasClube(clubId),
          getRankingUnidades(clubId),
          getMembrosPorClasse(clubId),
          getAtividadeRecente(clubId, 5),
        ]);
        setEstatisticas(stats);
        setRanking(rankingData);
        setMembrosPorClasse(classesData);
        setAtividades(atividadesData);
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();
  }, [clubId]);

  const abrirClasse = async (classeId: string, classeNome: string, classeCor: string) => {
    setClasseModal({ id: classeId, nome: classeNome, cor: classeCor });
    setLoadingMembros(true);
    setMembrosDaClasse([]);
    try {
      const data = await getMembrosComProgresso(clubId, classeId);
      setMembrosDaClasse(data);
    } catch (err) {
      console.error('Erro ao carregar membros da classe:', err);
    } finally {
      setLoadingMembros(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <AppLayout title="Dashboard" subtitle="Visão geral do clube">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Dashboard"
      subtitle="Visão geral do clube"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <AppCard className="relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-sm text-muted mb-1">Bem-vindo de volta,</p>
              <h2 className="text-2xl font-bold text-text-primary mb-1">{profile?.nome || 'Conselheiro'}</h2>
              <p className="text-sm text-muted">Continue o excelente trabalho!</p>
            </div>
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
          </AppCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 gap-3">
            <AppStatsCard
              label="Total Membros"
              value={estatisticas.totalMembros}
              icon={Users}
              trend={{ value: estatisticas.membrosAtivos, label: 'ativos' }}
              color="primary"
            />
            <AppStatsCard
              label="Unidades"
              value={estatisticas.totalUnidades}
              icon={Star}
              color="success"
            />
            <AppStatsCard
              label="Classes Concluídas"
              value={estatisticas.totalClassesConcluidas}
              icon={BookOpen}
              color="info"
            />
            <AppStatsCard
              label="Especialidades"
              value={estatisticas.totalEspecialidades}
              icon={Award}
              color="warning"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          {ranking.length > 0 && (
            <motion.div variants={itemVariants} className="col-span-2">
              <div className="rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.2)] p-3 h-full" style={{ backgroundColor: 'var(--card-color)', border: '1px solid var(--border-color)' }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text-primary">Top Unidades</h3>
                  <span className="inline-flex items-center font-medium rounded-full border transition-colors duration-200 bg-primary/20 text-primary border-primary/30 px-2 py-0.5 text-xs gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Mês
                  </span>
                </div>
                <div className="space-y-2">
                  {ranking.slice(0, 3).map((unit, index) => (
                    <div key={unit.id} className="flex items-center gap-2 py-1">
                      <span className="w-5 text-xs font-bold text-muted">#{index + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-text-primary truncate">{unit.nome}</p>
                      </div>
                      <span className="text-xs font-bold text-primary">{oculta ? '—' : unit.totalPontos}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {atividades.length > 0 && (
            <motion.div variants={itemVariants} className="col-span-1">
              <AppCard padding="sm" className="h-full">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-text-primary">Atividades</h3>
                </div>
                <div className="space-y-2">
                  {atividades.slice(0, 3).map((ativ: any) => (
                    <div key={ativ.id} className="flex items-start gap-2">
                      <div className={getTimelineColor(ativ.tipo)}>
                        {getTimelineIcon(ativ.tipo, 'w-3 h-3 mt-0.5')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-primary truncate">
                          <span className="font-medium">{ativ.membro_nome}</span>
                          {' '}{ativ.descricao}
                        </p>
                        <p className="text-[10px] text-muted">
                          {formatDateBR(ativ.data)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </AppCard>
            </motion.div>
          )}
        </div>

        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-text-primary">Progresso das Classes</h3>
            <Calendar className="w-5 h-5 text-muted" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {DEFAULT_CLASSES.map((classe) => {
              const count = membrosPorClasse.find(m => m.classeId === classe.id)?.count || 0;
              return (
                <AppCard
                  key={classe.id}
                  padding="sm"
                  className="text-center cursor-pointer hover:brightness-110 transition-all"
                  hover
                  onClick={() => abrirClasse(classe.id, classe.nome, classe.cor)}
                >
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                    style={{ backgroundColor: `${classe.cor}20` }}
                  >
                    <BookOpen className="w-6 h-6" style={{ color: classe.cor }} />
                  </div>
                  <p className="text-sm font-medium text-text-primary">{classe.nome}</p>
                  <p className="text-xs text-muted">{count} membro{count !== 1 ? 's' : ''}</p>
                </AppCard>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      <AppModal
        isOpen={!!classeModal}
        onClose={() => setClasseModal(null)}
        title={classeModal?.nome || 'Classe'}
        size="md"
      >
        {loadingMembros ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : membrosDaClasse.length > 0 ? (
          <div className="space-y-3">
            {membrosDaClasse.map((m) => (
              <div key={m.membroId} className="p-3 rounded-xl bg-card/50">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: '#6B7280' }}
                  >
                    {m.membroNome.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{m.membroNome}</p>
                    {m.membroUnidade && (
                      <p className="text-xs text-muted truncate">{m.membroUnidade}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold" style={{ color: 'rgb(139, 92, 246)' }}>{m.progressPercentage}%</p>
                    <p className="text-xs text-muted">{m.completedCount}/{m.totalCount} req</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-sm text-muted">
            Nenhum membro nesta classe
          </div>
        )}
      </AppModal>
    </AppLayout>
  );
}
