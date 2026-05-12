'use client';

import { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  User,
  Shield,
  BookOpen,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  History,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MembroFormModal, MembroCard } from '@/components/membros';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { cn } from '@/utils/cn';
import {
  Usuario,
  Unit,
  CargoTipo,
  getClasseAtualPrincipal,
  CARGOS,
  getCargoByTipo,
  DEFAULT_CLASSES,
} from '@/types';

// Mock data - em produção viria da API
const mockUnidades: Unit[] = [
  {
    id: '1',
    nome: 'Lobos',
    genero: 'M',
    cores: ['#3B82F6', '#1E40AF', '#1E3A8A'],
    ativo: true,
    clubeId: '1',
    createdAt: new Date(),
  },
  {
    id: '2',
    nome: 'Águias',
    genero: 'F',
    cores: ['#EC4899', '#BE185D', '#9D174D'],
    ativo: true,
    clubeId: '1',
    createdAt: new Date(),
  },
  {
    id: '3',
    nome: 'Fênix',
    genero: 'MISTA',
    cores: ['#F97316', '#EA580C', '#C2410C'],
    ativo: true,
    clubeId: '1',
    createdAt: new Date(),
  },
];

const mockMembros: Usuario[] = [
  {
    id: '1',
    nome: 'Lucas Silva',
    sexo: 'M',
    dataNascimento: new Date('2012-03-15'),
    telefone: '(11) 99999-1111',
    email: 'lucas@email.com',
    ativo: true,
    clubeId: '1',
    dataCadastro: new Date('2022-01-15'),
    classesAtuais: [{ classeId: '5', dataInicio: new Date('2025-01-15') }],
    classesConcluidas: [
      { classeId: '1', dataInicio: new Date('2022-01-15'), dataConclusao: new Date('2022-03-20'), concluido: true },
      { classeId: '2', dataInicio: new Date('2022-03-21'), dataConclusao: new Date('2022-06-15'), concluido: true },
      { classeId: '3', dataInicio: new Date('2022-06-16'), dataConclusao: new Date('2022-09-10'), concluido: true },
      { classeId: '4', dataInicio: new Date('2022-09-11'), dataConclusao: new Date('2023-01-20'), concluido: true },
    ],
    cargos: [
      { tipo: 'CAPITAO', dataAtribuicao: new Date('2024-01-01'), unidadeId: '1', ativo: true },
    ],
    unidadeAtualId: '1',
    unidadesAnteriores: [],
    especialidadesConcluidas: [],
    transicoes: [],
  },
  {
    id: '2',
    nome: 'Ana Costa',
    sexo: 'F',
    dataNascimento: new Date('2013-07-22'),
    telefone: '(11) 99999-2222',
    email: 'ana@email.com',
    ativo: true,
    clubeId: '1',
    dataCadastro: new Date('2021-06-01'),
    classesAtuais: [{ classeId: '6', dataInicio: new Date('2024-11-01') }],
    classesConcluidas: [
      { classeId: '1', dataInicio: new Date('2021-06-01'), dataConclusao: new Date('2021-08-15'), concluido: true },
      { classeId: '2', dataInicio: new Date('2021-08-16'), dataConclusao: new Date('2021-11-20'), concluido: true },
      { classeId: '3', dataInicio: new Date('2021-11-21'), dataConclusao: new Date('2022-02-28'), concluido: true },
      { classeId: '4', dataInicio: new Date('2022-03-01'), dataConclusao: new Date('2022-06-15'), concluido: true },
      { classeId: '5', dataInicio: new Date('2022-06-16'), dataConclusao: new Date('2022-10-30'), concluido: true },
    ],
    cargos: [
      { tipo: 'CONSELHEIRO', dataAtribuicao: new Date('2024-01-01'), unidadeId: '1', ativo: true },
    ],
    unidadeAtualId: '1',
    unidadesAnteriores: [],
    especialidadesConcluidas: ['especialidade_1', 'especialidade_2'],
    transicoes: [],
  },
  {
    id: '3',
    nome: 'Pedro Santos',
    sexo: 'M',
    dataNascimento: new Date('2014-01-10'),
    ativo: true,
    clubeId: '1',
    dataCadastro: new Date('2023-03-10'),
    classesAtuais: [{ classeId: '4', dataInicio: new Date('2025-01-15') }],
    classesConcluidas: [
      { classeId: '1', dataInicio: new Date('2023-03-10'), dataConclusao: new Date('2023-05-20'), concluido: true },
      { classeId: '2', dataInicio: new Date('2023-05-21'), dataConclusao: new Date('2023-08-15'), concluido: true },
      { classeId: '3', dataInicio: new Date('2023-08-16'), dataConclusao: new Date('2024-01-10'), concluido: true },
    ],
    cargos: [
      { tipo: 'SECRETARIO', dataAtribuicao: new Date('2024-01-01'), unidadeId: '1', ativo: true },
      { tipo: 'DESBRAVADOR', dataAtribuicao: new Date('2023-03-10'), unidadeId: '1', ativo: true },
    ],
    unidadeAtualId: '1',
    unidadesAnteriores: [],
    especialidadesConcluidas: [],
    transicoes: [],
  },
  {
    id: '4',
    nome: 'Maria Oliveira',
    sexo: 'F',
    dataNascimento: new Date('2015-09-05'),
    ativo: true,
    clubeId: '1',
    dataCadastro: new Date('2024-02-01'),
    classesAtuais: [{ classeId: '1', dataInicio: new Date('2024-02-01') }],
    classesConcluidas: [],
    cargos: [
      { tipo: 'DESBRAVADOR', dataAtribuicao: new Date('2024-02-01'), unidadeId: '2', ativo: true },
    ],
    unidadeAtualId: '2',
    unidadesAnteriores: [],
    especialidadesConcluidas: [],
    transicoes: [],
  },
  {
    id: '5',
    nome: 'João Ferreira',
    sexo: 'M',
    dataNascimento: new Date('2011-11-30'),
    ativo: false,
    clubeId: '1',
    dataCadastro: new Date('2020-01-15'),
    dataDesligamento: new Date('2024-12-01'),
    motivoDesligamento: 'Transferência',
    classesAtuais: [],
    classesConcluidas: [
      { classeId: '1', dataInicio: new Date('2020-01-15'), dataConclusao: new Date('2020-03-20'), concluido: true },
      { classeId: '2', dataInicio: new Date('2020-03-21'), dataConclusao: new Date('2020-06-15'), concluido: true },
      { classeId: '3', dataInicio: new Date('2020-06-16'), dataConclusao: new Date('2020-09-10'), concluido: true },
    ],
    cargos: [
      { tipo: 'DESBRAVADOR', dataAtribuicao: new Date('2020-01-15'), ativo: false },
    ],
    unidadeAtualId: undefined,
    unidadesAnteriores: [{ unidadeId: '1', dataEntrada: new Date('2020-01-15'), dataSaida: new Date('2024-12-01') }],
    especialidadesConcluidas: [],
    transicoes: [],
  },
];

