'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Check, Clock, Trophy, Users, ChevronDown, User } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppModal } from '@/components/ui/AppModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppStatsCard } from '@/components/ui/AppStatsCard';
import { useToast } from '@/components/ui/Toast';
import { DEFAULT_CLASSES, Classe } from '@/types';
import { ClassRequirementsPopup } from '@/components/classes';
import { cn } from '@/utils/cn';

interface Requirement {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  completedAt?: Date;
}

interface Area {
  id: string;
  name: string;
  icon: string;
  requirements: Requirement[];
}

interface MemberClassProgress {
  memberId: string;
  memberName: string;
  memberUnidade: string;
  classId: string;
  className: string;
  classColor: string;
  areas: Area[];
  completedRequirements: number;
  totalRequirements: number;
  progressPercentage: number;
}

interface Member {
  id: string;
  nome: string;
  unidade: string;
  dataNascimento: Date;
  email?: string;
  telefone?: string;
}

interface MemberClass {
  id: string;
  nome: string;
  descricao?: string;
  ordem: number;
  cor: string;
  imagem?: string;
  completedBy: number;
  progress: number;
  members: Member[];
  memberProgress: MemberClassProgress[];
}

interface ClassProgress {
  classId: string;
  className: string;
  classColor: string;
  areas: Area[];
  completedRequirements: number;
  totalRequirements: number;
  progressPercentage: number;
}

