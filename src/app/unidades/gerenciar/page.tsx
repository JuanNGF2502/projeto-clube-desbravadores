'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { AppInput } from '@/components/ui/AppInput';
import { AppTextarea } from '@/components/ui/AppInput';
import { AppBadge } from '@/components/ui/AppBadge';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { Unit, UNIT_GENDERS, DEFAULT_UNIT_COLORS } from '@/types';
import { cn } from '@/utils/cn';

const initialUnits: Unit[] = [
  {
    id: '1',
    nome: 'Lobos',
    genero: 'M',
    cores: ['#3B82F6', '#1E40AF', '#1E3A8A'],
    ativo: true,
    clubeId: '1',
    membrosCount: 12,
    createdAt: new Date(),
  },
  {
    id: '2',
    nome: 'Águias',
    genero: 'M',
    cores: ['#C6A15B', '#A16207', '#854D0E'],
    ativo: true,
    clubeId: '1',
    membrosCount: 8,
    createdAt: new Date(),
  },
  {
    id: '3',
    nome: 'Leões',
    genero: 'MISTA',
    cores: ['#EF4444', '#B91C1C', '#991B1B'],
    ativo: true,
    clubeId: '1',
    membrosCount: 15,
    createdAt: new Date(),
  },
  {
    id: '4',
    nome: 'Corujas',
    genero: 'F',
    cores: ['#8B5CF6', '#6D28D9', '#5B21B6'],
    ativo: false,
    clubeId: '1',
    membrosCount: 0,
    createdAt: new Date(),
  },
];

interface UnitFormData {
  nome: string;
  genero: Unit['genero'];
  cores: string[];
  gritoDeGuerra?: string;
  significadoLogo?: string;
  historiaNome?: string;
}

export default function GerenciarUnidadesPage() {
  const [units, setUnits] = useState<Unit[]>(initialUnits);
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
      genero: unit.genero,
      cores: unit.cores,
      gritoDeGuerra: unit.gritoDeGuerra || '',
      significadoLogo: unit.significadoLogo || '',
      historiaNome: unit.historiaNome || '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteUnit = (unit: Unit) => {
    if (confirm(`Tem certeza que deseja excluir a unidade "${unit.nome}"?`)) {
      setUnits(units.filter(u => u.id !== unit.id));
    }
  };

  const handleSaveUnit = () => {
    if (!formData.nome.trim()) return;

    if (editingUnit) {
      setUnits(units.map(u =>
        u.id === editingUnit.id
          ? {
              ...u,
              nome: formData.nome,
              genero: formData.genero,
              cores: formData.cores,
              gritoDeGuerra: formData.gritoDeGuerra,
              significadoLogo: formData.significadoLogo,
              historiaNome: formData.historiaNome,
            }
          : u
      ));
    } else {
      const newUnit: Unit = {
        id: String(Date.now()),
        nome: formData.nome,
        genero: formData.genero,
        cores: formData.cores,
        ativo: true,
        clubeId: '1',
        membrosCount: 0,
        createdAt: new Date(),
        gritoDeGuerra: formData.gritoDeGuerra,
        significadoLogo: formData.significadoLogo,
        historiaNome: formData.historiaNome,
      };
      setUnits([...units, newUnit]);
    }
    setIsModalOpen(false);
    setEditingUnit(null);
  };

  const toggleUnitStatus = (unit: Unit) => {
    setUnits(units.map(u =>
      u.id === unit.id ? { ...u, ativo: !u.ativo } : u
    ));
  };

  const getGenderLabel = (genero: Unit['genero']) => {
    return UNIT_GENDERS.find(g => g.value === genero)?.label || genero;
  };

  const activeUnits = units.filter(u => u.ativo);
  const inactiveUnits = units.filter(u => !u.ativo);

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
                          background: unit.cores.length === 1
                            ? unit.cores[0]
                            : `linear-gradient(135deg, ${unit.cores[0]}, ${unit.cores[unit.cores.length - 1]})`,
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
                            {getGenderLabel(unit.genero)}
                          </span>
                          <span className="text-xs text-muted">•</span>
                          <span className="text-xs text-muted">
                            {unit.membrosCount} membro{unit.membrosCount !== 1 ? 's' : ''}
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
                          background: unit.cores.length === 1
                            ? unit.cores[0]
                            : `linear-gradient(135deg, ${unit.cores[0]}, ${unit.cores[unit.cores.length - 1]})`,
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
                            {getGenderLabel(unit.genero)}
                          </span>
                          <span className="text-xs text-muted">•</span>
                          <span className="text-xs text-muted">
                            {unit.membrosCount} membro{unit.membrosCount !== 1 ? 's' : ''}
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
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-muted" />
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">Nenhuma unidade encontrada</h3>
            <p className="text-sm text-muted mb-4">Crie sua primeira unidade para começar</p>
            <AppButton onClick={openCreateModal} leftIcon={<Plus className="w-5 h-5" />}>
              Nova Unidade
            </AppButton>
          </div>
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
                  onClick={() => setFormData({ ...formData, genero: g.value as Unit['genero'] })}
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