type FiltroCargo = CargoTipo | 'TODOS';
type FiltroStatus = 'TODOS' | 'ATIVOS' | 'INATIVOS';
type FiltroClasse = string | 'TODOS';

export default function MembrosPage() {
  const [membros, setMembros] = useState<Usuario[]>(mockMembros);
  const [search, setSearch] = useState('');
  const [filtroCargo, setFiltroCargo] = useState<FiltroCargo>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('ATIVOS');
  const [filtroClasse, setFiltroClasse] = useState<FiltroClasse>('TODOS');
  const [filtroUnidade, setFiltroUnidade] = useState<string>('TODOS');
  const [showForm, setShowForm] = useState(false);
  const [editandoMembro, setEditandoMembro] = useState<Usuario | null>(null);
  const [showFiltros, setShowFiltros] = useState(false);

  const membrosFiltrados = useMemo(() => {
    return membros.filter((membro) => {
      // Busca
      if (search && !membro.nome.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }

      // Status
      if (filtroStatus === 'ATIVOS' && !membro.ativo) return false;
      if (filtroStatus === 'INATIVOS' && membro.ativo) return false;

      // Cargo
      if (filtroCargo !== 'TODOS') {
        if (!membro.cargos.some(c => c.tipo === filtroCargo && c.ativo)) {
          return false;
        }
      }

      // Classe
      if (filtroClasse !== 'TODOS' && getClasseAtualPrincipal(membro) !== filtroClasse) {
        return false;
      }

      // Unidade
      if (filtroUnidade !== 'TODOS' && membro.unidadeAtualId !== filtroUnidade) {
        return false;
      }

      return true;
    });
  }, [membros, search, filtroCargo, filtroStatus, filtroClasse, filtroUnidade]);

  const estatisticas = useMemo(() => ({
    total: membros.length,
    ativos: membros.filter(m => m.ativo).length,
    inativos: membros.filter(m => !m.ativo).length,
    porCargo: CARGOS.reduce((acc, cargo) => {
      acc[cargo.tipo] = membros.filter(m =>
        m.ativo && m.cargos.some(c => c.tipo === cargo.tipo && c.ativo)
      ).length;
      return acc;
    }, {} as Record<CargoTipo, number>),
    porClasse: DEFAULT_CLASSES.reduce((acc, classe) => {
      acc[classe.id] = membros.filter(m => getClasseAtualPrincipal(m) === classe.id && m.ativo).length;
      return acc;
    }, {} as Record<string, number>),
  }), [membros]);

  const unidadesCores = useMemo(() => {
    return mockUnidades.reduce((acc, u) => {
      acc[u.id] = u.cores;
      return acc;
    }, {} as Record<string, string[]>);
  }, []);

  const handleSalvarMembro = (dados: Partial<Usuario>) => {
    if (editandoMembro) {
      setMembros(prev => prev.map(m => m.id === dados.id ? { ...m, ...dados } as Usuario : m));
    } else {
      setMembros(prev => [...prev, dados as Usuario]);
    }
    setShowForm(false);
    setEditandoMembro(null);
  };

  const handleEditarMembro = (membro: Usuario) => {
    setEditandoMembro(membro);
    setShowForm(true);
  };

  const handleNovoMembro = () => {
    setEditandoMembro(null);
    setShowForm(true);
  };

  return (
    <AppLayout
      title="Membros"
      actions={
        <AppButton variant="primary" size="sm" onClick={handleNovoMembro}>
          <Plus className="w-4 h-4 mr-1" />
          Novo
        </AppButton>
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
                  onChange={(e) => setFiltroStatus(e.target.value as FiltroStatus)}
                  className="w-full p-2 rounded-lg border border-border bg-background text-text-primary text-sm"
                >
                  <option value="TODOS">Todos</option>
                  <option value="ATIVOS">Ativos</option>
                  <option value="INATIVOS">Inativos</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block">Cargo</label>
                <select
                  value={filtroCargo}
                  onChange={(e) => setFiltroCargo(e.target.value as FiltroCargo)}
                  className="w-full p-2 rounded-lg border border-border bg-background text-text-primary text-sm"
                >
                  <option value="TODOS">Todos</option>
                  {CARGOS.map(c => (
                    <option key={c.tipo} value={c.tipo}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block">Classe</label>
                <select
                  value={filtroClasse}
                  onChange={(e) => setFiltroClasse(e.target.value)}
                  className="w-full p-2 rounded-lg border border-border bg-background text-text-primary text-sm"
                >
                  <option value="TODOS">Todas</option>
                  {DEFAULT_CLASSES.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
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
                  {mockUnidades.map(u => (
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
                  setFiltroCargo('TODOS');
                  setFiltroClasse('TODOS');
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
            <p className="text-sm text-muted">
              Mostrando {membrosFiltrados.length} de {membros.length} membros
            </p>
            {membrosFiltrados.map((membro) => (
              <div key={membro.id} className="relative group">
                <MembroCard
                  membro={membro}
                  unidadeCores={unidadesCores[membro.unidadeAtualId || '']}
                  onClick={() => handleEditarMembro(membro)}
                />
                {/* Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <AppButton
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditarMembro(membro);
                    }}
                    className="!p-1.5"
                  >
                    <Edit className="w-4 h-4" />
                  </AppButton>
                  <AppButton
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Ver histórico
                    }}
                    className="!p-1.5"
                  >
                    <History className="w-4 h-4" />
                  </AppButton>
                </div>
              </div>
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
        usuario={editandoMembro}
        unidades={mockUnidades}
      />
    </AppLayout>
  );
}
