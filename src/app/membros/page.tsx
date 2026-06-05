'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  User,
  Shield,
  Loader2,
  UserMinus,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MembroFormModal, MembroCard, MembroDetailModal, MembroInativoModal } from '@/components/membros';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppCard } from '@/components/ui/AppCard';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase/client';
import { getMembros, getUnidades, updateMembro, createMembroCargo, createMembroClasseAtual, createMembroUnidade, deleteMembroCargos, deleteMembroClassesAtuais, syncProfileFromMembro } from '@/lib/queries';
import { Unit, CargoTipo, DEFAULT_CLASSES } from '@/types';
import { useClubId } from '@/hooks';

interface MembroData {
  id: string;
  nome: string;
  nome_social?: string;
  sexo: string;
  data_nascimento: string;
  data_cadastro?: string;
  data_desligamento?: string;
  telefone?: string;
  email?: string;
  foto?: string;
  ativo: boolean;
  unidade_id?: string;
  observacoes?: string;
  motivo_desligamento?: string;
  endereco?: any;
  responsavel?: any;
  unidade?: {
    nome: string;
    cores: string[];
    genero: string;
  };
  membros_cargos?: {
    cargo_tipo: string;
    cargo?: {
      nome: string;
      cor: string;
    };
    ativo: boolean;
    data_atribuicao?: string;
    unidade_id?: string;
    classe_id?: string;
    observacao?: string;
  }[];
  membros_classes_atuais?: {
    classe_id: string;
    classe?: {
      nome: string;
      cor: string;
    };
    data_inicio?: string;
  }[];
}