// Requirements by area for each class
const classAreasData: Record<string, Area[]> = {
  '1': [
    {
      id: 'spiritual',
      name: 'Espiritualidade',
      icon: 'book',
      requirements: [
        { id: '1-s-1', name: 'Participar de 3 encontros', description: 'Estar presente em pelo menos 3 encontros', completed: false },
        { id: '1-s-2', name: 'Memorizar a Lei', description: 'Decorar e recitar a Lei dos Desbravadores', completed: false },
        { id: '1-s-3', name: 'Conhecer a estrutura', description: 'Saber nomes dos diretores e conselheiros', completed: false },
      ],
    },
    {
      id: 'uniform',
      name: 'Uniforme',
      icon: 'star',
      requirements: [
        { id: '1-u-1', name: 'Apresentar a Bíblia', description: 'Trazer sua própria Bíblia', completed: false },
        { id: '1-u-2', name: 'Ter o uniforme básico', description: 'Camiseta e calça do clube', completed: false },
      ],
    },
    {
      id: 'outdoor',
      name: 'Atividades ao Ar Livre',
      icon: 'map',
      requirements: [
        { id: '1-o-1', name: 'Primeira caminhada', description: 'Participar de uma caminhada', completed: false },
      ],
    },
  ],
  '2': [
    {
      id: 'spiritual',
      name: 'Espiritualidade',
      icon: 'book',
      requirements: [
        { id: '2-s-1', name: 'Completar classe Amigo', description: 'Ter todas as especialidades da classe anterior', completed: false },
        { id: '2-s-2', name: 'Participar de 5 encontros', description: 'Estar presente em pelo menos 5 encontros', completed: false },
        { id: '2-s-3', name: 'Liderar uma atividade', description: 'Coordenar uma atividade da unidade', completed: false },
      ],
    },
    {
      id: 'skills',
      name: 'Habilidades',
      icon: 'star',
      requirements: [
        { id: '2-h-1', name: 'Ensinar uma habilidade', description: 'Ensinar algo que sabe para outro desbravador', completed: false },
        { id: '2-h-2', name: 'Fazer uma caminhada', description: 'Participar de caminhada de pelo menos 5km', completed: false },
      ],
    },
    {
      id: 'community',
      name: 'Comunidade',
      icon: 'heart',
      requirements: [
        { id: '2-c-1', name: 'Ajudar novo membro', description: 'Apoiar integração de novo desbravador', completed: false },
      ],
    },
  ],
  '3': [
    {
      id: 'spiritual',
      name: 'Espiritualidade',
      icon: 'book',
      requirements: [
        { id: '3-s-1', name: 'Completar classes anteriores', description: 'Ter concluído todas as classes até Companheiro', completed: false },
        { id: '3-s-2', name: 'Estudar 2 especialidades', description: 'Completar pelo menos 2 especialidades', completed: false },
        { id: '3-s-3', name: 'Apresentar devoção', description: 'Conduzir um momento devocional', completed: false },
      ],
    },
    {
      id: 'outdoor',
      name: 'Vida ao Ar Livre',
      icon: 'map',
      requirements: [
        { id: '3-o-1', name: 'Participar de acampamento', description: 'Participar de pelo menos 1 acampamento', completed: false },
        { id: '3-o-2', name: 'Acender fogo', description: 'Demonstrar habilidade de fazer fogo', completed: false },
      ],
    },
    {
      id: 'leadership',
      name: 'Liderança',
      icon: 'shield',
      requirements: [
        { id: '3-l-1', name: 'Ajudar novo membro', description: 'Acompanhar progresso de um desbravador mais novo', completed: false },
      ],
    },
  ],
  '4': [
    {
      id: 'spiritual',
      name: 'Espiritualidade',
      icon: 'book',
      requirements: [
        { id: '4-s-1', name: 'Completar todas as classes anteriores', description: 'Ter concluído até Pesquisador', completed: false },
        { id: '4-s-2', name: 'Estudar 3 especialidades', description: 'Completar pelo menos 3 especialidades', completed: false },
      ],
    },
    {
      id: 'outdoor',
      name: 'Vida ao Ar Livre',
      icon: 'map',
      requirements: [
        { id: '4-o-1', name: 'Liderar acampamento', description: 'Participar da organização de um acampamento', completed: false },
        { id: '4-o-2', name: 'Navegação', description: 'Demonstrar uso de mapa e bússola', completed: false },
      ],
    },
    {
      id: 'leadership',
      name: 'Liderança',
      icon: 'shield',
      requirements: [
        { id: '4-l-1', name: 'Mentoriar um desbravador', description: 'Acompanhar o progresso de um desbravador', completed: false },
        { id: '4-l-2', name: 'Organizar evento', description: 'Coordenar um evento da unidade', completed: false },
      ],
    },
    {
      id: 'community',
      name: 'Comunidade',
      icon: 'heart',
      requirements: [
        { id: '4-c-1', name: 'Projeto comunitário', description: 'Participar de projeto de serviço', completed: false },
      ],
    },
  ],
  '5': [
    {
      id: 'spiritual',
      name: 'Espiritualidade',
      icon: 'book',
      requirements: [
        { id: '5-s-1', name: 'Completar classes até Pioneiro', description: 'Ter concluído todas as classes anteriores', completed: false },
        { id: '5-s-2', name: 'Estudar 4 especialidades', description: 'Completar pelo menos 4 especialidades', completed: false },
      ],
    },
    {
      id: 'outdoor',
      name: 'Vida ao Ar Livre',
      icon: 'map',
      requirements: [
        { id: '5-o-1', name: 'Planejar expedição', description: 'Organizar e liderar uma expedição', completed: false },
        { id: '5-o-2', name: 'Sobrevivência', description: 'Demonstrar técnicas de sobrevivência', completed: false },
      ],
    },
    {
      id: 'teaching',
      name: 'Ensino',
      icon: 'star',
      requirements: [
        { id: '5-t-1', name: 'Ensinar especialidades', description: 'Ministrar pelo menos 2 especialidades', completed: false },
        { id: '5-t-2', name: 'Uniforme completo', description: 'Apresentar-se com uniforme completo em 5 ocasiões', completed: false },
      ],
    },
  ],
  '6': [
    {
      id: 'spiritual',
      name: 'Espiritualidade',
      icon: 'book',
      requirements: [
        { id: '6-s-1', name: 'Ser exemplo', description: 'Demonstrar conduta exemplar', completed: false },
        { id: '6-s-2', name: 'Completar especialidades', description: 'Concluir todas as especialidades obrigatórias', completed: false },
      ],
    },
    {
      id: 'leadership',
      name: 'Liderança',
      icon: 'shield',
      requirements: [
        { id: '6-l-1', name: 'Liderar a unidade', description: 'Assumir papel de liderança', completed: false },
        { id: '6-l-2', name: 'Apresentar testemunho', description: 'Compartilhar sua jornada como desbravador', completed: false },
      ],
    },
    {
      id: 'community',
      name: 'Comunidade',
      icon: 'heart',
      requirements: [
        { id: '6-c-1', name: 'Servir à comunidade', description: 'Participar de projetos de serviço', completed: false },
        { id: '6-c-2', name: 'Projetos sociais', description: 'Liderar um projeto social', completed: false },
      ],
    },
  ],
};

// Mock members
const mockMembers: Member[] = [
  { id: '1', nome: 'Lucas Silva', unidade: 'Lobos', dataNascimento: new Date('2010-05-15'), email: 'lucas@email.com' },
  { id: '2', nome: 'Ana Costa', unidade: 'Lobos', dataNascimento: new Date('2011-03-20'), email: 'ana@email.com' },
  { id: '3', nome: 'Pedro Santos', unidade: 'Águias', dataNascimento: new Date('2010-08-10'), email: 'pedro@email.com' },
  { id: '4', nome: 'Maria Oliveira', unidade: 'Falcões', dataNascimento: new Date('2011-01-25'), email: 'maria@email.com' },
  { id: '5', nome: 'João Ferreira', unidade: 'Tigres', dataNascimento: new Date('2009-11-30'), email: 'joao@email.com' },
  { id: '6', nome: 'Sofia Rodrigues', unidade: 'Onças', dataNascimento: new Date('2010-07-22'), email: 'sofia@email.com' },
  { id: '7', nome: 'Gabriel Lima', unidade: 'Lobos', dataNascimento: new Date('2010-04-18'), telefone: '11999999999' },
];

