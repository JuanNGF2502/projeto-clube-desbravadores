'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Check, Clock, Trophy, Users, ChevronDown, User, Loader2, GraduationCap } from 'lucide-react';
import { cn } from '@/utils/cn';
import { AppLayout } from '@/components/layout/AppLayout';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppModal } from '@/components/ui/AppModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppStatsCard } from '@/components/ui/AppStatsCard';
import { ProgressCircle } from '@/components/ui/ProgressCircle';
import { useToast } from '@/components/ui/Toast';
import { DEFAULT_CLASSES, Classe } from '@/types';
import { ClassRequirementsPopup } from '@/components/classes';
import { getClasses, getEstatisticasClasse, getRequisitosPorClasse, getMembrosComProgresso, RequisitoClasse, MembroComProgresso, updateProgressoRequisito, getStatusInstrucaoPorClasse, salvarInstrucaoRequisito, getProgressoInstrucaoClasse, getClassesQueInstrutorEnsina } from '@/lib/queries/classes';
import { getClassesQueInstrutorEnsinaPorCargo } from '@/lib/queries/membros';
import { getMembrosPorClasse } from '@/lib/queries/dashboard';
import { useClubId, useAuth } from '@/hooks';
import { concluirClasse, createTransicao } from '@/lib/queries';

interface MemberClassProgress {
  memberId: string;
  memberName: string;
  memberUnidade: string;
  classId: string;
  className: string;
  classColor: string;
  areas: any[];
  completedRequirements: number;
  totalRequirements: number;
  progressPercentage: number;
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
  requisitos: RequisitoClasse[];
  // Controle de instrução
  ensinadosCount?: number;
  instrucaoPercentage?: number;
}

interface Member {
  id: string;
  nome: string;
  unidade: string;
  dataNascimento: Date;
  email?: string;
  telefone?: string;
}

interface ClassProgress {
  classId: string;
  className: string;
  classColor: string;
  areas: any[];
  completedRequirements: number;
  totalRequirements: number;
  progressPercentage: number;
}

// Requirements by area for each class (from database)
const getClassAreasData = (requisitos: any[]) => {
  const areasMap: Record<string, any[]> = {};

  requisitos.forEach((req) => {
    if (!areasMap[req.area]) {
      areasMap[req.area] = [];
    }
    areasMap[req.area].push({
      id: req.id,
      name: req.nome,
      description: req.descricao || '',
      completed: false,
      ensinou: req.ensinou || false,
    });
  });

  return Object.entries(areasMap).map(([area, requirements]) => ({
    id: area.toLowerCase(),
    name: area,
    icon: getAreaIcon(area),
    requirements: requirements.map((r) => ({
      ...r,
      completed: false,
      ensinou: r.ensinou || false,
    })),
  }));
};

const getAreaIcon = (area: string) => {
  const icons: Record<string, string> = {
    'Espiritualidade': 'book',
    'Habilidades': 'star',
    'Vida ao Ar Livre': 'map',
    'Liderança': 'shield',
    'Comunidade': 'heart',
    'Ensino': 'star',
    'Uniforme': 'star',
    'Atividades ao Ar Livre': 'map',
  };
  return icons[area] || 'book';
};

