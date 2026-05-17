'use client';

import { useState } from 'react';
import { Search, UserMinus, CheckCircle, ChevronRight, Calendar, User, Shield, Loader2 } from 'lucide-react';
import { AppModal } from '@/components/ui/AppModal';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { cn } from '@/utils/cn';
import { getCargoByTipo } from '@/types';

interface MembroInativoModalProps {
  isOpen: boolean;
  onClose: () => void;
  membrosInativos: any[];
  onAtivar: (membro: any) => Promise<void>;
  onVerDetalhes: (membro: any) => void;
  unidades: any[];
  unidadesCores: Record<string, string[]>;
}

export function MembroInativoModal({
  isOpen,
  onClose,
  membrosInativos,
  onAtivar,
  onVerDetalhes,
  unidades,
  unidadesCores,
}: MembroInativoModalProps) {
  const [search, setSearch] = useState('');
  const [membroSelecionado, setMembroSelecionado] = useState<any | null>(null);
  const [isActivating, setIsActivating] = useState(false);

  const membrosFiltrados = membrosInativos.filter(m =>
    m.nome.toLowerCase().includes(search.toLowerCase())
  );

  const handleVerDetalhes = (membro: any) => {
    setMembroSelecionado(membro);
  };

  const getUnidadeNome = (unidadeId?: string) => {
    if (!unidadeId) return 'Sem unidade';
    const unidade = unidades.find(u => u.id === unidadeId);
    return unidade?.nome || 'Sem unidade';
  };

  const formatarData = (data?: string) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const calcularIdade = (dataNasc: string): number => {
    const hoje = new Date();
    const nasc = new Date(dataNasc);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const mes = hoje.getMonth() - nasc.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }
    return idade;
  };

  // Se há um membro selecionado, mostrar detalhes
  if (membroSelecionado) {
    const cargosAtivos = membroSelecionado.membros_cargos?.filter((c: any) => c.ativo) || [];

    return (
      <AppModal
        isOpen={true}
        onClose={() => setMembroSelecionado(null)}
        title={
          <div className="flex items-center gap-2">
            <span>Membro Inativo</span>
            <AppBadge variant="danger" size="sm">Inativo</AppBadge>
          </div>
        }
        size="lg"
        scrollable
      >
        {/* Header com avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 bg-muted"
          >
            <span className="text-3xl font-bold text-muted">{membroSelecionado.nome.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-text-primary">{membroSelecionado.nome}</h2>
            {membroSelecionado.nome_social && (
              <p className="text-sm text-muted">Nome social: {membroSelecionado.nome_social}</p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <AppBadge variant="secondary">
                {getUnidadeNome(membroSelecionado.unidade_id)}
              </AppBadge>
              {membroSelecionado.data_desligamento && (
                <AppBadge variant="warning">
                  Desligado em {formatarData(membroSelecionado.data_desligamento)}
                </AppBadge>
              )}
            </div>
          </div>
        </div>

        {/* Informações */}
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
                <p className="font-medium text-text-primary">
                  {membroSelecionado.sexo === 'M' ? 'Masculino' : 'Feminino'}
                </p>
              </div>
              <div>
                <p className="text-muted text-xs">Idade</p>
                <p className="font-medium text-text-primary">
                  {calcularIdade(membroSelecionado.data_nascimento)} anos
                </p>
              </div>
              <div>
                <p className="text-muted text-xs">Nascimento</p>
                <p className="font-medium text-text-primary">
                  {formatarData(membroSelecionado.data_nascimento)}
                </p>
              </div>
              <div>
                <p className="text-muted text-xs">Membro desde</p>
                <p className="font-medium text-text-primary">
                  {formatarData(membroSelecionado.data_cadastro)}
                </p>
              </div>
            </div>
          </AppCard>

          {/* Contato */}
          {(membroSelecionado.telefone || membroSelecionado.email) && (
            <AppCard padding="sm">
              <h3 className="font-semibold text-text-primary mb-3">Contato</h3>
              <div className="space-y-2 text-sm">
                {membroSelecionado.telefone && (
                  <p><span className="text-muted">Telefone:</span> {membroSelecionado.telefone}</p>
                )}
                {membroSelecionado.email && (
                  <p><span className="text-muted">E-mail:</span> {membroSelecionado.email}</p>
                )}
              </div>
            </AppCard>
          )}

          {/* Responsável */}
          {membroSelecionado.responsavel && (
            <AppCard padding="sm">
              <h3 className="font-semibold text-text-primary mb-3">Responsável</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-muted">Nome:</span> {membroSelecionado.responsavel.nome}</p>
                <p><span className="text-muted">Telefone:</span> {membroSelecionado.responsavel.telefone}</p>
                <p><span className="text-muted">Parentesco:</span> {membroSelecionado.responsavel.parentesco}</p>
              </div>
            </AppCard>
          )}

          {/* Motivo do desligamento */}
          {membroSelecionado.motivo_desligamento && (
            <AppCard padding="sm" className="bg-warning/10 border-warning/30">
              <h3 className="font-semibold text-text-primary mb-2">Motivo do Desligamento</h3>
              <p className="text-sm text-muted">{membroSelecionado.motivo_desligamento}</p>
            </AppCard>
          )}

          {/* Observações */}
          {membroSelecionado.observacoes && (
            <AppCard padding="sm">
              <h3 className="font-semibold text-text-primary mb-2">Observações</h3>
              <p className="text-sm text-muted">{membroSelecionado.observacoes}</p>
            </AppCard>
          )}
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-border">
          <AppButton
            variant="secondary"
            onClick={() => setMembroSelecionado(null)}
            className="flex-1"
          >
            Voltar
          </AppButton>
          <AppButton
            variant="primary"
            onClick={() => onVerDetalhes(membroSelecionado)}
            className="flex-1"
          >
            Editar
          </AppButton>
          <AppButton
            variant="success"
            onClick={async () => {
              setIsActivating(true);
              try {
                await onAtivar(membroSelecionado);
                setMembroSelecionado(null);
              } finally {
                setIsActivating(false);
              }
            }}
            className="flex-1"
            disabled={isActivating}
          >
            {isActivating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            {isActivating ? 'Ativando...' : 'Ativar'}
          </AppButton>
        </div>
      </AppModal>
    );
  }

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <UserMinus className="w-5 h-5 text-muted" />
          <span>Membros Inativos</span>
          <AppBadge variant="secondary" size="sm">{membrosInativos.length}</AppBadge>
        </div>
      }
      size="lg"
      scrollable
    >
      {/* Search */}
      <div className="mb-4">
        <AppInput
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Lista de inativos */}
      {membrosFiltrados.length === 0 ? (
        <div className="text-center py-8">
          <UserMinus className="w-12 h-12 mx-auto text-muted mb-3" />
          <p className="text-muted">
            {search ? 'Nenhum membro inativo encontrado' : 'Nenhum membro inativo'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {membrosFiltrados.map((membro) => (
            <button
              key={membro.id}
              onClick={() => handleVerDetalhes(membro)}
              className="w-full p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-muted">{membro.nome.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary">{membro.nome}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted">
                        {getUnidadeNome(membro.unidade_id)}
                      </span>
                      {membro.data_desligamento && (
                        <>
                          <span className="text-muted">•</span>
                          <span className="text-xs text-muted">
                            Desligado em {formatarData(membro.data_desligamento)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted" />
              </div>
              {membro.motivo_desligamento && (
                <p className="mt-2 text-xs text-muted truncate">{membro.motivo_desligamento}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </AppModal>
  );
}