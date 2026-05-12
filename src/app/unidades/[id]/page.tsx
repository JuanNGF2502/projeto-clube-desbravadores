'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Calendar, User, Home, Image, Info, Mic, Trophy, ChevronRight } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { UnitHeader, TabsNavigation, ScoreCard, RankingModal } from '@/components/unidades';
import { MembroDetailModal } from '@/components/membros';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppStatsCard } from '@/components/ui/AppStatsCard';
import { AppButton } from '@/components/ui/AppButton';
import { cn } from '@/utils/cn';
import { Usuario } from '@/types';

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

const members: Usuario[] = [
  {
    id: '1',
    nome: 'Lucas Silva',
    sexo: 'M',
    dataNascimento: new Date('2012-03-15'),
    telefone: '(11) 99999-1111',
    email: 'lucas@email.com',
    ativo: true,
    clubeId: '1',
    dataCadastro: new Date('2022-01-15'),
    classesAtuais: [{ classeId: '5', dataInicio: new Date('2025-01-15') }],
    classesConcluidas: [
      { classeId: '1', dataInicio: new Date('2022-01-15'), dataConclusao: new Date('2022-03-20'), concluido: true },
      { classeId: '2', dataInicio: new Date('2022-03-21'), dataConclusao: new Date('2022-06-15'), concluido: true },
    ],
    cargos: [{ tipo: 'CAPITAO', dataAtribuicao: new Date('2024-01-01'), unidadeId: '1', ativo: true }],
    unidadeAtualId: '1',
    unidadesAnteriores: [],
    especialidadesConcluidas: [],
    transicoes: [],
  },
  {
    id: '2',
    nome: 'Ana Costa',
    sexo: 'F',
    dataNascimento: new Date('2013-07-22'),
    telefone: '(11) 99999-2222',
    email: 'ana@email.com',
    ativo: true,
    clubeId: '1',
    dataCadastro: new Date('2021-06-01'),
    classesAtuais: [{ classeId: '6', dataInicio: new Date('2024-11-01') }],
    classesConcluidas: [
      { classeId: '1', dataInicio: new Date('2021-06-01'), dataConclusao: new Date('2021-08-15'), concluido: true },
      { classeId: '2', dataInicio: new Date('2021-08-16'), dataConclusao: new Date('2021-11-20'), concluido: true },
      { classeId: '3', dataInicio: new Date('2021-11-21'), dataConclusao: new Date('2022-02-28'), concluido: true },
      { classeId: '4', dataInicio: new Date('2022-03-01'), dataConclusao: new Date('2022-06-15'), concluido: true },
      { classeId: '5', dataInicio: new Date('2022-06-16'), dataConclusao: new Date('2022-10-30'), concluido: true },
    ],
    cargos: [{ tipo: 'CONSELHEIRO', dataAtribuicao: new Date('2024-01-01'), unidadeId: '1', ativo: true }],
    unidadeAtualId: '1',
    unidadesAnteriores: [],
    especialidadesConcluidas: ['esp1', 'esp2'],
    transicoes: [],
  },
  {
    id: '3',
    nome: 'Pedro Santos',
    sexo: 'M',
    dataNascimento: new Date('2014-01-10'),
    ativo: true,
    clubeId: '1',
    dataCadastro: new Date('2023-03-10'),
    classesAtuais: [{ classeId: '4', dataInicio: new Date('2025-01-15') }],
    classesConcluidas: [
      { classeId: '1', dataInicio: new Date('2023-03-10'), dataConclusao: new Date('2023-05-20'), concluido: true },
      { classeId: '2', dataInicio: new Date('2023-05-21'), dataConclusao: new Date('2023-08-15'), concluido: true },
      { classeId: '3', dataInicio: new Date('2023-08-16'), dataConclusao: new Date('2024-01-10'), concluido: true },
    ],
    cargos: [
      { tipo: 'SECRETARIO', dataAtribuicao: new Date('2024-01-01'), unidadeId: '1', ativo: true },
      { tipo: 'DESBRAVADOR', dataAtribuicao: new Date('2023-03-10'), unidadeId: '1', ativo: true },
    ],
    unidadeAtualId: '1',
    unidadesAnteriores: [],
    especialidadesConcluidas: [],
    transicoes: [],
  },
  {
    id: '4',
    nome: 'Maria Oliveira',
    sexo: 'F',
    dataNascimento: new Date('2015-09-05'),
    ativo: true,
    clubeId: '1',
    dataCadastro: new Date('2024-02-01'),
    classesAtuais: [{ classeId: '2', dataInicio: new Date('2024-02-01') }],
    classesConcluidas: [
      { classeId: '1', dataInicio: new Date('2024-02-01'), dataConclusao: new Date('2024-04-15'), concluido: true },
    ],
    cargos: [{ tipo: 'DESBRAVADOR', dataAtribuicao: new Date('2024-02-01'), unidadeId: '1', ativo: true }],
    unidadeAtualId: '1',
    unidadesAnteriores: [],
    especialidadesConcluidas: [],
    transicoes: [],
    responsavel: { nome: 'Carlos Oliveira', telefone: '(11) 88888-9999', parentesco: 'Pai' },
  },
  {
    id: '5',
    nome: 'João Ferreira',
    sexo: 'M',
    dataNascimento: new Date('2011-11-30'),
    ativo: false,
    clubeId: '1',
    dataCadastro: new Date('2020-01-15'),
    dataDesligamento: new Date('2024-12-01'),
    motivoDesligamento: 'Transferência',
    classesAtuais: [],
    classesConcluidas: [
      { classeId: '1', dataInicio: new Date('2020-01-15'), dataConclusao: new Date('2020-03-20'), concluido: true },
      { classeId: '2', dataInicio: new Date('2020-03-21'), dataConclusao: new Date('2020-06-15'), concluido: true },
      { classeId: '3', dataInicio: new Date('2020-06-16'), dataConclusao: new Date('2020-09-10'), concluido: true },
    ],
    cargos: [{ tipo: 'DESBRAVADOR', dataAtribuicao: new Date('2020-01-15'), ativo: false }],
    unidadeAtualId: undefined,
    unidadesAnteriores: [{ unidadeId: '1', dataEntrada: new Date('2020-01-15'), dataSaida: new Date('2024-12-01') }],
    especialidadesConcluidas: [],
    transicoes: [],
  },
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
  const [showRanking, setShowRanking] = useState(false);
  const [selectedMembro, setSelectedMembro] = useState<Usuario | null>(null);

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
              <AppCard
                key={member.id}
                hover
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => setSelectedMembro(member)}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${mockUnit.cores[0]}, ${mockUnit.cores[2]})` }}
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
                    {member.cargos?.find(c => c.ativo)?.tipo === 'CAPITAO' ? 'Capitão' :
                     member.cargos?.find(c => c.ativo)?.tipo === 'CONSELHEIRO' ? 'Conselheiro' :
                     member.cargos?.find(c => c.ativo)?.tipo === 'SECRETARIO' ? 'Secretário' : 'Desbravador'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted flex-shrink-0" />
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

        {/* Ranking Button */}
        <AppButton
          variant="primary"
          className="w-full"
          onClick={() => setShowRanking(true)}
        >
          <Trophy className="w-5 h-5 mr-2" />
          Ranking da Unidade
        </AppButton>

        <TabsNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>

      <RankingModal
        isOpen={showRanking}
        onClose={() => setShowRanking(false)}
        unidadeId={mockUnit.id}
        unidadeNome={mockUnit.nome}
        unidadeCores={mockUnit.cores}
        membros={members}
      />

      <MembroDetailModal
        isOpen={!!selectedMembro}
        onClose={() => setSelectedMembro(null)}
        membro={selectedMembro}
        unidadeCores={mockUnit.cores}
      />
    </AppLayout>
  );
}