export default function MembrosPage() {
  const [membros, setMembros] = useState<MembroData[]>([]);
  const [unidades, setUnidades] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'ATIVOS' | 'INATIVOS'>('ATIVOS');
  const [filtroUnidade, setFiltroUnidade] = useState<string>('TODOS');
  const [showForm, setShowForm] = useState(false);
  const [editandoMembro, setEditandoMembro] = useState<MembroData | null>(null);
  const [showFiltros, setShowFiltros] = useState(false);
  const [membroSelecionado, setMembroSelecionado] = useState<any | null>(null);
  const [showInativos, setShowInativos] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  const CLUB_ID = useClubId();

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      const [membrosData, unidadesData] = await Promise.all([
        getMembros(CLUB_ID),
        getUnidades(CLUB_ID),
      ]);
      setMembros(membrosData || []);
      setUnidades(unidadesData || []);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error?.message || error);
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Falha ao carregar dados',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (CLUB_ID) {
      carregarDados();
    }
  }, [CLUB_ID]);

  const membrosFiltrados = useMemo(() => {
    return membros.filter((membro) => {
      // Busca
      if (search && !membro.nome.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }

      // Status
      if (filtroStatus === 'ATIVOS' && !membro.ativo) return false;
      if (filtroStatus === 'INATIVOS' && membro.ativo) return false;

      // Unidade
      if (filtroUnidade !== 'TODOS' && membro.unidade_id !== filtroUnidade) {
        return false;
      }

      return true;
    });
  }, [membros, search, filtroStatus, filtroUnidade]);

  const estatisticas = useMemo(() => ({
    total: membros.length,
    ativos: membros.filter(m => m.ativo).length,
    inativos: membros.filter(m => !m.ativo).length,
  }), [membros]);

  const membrosInativos = useMemo(() => {
    return membros.filter(m => !m.ativo);
  }, [membros]);

  const unidadesCores = useMemo(() => {
    return unidades.reduce((acc, u) => {
      acc[u.id] = u.cores;
      return acc;
    }, {} as Record<string, string[]>);
  }, [unidades]);

  const handleSalvarMembro = async (dados: any) => {
    try {
      setIsSaving(true);
      const membroUnidadeId = dados.unidadeAtualId || dados.unidadeId || null;

      const membroData = {
        nome: dados.nome,
        nome_social: dados.nomeSocial || null,
        sexo: dados.sexo,
        data_nascimento: dados.dataNascimento instanceof Date
          ? dados.dataNascimento.toISOString().split('T')[0]
          : dados.dataNascimento,
        telefone: dados.telefone || null,
        email: dados.email || null,
        foto: dados.foto || null,
        ativo: dados.ativo !== undefined ? dados.ativo : true,
        unidade_id: membroUnidadeId,
        endereco: dados.endereco || null,
        responsavel: dados.responsavel || null,
        observacoes: dados.observacoes || null,
      };

      const salvarCargos = async (membroId: string) => {
        if (!dados.cargos?.length) return;
        for (const cargo of dados.cargos) {
          const cargoTipo = typeof cargo === 'string' ? cargo : cargo.tipo;
          const cargoUnidadeId = typeof cargo === 'object'
            ? (cargo.unidadeId || membroUnidadeId)
            : membroUnidadeId;
          const cargoClasseId = typeof cargo === 'object' ? cargo.classeId || null : null;
          try {
            await createMembroCargo(membroId, cargoTipo, cargoUnidadeId, cargoClasseId);
          } catch (err: any) {
            console.error(`Erro ao salvar cargo ${cargoTipo}:`, err);
          }
        }
      };

      const salvarClasses = async (membroId: string) => {
        if (!dados.classesAtuais?.length) return;
        for (const classe of dados.classesAtuais) {
          const classeId = typeof classe === 'string' ? classe : classe.classeId;
          try {
            await createMembroClasseAtual(membroId, classeId);
          } catch (err: any) {
            console.error(`Erro ao salvar classe ${classeId}:`, err);
          }
        }
      };

      if (editandoMembro) {
        await updateMembro(editandoMembro.id, membroData);

        try { await deleteMembroCargos(editandoMembro.id); } catch (err: any) { console.error('Erro ao limpar cargos:', err); }
        await salvarCargos(editandoMembro.id);

        try { await deleteMembroClassesAtuais(editandoMembro.id); } catch (err: any) { console.error('Erro ao limpar classes:', err); }
        await salvarClasses(editandoMembro.id);

        try { await syncProfileFromMembro(editandoMembro.id); } catch (err: any) { console.error('Erro ao sync profile:', err); }

        addToast({ type: 'success', title: 'Sucesso', message: 'Membro atualizado' });
      } else {
        const { data: novoMembro, error: createError } = await supabase
          .from('membros')
          .insert({ ...membroData, clube_id: CLUB_ID })
          .select()
          .single();

        if (createError) {
          console.error('Erro ao criar membro:', createError);
          addToast({ type: 'error', title: 'Erro', message: `Falha ao criar: ${createError.message}` });
          return;
        }

        await salvarCargos(novoMembro.id);
        await salvarClasses(novoMembro.id);

        if (membroUnidadeId) {
          try { await createMembroUnidade(novoMembro.id, membroUnidadeId); } catch (err: any) { console.error('Erro ao salvar historico unidade:', err); }
        }

        addToast({ type: 'success', title: 'Sucesso', message: 'Membro criado' });
      }
      await carregarDados();
      setShowForm(false);
      setEditandoMembro(null);
    } catch (error: any) {
      console.error('Erro inesperado ao salvar membro:', error);
      addToast({ type: 'error', title: 'Erro', message: error?.message || 'Falha ao salvar membro' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditarMembro = (membro: MembroData) => {
    setEditandoMembro(membro);
    setShowForm(true);
  };

  const handleNovoMembro = () => {
    setEditandoMembro(null);
    setShowForm(true);
  };

  const handleVerDetalhes = (membro: MembroData) => {
    const membroCompleto = {
      id: membro.id,
      nome: membro.nome,
      nomeSocial: membro.nome_social || undefined,
      sexo: membro.sexo as 'M' | 'F',
      dataNascimento: new Date(membro.data_nascimento),
      telefone: membro.telefone,
      email: membro.email,
      foto: membro.foto,
      ativo: membro.ativo,
      clubeId: CLUB_ID,
      dataCadastro: membro.data_cadastro ? new Date(membro.data_cadastro) : new Date(),
      classesAtuais: membro.membros_classes_atuais?.map(c => ({
        classeId: String(c.classe_id),
        dataInicio: c.data_inicio ? new Date(c.data_inicio) : new Date(),
      })) || [],
      classesConcluidas: [],
      cargos: membro.membros_cargos?.map(c => ({
        tipo: c.cargo_tipo as CargoTipo,
        dataAtribuicao: c.data_atribuicao ? new Date(c.data_atribuicao) : new Date(),
        unidadeId: c.unidade_id || membro.unidade_id,
        classeId: c.classe_id || undefined,
        ativo: c.ativo,
        observacao: c.observacao,
      })) || [],
      unidadeAtualId: membro.unidade_id,
      unidadesAnteriores: [],
      especialidadesConcluidas: [],
      transicoes: [],
      responsavel: membro.responsavel,
      observacoes: membro.observacoes,
    };
    setMembroSelecionado(membroCompleto);
  };

  const handleEditarDeDetalhes = (membroCompleto: any) => {
    // Find the original membroData from the list
    const membroData = membros.find(m => m.id === membroCompleto.id);
    if (membroData) {
      setEditandoMembro(membroData);
      setMembroSelecionado(null);
      setShowForm(true);
    }
  };

  const handleAtivarMembro = async (membro: MembroData) => {
    try {
      await updateMembro(membro.id, { ativo: true });
      addToast({
        type: 'success',
        title: 'Sucesso',
        message: `${membro.nome} foi reativado`,
      });
      await carregarDados();
    } catch (error) {
      console.error('Erro ao ativar membro:', error);
      addToast({
        type: 'error',
        title: 'Erro',
        message: 'Falha ao ativar membro',
      });
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Membros">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Membros"
      actions={
        <div className="flex gap-2">
          <AppButton
            variant="secondary"
            size="sm"
            onClick={() => setShowInativos(true)}
            disabled={estatisticas.inativos === 0}
          >
            <UserMinus className="w-4 h-4 mr-1" />
            Inativos ({estatisticas.inativos})
          </AppButton>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <AppCard padding="sm" className="text-center">
            <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold text-text-primary">{estatisticas.total}</p>
            <p className="text-xs text-muted">Total</p>
          </AppCard>
          <AppCard padding="sm" className="text-center">
            <User className="w-5 h-5 mx-auto mb-1 text-success" />
            <p className="text-2xl font-bold text-text-primary">{estatisticas.ativos}</p>
            <p className="text-xs text-muted">Ativos</p>
          </AppCard>
          <AppCard padding="sm" className="text-center">
            <Shield className="w-5 h-5 mx-auto mb-1 text-muted" />
            <p className="text-2xl font-bold text-text-primary">{estatisticas.inativos}</p>
            <p className="text-xs text-muted">Inativos</p>
          </AppCard>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="flex-1">
            <AppInput
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <AppButton
            variant={showFiltros ? 'primary' : 'secondary'}
            onClick={() => setShowFiltros(!showFiltros)}
          >
            <Filter className="w-4 h-4" />
          </AppButton>
        </div>

        {/* Filtros avançados */}
        {showFiltros && (
          <AppCard className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted mb-1 block">Status</label>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-border bg-background text-text-primary text-sm"
                >
                  <option value="TODOS">Todos</option>
                  <option value="ATIVOS">Ativos</option>
                  <option value="INATIVOS">Inativos</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block">Unidade</label>
                <select
                  value={filtroUnidade}
                  onChange={(e) => setFiltroUnidade(e.target.value)}
                  className="w-full p-2 rounded-lg border border-border bg-background text-text-primary text-sm"
                >
                  <option value="TODOS">Todas</option>
                  {unidades.map(u => (
                    <option key={u.id} value={u.id}>{u.nome}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <AppButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFiltroStatus('ATIVOS');
                  setFiltroUnidade('TODOS');
                }}
              >
                Limpar filtros
              </AppButton>
            </div>
          </AppCard>
        )}

        {/* Lista de membros */}
        {membrosFiltrados.length === 0 ? (
          <AppEmptyState
            icon={<Users className="w-8 h-8 text-muted" />}
            title="Nenhum membro encontrado"
            description={search ? 'Tente buscar por outro nome ou ajuste os filtros.' : 'Comece adicionando o primeiro membro.'}
            action={!search ? { label: 'Novo Membro', onClick: handleNovoMembro } : undefined}
          />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">
                Mostrando {membrosFiltrados.length} de {membros.length} membros
              </p>
              <AppButton variant="primary" size="sm" onClick={handleNovoMembro}>
                <Plus className="w-4 h-4 mr-1" />
                Novo
              </AppButton>
            </div>
            {membrosFiltrados.map((membro) => (
              <MembroCard
                key={membro.id}
                membro={{
                  id: membro.id,
                  nome: membro.nome,
                  sexo: membro.sexo as 'M' | 'F',
                  dataNascimento: new Date(membro.data_nascimento),
                  telefone: membro.telefone,
                  email: membro.email,
                  foto: membro.foto,
                  ativo: membro.ativo,
                  clubeId: CLUB_ID,
                  dataCadastro: membro.data_cadastro ? new Date(membro.data_cadastro) : new Date(),
                  classesAtuais: membro.membros_classes_atuais?.map(c => ({
                    classeId: String(c.classe_id),
                    dataInicio: c.data_inicio ? new Date(c.data_inicio) : new Date(),
                  })) || [],
                  classesConcluidas: [],
                  cargos: membro.membros_cargos?.filter(c => c.ativo).map(c => ({
                    tipo: c.cargo_tipo as CargoTipo,
                    dataAtribuicao: c.data_atribuicao ? new Date(c.data_atribuicao) : new Date(),
                    unidadeId: c.unidade_id || membro.unidade_id,
                    classeId: c.classe_id || undefined,
                    ativo: c.ativo,
                    observacao: c.observacao,
                  })) || [],
                  unidadeAtualId: membro.unidade_id,
                  unidadesAnteriores: [],
                  especialidadesConcluidas: [],
                  transicoes: [],
                  responsavel: membro.responsavel,
                  observacoes: membro.observacoes,
                } as any}
                unidadeCores={unidadesCores[membro.unidade_id || '']}
                onClick={() => handleVerDetalhes(membro)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de formulário */}
      <MembroFormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditandoMembro(null);
        }}
        onSave={handleSalvarMembro}
        usuario={editandoMembro ? {
          id: editandoMembro.id,
          nome: editandoMembro.nome,
          nomeSocial: editandoMembro.nome_social || undefined,
          sexo: editandoMembro.sexo as 'M' | 'F',
          dataNascimento: editandoMembro.data_nascimento ? new Date(editandoMembro.data_nascimento) : new Date(),
          telefone: editandoMembro.telefone || undefined,
          email: editandoMembro.email || undefined,
          foto: editandoMembro.foto || undefined,
          ativo: editandoMembro.ativo,
          clubeId: CLUB_ID,
          dataCadastro: new Date(editandoMembro.data_cadastro || new Date()),
          dataDesligamento: editandoMembro.data_desligamento ? new Date(editandoMembro.data_desligamento) : undefined,
          motivoDesligamento: editandoMembro.motivo_desligamento || undefined,
          // Classes atuais - mapeando do banco
          classesAtuais: editandoMembro.membros_classes_atuais?.map(c => ({
            classeId: c.classe_id,
            dataInicio: c.data_inicio ? new Date(c.data_inicio) : new Date(),
            classe: c.classe,
          })) || [],
          // Classes concluídas - pode buscar do banco se necessário
          classesConcluidas: [],
          // Cargos - mapeando do banco com verificação de ativo
          cargos: editandoMembro.membros_cargos?.map(c => ({
            tipo: c.cargo_tipo as CargoTipo,
            dataAtribuicao: c.data_atribuicao ? new Date(c.data_atribuicao) : new Date(),
            unidadeId: c.unidade_id || undefined,
            classeId: c.classe_id || undefined,
            ativo: c.ativo !== false,
            observacao: c.observacao || undefined,
          })) || [],
          // Unidade atual
          unidadeAtualId: editandoMembro.unidade_id || undefined,
          // Arrays vazios para dados não carregados
          unidadesAnteriores: [],
          especialidadesConcluidas: [],
          transicoes: [],
          // Endereço e responsáveis
          endereco: editandoMembro.endereco || undefined,
          responsavel: editandoMembro.responsavel || undefined,
          observacoes: editandoMembro.observacoes || undefined,
        } : null}
        unidades={unidades}
        isSaving={isSaving}
      />

      {/* Modal de detalhes do membro */}
      <MembroDetailModal
        isOpen={!!membroSelecionado}
        onClose={() => setMembroSelecionado(null)}
        onEdit={handleEditarDeDetalhes}
        onUpdate={carregarDados}
        membro={membroSelecionado}
        unidadeCores={membroSelecionado?.unidade_id ? unidadesCores[membroSelecionado.unidade_id] : undefined}
      />

      {/* Modal de membros inativos */}
      <MembroInativoModal
        isOpen={showInativos}
        onClose={() => setShowInativos(false)}
        membrosInativos={membrosInativos}
        onAtivar={handleAtivarMembro}
        onVerDetalhes={(membro) => {
          const membroData = membros.find(m => m.id === membro.id);
          if (membroData) {
            setEditandoMembro(membroData);
            setShowInativos(false);
            setShowForm(true);
          }
        }}
        unidades={unidades}
        unidadesCores={unidadesCores}
      />
    </AppLayout>
  );
}