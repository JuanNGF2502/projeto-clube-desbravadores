'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, RotateCcw } from 'lucide-react';
import { AppModal } from '@/components/ui/AppModal';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { useToast } from '@/components/ui/Toast';
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

interface ClassMemberProgress {
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

interface ClassRequirementsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  initialProgress: ClassMemberProgress | null;
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
}: ClassRequirementsPopupProps) {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const { addToast } = useToast();

  // Initialize state when progress changes
  useEffect(() => {
    if (initialProgress) {
      setAreas(JSON.parse(JSON.stringify(initialProgress.areas)));
      setProgressPercentage(initialProgress.progressPercentage);
      setCompletedCount(initialProgress.completedRequirements);
      setSelectedArea(null);
    }
  }, [initialProgress]);

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

  // Toggle requirement
  const toggleRequirement = (areaId: string, reqId: string) => {
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

    // Find the requirement that was toggled
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

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialProgress.className}
      description={`Progresso de ${initialProgress.memberName}`}
      size="lg"
    >
      <div className="space-y-5">
        {/* Member Info Header */}
        <div className="flex items-center gap-4 p-3 bg-card rounded-xl">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${initialProgress.classColor}40, ${initialProgress.classColor}20)`,
            }}
          >
            <span className="text-xl">👤</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-text-primary">{initialProgress.memberName}</p>
            <p className="text-sm text-muted">{initialProgress.memberUnidade}</p>
          </div>
          <AppBadge
            variant={progressPercentage === 100 ? 'success' : 'primary'}
            size="sm"
          >
            {progressPercentage}%
          </AppBadge>
        </div>

        {/* Overall Progress Bar */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted">Progresso geral</span>
            <span className="text-sm font-medium text-primary">
              {completedCount}/{totalReqs}
            </span>
          </div>
          <div className="h-3 bg-surface rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: initialProgress.classColor }}
            />
          </div>
        </div>

        {/* Areas Horizontal Scroll */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-text-secondary">Áreas de Atuação</h4>
            {progressPercentage > 0 && (
              <button
                onClick={resetAll}
                className="flex items-center gap-1 text-xs text-muted hover:text-danger transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Resetar
              </button>
            )}
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
            {areas.map((area) => {
              const areaCompleted = area.requirements.filter((r) => r.completed).length;
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
                      : 'border-border bg-card hover:border-primary/50',
                    isComplete && 'border-success/50 bg-success/5'
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{areaIcons[area.icon] || '📋'}</span>
                  </div>
                  <p className="text-sm font-medium text-text-primary truncate">{area.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted">
                      {areaCompleted}/{areaTotal}
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: isComplete ? '#22C55E' : initialProgress.classColor }}
                    >
                      {areaPercentage}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-surface rounded-full mt-2 overflow-hidden">
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
                  <h4 className="text-sm font-medium text-text-primary">
                    {currentArea.name}
                  </h4>
                </div>
                <AppBadge variant="secondary" size="sm">
                  {currentArea.requirements.filter((r) => r.completed).length}/{currentArea.requirements.length}
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
                      req.completed
                        ? 'bg-success/10 border-success/30'
                        : 'bg-card border-border hover:border-primary/30'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all cursor-pointer',
                          req.completed
                            ? 'bg-success'
                            : 'bg-surface border border-border hover:border-primary/50'
                        )}
                      >
                        {req.completed ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <span className="text-xs text-muted">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-sm font-medium',
                            req.completed ? 'text-success' : 'text-text-primary'
                          )}
                        >
                          {req.name}
                        </p>
                        <p className="text-xs text-muted mt-0.5">{req.description}</p>
                        {req.completed && req.completedAt && (
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
            <p className="text-sm text-muted text-center">
              👆 Selecione uma área acima para ver seus requisitos
            </p>
          </div>
        )}
      </div>
    </AppModal>
  );
}
