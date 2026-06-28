'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import { usePontuacao } from '@/contexts/PontuacaoContext';
import { cn } from '@/utils/cn';

interface ScoreItem {
  id: string;
  icon: LucideIcon;
  name: string;
  score: number;
  maxScore?: number;
}

interface ScoreCardProps {
  title?: string;
  items: ScoreItem[];
  total: number;
  className?: string;
}

export function ScoreCard({ title = 'Pontuação', items, total, className }: ScoreCardProps) {
  const { oculta } = usePontuacao();
  return (
    <AppCard padding="none" className={cn('overflow-hidden', className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      </div>

      {/* Items */}
      <div className="divide-y divide-border/50">
        {items.map((item) => (
          <ScoreItem
            key={item.id}
            icon={item.icon}
            name={item.name}
            score={item.score}
            maxScore={item.maxScore}
            oculta={oculta}
          />
        ))}
      </div>

      {/* Total Footer */}
      <TotalFooter total={total} oculta={oculta} />
    </AppCard>
  );
}

interface ScoreItemProps {
  icon: LucideIcon;
  name: string;
  score: number;
  maxScore?: number;
  oculta?: boolean;
}

export function ScoreItem({ icon: Icon, name, score, maxScore = 100, oculta = false }: ScoreItemProps) {
  const progress = oculta ? 0 : (score / maxScore) * 100;

  return (
    <div className="px-4 py-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-text-primary font-medium">{name}</span>
          <span className="text-sm font-bold text-primary">
            {oculta ? '—' : `${score} pts`}
          </span>
        </div>
        <div className="h-1.5 bg-card rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: oculta ? '0%' : `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-primary rounded-full"
          />
        </div>
      </div>
    </div>
  );
}

interface TotalFooterProps {
  total: number;
  oculta?: boolean;
}

export function TotalFooter({ total, oculta = false }: TotalFooterProps) {
  return (
    <div className="px-4 py-3 bg-surface border-t border-border flex items-center justify-between">
      <span className="text-sm font-semibold text-text-primary">Total</span>
      <span className="text-lg font-bold gold-gradient-text">
        {oculta ? '—' : `${total} pts`}
      </span>
    </div>
  );
}
