'use client';

import { User, Calendar, Shield, BookOpen, Users } from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { cn } from '@/utils/cn';
import {
  Usuario,
  getCargoByTipo,
  getClasseById,
  DEFAULT_CLASSES,
  CargoTipo,
} from '@/types';

interface MembroCardProps {
  membro: Usuario;
  unidadeCores?: string[];
  onClick?: () => void;
  showDetails?: boolean;
}

export function MembroCard({
  membro,
  unidadeCores,
  onClick,
  showDetails = true,
}: MembroCardProps) {
  const cargosAtivos = membro.cargos.filter(c => c.ativo);
  const classesAtuais = membro.classesAtuais?.map(c => getClasseById(c.classeId)).filter(Boolean) || [];
  const classeAtual = classesAtuais[0];
  const classesConcluidasCount = membro.classesConcluidas.filter(c => c.concluido).length;

  const getCargoPrincipal = (): CargoTipo | null => {
    const ordemPrioridade: CargoTipo[] = [
      'ADMIN', 'REGIONAL', 'DIRETOR', 'DIRETOR_ASSOC',
      'DIRETOR_CLUBE', 'DIRETOR_ASSOC_CLUBE', 'SECRETARIO_CLUBE', 'TESOUREIRO_CLUBE',
      'CAPELAO_CLUBE', 'INSTRUTOR_CLASSE', 'INSTRUTOR_OU',
      'CONSELHEIRO', 'CONSELHEIRO_ASSOC',
      'CAPITAO', 'SECRETARIO', 'TESOUREIRO', 'ALMOXARIFE',
      'PADIOLEIRO', 'CAPELAO', 'ESPORTISTA', 'OUTRO',
      'DESBRAVADOR',
    ];

    for (const tipo of ordemPrioridade) {
      if (cargosAtivos.some(c => c.tipo === tipo)) {
        return tipo;
      }
    }
    return null;
  };

  const cargoPrincipal = getCargoPrincipal();
  const cargoInfo = cargoPrincipal ? getCargoByTipo(cargoPrincipal) : null;

  const calcularIdade = (dataNasc: Date): number => {
    const hoje = new Date();
    const nasc = new Date(dataNasc);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const mes = hoje.getMonth() - nasc.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }
    return idade;
  };

  const idade = calcularIdade(membro.dataNascimento);

  return (
    <AppCard
      hover={!!onClick}
      className={cn('cursor-pointer', !membro.ativo && 'opacity-60')}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: unidadeCores
              ? `linear-gradient(135deg, ${unidadeCores[0]}, ${unidadeCores[2]})`
              : cargoInfo?.cor || '#64748B',
          }}
        >
          {membro.foto ? (
            <img
              src={membro.foto}
              alt={membro.nome}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-white font-bold text-xl">
              {membro.nome.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-text-primary truncate">
              {membro.nome}
            </h4>
            {!membro.ativo && (
              <AppBadge variant="danger" size="sm">
                Inativo
              </AppBadge>
            )}
            {cargoInfo && (
              <AppBadge color={cargoInfo.cor} size="sm">
                {cargoInfo.nome}
              </AppBadge>
            )}
          </div>

          {showDetails && (
            <div className="flex items-center gap-3 mt-1 text-xs text-muted flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {idade} anos
              </span>

              {classesAtuais.length > 0 && (
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {classesAtuais.map((classe, i) => classe && (
                    <span
                      key={classe.id}
                      className="px-1.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${classe.cor}20`,
                        color: classe.cor,
                      }}
                    >
                      {classe.nome}{i < classesAtuais.length - 1 ? ',' : ''}
                    </span>
                  ))}
                </div>
              )}

              {classesConcluidasCount > 0 && (
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {classesConcluidasCount} concluída{classesConcluidasCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}

          {/* Cargos secundários */}
          {showDetails && cargosAtivos.length > 1 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {cargosAtivos
                .filter(c => c.tipo !== cargoPrincipal)
                .slice(0, 3)
                .map(c => {
                  const info = getCargoByTipo(c.tipo);
                  return info ? (
                    <AppBadge
                      key={c.tipo}
                      variant="secondary"
                      size="sm"
                      className="text-xs"
                    >
                      {info.nome}
                    </AppBadge>
                  ) : null;
                })}
              {cargosAtivos.length > 4 && (
                <AppBadge variant="secondary" size="sm" className="text-xs">
                  +{cargosAtivos.length - 4}
                </AppBadge>
              )}
            </div>
          )}
        </div>
      </div>
    </AppCard>
  );
}

// Componente para listar membros em uma grid
interface MembroGridProps {
  membros: Usuario[];
  unidadesCores?: Record<string, string[]>;
  onMembroClick?: (membro: Usuario) => void;
}

export function MembroGrid({
  membros,
  unidadesCores,
  onMembroClick,
}: MembroGridProps) {
  return (
    <div className="grid gap-3">
      {membros.map((membro) => (
        <MembroCard
          key={membro.id}
          membro={membro}
          unidadeCores={unidadesCores?.[membro.unidadeAtualId || '']}
          onClick={() => onMembroClick?.(membro)}
        />
      ))}
    </div>
  );
}