// Generate member progress with random completion
function generateMemberProgress(classId: string, member: Member): MemberClassProgress {
  const areasData = classAreasData[classId] || [];

  const areasWithStatus = areasData.map((area) => ({
    ...area,
    requirements: area.requirements.map((req) => ({
      ...req,
      completed: Math.random() > 0.5,
      completedAt: Math.random() > 0.5 ? new Date() : undefined,
    })),
  }));

  const completedCount = areasWithStatus.reduce(
    (acc, area) => acc + area.requirements.filter((r) => r.completed).length,
    0
  );
  const totalCount = areasWithStatus.reduce((acc, area) => acc + area.requirements.length, 0);
  const percentage = Math.round((completedCount / totalCount) * 100);

  return {
    memberId: member.id,
    memberName: member.nome,
    memberUnidade: member.unidade,
    classId,
    className: DEFAULT_CLASSES.find((c) => c.id === classId)?.nome || '',
    classColor: DEFAULT_CLASSES.find((c) => c.id === classId)?.cor || '#C6A15B',
    areas: areasWithStatus,
    completedRequirements: completedCount,
    totalRequirements: totalCount,
    progressPercentage: percentage,
  };
}

// Build initial classes with members
const initialClasses: MemberClass[] = DEFAULT_CLASSES.map((classe, classIndex) => {
  const classMembers = mockMembers.filter((_, i) => i % (DEFAULT_CLASSES.length - classIndex) === 0);
  const memberProgress = classMembers.map((member) => generateMemberProgress(classe.id, member));

  return {
    ...classe,
    completedBy: Math.floor(Math.random() * 15) + 5,
    progress: Math.floor(Math.random() * 100),
    members: classMembers,
    memberProgress,
  };
});

