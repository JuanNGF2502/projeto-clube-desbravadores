'use client';

import { History, ArrowUpRight, ArrowDownLeft, RefreshCw, GraduationCap, BadgeCheck, LogIn, LogOut } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface TimelineItemData {
  id: string;
  tipo: string;
  data: string | Date;
  descricao: string;
  observacoes?: string;
}

function getIcon(tipo: string) {
  switch (tipo) {
    case 'ENTRADA': return <LogIn className="w-4 h-4" />;
    case 'SAIDA': return <LogOut className="w-4 h-4" />;
    case 'TROCA_UNIDADE': return <RefreshCw className="w-4 h-4" />;
    case 'TROCA_CARGO': return <BadgeCheck className="w-4 h-4" />;
    case 'CONCLUIU_CLASSE':
    case 'INICIO_CLASSE': return <GraduationCap className="w-4 h-4" />;
    case 'PROMOCAO': return <ArrowUpRight className="w-4 h-4" />;
    case 'RECLASSIFICACAO': return <ArrowDownLeft className="w-4 h-4" />;
    default: return <History className="w-4 h-4" />;
  }
}

function getColor(tipo: string) {
  switch (tipo) {
    case 'ENTRADA': case 'CONCLUIU_CLASSE': case 'PROMOCAO':
      return 'bg-success text-success';
    case 'SAIDA': return 'bg-danger text-danger';
    case 'TROCA_UNIDADE': case 'RECLASSIFICACAO':
      return 'bg-warning text-warning';
    case 'TROCA_CARGO': return 'bg-primary text-primary';
    case 'INICIO_CLASSE': return 'bg-info text-info';
    default: return 'bg-muted text-muted';
  }
}

function getLabel(tipo: string) {
  const labels: Record<string, string> = {
    ENTRADA: 'Entrada no Clube',
    SAIDA: 'Saída do Clube',
    TROCA_UNIDADE: 'Transferência de Unidade',
    TROCA_CARGO: 'Mudança de Cargo',
    CONCLUIU_CLASSE: 'Conclusão de Classe',
    INICIO_CLASSE: 'Início de Classe',
    PROMOCAO: 'Promoção',
    RECLASSIFICACAO: 'Reclassificação',
  };
  return labels[tipo] || 'Atualização';
}

function formatDate(data: string | Date): string {
  const d = new Date(data);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function TimelineItem({ item, isLast }: { item: TimelineItemData; isLast?: boolean }) {
  return (
    <div className="relative flex items-start gap-3 pl-2">
      <div className={cn(
        'relative z-10 flex items-center justify-center w-8 h-8 rounded-full',
        getColor(item.tipo)
      )}>
        {getIcon(item.tipo)}
      </div>

      <div className="flex-1 min-w-0 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm text-text-primary">{getLabel(item.tipo)}</span>
          <span className="text-xs text-muted">{formatDate(item.data)}</span>
        </div>
        <p className="text-sm text-muted mt-0.5">{item.descricao}</p>
        {item.observacoes && (
          <p className="text-xs text-muted mt-1 italic">{item.observacoes}</p>
        )}
      </div>
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3 pl-2 animate-pulse">
          <div className="w-8 h-8 rounded-full bg-muted" />
          <div className="flex-1 space-y-2 pb-4">
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="h-3 w-64 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
