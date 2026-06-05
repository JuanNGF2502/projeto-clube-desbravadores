'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Users, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppTextarea } from '@/components/ui/AppInput';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { useToast } from '@/components/ui/Toast';
import { Unit, UNIT_GENDERS, DEFAULT_UNIT_COLORS } from '@/types';
import { cn } from '@/utils/cn';
import {
  getTodasUnidades,
  createUnidade,
  updateUnidade,
  deleteUnidade,
  toggleUnidadeAtivo
} from '@/lib/queries';
import { supabase } from '@/lib/supabase/client';
import { useClubId } from '@/hooks';

interface UnitFormData {
  nome: string;
  genero: Unit['genero'];
  cores: string[];
  gritoDeGuerra?: string;
  significadoLogo?: string;
  historiaNome?: string;
}

export default function GerenciarUnidadesPage() {
  const CLUB_ID = useClubId();
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [formData, setFormData] = useState<UnitFormData>({
    nome: '',
    genero: 'M',
    cores: DEFAULT_UNIT_COLORS,
    gritoDeGuerra: '',
    significadoLogo: '',
    historiaNome: '',
  });
  const { addToast } = useToast();

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      const dados = await getTodasUnidades(CLUB_ID);
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

  const openCreateModal = () => {
    setEditingUnit(null);
    setFormData({
      nome: '',
      genero: 'M',
      cores: DEFAULT_UNIT_COLORS,
      gritoDeGuerra: '',
      significadoLogo: '',
      historiaNome: '',
    });
    setIsModalOpen(true);
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setFormData({
      nome: unit.nome,
      genero: unit.genero as 'M' | 'F' ,
      cores: unit.cores || [],
      gritoDeGuerra: unit.gritoDeGuerra || '',
      significadoLogo: unit.significadoLogo || '',
      historiaNome: unit.historiaNome || '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteUnit = async (unit: Unit) => {
    const confirmar = confirm(`Tem certeza que deseja APAGAR DEFINITIVAMENTE a unidade "${unit.nome}"? Esta ação não pode ser desfeita.`);
    if (!confirmar) return;

    try {
      // 1. Desvincular membros_cargos
      await supabase
        .from('membros_cargos')
        .update({ unidade_id: null })
        .eq('unidade_id', unit.id);

      // 2. Desvincular membros
      await supabase
        .from('membros')
        .update({ unidade_id: null })
        .eq('unidade_id', unit.id);

      // 3. Desvincular membros_unidades
      await supabase
        .from('membros_unidades')
        .update({ ativo: false })
        .eq('unidade_id', unit.id);

      // 4. Remover referência das avaliações (agora Permite NULL no banco)
      await supabase
        .from('avaliacoes')
        .update({ unidade_id: null })
        .eq('unidade_id', unit.id);

      // 5. Excluir a unidade
      await supabase
        .from('unidades')
        .delete()
        .eq('id', unit.id);

      addToast({ type: 'success', title: 'Sucesso', message: 'Unidade excluída definitivamente' });
      await carregarDados();
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      addToast({ type: 'error', title: 'Erro', message: error.message || 'Falha ao excluir unidade' });
    }
  };

  const handleSaveUnit = async () => {
    if (!formData.nome.trim()) return;

    try {
      if (editingUnit) {
        await updateUnidade(editingUnit.id, {
          nome: formData.nome,
          genero: formData.genero as 'M' | 'F',
          cores: formData.cores,
          clube_id: CLUB_ID,
          grito_de_guerra: formData.gritoDeGuerra || undefined,
          significado_logo: formData.significadoLogo || undefined,
          historia_nome: formData.historiaNome || undefined,
        });
        addToast({ type: 'success', title: 'Sucesso', message: 'Unidade atualizada' });
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
        addToast({ type: 'success', title: 'Sucesso', message: 'Unidade criada' });
      }
      setIsModalOpen(false);
      setEditingUnit(null);
      await carregarDados();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao salvar unidade' });
    }
  };

  const toggleUnitStatus = async (unit: Unit) => {
    try {
      // Se estiver desativando, desvincular membros primeiro
      if (unit.ativo) {
        // Atualizar membros para remover referência à unidade
        await supabase
          .from('membros')
          .update({ unidade_id: null })
          .eq('unidade_id', unit.id);

        // Atualizar membros_unidades para inativo
        await supabase
          .from('membros_unidades')
          .update({ ativo: false })
          .eq('unidade_id', unit.id);
      }

      await toggleUnidadeAtivo(unit.id);
      addToast({
        type: 'success',
        title: 'Sucesso',
        message: unit.ativo ? 'Unidade desativada e membros desvinculados' : 'Unidade ativada'
      });
      await carregarDados();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao alterar status' });
    }
  };

  const getGenderLabel = (genero: string) => {
    return UNIT_GENDERS.find(g => g.value === genero)?.label || genero;
  };

  const activeUnits = units.filter(u => u.ativo);
  const inactiveUnits = units.filter(u => !u.ativo);

  if (isLoading) {
    return (
      <AppLayout title="Gerenciar Unidades" backHref="/unidades">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Gerenciar Unidades" backHref="/unidades">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">
              {activeUnits.length} unidade{activeUnits.length !== 1 ? 's' : ''} ativa{activeUnits.length !== 1 ? 's' : ''}
            </p>
          </div>
          <AppButton onClick={openCreateModal} leftIcon={<Plus className="w-5 h-5" />}>
            Nova Unidade
          </AppButton>
        </div>

        {/* Active Units */}
        {activeUnits.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted">Ativas</h3>
            <div className="space-y-2">
              {activeUnits.map((unit) => (
                <motion.div
                  key={unit.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AppCard className="p-4">
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
                          <p className="font-semibold text-text-primary">{unit.nome}</p>
                          <AppBadge variant="success" size="sm">Ativa</AppBadge>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted">
                            {getGenderLabel(unit.genero || 'M')}
                          </span>
                          <span className="text-xs text-muted">•</span>
                          <span className="text-xs text-muted">
                            {unit.membrosCount || 0} membro{(unit.membrosCount || 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleUnitStatus(unit)}
                          className="p-2 rounded-lg hover:bg-surface transition-colors"
                          title="Desativar"
                        >
                          <span className="text-xs">⏸️</span>
                        </button>
                        <button
                          onClick={() => handleEditUnit(unit)}
                          className="p-2 rounded-lg hover:bg-surface transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4 text-muted" />
                        </button>
                        <button
                          onClick={() => handleDeleteUnit(unit)}
                          className="p-2 rounded-lg hover:bg-danger/10 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4 text-danger" />
                        </button>
                      </div>
                    </div>
                  </AppCard>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Inactive Units */}
        {inactiveUnits.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted">Inativas</h3>
            <div className="space-y-2">
              {inactiveUnits.map((unit) => (
                <motion.div
                  key={unit.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AppCard className="p-4 opacity-75">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 opacity-50"
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
                          <p className="font-semibold text-text-primary">{unit.nome}</p>
                          <AppBadge variant="secondary" size="sm">Inativa</AppBadge>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted">
                            {getGenderLabel(unit.genero || 'M')}
                          </span>
                          <span className="text-xs text-muted">•</span>
                          <span className="text-xs text-muted">
                            {unit.membrosCount || 0} membro{(unit.membrosCount || 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleUnitStatus(unit)}
                          className="p-2 rounded-lg hover:bg-success/10 transition-colors"
                          title="Ativar"
                        >
                          <span className="text-xs">▶️</span>
                        </button>
                        <button
                          onClick={() => handleEditUnit(unit)}
                          className="p-2 rounded-lg hover:bg-surface transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4 text-muted" />
                        </button>
                        <button
                          onClick={() => handleDeleteUnit(unit)}
                          className="p-2 rounded-lg hover:bg-danger/10 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4 text-danger" />
                        </button>
                      </div>
                    </div>
                  </AppCard>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {units.length === 0 && (
          <AppEmptyState
            icon={<Users className="w-8 h-8 text-primary" />}
            title="Nenhuma unidade encontrada"
            description="Crie sua primeira unidade para começar"
            action={{ label: 'Nova Unidade', onClick: openCreateModal }}
          />
        )}
      </div>

      {/* Create/Edit Modal */}
      <AppModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingUnit(null); }}
        title={editingUnit ? 'Editar Unidade' : 'Nova Unidade'}
        description={editingUnit ? 'Faça as alterações necessárias' : 'Preencha os dados da nova unidade'}
        size="lg"
      >
        <div className="space-y-4">
          <AppInput
            label="Nome da Unidade"
            placeholder="Ex: Lobos, Águias, Leões"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Gênero
            </label>
            <div className="flex flex-wrap gap-2">
              {UNIT_GENDERS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, genero: g.value as 'M' | 'F'  })}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    formData.genero === g.value
                      ? 'bg-primary text-white'
                      : 'bg-surface text-muted hover:bg-primary/10'
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Cores
            </label>
            <ColorPicker
              colors={formData.cores}
              onChange={(colors) => setFormData({ ...formData, cores: colors })}
            />
          </div>

          <AppInput
            label="Grito de Guerra"
            placeholder="Ex: Lobos juntos, jamais vencidos!"
            value={formData.gritoDeGuerra || ''}
            onChange={(e) => setFormData({ ...formData, gritoDeGuerra: e.target.value })}
          />

          <AppTextarea
            label="Significado do Logo"
            placeholder="O que o logo representa..."
            value={formData.significadoLogo || ''}
            onChange={(e) => setFormData({ ...formData, significadoLogo: e.target.value })}
            rows={2}
          />

          <AppTextarea
            label="História do Nome"
            placeholder="Por que este nome foi escolhido..."
            value={formData.historiaNome || ''}
            onChange={(e) => setFormData({ ...formData, historiaNome: e.target.value })}
            rows={2}
          />

          <div className="flex gap-3 pt-2">
            <AppButton
              variant="secondary"
              onClick={() => { setIsModalOpen(false); setEditingUnit(null); }}
              className="flex-1"
            >
              Cancelar
            </AppButton>
            <AppButton
              onClick={handleSaveUnit}
              className="flex-1"
              disabled={!formData.nome.trim()}
            >
              {editingUnit ? 'Salvar' : 'Criar'}
            </AppButton>
          </div>
        </div>
      </AppModal>
    </AppLayout>
  );
}