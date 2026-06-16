'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { History, ArrowLeft, Clock } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { TimelineItem, TimelineSkeleton } from '@/components/membros/TimelineItem';

import { getMembroById, getTransicoesPorMembro } from '@/lib/queries';

interface Params { id: string }

export default function MembroTimelinePage({ params }: { params: Promise<Params> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [membro, setMembro] = useState<any>(null);
  const [transicoes, setTransicoes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [membroData, transicoesData] = await Promise.all([
          getMembroById(resolvedParams.id),
          getTransicoesPorMembro(resolvedParams.id),
        ]);
        setMembro(membroData);
        setTransicoes(transicoesData || []);
      } catch (err) {
        console.error('Erro ao carregar timeline:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [resolvedParams.id]);

  return (
    <AppLayout
      title="Linha do Tempo"
      subtitle={membro?.nome || 'Carregando...'}
      backHref="/membros"
      showNavigation={false}
    >
      {isLoading ? (
        <AppCard padding="sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 animate-spin text-muted" />
            <span className="text-sm text-muted">Carregando histórico...</span>
          </div>
          <TimelineSkeleton />
        </AppCard>
      ) : transicoes.length > 0 ? (
        <AppCard padding="sm">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-text-primary">
              {transicoes.length} {transicoes.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-0">
              {transicoes.map((t: any, i: number) => (
                <TimelineItem key={t.id || i} item={t} isLast={i === transicoes.length - 1} />
              ))}
            </div>
          </div>
        </AppCard>
      ) : (
        <AppCard padding="sm">
          <AppEmptyState
            icon={<History className="w-12 h-12 text-muted" />}
            title="Nenhum registro"
            description="Este membro ainda não possui histórico de atividades."
          />
        </AppCard>
      )}

      <div className="mt-4">
        <AppButton
          variant="ghost"
          className="w-full"
          onClick={() => router.push('/membros')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Membros
        </AppButton>
      </div>
    </AppLayout>
  );
}
