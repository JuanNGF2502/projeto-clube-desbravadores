'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Award, TrendingUp, Calendar, Star, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AppStatsCard } from '@/components/ui/AppStatsCard';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { getEstatisticasClube, getRankingUnidades, getMembrosPorClasse } from '@/lib/queries';
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

export default function DashboardPage() {
  const clubId = useClubId();
  const { profile } = useAuth();

  const [estatisticas, setEstatisticas] = useState({
    totalMembros: 0,
    membrosAtivos: 0,
    totalUnidades: 0,
    totalClassesConcluidas: 0,
    totalEspecialidades: 0,
  });
  const [ranking, setRanking] = useState<RankingUnidade[]>([]);
  const [membrosPorClasse, setMembrosPorClasse] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!clubId) return;

    const carregarDados = async () => {
      try {
        const [stats, rankingData, classesData] = await Promise.all([
          getEstatisticasClube(clubId),
          getRankingUnidades(clubId),
          getMembrosPorClasse(clubId),
        ]);
        setEstatisticas(stats);
        setRanking(rankingData);
        setMembrosPorClasse(classesData);
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();
  }, [clubId]);

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
      <AppLayout title="Dashboard" subtitle="Visao geral do clube">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Dashboard"
      subtitle="Visao geral do clube"
      actions={
        <button className="p-2 rounded-xl bg-card border border-border hover:bg-primary/10 transition-colors">
          <BellIcon className="w-5 h-5 text-text-primary" />
        </button>
      }
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Welcome Card */}
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

        {/* Stats Grid */}
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
              label="Classes"
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

        {/* Ranking Units */}
        {ranking.length > 0 ? (
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-text-primary">Ranking de Unidades</h3>
              <AppBadge variant="primary" size="sm">
                <TrendingUp className="w-3 h-3" />
                Este mes
              </AppBadge>
            </div>
            <AppCard padding="sm" className="space-y-3">
              {ranking.slice(0, 4).map((unit, index) => (
                <div key={unit.id} className="flex items-center gap-3 py-2">
                  <span className="w-6 text-sm font-bold text-muted">#{index + 1}</span>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${unit.cores?.[0] || '#3B82F6'}20` }}
                  >
                    <Star className="w-5 h-5" style={{ color: unit.cores?.[0] || '#3B82F6' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">{unit.nome}</p>
                    <p className="text-xs text-muted">{unit.totalMembros} membros</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{unit.totalPontos}</p>
                    <p className="text-xs text-muted">pontos</p>
                  </div>
                </div>
              ))}
            </AppCard>
          </motion.div>
        ) : null}

        {/* Classes Progress */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-text-primary">Progresso das Classes</h3>
            <Calendar className="w-5 h-5 text-muted" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {DEFAULT_CLASSES.map((classe) => {
              const count = membrosPorClasse.find(m => m.classeId === classe.id)?.count || 0;
              return (
                <AppCard
                  key={classe.id}
                  padding="sm"
                  className="min-w-[100px] flex-shrink-0 text-center"
                  hover
                >
                  <div
                    className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                    style={{ backgroundColor: `${classe.cor}20` }}
                  >
                    <BookOpen className="w-5 h-5" style={{ color: classe.cor }} />
                  </div>
                  <p className="text-sm font-medium text-text-primary">{classe.nome}</p>
                  <p className="text-xs text-muted">{count} membros</p>
                </AppCard>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}