export default function ClassesPage() {
  const clubId = useClubId();

  const [classes, setClasses] = useState<MemberClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<MemberClass | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [selectedMemberProgress, setSelectedMemberProgress] = useState<MemberClassProgress | null>(null);
  const [isRequirementsModalOpen, setIsRequirementsModalOpen] = useState(false);
  const [selectedClassProgress, setSelectedClassProgress] = useState<ClassProgress | null>(null);
  const [classesQueInstrui, setClassesQueInstrui] = useState<string[]>([]);
  const [instrucaoProgress, setInstrucaoProgress] = useState<{ total: number; ensinados: number; percentage: number } | null>(null);
  const { addToast } = useToast();

  const { user, profile } = useAuth();

  const isInstrutorMode = profile?.role === 'ADMIN' || classesQueInstrui.length > 0;
  const showAllClasses = profile?.role === 'ADMIN' || classesQueInstrui.length === 0;

  const carregarDados = async () => {
    try {
      setIsLoading(true);

      // Buscar classes do banco
      const classesData = await getClasses(true);

      // Converter para formato da UI
      const classesFormatadas = await Promise.all(
        (classesData || []).map(async (classe: any) => {
          // Buscar estatísticas da classe
          const stats = await getEstatisticasClasse(classe.id);

          // Buscar requisitos
          const requisitos = await getRequisitosPorClasse(classe.id);

          // Buscar membros com progresso nesta classe
          const membrosComProgresso = await getMembrosComProgresso(clubId, classe.id);

          // Buscar contagem de membros
          const membrosData = await getMembrosPorClasse(clubId);
          const membrosNaClasse = membrosData?.find(m => m.classeId === classe.id);

          // Buscar progresso de instrução
          const instrucao = await getProgressoInstrucaoClasse(classe.id);

          // Buscar status de instrução dos requisitos
          const statusInstrucao = await getStatusInstrucaoPorClasse(classe.id);

          // Adicionar status de ensino aos requisitos para o popup
          const requisitosComInstrucao = (requisitos || []).map(req => ({
            ...req,
            ensinou: statusInstrucao[req.id] || false,
          }));

          return {
            ...classe,
            completedBy: stats.membrosConcluiram || 0,
            progress: membrosNaClasse ? Math.floor((stats.membrosConcluiram / (stats.membrosNaClasse || 1)) * 100) : 0,
            members: [],
            memberProgress: membrosComProgresso.map(m => ({
              memberId: m.membroId,
              memberName: m.membroNome,
              memberUnidade: m.membroUnidade,
              classId: classe.id,
              className: classe.nome,
              classColor: classe.cor,
              areas: m.areas,
              completedRequirements: m.completedCount,
              totalRequirements: m.totalCount,
              progressPercentage: m.progressPercentage,
            })),
            requisitos: requisitosComInstrucao,
            ensinadosCount: instrucao.ensinados,
            instrucaoPercentage: instrucao.percentage,
          };
        })
      );

      setClasses(classesFormatadas as MemberClass[]);
    } catch (error) {
      console.error('Erro ao carregar classes:', error);
      // Fallback para DEFAULT_CLASSES se erro
      setClasses(DEFAULT_CLASSES.map(c => ({
        ...c,
        completedBy: 0,
        progress: 0,
        members: [],
        memberProgress: [],
        requisitos: [],
      })) as unknown as MemberClass[]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (clubId) {
      carregarDados();
    }
  }, [clubId]);

  useEffect(() => {
    if (user && profile) {
      if (profile.role !== 'ADMIN') {
        Promise.all([
          getClassesQueInstrutorEnsina(user.id),
          profile.membro_id ? getClassesQueInstrutorEnsinaPorCargo(profile.membro_id) : Promise.resolve([]),
        ]).then(([fromInstrucoes, fromCargos]) => {
          const merged = [...new Set([...fromInstrucoes, ...fromCargos])];
          setClassesQueInstrui(merged);
        }).catch(() => {
          setClassesQueInstrui([]);
        });
      } else {
        setClassesQueInstrui([]);
      }
    }
  }, [user, profile]);

  const handleClassClick = (classe: MemberClass) => {
    const areas = getClassAreasData(classe.requisitos || []);

    // Se modo instrutor, usar dados de progresso de instrução
    const progressToUse = isInstrutorMode
      ? { ensinados: classe.ensinadosCount || 0, percentage: classe.instrucaoPercentage || 0 }
      : { total: areas.reduce((acc, a) => acc + a.requirements.length, 0), ensinados: 0, percentage: 0 };

    const classProgress: ClassProgress = {
      classId: classe.id,
      className: classe.nome,
      classColor: classe.cor,
      areas,
      completedRequirements: 0,
      totalRequirements: areas.reduce((acc, a) => acc + a.requirements.length, 0),
      progressPercentage: isInstrutorMode ? (classe.instrucaoPercentage || 0) : classe.progress,
    };
    setSelectedClassProgress(classProgress);

    // Se modo instrutor, salvar o progresso de instrução
    if (isInstrutorMode) {
      setInstrucaoProgress({
        total: areas.reduce((acc, a) => acc + a.requirements.length, 0),
        ensinados: classe.ensinadosCount || 0,
        percentage: classe.instrucaoPercentage || 0,
      });
    } else {
      setInstrucaoProgress(null);
    }

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
    setInstrucaoProgress(null);
    setIsRequirementsModalOpen(true);
  };

  const handleSaveProgress = async (membroId: string, requisitoId: string, completado: boolean) => {
    await updateProgressoRequisito(membroId, requisitoId, completado);
  };

  const handleSalvarInstrucao = async (requisitoId: string, ensinou: boolean) => {
    if (!selectedClassProgress) {
      console.error('selectedClassProgress é null');
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Não foi possível salvar a instrução. Selecione uma classe primeiro.',
      });
      return;
    }
    try {
      console.log('Salvando instrução - classId:', selectedClassProgress.classId, 'requisitoId:', requisitoId, 'ensinou:', ensinou);
      await salvarInstrucaoRequisito(selectedClassProgress.classId, requisitoId, ensinou);
      console.log('Salvo com sucesso!');

      // Atualizar o estado local do progresso
      const novoProgress = {
        total: instrucaoProgress?.total || 0,
        ensinados: ensinou
          ? (instrucaoProgress?.ensinados || 0) + 1
          : Math.max(0, (instrucaoProgress?.ensinados || 0) - 1),
        percentage: 0,
      };
      novoProgress.percentage = Math.round((novoProgress.ensinados / novoProgress.total) * 100);
      setInstrucaoProgress(novoProgress);

      // Recarregar dados para atualizar a lista de classes
      await carregarDados();
    } catch (error) {
      console.error('Erro ao salvar instrução:', error);
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Falha ao salvar instrução',
      });
    }
  };

  const handleConcluirClasse = async (memberId: string) => {
    if (!selectedClassProgress) return;
    try {
      await concluirClasse(memberId, selectedClassProgress.classId);
      await createTransicao({
        membro_id: memberId,
        tipo: 'CONCLUIU_CLASSE',
        descricao: `Concluiu a classe ${selectedClassProgress.className}`,
        classe_id: selectedClassProgress.classId,
      });
      addToast({ type: 'success', title: 'Classe concluída!', message: 'Parabéns pela conclusão!' });
      await carregarDados();
    } catch (error) {
      console.error('Erro ao concluir classe:', error);
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao concluir classe' });
    }
  };

  const handleRequirementsModalClose = () => {
    setIsRequirementsModalOpen(false);
    setSelectedMemberProgress(null);
    setSelectedClassProgress(null);
    setInstrucaoProgress(null);
    // Recarregar dados
    carregarDados();
  };

  if (isLoading) {
    return (
      <AppLayout title="Classes" subtitle="Classes regulares dos desbravadores">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const filteredClasses = showAllClasses ? classes : classes.filter(c => classesQueInstrui.includes(c.id));
  const totalCompletions = filteredClasses.reduce((acc, c) => acc + (c.completedBy || 0), 0);

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
          <AppStatsCard label="Classes" value={filteredClasses.length} icon={BookOpen} color="primary" />
          <AppStatsCard label="Conclusões" value={totalCompletions} icon={Trophy} color="success" />
        </div>

        {/* Modo Instrutor */}
        {isInstrutorMode && (
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--card-color)', border: '1px solid var(--border-color)' }}>
            <div className="p-2 rounded-lg bg-primary/20">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                Modo Instrutor
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary-color)' }}>
                Marque os requisitos que você ensinou
              </p>
            </div>
          </div>
        )}

        {/* Instrução Stats (only in instrutor mode) */}
        {isInstrutorMode && (
          <div className="grid grid-cols-3 gap-3">
            {filteredClasses.map((classe) => (
              <div
                key={classe.id}
                className="p-3 rounded-xl text-center"
                style={{ backgroundColor: `${classe.cor}15`, border: `1px solid ${classe.cor}30` }}
              >
                <p className="text-xs font-medium" style={{ color: classe.cor }}>{classe.nome}</p>
                <p className="text-lg font-bold" style={{ color: 'var(--text-color)' }}>
                  {classe.ensinadosCount || 0}/{classe.requisitos?.length || 0}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary-color)' }}>ensinados</p>
              </div>
            ))}
          </div>
        )}

        {/* Classes List */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-3">Todas as Classes</h3>
          <div className="space-y-3">
            {filteredClasses.map((classe, index) => (
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
                        {isInstrutorMode ? (
                          <>
                            <div className="flex items-center gap-1 text-xs text-primary">
                              <GraduationCap className="w-3 h-3" />
                              {classe.ensinadosCount || 0} ensinados
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted">
                              <BookOpen className="w-3 h-3" />
                              {(classe.requisitos?.length || 0)} requisitos
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-1 text-xs text-muted">
                              <Trophy className="w-3 h-3" />
                              {classe.completedBy || 0} conclusões
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted">
                              <BookOpen className="w-3 h-3" />
                              {(classe.requisitos?.length || 0)} requisitos
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <ProgressCircle
                        value={isInstrutorMode ? (classe.instrucaoPercentage || 0) : (classe.progress || 0)}
                        size="md"
                        color={classe.cor}
                      />
                    </div>
                  </div>

                  {/* Members section - show if there are members in this class */}
                  {classe.memberProgress && classe.memberProgress.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-border/50">
                      <button
                        onClick={(e) => handleShowMembers(classe, e)}
                        className="flex items-center justify-between w-full py-2 px-3 rounded-xl bg-surface hover:bg-primary/10 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          <span className="text-sm text-text-primary">
                            {classe.memberProgress.length} desbravadores
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
        description={`Classe ${selectedClass?.ordem} de ${classes.length}`}
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
                {getClassAreasData(selectedClass.requisitos || []).map((area) => (
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
        description={`Progresso de ${selectedClass?.memberProgress?.length || 0} desbravadores`}
        size="md"
      >
        {selectedClass && selectedClass.memberProgress && selectedClass.memberProgress.length > 0 && (
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
        key={selectedClassProgress?.classId}
        isOpen={isRequirementsModalOpen}
        onClose={handleRequirementsModalClose}
        initialProgress={selectedClassProgress || selectedMemberProgress}
        onSaveProgress={selectedMemberProgress ? handleSaveProgress : undefined}
        modoInstrutor={isInstrutorMode}
        onSalvarInstrucao={isInstrutorMode && selectedClassProgress ? handleSalvarInstrucao : undefined}
        instrucaoProgress={instrucaoProgress || undefined}
        onConcluirClasse={selectedMemberProgress ? handleConcluirClasse : undefined}
      />
    </AppLayout>
  );
}