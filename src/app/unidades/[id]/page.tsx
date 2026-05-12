'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Calendar, User, Home, Image, Info, Mic } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { UnitHeader, TabsNavigation, ScoreCard } from '@/components/unidades';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppStatsCard } from '@/components/ui/AppStatsCard';
import { cn } from '@/utils/cn';

interface Tab {
  id: string;
  label: string;
}

const tabs: Tab[] = [
  { id: 'resumo', label: 'Resumo' },
  { id: 'integrantes', label: 'Integrantes' },
  { id: 'sobre', label: 'Sobre' },
];

const scoreItems = [
  { id: 'presenca', icon: Users, name: 'Presença', score: 90 },
  { id: 'uniforme', icon: User, name: 'Uniforme', score: 80 },
  { id: 'biblia', icon: Calendar, name: 'Bíblia', score: 70 },
  { id: 'pontualidade', icon: Calendar, name: 'Pontualidade', score: 50 },
  { id: 'atividades', icon: Home, name: 'Atividades', score: 30 },
];

const totalScore = scoreItems.reduce((acc, item) => acc + item.score, 0);

const members = [
  { id: '1', nome: 'Lucas Silva', funcao: 'Capitão', ativo: true },
  { id: '2', nome: 'Ana Costa', funcao: 'Conselheiro', ativo: true },
  { id: '3', nome: 'Pedro Santos', funcao: 'Secretário', ativo: true },
  { id: '4', nome: 'Maria Oliveira', funcao: 'Membro', ativo: true },
  { id: '5', nome: 'João Ferreira', funcao: 'Membro', ativo: false },
];

// Mock data - em produção viria da API
const mockUnit = {
  id: '1',
  nome: 'Lobos',
  cores: ['#3B82F6', '#1E40AF', '#1E3A8A'],
  gender: 'M' as const,
  gritoDeGuerra: 'Lobos juntos, jamais vencidos!',
  significadoLogo: 'O lobo representa a força, lealdade e trabalho em equipe. A alcateia simboliza a união que nos torna invencíveis.',
  historiaNome: 'Escolhido por representar a união, coragem e proteção. Como os lobos de uma alcateia, caminhamos juntos enfrentando qualquer desafio.',
  logo: null,
  membrosCount: members.length,
};

export default function UnitDetailPage() {
  const [activeTab, setActiveTab] = useState('resumo');

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
                value={members.length}
                icon={Users}
                color="primary"
              />
              <AppStatsCard
                label="Presença média"
                value="85%"
                icon={Calendar}
                color="success"
              />
            </div>

            <ScoreCard items={scoreItems} total={totalScore} />

            <AppCard padding="sm">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Últimas Atividades</h3>
              <div className="space-y-2">
                {[
                  { text: 'Encontro semanal realizado', time: 'há 2 dias' },
                  { text: 'Campismo no parque nacional', time: 'há 1 semana' },
                  { text: 'Estudo bíblico em equipe', time: 'há 2 semanas' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <span className="text-sm text-text-primary">{activity.text}</span>
                    <span className="text-xs text-muted">{activity.time}</span>
                  </div>
                ))}
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
            {members.map((member) => (
              <AppCard key={member.id} hover className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${mockUnit.cores[0]}, ${mockUnit.cores[2]})` }}
                >
                  <Users className="w-6 h-6 text-white" />
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
                  <p className="text-sm text-muted">{member.funcao}</p>
                </div>
              </AppCard>
            ))}
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
            {mockUnit.significadoLogo && (
              <AppCard>
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-text-primary">Significado do Logo</h3>
                </div>
                <p className="text-sm text-muted leading-relaxed">{mockUnit.significadoLogo}</p>
              </AppCard>
            )}

            {/* História do Nome */}
            {mockUnit.historiaNome && (
              <AppCard>
                <div className="flex items-center gap-2 mb-3">
                  <Image className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-text-primary">História do Nome</h3>
                </div>
                <p className="text-sm text-muted leading-relaxed">{mockUnit.historiaNome}</p>
              </AppCard>
            )}

            {/* Informações da Unidade */}
            <AppCard>
              <h3 className="text-sm font-semibold text-text-primary mb-3">Informações da Unidade</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted">Nome</span>
                  <span className="text-sm text-text-primary font-medium">{mockUnit.nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted">Gênero</span>
                  <span className="text-sm text-text-primary font-medium">
                    {mockUnit.gender === 'M' ? 'Masculina' : mockUnit.gender === 'F' ? 'Feminina' : 'Mista'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Cores</span>
                  <div className="flex items-center gap-1">
                    {mockUnit.cores.map((color, i) => (
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
                  <span className="text-sm text-text-primary font-medium">{mockUnit.membrosCount}</span>
                </div>
              </div>
            </AppCard>

            {/* Conselheiro */}
            <AppCard>
              <h3 className="text-sm font-semibold text-text-primary mb-3">Conselheiro</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${mockUnit.cores[0]}, ${mockUnit.cores[2]})` }}
                >
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-text-primary font-medium">Ana Costa</p>
                  <p className="text-xs text-muted">Responsável pela unidade</p>
                </div>
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
          name={mockUnit.nome}
          cores={mockUnit.cores}
          gender={mockUnit.gender}
          gritoDeGuerra={mockUnit.gritoDeGuerra}
        />

        <TabsNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}