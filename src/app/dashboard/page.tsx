'use client';

import { motion } from 'framer-motion';
import { Users, BookOpen, Award, TrendingUp, Calendar, Star } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AppStatsCard } from '@/components/ui/AppStatsCard';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { DEFAULT_CLASSES } from '@/types';

export default function DashboardPage() {
  const stats = [
    { label: 'Total Membros', value: 48, icon: Users, trend: { value: 12, label: 'este mês' } },
    { label: 'Unidades', value: 6, icon: Star, trend: { value: 2, label: 'novas' } },
    { label: 'Classes', value: 24, icon: BookOpen, trend: { value: 8, label: 'concluídas' } },
    { label: 'Especialidades', value: 156, icon: Award, trend: { value: 15, label: 'este trimestre' } },
  ];

  const recentActivity = [
    { id: '1', user: 'Ana Silva', action: 'concluiu classe', target: 'Companheiro', time: 'há 2h' },
    { id: '2', user: 'Pedro Santos', action: 'completou especialidade', target: 'Primeiros Socorros', time: 'há 4h' },
    { id: '3', user: 'Maria Oliveira', action: 'entrou na unidade', target: 'Desbravadores Norte', time: 'há 1 dia' },
  ];

  const rankingUnits = [
    { name: 'Lobos', members: 12, points: 850, color: '#3B82F6' },
    { name: 'Águias', members: 10, points: 780, color: '#C6A15B' },
    { name: 'Falcões', members: 11, points: 720, color: '#EF4444' },
    { name: 'Tigres', members: 8, points: 650, color: '#22C55E' },
  ];

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

  return (
    <AppLayout
      title="Dashboard"
      subtitle="Visão geral do clube"
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
              <h2 className="text-2xl font-bold text-text-primary mb-1">Conselheiro</h2>
              <p className="text-sm text-muted">Continue o excelente trabalho!</p>
            </div>
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
          </AppCard>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, index) => (
              <AppStatsCard
                key={index}
                label={stat.label}
                value={stat.value}
                icon={stat.icon}
                trend={stat.trend}
                color={index === 0 ? 'primary' : index === 1 ? 'success' : index === 2 ? 'info' : 'warning'}
              />
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-text-primary">Atividade Recente</h3>
            <AppBadge variant="ghost" size="sm">
              Ver todas
            </AppBadge>
          </div>
          <AppCard padding="sm" className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-text-primary">
                      <span className="font-medium">{activity.user}</span>{' '}
                      <span className="text-muted">{activity.action}</span>
                    </p>
                    <p className="text-xs text-primary">{activity.target}</p>
                  </div>
                </div>
                <span className="text-xs text-muted">{activity.time}</span>
              </div>
            ))}
          </AppCard>
        </motion.div>

        {/* Ranking Units */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-text-primary">Ranking de Unidades</h3>
            <AppBadge variant="primary" size="sm">
              <TrendingUp className="w-3 h-3" />
              Este mês
            </AppBadge>
          </div>
          <AppCard padding="sm" className="space-y-3">
            {rankingUnits.map((unit, index) => (
              <div key={unit.name} className="flex items-center gap-3 py-2">
                <span className="w-6 text-sm font-bold text-muted">#{index + 1}</span>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${unit.color}20` }}
                >
                  <Star className="w-5 h-5" style={{ color: unit.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{unit.name}</p>
                  <p className="text-xs text-muted">{unit.members} membros</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{unit.points}</p>
                  <p className="text-xs text-muted">pontos</p>
                </div>
              </div>
            ))}
          </AppCard>
        </motion.div>

        {/* Classes Progress */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-text-primary">Progresso das Classes</h3>
            <Calendar className="w-5 h-5 text-muted" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {DEFAULT_CLASSES.map((classe) => (
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
                <p className="text-xs text-muted">{Math.floor(Math.random() * 10) + 1} conclusões</p>
              </AppCard>
            ))}
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
