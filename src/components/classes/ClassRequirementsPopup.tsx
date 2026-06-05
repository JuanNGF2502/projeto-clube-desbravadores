'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, RotateCcw, GraduationCap, UserCheck, BookOpen, Loader2, Trophy } from 'lucide-react';
import { AppModal } from '@/components/ui/AppModal';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/utils/cn';
import { DEFAULT_CLASSES } from '@/types';

interface Requirement {
  id: string;
  name: string;
  description: string;
  completed: boolean;
  completedAt?: Date;
  ensinou?: boolean;
  dataEnsino?: string;
}

interface Area {
  id: string;
  name: string;
  icon: string;
  requirements: Requirement[];
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

interface MemberProgress {
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

type ProgressData = ClassProgress | MemberProgress;

interface ClassRequirementsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  initialProgress: ProgressData | null;
  onSaveProgress?: (membroId: string, requisitoId: string, completado: boolean) => Promise<void>;
  // Props para modo instrutor (controle de ensino)
  modoInstrutor?: boolean;
  onSalvarInstrucao?: (requisitoId: string, ensinou: boolean) => Promise<void>;
  instrucaoProgress?: {
    total: number;
    ensinados: number;
    percentage: number;
  };
  onConcluirClasse?: (memberId: string) => Promise<void>;
}

const areaIcons: Record<string, string> = {
  book: '📖',
  map: '🧭',
  heart: '❤️',
  star: '⭐',
  shield: '🛡️',
};

export function ClassRequirementsPopup({
  isOpen,
  onClose,
  initialProgress,
  onSaveProgress,
  modoInstrutor = false,
  onSalvarInstrucao,
  instrucaoProgress,
  onConcluirClasse,
}: ClassRequirementsPopupProps) {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [ensinadosCount, setEnsinadosCount] = useState(0);
  const [instrucaoPercentage, setInstrucaoPercentage] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  // Initialize state when progress changes
  useEffect(() => {
    if (initialProgress) {
      const areasCopy = JSON.parse(JSON.stringify(initialProgress.areas));

      // Se modo instrutor, garantir que ensinou status está sendo usado
      if (modoInstrutor) {
        // Recalcular contagem de ensinados
        const totalEnsinados = areasCopy.reduce(
          (acc: number, area: any) => acc + area.requirements.filter((r: any) => r.ensinou).length,
          0
        );
        const totalReqs = areasCopy.reduce(
          (acc: number, area: any) => acc + area.requirements.length,
          0
        );
        setEnsinadosCount(totalEnsinados);
        setInstrucaoPercentage(Math.round((totalEnsinados / totalReqs) * 100));
      }

      setAreas(areasCopy);
      setProgressPercentage(initialProgress.progressPercentage);
      setCompletedCount(initialProgress.completedRequirements);
      setSelectedArea(null);

      // Se tem dados de instrução, atualizar contadores
      if (instrucaoProgress && modoInstrutor) {
        setEnsinadosCount(instrucaoProgress.ensinados);
        setInstrucaoPercentage(instrucaoProgress.percentage);
      }
    }
  }, [initialProgress, instrucaoProgress, modoInstrutor]);

  // Check if it's a member progress or class progress
  const isMemberProgress = (progress: ProgressData): progress is MemberProgress => {
    return 'memberId' in progress;
  };

  // Calculate progress
  const calculateProgress = (updatedAreas: Area[]) => {
    const totalCompleted = updatedAreas.reduce(
      (acc, area) => acc + area.requirements.filter((r) => r.completed).length,
      0
    );
    const totalReqs = updatedAreas.reduce(
      (acc, area) => acc + area.requirements.length,
      0
    );
    return {
      percentage: Math.round((totalCompleted / totalReqs) * 100),
      completed: totalCompleted,
    };
  };

  // Toggle requirement (para membro) ou toggle ensino (para instrutor)
  const toggleRequirement = async (areaId: string, reqId: string) => {
    const isMemberProgressData = initialProgress && 'memberId' in initialProgress;
    const memberId = isMemberProgressData ? (initialProgress as MemberProgress).memberId : null;

    // Se for modo instrutor, tratar como ensino
    if (modoInstrutor && onSalvarInstrucao) {
      setIsSaving(true);
      try {
        const currentReq = areas
          .find(a => a.id === areaId)
          ?.requirements.find(r => r.id === reqId);

        const novoStatus = !(currentReq?.ensinou);

        console.log('Popup - chamando onSalvarInstrucao:', reqId, novoStatus);
        await onSalvarInstrucao(reqId, novoStatus);
        console.log('Popup - retorno do onSalvarInstrucao');

        // Atualizar estado local
        const updatedAreas = areas.map((area) => {
          if (area.id === areaId) {
            return {
              ...area,
              requirements: area.requirements.map((req) => {
                if (req.id === reqId) {
                  return {
                    ...req,
                    ensinou: novoStatus,
                    dataEnsino: novoStatus ? new Date().toISOString() : undefined,
                  };
                }
                return req;
              }),
            };
          }
          return area;
        });

        setAreas(updatedAreas);

        // Recalcular ensinados
        const totalEnsinados = updatedAreas.reduce(
          (acc, area) => acc + area.requirements.filter((r) => r.ensinou).length,
          0
        );
        const totalReqs = updatedAreas.reduce(
          (acc, area) => acc + area.requirements.length,
          0
        );
        setEnsinadosCount(totalEnsinados);
        setInstrucaoPercentage(Math.round((totalEnsinados / totalReqs) * 100));

        if (novoStatus) {
          addToast({
            type: 'success',
            title: '✓ Requisito ensinado',
            message: currentReq?.name || 'Requisito',
          });
        } else {
          addToast({
            type: 'warning',
            title: '✗ Ensino removido',
            message: currentReq?.name || 'Requisito',
          });
        }
      } catch (error) {
        console.error('Erro ao salvar instrução:', error);
        addToast({
          type: 'error',
          title: 'Erro',
          message: 'Falha ao salvar instrução',
        });
      } finally {
        setIsSaving(false);
      }
      return;
    }

    // Se for progresso de membro e houver callback, salvar no banco
    if (memberId && onSaveProgress) {
      setIsSaving(true);
      try {
        // Encontrar o requisito atual para inverter
        const currentReq = areas
          .find(a => a.id === areaId)
          ?.requirements.find(r => r.id === reqId);

        if (currentReq) {
          await onSaveProgress(memberId, reqId, !currentReq.completed);
        }
      } catch (error) {
        console.error('Erro ao salvar progresso:', error);
        addToast({
          type: 'error',
          title: 'Erro',
          message: 'Falha ao salvar progresso',
        });
        setIsSaving(false);
        return;
      }
      setIsSaving(false);
    }

    const updatedAreas = areas.map((area) => {
      if (area.id === areaId) {
        return {
          ...area,
          requirements: area.requirements.map((req) => {
            if (req.id === reqId) {
              const newCompleted = !req.completed;
              return {
                ...req,
                completed: newCompleted,
                completedAt: newCompleted ? new Date() : undefined,
              };
            }
            return req;
          }),
        };
      }
      return area;
    });

    setAreas(updatedAreas);

    const { percentage, completed } = calculateProgress(updatedAreas);
    setProgressPercentage(percentage);
    setCompletedCount(completed);

    const req = updatedAreas
      .find((a) => a.id === areaId)
      ?.requirements.find((r) => r.id === reqId);

    if (req?.completed) {
      addToast({
        type: 'success',
        title: '✓ Requisito concluído',
        message: req.name,
      });
    } else {
      addToast({
        type: 'warning',
        title: '✗ Requisito desmarcado',
        message: req?.name || 'Requisito',
      });
    }
  };

  // Reset all requirements
  const resetAll = () => {
    const resetAreas = areas.map((area) => ({
      ...area,
      requirements: area.requirements.map((req) => ({
        ...req,
        completed: false,
        completedAt: undefined,
      })),
    }));

    setAreas(resetAreas);
    setProgressPercentage(0);
    setCompletedCount(0);

    addToast({
      type: 'info',
      title: 'Progresso resetado',
      message: 'Todos os requisitos foram desmarcados',
    });
  };

  if (!initialProgress) return null;

  const totalReqs = areas.reduce((acc, area) => acc + area.requirements.length, 0);
  const currentArea = areas.find((a) => a.id === selectedArea);
  const showMemberInfo = isMemberProgress(initialProgress);

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialProgress.className}
      description={showMemberInfo ? `Progresso de ${(initialProgress as MemberProgress).memberName}` : 'Requisitos da Classe'}
      size="lg"
    >
      <div className="space-y-5">
        {/* Header - Member or Class Info */}
        {showMemberInfo ? (
          <div className="flex items-center gap-4 p-3 rounded-xl" style={{ backgroundColor: 'var(--card-color)' }}>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${initialProgress.classColor}40, ${initialProgress.classColor}20)`,
              }}
            >
              <span className="text-xl">👤</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium" style={{ color: 'var(--text-color)' }}>{(initialProgress as MemberProgress).memberName}</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary-color)' }}>{(initialProgress as MemberProgress).memberUnidade}</p>
            </div>
            <AppBadge
              variant={progressPercentage === 100 ? 'success' : 'primary'}
              size="sm"
            >
              {progressPercentage}%
            </AppBadge>
          </div>
        ) : (
          <div className="flex items-center gap-4 p-3 rounded-xl" style={{ backgroundColor: 'var(--card-color)' }}>
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${initialProgress.classColor}40, ${initialProgress.classColor}20)`,
              }}
            >
              {(() => {
                const classeInfo = DEFAULT_CLASSES.find(c => c.id === initialProgress.classId);
                return classeInfo?.imagem ? (
                  <img
                    src={classeInfo.imagem}
                    alt={classeInfo.nome}
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <BookIcon className="w-6 h-6" style={{ color: initialProgress.classColor }} />
                );
              })()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium" style={{ color: 'var(--text-color)' }}>{initialProgress.className}</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary-color)' }}>Classe {initialProgress.classId} de {DEFAULT_CLASSES.length}</p>
            </div>
            <AppBadge
              variant={progressPercentage === 100 ? 'success' : 'primary'}
              size="sm"
            >
              {progressPercentage}%
            </AppBadge>
          </div>
        )}

        {/* Overall Progress Bar */}
        <div>
          {modoInstrutor ? (
            // Modo Instrutor - Progresso de Ensino
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>Controle de Instrução</span>
                <AppBadge
                  variant={instrucaoPercentage === 100 ? 'success' : 'warning'}
                  size="sm"
                >
                  {instrucaoPercentage}%
                </AppBadge>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-xs" style={{ color: 'var(--text-secondary-color)' }}>Requisitos ensinados</span>
                <span className="text-xs font-medium text-primary">
                  {ensinadosCount}/{totalReqs}
                </span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-color)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${instrucaoPercentage}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
              <p className="text-xs" style={{ color: 'var(--text-secondary-color)' }}>
                Clique em cada requisito para marcar como ensinado ou não ensinado
              </p>
            </div>
          ) : (
            // Modo Member - Progresso de Conclusão
            <>
              <div className="flex justify-between mb-2">
                <span className="text-sm" style={{ color: 'var(--text-secondary-color)' }}>Progresso geral</span>
                <span className="text-sm font-medium text-primary">
                  {completedCount}/{totalReqs}
                </span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-color)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: initialProgress.classColor }}
                />
              </div>
            </>
          )}
        </div>

        {/* Concluir Classe Button */}
        {!modoInstrutor && progressPercentage === 100 && completedCount === totalReqs && onConcluirClasse && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-success/10 border border-success/30"
          >
            <Trophy className="w-8 h-8 text-success" />
            <p className="text-sm font-semibold text-success text-center">
              Todos os requisitos foram concluídos!
            </p>
            <AppButton
              onClick={async () => {
                if (initialProgress && 'memberId' in initialProgress) {
                  await onConcluirClasse(initialProgress.memberId);
                  onClose();
                }
              }}
              variant="primary"
              className="mt-1"
            >
              <Trophy className="w-4 h-4 mr-1" />
              Concluir Classe
            </AppButton>
          </motion.div>
        )}

        {/* Areas Horizontal Scroll */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium" style={{ color: 'var(--text-secondary-color)' }}>Áreas de Atuação</h4>
            {progressPercentage > 0 && (
              <button
                onClick={resetAll}
                className="flex items-center gap-1 text-xs hover:text-danger transition-colors"
                style={{ color: 'var(--text-secondary-color)' }}
              >
                <RotateCcw className="w-3 h-3" />
                Resetar
              </button>
            )}
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2" style={{ scrollbarWidth: 'none' }}>
            {areas.map((area) => {
              // No modo instrutor, contar ensinados. No modo membro, contar completados
              const areaCompleted = modoInstrutor
                ? area.requirements.filter((r) => r.ensinou).length
                : area.requirements.filter((r) => r.completed).length;
              const areaTotal = area.requirements.length;
              const areaPercentage = Math.round((areaCompleted / areaTotal) * 100);
              const isSelected = selectedArea === area.id;
              const isComplete = areaPercentage === 100;

              return (
                <motion.button
                  key={area.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedArea(isSelected ? null : area.id)}
                  className={cn(
                    'flex-shrink-0 w-32 p-3 rounded-xl border transition-all text-left',
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border',
                    isComplete && 'border-success/50 bg-success/5'
                  )}
                  style={{ backgroundColor: isSelected ? undefined : 'var(--card-color)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{areaIcons[area.icon] || '📋'}</span>
                  </div>
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-color)' }}>{area.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs" style={{ color: 'var(--text-secondary-color)' }}>
                      {areaCompleted}/{areaTotal}
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: isComplete ? '#22C55E' : initialProgress.classColor }}
                    >
                      {areaPercentage}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full mt-2 overflow-hidden" style={{ backgroundColor: 'var(--surface-color)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${areaPercentage}%` }}
                      transition={{ duration: 0.3 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: isComplete ? '#22C55E' : initialProgress.classColor }}
                    />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Requirements for Selected Area */}
        <AnimatePresence mode="wait">
          {currentArea && (
            <motion.div
              key={currentArea.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{areaIcons[currentArea.icon] || '📋'}</span>
                  <h4 className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>
                    {currentArea.name}
                  </h4>
                </div>
                <AppBadge variant="secondary" size="sm">
                  {modoInstrutor
                    ? `${currentArea.requirements.filter((r) => r.ensinou).length}/${currentArea.requirements.length}`
                    : `${currentArea.requirements.filter((r) => r.completed).length}/${currentArea.requirements.length}`
                  }
                </AppBadge>
              </div>

              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {currentArea.requirements.map((req, index) => (
                  <motion.button
                    key={req.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => toggleRequirement(currentArea.id, req.id)}
                    className={cn(
                      'w-full p-3 rounded-xl border transition-all text-left',
                      modoInstrutor
                        ? req.ensinou
                          ? 'bg-primary/10 border-primary/30'
                          : 'border-border'
                        : req.completed
                        ? 'bg-success/10 border-success/30'
                        : 'border-border'
                    )}
                    style={{ backgroundColor: (modoInstrutor ? req.ensinou : req.completed) ? undefined : 'var(--card-color)' }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all cursor-pointer',
                          modoInstrutor
                            ? req.ensinou
                              ? 'bg-primary'
                              : 'border'
                            : req.completed
                            ? 'bg-success'
                            : 'border'
                        )}
                        style={req.completed || req.ensinou ? undefined : { borderColor: 'var(--border-color)', backgroundColor: 'var(--surface-color)' }}
                      >
                        {req.completed || req.ensinou ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--text-secondary-color)' }}>{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-sm font-medium',
                            (modoInstrutor ? req.ensinou : req.completed) ? 'text-primary' : ''
                          )}
                          style={(modoInstrutor ? req.ensinou : req.completed) ? undefined : { color: 'var(--text-color)' }}
                        >
                          {req.name}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary-color)' }}>{req.description}</p>
                        {modoInstrutor && req.ensinou && req.dataEnsino && (
                          <p className="text-xs text-primary mt-1 flex items-center gap-1">
                            <UserCheck className="w-3 h-3" />
                            Ensinado em {new Date(req.dataEnsino).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                        {!modoInstrutor && req.completed && req.completedAt && (
                          <p className="text-xs text-success mt-1">
                            ✓ Concluído em {new Date(req.completedAt).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!selectedArea && (
          <div className="flex items-center justify-center py-4">
            <p className="text-sm text-center" style={{ color: 'var(--text-secondary-color)' }}>
              👆 Selecione uma área acima para ver seus requisitos
            </p>
          </div>
        )}
      </div>
    </AppModal>
  );
}

// Simple Book icon component
function BookIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}