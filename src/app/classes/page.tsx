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
import { Classe } from '@/types';
import { ClassRequirementsPopup } from '@/components/classes';
import { getClasses, RequisitoClasse, MembroComProgresso, updateProgressoRequisito, salvarInstrucaoRequisito, getClassesQueInstrutorEnsina } from '@/lib/queries/classes';
import { getClassesQueInstrutorEnsinaPorCargo } from '@/lib/queries/membros';
import { useClubId, useAuth } from '@/hooks';
import { concluirClasse, createTransicao } from '@/lib/queries';
import { supabase } from '@/lib/supabase/client';
import { batchInQuery } from '@/lib/supabase/batch';

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
  const showAllClasses = profile?.role === 'ADMIN';

  const carregarDados = async () => {
    try {
      setIsLoading(true);

      // 1. Buscar todas as classes
      const classesData = await getClasses(true);
      const todasClasses = classesData || [];
      const todosClassIds = todasClasses.map(c => c.id);

      // 2. Buscar membros em classes (para filtrar classes com desbravadores)
      const { data: membrosClasses } = await supabase
        .from('membros_classes_atuais')
        .select('membro_id, classe_id');

      const classesComMembros = new Set(membrosClasses?.map(mc => mc.classe_id) || []);
      const classesFiltradas = todasClasses.filter(c => classesComMembros.has(c.id));
      const classIds = classesFiltradas.map(c => c.id);

      if (classIds.length === 0) {
        setClasses([]);
        return;
      }

      // 3. Buscar TODOS os requisitos das classes relevantes (1 query)
      const { data: todosRequisitos } = await supabase
        .from('requisitos_classe')
        .select('*')
        .in('classe_id', classIds)
        .eq('ativo', true)
        .order('ordem');

      const requisitosPorClasse: Record<string, any[]> = {};
      const seenRequisitos = new Set<string>();
      (todosRequisitos || []).forEach(req => {
        const key = `${req.classe_id}_${req.area}_${req.ordem}`;
        if (seenRequisitos.has(key)) return;
        seenRequisitos.add(key);
        if (!requisitosPorClasse[req.classe_id]) requisitosPorClasse[req.classe_id] = [];
        requisitosPorClasse[req.classe_id].push(req);
      });

      // 4. Buscar informações dos membros (1 query)
      const todosMembroIds = [...new Set(membrosClasses?.map(mc => mc.membro_id) || [])];
      let todosMembros: any[] = [];
      if (todosMembroIds.length > 0) {
        const { data } = await supabase
          .from('membros')
          .select('id, nome, unidade_id')
          .in('id', todosMembroIds);
        todosMembros = data || [];
      }

      const membrosPorId: Record<string, any> = {};
      todosMembros.forEach(m => { membrosPorId[m.id] = m; });

      // 5. Buscar unidades (1 query)
      const unidadeIds = [...new Set(todosMembros?.map(m => m.unidade_id).filter(Boolean) || [])];
      let todasUnidades: any[] = [];
      if (unidadeIds.length > 0) {
        const { data } = await supabase
          .from('unidades')
          .select('id, nome')
          .in('id', unidadeIds);
        todasUnidades = data || [];
      }

      const unidadesPorId: Record<string, any> = {};
      todasUnidades.forEach(u => { unidadesPorId[u.id] = u; });

      // 6. Buscar TODOS os progressos de requisitos (com batch só por membro_id)
      let todosProgressos: any[] = [];
      if (todosMembroIds.length > 0) {
        todosProgressos = await batchInQuery(
          (membroIds) =>
            supabase
              .from('membros_requisitos')
              .select('membro_id, requisito_id, completado')
              .in('membro_id', membroIds) as any,
          todosMembroIds,
          30,
        );
      }

      // Agrupar progressos por (membro_id + classe_id) para acesso rápido
      const progressoMap = new Map<string, boolean>();
      todosProgressos.forEach(p => {
        progressoMap.set(`${p.membro_id}_${p.requisito_id}`, p.completado);
      });

      // 7. Buscar TODAS as instruções (1 query)
      const { data: todasInstrucoes } = await supabase
        .from('classes_instrucoes')
        .select('*')
        .in('classe_id', classIds);

      const instrucoesPorClasse: Record<string, any[]> = {};
      (todasInstrucoes || []).forEach(inst => {
        if (!instrucoesPorClasse[inst.classe_id]) instrucoesPorClasse[inst.classe_id] = [];
        instrucoesPorClasse[inst.classe_id].push(inst);
      });

      // 8. Buscar conclusões de classes (1 query)
      const { data: todasConcluidas } = await supabase
        .from('membros_classes_concluidas')
        .select('classe_id')
        .eq('concluido', true)
        .in('classe_id', classIds);

      const concluidasPorClasse: Record<string, number> = {};
      (todasConcluidas || []).forEach(c => {
        concluidasPorClasse[c.classe_id] = (concluidasPorClasse[c.classe_id] || 0) + 1;
      });

      // 9. Montar resultado (tudo em memória)
      const classesFormatadas = classesFiltradas.map(classe => {
        const requisitos = requisitosPorClasse[classe.id] || [];
        const membrosNaClasse = membrosClasses?.filter(mc => mc.classe_id === classe.id) || [];
        const instrucoes = instrucoesPorClasse[classe.id] || [];

        const statusInstrucao: Record<string, boolean> = {};
        instrucoes.forEach(inst => { statusInstrucao[inst.requisito_id] = inst.ensinou; });

        const requisitosComInstrucao = requisitos.map((req: any) => ({
          ...req,
          ensinou: statusInstrucao[req.id] || false,
        }));

        const memberProgress = membrosNaClasse.map(mc => {
          const membro = membrosPorId[mc.membro_id];
          const unidade = membro ? unidadesPorId[membro.unidade_id] : null;

          const areasMap: Record<string, any> = {};
          requisitos.forEach((req: any) => {
            if (!areasMap[req.area]) {
              areasMap[req.area] = {
                id: req.area.toLowerCase(),
                name: req.area,
                icon: getAreaIcon(req.area),
                requirements: [],
              };
            }
            areasMap[req.area].requirements.push({
              id: req.id,
              name: req.nome,
              description: req.descricao || '',
              completed: progressoMap.get(`${mc.membro_id}_${req.id}`) || false,
            });
          });

          const areas = Object.values(areasMap);
          const completedCount = areas.reduce(
            (acc: number, a: any) => acc + a.requirements.filter((r: any) => r.completed).length, 0
          );

          return {
            memberId: mc.membro_id,
            memberName: membro?.nome || 'Desbravador',
            memberUnidade: unidade?.nome || 'Sem unidade',
            classId: classe.id,
            className: classe.nome,
            classColor: classe.cor,
            areas: JSON.parse(JSON.stringify(areas)),
            completedRequirements: completedCount,
            totalRequirements: requisitos.length,
            progressPercentage: requisitos.length > 0 ? Math.floor((completedCount / requisitos.length) * 100) : 0,
          };
        });

        const ensinadosCount = instrucoes.filter((i: any) => i.ensinou).length;
        const totalMembers = membrosNaClasse.length;

        return {
          ...classe,
          completedBy: concluidasPorClasse[classe.id] || 0,
          progress: totalMembers > 0 ? Math.floor(((concluidasPorClasse[classe.id] || 0) / totalMembers) * 100) : 0,
          members: [],
          memberProgress,
          requisitos: requisitosComInstrucao,
          ensinadosCount,
          instrucaoPercentage: requisitos.length > 0 ? Math.round((ensinadosCount / requisitos.length) * 100) : 0,
        };
      });

      setClasses(classesFormatadas as MemberClass[]);
    } catch (error) {
      console.error('Erro ao carregar classes:', error);
      setClasses([]);
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

  const buildClassProgress = (classe: MemberClass): ClassProgress => {
    const areas = getClassAreasData(classe.requisitos || []);
    const totalReqs = areas.reduce((acc, a) => acc + a.requirements.length, 0);
    return {
      classId: classe.id,
      className: classe.nome,
      classColor: classe.cor,
      areas,
      completedRequirements: isInstrutorMode ? (classe.ensinadosCount || 0) : 0,
      totalRequirements: totalReqs,
      progressPercentage: isInstrutorMode ? (classe.instrucaoPercentage || 0) : 0,
    };
  };

  const handleClassClick = (classe: MemberClass) => {
    const classProgress = buildClassProgress(classe);
    setSelectedClassProgress(classProgress);

    if (isInstrutorMode) {
      const totalReqs = classProgress.areas.reduce((acc, a) => acc + a.requirements.length, 0);
      setInstrucaoProgress({
        total: totalReqs,
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

    // Atualizar localmente para não precisar recarregar tudo
    setSelectedMemberProgress(prev => {
      if (!prev) return null;
      const updatedAreas = prev.areas.map(area => ({
        ...area,
        requirements: area.requirements.map((req: any) =>
          req.id === requisitoId ? { ...req, completed: completado } : req
        ),
      }));
      const completedCount = updatedAreas.reduce(
        (acc: number, a: any) => acc + a.requirements.filter((r: any) => r.completed).length, 0
      );
      const totalReqs = updatedAreas.reduce((acc, a) => acc + a.requirements.length, 0);
      return {
        ...prev,
        areas: updatedAreas,
        completedRequirements: completedCount,
        progressPercentage: totalReqs > 0 ? Math.round((completedCount / totalReqs) * 100) : 0,
      };
    });
  };

  const handleSalvarInstrucao = async (requisitoId: string, ensinou: boolean) => {
    if (!selectedClassProgress) {
      addToast({ type: 'error', title: 'Erro', message: 'Selecione uma classe primeiro.' });
      return;
    }
    try {
      await salvarInstrucaoRequisito(selectedClassProgress.classId, requisitoId, ensinou);

      // Atualizar o progresso local e as areas do modal com os dados frescos
      const total = instrucaoProgress?.total || selectedClassProgress.totalRequirements;
      const ensinados = ensinou
        ? (instrucaoProgress?.ensinados || 0) + 1
        : Math.max(0, (instrucaoProgress?.ensinados || 0) - 1);
      const percentage = Math.round((ensinados / total) * 100);

      setInstrucaoProgress({ total, ensinados, percentage });

      // Atualizar areas do selectedClassProgress com o novo status
      setSelectedClassProgress(prev => {
        if (!prev) return null;
        return {
          ...prev,
          areas: prev.areas.map(area => ({
            ...area,
            requirements: area.requirements.map((req: any) =>
              req.id === requisitoId ? { ...req, ensinou } : req
            ),
          })),
          completedRequirements: ensinados,
          progressPercentage: percentage,
        };
      });
    } catch (error) {
      console.error('Erro ao salvar instrução:', error);
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao salvar instrução' });
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

  const classesVisiveis = showAllClasses
    ? classes
    : classesQueInstrui.length > 0
      ? classes.filter(c => classesQueInstrui.includes(c.id))
      : [];
  const filteredClasses = classesVisiveis;
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
        key={selectedClassProgress?.classId || selectedMemberProgress?.memberId}
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