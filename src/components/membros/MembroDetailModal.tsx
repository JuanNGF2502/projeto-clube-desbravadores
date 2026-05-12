'use client';

import { User, Calendar, Phone, Mail, Shield, Users, Star, Clock, Award } from 'lucide-react';
import { AppModal } from '@/components/ui/AppModal';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { cn } from '@/utils/cn';
import {
  Usuario,
  Cargo,
  CargoTipo,
  getCargoByTipo,
  getClasseById,
  DEFAULT_CLASSES,
} from '@/types';

interface MembroDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  membro: Usuario | null;
  unidadeCores?: string[];
}

export function MembroDetailModal({
  isOpen,
  onClose,
  membro,
  unidadeCores,
}: MembroDetailModalProps) {
  if (!membro) return null;

  const cargosAtivos = membro.cargos?.filter(c => c.ativo) || [];
  const classesAtuais = membro.classesAtuais?.map(c => getClasseById(c.classeId)).filter(Boolean) || [];
  const classesConcluidas = membro.classesConcluidas?.filter(c => c.concluido) || [];

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

  const formatarData = (data: Date): string => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getCargoPrincipal = (): Cargo | null => {
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
        return getCargoByTipo(tipo) || null;
      }
    }
    return null;
  };

  const cargoPrincipal = getCargoPrincipal();

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes do Membro"
      size="lg"
      scrollable
    >
      {/* Header com avatar */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: unidadeCores
              ? `linear-gradient(135deg, ${unidadeCores[0]}, ${unidadeCores[2]})`
              : cargoPrincipal?.cor || '#64748B',
          }}
        >
          {membro.foto ? (
            <img src={membro.foto} alt={membro.nome} className="w-full h-full rounded-2xl object-cover" />
          ) : (
            <span className="text-3xl font-bold text-white">{membro.nome.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-text-primary">{membro.nome}</h2>
          {membro.nomeSocial && (
            <p className="text-sm text-muted">Nome social: {membro.nomeSocial}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {cargoPrincipal && (
              <AppBadge color={cargoPrincipal.cor}>
                {cargoPrincipal.nome}
              </AppBadge>
            )}
            {cargosAtivos.length > 1 && (
              <AppBadge variant="secondary" size="sm">
                +{cargosAtivos.length - 1} cargo{cargosAtivos.length > 2 ? 's' : ''}
              </AppBadge>
            )}
            {!membro.ativo && (
              <AppBadge variant="danger">Inativo</AppBadge>
            )}
          </div>
        </div>
      </div>

      {/* Informações básicas */}
      <div className="space-y-4">
        {/* Dados pessoais */}
        <AppCard padding="sm">
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Dados Pessoais
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted text-xs">Sexo</p>
              <p className="font-medium text-text-primary">{membro.sexo === 'M' ? 'Masculino' : 'Feminino'}</p>
            </div>
            <div>
              <p className="text-muted text-xs">Idade</p>
              <p className="font-medium text-text-primary">{calcularIdade(membro.dataNascimento)} anos</p>
            </div>
            <div>
              <p className="text-muted text-xs">Nascimento</p>
              <p className="font-medium text-text-primary">{formatarData(membro.dataNascimento)}</p>
            </div>
            <div>
              <p className="text-muted text-xs">Membro desde</p>
              <p className="font-medium text-text-primary">{formatarData(membro.dataCadastro)}</p>
            </div>
          </div>
        </AppCard>

        {/* Contato */}
        {(membro.telefone || membro.email || membro.responsavel) && (
          <AppCard padding="sm">
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              Contato
            </h3>
            <div className="space-y-2 text-sm">
              {membro.telefone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted" />
                  <span className="text-text-primary">{membro.telefone}</span>
                </div>
              )}
              {membro.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted" />
                  <span className="text-text-primary">{membro.email}</span>
                </div>
              )}
              {membro.responsavel && (
                <div className="mt-2 pt-2 border-t border-border">
                  <p className="text-xs text-muted mb-1">Responsável</p>
                  <p className="font-medium text-text-primary">{membro.responsavel.nome}</p>
                  <p className="text-sm text-muted">{membro.responsavel.telefone} ({membro.responsavel.parentesco})</p>
                </div>
              )}
            </div>
          </AppCard>
        )}

        {/* Classes */}
        <AppCard padding="sm">
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            Classes
          </h3>
          <div className="space-y-2">
            {classesAtuais.length > 0 && (
              <div>
                <p className="text-xs text-muted mb-2">Em andamento</p>
                <div className="flex flex-wrap gap-2">
                  {classesAtuais.map(classe => classe && (
                    <div
                      key={classe.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{ backgroundColor: `${classe.cor}20` }}
                    >
                      {classe.imagem && (
                        <img
                          src={classe.imagem}
                          alt={classe.nome}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                      )}
                      <span className="font-medium text-text-primary">{classe.nome}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {classesConcluidas.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-muted mb-2">Concluídas ({classesConcluidas.length})</p>
                <div className="flex flex-wrap gap-2">
                  {membro.classesConcluidas
                    .filter(c => c.concluido)
                    .map((classe, idx) => {
                      const info = getClasseById(classe.classeId);
                      return info ? (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-2 py-1 rounded-lg"
                          style={{ backgroundColor: `${info.cor}20` }}
                        >
                          {info.imagem && (
                            <img
                              src={info.imagem}
                              alt={info.nome}
                              className="w-6 h-6 rounded-md object-cover"
                            />
                          )}
                          <span className="text-sm font-medium" style={{ color: info.cor }}>
                            {info.nome}
                          </span>
                        </div>
                      ) : null;
                    })}
                </div>
              </div>
            )}

            {classesAtuais.length === 0 && classesConcluidas.length === 0 && (
              <p className="text-sm text-muted">Nenhuma classe iniciada</p>
            )}
          </div>
        </AppCard>

        {/* Cargos */}
        {cargosAtivos.length > 0 && (
          <AppCard padding="sm">
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Cargos
            </h3>
            <div className="flex flex-wrap gap-2">
              {cargosAtivos.map(cargo => {
                const info = getCargoByTipo(cargo.tipo);
                return info ? (
                  <AppBadge key={cargo.tipo} color={info.cor}>
                    {info.nome}
                  </AppBadge>
                ) : null;
              })}
            </div>
          </AppCard>
        )}

        {/* Especialidades */}
        {membro.especialidadesConcluidas && membro.especialidadesConcluidas.length > 0 && (
          <AppCard padding="sm">
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              Especialidades
            </h3>
            <div className="flex flex-wrap gap-2">
              <AppBadge variant="warning">
                {membro.especialidadesConcluidas.length} especialidade{membro.especialidadesConcluidas.length > 1 ? 's' : ''} concluída{membro.especialidadesConcluidas.length > 1 ? 's' : ''}
              </AppBadge>
            </div>
          </AppCard>
        )}

        {/* Observações */}
        {membro.observacoes && (
          <AppCard padding="sm">
            <h3 className="font-semibold text-text-primary mb-2">Observações</h3>
            <p className="text-sm text-muted">{membro.observacoes}</p>
          </AppCard>
        )}
      </div>
    </AppModal>
  );
}