export default function ClassesPage() {
  const [classes] = useState<MemberClass[]>(initialClasses);
  const [selectedClass, setSelectedClass] = useState<MemberClass | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [selectedMemberProgress, setSelectedMemberProgress] = useState<MemberClassProgress | null>(null);
  const [isRequirementsModalOpen, setIsRequirementsModalOpen] = useState(false);
  const [selectedClassProgress, setSelectedClassProgress] = useState<ClassProgress | null>(null);
  const { addToast } = useToast();

  const totalCompletions = classes.reduce((acc, c) => acc + c.completedBy, 0);

  const handleClassClick = (classe: MemberClass) => {
    // Create class progress data for the popup
    const classProgress: ClassProgress = {
      classId: classe.id,
      className: classe.nome,
      classColor: classe.cor,
      areas: classAreasData[classe.id] || [],
      completedRequirements: 0,
      totalRequirements: (classAreasData[classe.id] || []).reduce(
        (acc, area) => acc + area.requirements.length, 0
      ),
      progressPercentage: 0,
    };
    setSelectedClassProgress(classProgress);
    setIsRequirementsModalOpen(true);
  };

  const handleShowMembers = (classe: MemberClass, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedClass(classe);
    setIsMembersModalOpen(true);
  };

  const handleMemberClick = (memberProgress: MemberClassProgress) => {
    setSelectedMemberProgress(memberProgress);
    setSelectedClassProgress(null);
    setIsRequirementsModalOpen(true);
  };

  return (
    <AppLayout title="Classes" subtitle="Classes regulares dos desbravadores">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-6"
      >
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <AppStatsCard label="Classes" value={classes.length} icon={BookOpen} color="primary" />
          <AppStatsCard label="Conclusões" value={totalCompletions} icon={Trophy} color="success" />
        </div>

        {/* Classes List */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-3">Todas as Classes</h3>
          <div className="space-y-3">
            {classes.map((classe, index) => (
              <motion.div
                key={classe.id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <AppCard
                  hover
                  onClick={() => handleClassClick(classe)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                      style={{ backgroundColor: `${classe.cor}20` }}
                    >
                      {classe.imagem ? (
                        <img
                          src={classe.imagem}
                          alt={classe.nome}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <BookOpen className="w-7 h-7" style={{ color: classe.cor }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-text-primary">{classe.nome}</h4>
                        <span className="text-xs text-muted">#{classe.ordem}</span>
                      </div>
                      <p className="text-sm text-muted line-clamp-1">{classe.descricao}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-xs text-muted">
                          <Trophy className="w-3 h-3" />
                          {classe.completedBy} conclusões
                        </div>
                      </div>
                    </div>
                    <div className="w-full max-w-[100px]">
                      <div className="h-2 bg-card rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${classe.progress}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: classe.cor }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Members section */}
                  {classe.members.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-border/50">
                      <button
                        onClick={(e) => handleShowMembers(classe, e)}
                        className="flex items-center justify-between w-full py-2 px-3 rounded-xl bg-surface hover:bg-primary/10 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          <span className="text-sm text-text-primary">
                            {classe.members.length} desbravadores
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AppBadge variant="secondary" size="sm">
                            Ver progressos
                          </AppBadge>
                          <motion.div
                            animate={{ rotate: expandedClass === classe.id ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-4 h-4 text-muted" />
                          </motion.div>
                        </div>
                      </button>

                      {/* Expanded member list */}
                      <AnimatePresence>
                        {expandedClass === classe.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 space-y-2 max-h-[250px] overflow-y-auto">
                              {classe.memberProgress.map((progress) => (
                                <button
                                  key={progress.memberId}
                                  onClick={() => handleMemberClick(progress)}
                                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors text-left"
                                >
                                  <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: `${classe.cor}20` }}
                                  >
                                    <User className="w-5 h-5" style={{ color: classe.cor }} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text-primary">{progress.memberName}</p>
                                    <p className="text-xs text-muted">{progress.memberUnidade}</p>
                                  </div>
                                  <div className="text-right">
                                    <p
                                      className="text-lg font-bold"
                                      style={{ color: classe.cor }}
                                    >
                                      {progress.progressPercentage}%
                                    </p>
                                    <p className="text-xs text-muted">
                                      {progress.completedRequirements}/{progress.totalRequirements}
                                    </p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </AppCard>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Class Detail Modal */}
      <AppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedClass?.nome || ''}
        description={`Classe ${selectedClass?.ordem} de ${DEFAULT_CLASSES.length}`}
        size="lg"
      >
        {selectedClass && (
          <div className="space-y-4">
            <div
              className="h-32 rounded-xl flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: `${selectedClass.cor}15` }}
            >
              {selectedClass.imagem ? (
                <img
                  src={selectedClass.imagem}
                  alt={selectedClass.nome}
                  className="w-28 h-28 object-contain drop-shadow-md"
                />
              ) : (
                <BookOpen className="w-12 h-12" style={{ color: selectedClass.cor }} />
              )}
            </div>

            <p className="text-sm text-muted">{selectedClass.descricao}</p>

            <div>
              <h4 className="font-medium text-text-primary mb-3">Áreas de Atuação</h4>
              <div className="grid grid-cols-2 gap-2">
                {(classAreasData[selectedClass.id] || []).map((area) => (
                  <div
                    key={area.id}
                    className="p-3 bg-card rounded-xl border border-border"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">
                        {area.icon === 'book' && '📖'}
                        {area.icon === 'map' && '🧭'}
                        {area.icon === 'heart' && '❤️'}
                        {area.icon === 'star' && '⭐'}
                        {area.icon === 'shield' && '🛡️'}
                      </span>
                      <span className="text-sm font-medium text-text-primary">{area.name}</span>
                    </div>
                    <p className="text-xs text-muted">{area.requirements.length} requisitos</p>
                  </div>
                ))}
              </div>
            </div>

            <AppButton variant="secondary" onClick={() => setIsModalOpen(false)} className="w-full">
              Fechar
            </AppButton>
          </div>
        )}
      </AppModal>

      {/* Members Progress Modal */}
      <AppModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        title={selectedClass?.nome}
        description={`Progresso de ${selectedClass?.members.length} desbravadores`}
        size="md"
      >
        {selectedClass && (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {selectedClass.memberProgress.map((progress) => (
              <button
                key={progress.memberId}
                onClick={() => {
                  setIsMembersModalOpen(false);
                  handleMemberClick(progress);
                }}
                className="w-full flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors text-left"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${selectedClass.cor}20` }}
                >
                  <User className="w-5 h-5" style={{ color: selectedClass.cor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{progress.memberName}</p>
                  <p className="text-xs text-muted">{progress.memberUnidade}</p>
                </div>
                <div className="text-right">
                  <p
                    className="text-lg font-bold"
                    style={{ color: selectedClass.cor }}
                  >
                    {progress.progressPercentage}%
                  </p>
                  <p className="text-xs text-muted">
                    {progress.completedRequirements}/{progress.totalRequirements} req
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </AppModal>

      {/* Member/Class Requirements Popup */}
      <ClassRequirementsPopup
        isOpen={isRequirementsModalOpen}
        onClose={() => setIsRequirementsModalOpen(false)}
        initialProgress={selectedClassProgress || selectedMemberProgress}
      />
    </AppLayout>
  );
}