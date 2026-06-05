'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Users, Search, Image, Mic, Settings, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppTextarea } from '@/components/ui/AppInput';
import { AppModal } from '@/components/ui/AppModal';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { useToast } from '@/components/ui/Toast';
import { Unit, UNIT_GENDERS, DEFAULT_UNIT_COLORS } from '@/types';
import { cn } from '@/utils/cn';
import { getUnidadesByClube, createUnidade, updateUnidade, getRankingUnidades } from '@/lib/queries';
import { useClubId, useAuth } from '@/hooks';
import { getUnidadesQueConselheiroOrienta } from '@/lib/queries/membros';

interface FormData {
  nome: string;
  genero: 'M' | 'F' ;
  cores: string[];
  gritoDeGuerra: string;
  logo: string;
  significadoLogo: string;
  historiaNome: string;
}

export default function UnitsPage() {
  const CLUB_ID = useClubId();
  const { user, profile } = useAuth();
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [unidadesQueOrienta, setUnidadesQueOrienta] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    genero: 'M',
    cores: [...DEFAULT_UNIT_COLORS],
    gritoDeGuerra: '',
    logo: '',
    significadoLogo: '',
    historiaNome: '',
  });
  const { addToast } = useToast();
  const router = useRouter();

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      const dados = await getUnidadesByClube(CLUB_ID);
      setUnits(dados || []);
    } catch (error) {
      console.error('Erro ao carregar unidades:', error);
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao carregar unidades' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Buscar ranking de pontos por unidade
  const [rankingData, setRankingData] = useState<Record<string, number>>({});

  useEffect(() => {
    const buscarRanking = async () => {
      try {
        const ranking = await getRankingUnidades(CLUB_ID);
        const rankingObj = ranking.reduce((acc, r) => {
          acc[r.id] = r.totalPontos;
          return acc;
        }, {} as Record<string, number>);
        setRankingData(rankingObj);
      } catch (error) {
        console.error('Erro ao buscar ranking:', error);
      }
    };
    buscarRanking();
  }, []);

  useEffect(() => {
    if (user && profile) {
      if (profile.role !== 'ADMIN' && profile.role !== 'DIRIGENTE' && profile.membro_id) {
        getUnidadesQueConselheiroOrienta(profile.membro_id).then(ids => {
          setUnidadesQueOrienta(ids);
        }).catch(() => {
          setUnidadesQueOrienta([]);
        });
      } else {
        setUnidadesQueOrienta([]);
      }
    }
  }, [user, profile]);

  const showAllUnits = profile?.role === 'ADMIN' || profile?.role === 'DIRIGENTE' || unidadesQueOrienta.length === 0;

  const filteredUnits = useMemo(() => {
    let result = units;
    if (!showAllUnits && unidadesQueOrienta.length > 0) {
      result = result.filter(u => unidadesQueOrienta.includes(u.id));
    }
    if (search) {
      result = result.filter((unit) =>
        unit.nome.toLowerCase().includes(search.toLowerCase())
      );
    }
    return result;
  }, [units, search, unidadesQueOrienta, showAllUnits]);

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      addToast({ type: 'error', title: 'Erro', message: 'Nome é obrigatório' });
      return;
    }

    if (formData.cores.length === 0) {
      addToast({ type: 'error', title: 'Erro', message: 'Adicione pelo menos 1 cor' });
      return;
    }

    try {
      if (editingUnit) {
        await updateUnidade(editingUnit.id, {
          nome: formData.nome,
          genero: formData.genero as 'M' | 'F' ,
          cores: formData.cores,
          clube_id: CLUB_ID,
          grito_de_guerra: formData.gritoDeGuerra || undefined,
          significado_logo: formData.significadoLogo || undefined,
          historia_nome: formData.historiaNome || undefined,
        });
        addToast({ type: 'success', title: 'Sucesso', message: `${formData.nome} foi atualizada com sucesso` });
      } else {
        await createUnidade({
          nome: formData.nome,
          genero: formData.genero as 'M' | 'F' ,
          cores: formData.cores,
          clube_id: CLUB_ID,
          grito_de_guerra: formData.gritoDeGuerra || undefined,
          significado_logo: formData.significadoLogo || undefined,
          historia_nome: formData.historiaNome || undefined,
        });
        addToast({ type: 'success', title: 'Sucesso', message: `${formData.nome} foi criada com sucesso` });
      }

      setIsModalOpen(false);
      setEditingUnit(null);
      resetForm();
      await carregarDados();
    } catch (error) {
      console.error('Erro ao salvar unidade:', error);
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao salvar unidade' });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      genero: 'M',
      cores: [...DEFAULT_UNIT_COLORS],
      gritoDeGuerra: '',
      logo: '',
      significadoLogo: '',
      historiaNome: '',
    });
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setFormData({
      nome: unit.nome,
      genero: unit.genero as 'M' | 'F' ,
      cores: [...(unit.cores || [])],
      gritoDeGuerra: unit.gritoDeGuerra || '',
      logo: unit.logo || '',
      significadoLogo: unit.significadoLogo || '',
      historiaNome: unit.historiaNome || '',
    });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingUnit(null);
    resetForm();
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <AppLayout title="Unidades" subtitle="Carregando...">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const canManageUnits = profile?.role === 'ADMIN' || profile?.role === 'DIRIGENTE';

  return (
    <AppLayout
      title="Unidades"
      subtitle={`${filteredUnits.length}${!showAllUnits ? ` de ${units.length}` : ''} unidades`}
      actions={
        canManageUnits ? (
          <AppButton variant="primary" size="sm" onClick={openCreateModal}>
            <Users className="w-4 h-4 mr-1" />
            Nova
          </AppButton>
        ) : undefined
      }
    >
      {!showAllUnits && unidadesQueOrienta.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--card-color)', border: '1px solid var(--border-color)' }}>
          <div className="p-2 rounded-lg bg-primary/20">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-color)' }}>
              Modo Conselheiro
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary-color)' }}>
              Você vê apenas as unidades que orienta
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <AppInput
          placeholder="Buscar unidade..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
          className="flex-1"
        />
        <AppButton
          variant="secondary"
          onClick={() => router.push('/unidades/gerenciar')}
          className="flex-shrink-0"
          title="Gerenciar unidades"
        >
          <Settings className="w-5 h-5" />
        </AppButton>
      </div>

      {filteredUnits.length === 0 ? (
        <AppEmptyState
          icon={<Users className="w-8 h-8 text-primary" />}
          title="Nenhuma unidade encontrada"
          description={search ? 'Tente buscar por outro nome.' : 'Crie sua primeira unidade para começar.'}
          action={!search ? { label: 'Nova Unidade', onClick: openCreateModal } : undefined}
        />
      ) : (
        <div className="grid gap-3">
          <AnimatePresence mode="popLayout">
            {filteredUnits.map((unit, index) => (
              <motion.div
                key={unit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <AppCard
                  hover
                  className="cursor-pointer overflow-hidden"
                  onClick={() => router.push(`/unidades/${unit.id}`)}
                >
                  {/* Gradient bar */}
                  <div
                    className="h-1.5 -mx-6 -mt-6 mb-4"
                    style={{
                      background: (unit.cores?.length || 0) === 1
                        ? unit.cores?.[0]
                        : `linear-gradient(to right, ${(unit.cores || []).join(', ')})`,
                    }}
                  />
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: (unit.cores?.length || 0) === 1
                          ? unit.cores?.[0]
                          : `linear-gradient(135deg, ${(unit.cores || [])[0]}, ${(unit.cores || [])[(unit.cores?.length || 1) - 1]})`,
                      }}
                    >
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-text-primary">{unit.nome}</h3>
                        <AppBadge
                          variant={unit.genero === 'M' ? 'info' : 'danger'}
                          size="sm"
                        >
                          {unit.genero === 'M' ? 'Masculina' : 'Feminina'}
                        </AppBadge>
                      </div>
                      <p className="text-sm text-muted">
                        {unit.membrosCount || 0} membros
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{rankingData[unit.id] || 0}</p>
                        <p className="text-xs text-muted">pontos</p>
                      </div>
                      <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </AppCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AppModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUnit(null);
        }}
        title={editingUnit ? 'Editar Unidade' : 'Nova Unidade'}
        description={editingUnit ? 'Faça as alterações necessárias' : 'Preencha os dados da nova unidade'}
        size="lg"
      >
        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* Nome */}
          <AppInput
            label="Nome da Unidade"
            placeholder="Ex: Lobos, Águias..."
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          />

          {/* Gênero */}
          <div>
            <label className="text-sm font-medium ml-1 block mb-2 text-text-secondary">Gênero</label>
            <div className="flex gap-2">
              {UNIT_GENDERS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, genero: g.value as 'M' | 'F' })}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-medium transition-all',
                    formData.genero === g.value
                      ? 'bg-primary text-background'
                      : 'border bg-card text-text-secondary'
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="text-sm font-medium ml-1 block mb-2 text-text-secondary">
              Cores da Unidade
            </label>
            <ColorPicker
              colors={formData.cores}
              onChange={(colors) => setFormData({ ...formData, cores: colors })}
              maxColors={5}
            />
          </div>

          {/* Grito de Guerra */}
          <AppInput
            label="Grito de Guerra"
            placeholder="Ex: Juntos somos mais fortes!"
            value={formData.gritoDeGuerra}
            onChange={(e) => setFormData({ ...formData, gritoDeGuerra: e.target.value })}
            leftIcon={<Mic className="w-4 h-4" />}
          />

          {/* Significado do Logo */}
          <AppTextarea
            label="Significado do Logo"
            placeholder="Explique o significado por trás do símbolo da unidade..."
            value={formData.significadoLogo}
            onChange={(e) => setFormData({ ...formData, significadoLogo: e.target.value })}
            rows={3}
          />

          {/* História do Nome */}
          <AppTextarea
            label="História do Nome"
            placeholder="Conte a história ou significado por trás do nome escolhido..."
            value={formData.historiaNome}
            onChange={(e) => setFormData({ ...formData, historiaNome: e.target.value })}
            rows={3}
          />

          <div className="flex gap-3 pt-2">
            <AppButton
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingUnit(null);
              }}
              className="flex-1"
            >
              Cancelar
            </AppButton>
            <AppButton onClick={handleSave} className="flex-1">
              {editingUnit ? 'Salvar' : 'Criar'}
            </AppButton>
          </div>
        </div>
      </AppModal>
    </AppLayout>
  );
}