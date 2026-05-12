'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Plus, Users, Search, MoreVertical, Pencil, Trash2, Image, Mic, Info, History } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppTextarea } from '@/components/ui/AppInput';
import { AppModal } from '@/components/ui/AppModal';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { AppSelect } from '@/components/ui/AppSelect';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { useToast } from '@/components/ui/Toast';
import { Unit, UNIT_GENDERS, DEFAULT_UNIT_COLORS } from '@/types';
import { cn } from '@/utils/cn';

const initialUnits: Unit[] = [
  {
    id: '1',
    nome: 'Lobos',
    genero: 'M',
    cores: ['#3B82F6', '#1E40AF', '#1E3A8A'],
    gritoDeGuerra: 'Lobos juntos, jamais vencidos!',
    significadoLogo: 'O lobo representa a força, lealdade e trabalho em equipe.',
    historiaNome: 'Escolhido por representar a união e coragem do grupo.',
    membrosCount: 12,
    ativo: true,
    clubeId: '1',
    createdAt: new Date(),
  },
  {
    id: '2',
    nome: 'Águias',
    genero: 'M',
    cores: ['#C6A15B', '#A16207', '#854D0E'],
    gritoDeGuerra: 'Voamos alto, servimos sempre!',
    significadoLogo: 'A águia simboliza visão, proteção e elevação espiritual.',
    historiaNome: 'Nome inspirado na nobreza e liberdade.',
    membrosCount: 10,
    ativo: true,
    clubeId: '1',
    createdAt: new Date(),
  },
];

interface FormData {
  nome: string;
  genero: 'M' | 'F' | 'MISTA';
  cores: string[];
  gritoDeGuerra: string;
  logo: string;
  significadoLogo: string;
  historiaNome: string;
}

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [search, setSearch] = useState('');
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
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const { addToast } = useToast();
  const router = useRouter();

  const filteredUnits = units.filter((unit) =>
    unit.nome.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!formData.nome.trim()) {
      addToast({ type: 'error', title: 'Erro', message: 'Nome é obrigatório' });
      return;
    }

    if (formData.cores.length === 0) {
      addToast({ type: 'error', title: 'Erro', message: 'Adicione pelo menos 1 cor' });
      return;
    }

    if (editingUnit) {
      setUnits(
        units.map((u) =>
          u.id === editingUnit.id
            ? {
                ...u,
                nome: formData.nome,
                genero: formData.genero as Unit['genero'],
                cores: formData.cores,
                gritoDeGuerra: formData.gritoDeGuerra,
                logo: formData.logo,
                significadoLogo: formData.significadoLogo,
                historiaNome: formData.historiaNome,
              }
            : u
        )
      );
      addToast({ type: 'success', title: 'Unidade atualizada', message: `${formData.nome} foi atualizada com sucesso` });
    } else {
      const newUnit: Unit = {
        id: String(Date.now()),
        nome: formData.nome,
        genero: formData.genero as Unit['genero'],
        cores: formData.cores,
        gritoDeGuerra: formData.gritoDeGuerra,
        logo: formData.logo,
        significadoLogo: formData.significadoLogo,
        historiaNome: formData.historiaNome,
        ativo: true,
        clubeId: '1',
        membrosCount: 0,
        createdAt: new Date(),
      };
      setUnits([...units, newUnit]);
      addToast({ type: 'success', title: 'Unidade criada', message: `${formData.nome} foi criada com sucesso` });
    }

    setIsModalOpen(false);
    setEditingUnit(null);
    resetForm();
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
      genero: unit.genero,
      cores: [...unit.cores],
      gritoDeGuerra: unit.gritoDeGuerra || '',
      logo: unit.logo || '',
      significadoLogo: unit.significadoLogo || '',
      historiaNome: unit.historiaNome || '',
    });
    setIsModalOpen(true);
    setMenuOpen(null);
  };

  const handleDelete = (unit: Unit) => {
    setUnits(units.filter((u) => u.id !== unit.id));
    addToast({ type: 'success', title: 'Unidade removida', message: `${unit.nome} foi removida` });
    setMenuOpen(null);
  };

  const openCreateModal = () => {
    setEditingUnit(null);
    resetForm();
    setIsModalOpen(true);
  };

  return (
    <AppLayout
      title="Unidades"
      subtitle={`${units.length} unidades cadastradas`}
      actions={
        <AppButton size="sm" onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Nova
        </AppButton>
      }
    >
      <AppInput
        placeholder="Buscar unidade..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        leftIcon={<Search className="w-4 h-4" />}
        className="mb-4"
      />

      {filteredUnits.length === 0 ? (
        <AppEmptyState
          icon={<Users className="w-8 h-8 text-primary" />}
          title="Nenhuma unidade encontrada"
          description="Clique abaixo para criar sua primeira unidade"
          action={{ label: 'Criar Unidade', onClick: openCreateModal }}
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
                      background: unit.cores.length === 1
                        ? unit.cores[0]
                        : `linear-gradient(to right, ${unit.cores.join(', ')})`,
                    }}
                  />
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
                        <h3 className="font-semibold text-text-primary">{unit.nome}</h3>
                        <AppBadge
                          variant={unit.genero === 'M' ? 'info' : unit.genero === 'F' ? 'danger' : 'success'}
                          size="sm"
                        >
                          {unit.genero === 'M' ? 'Masculina' : unit.genero === 'F' ? 'Feminina' : 'Mista'}
                        </AppBadge>
                      </div>
                      <p className="text-sm text-muted">{unit.membrosCount} membros</p>
                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(menuOpen === unit.id ? null : unit.id);
                        }}
                        className="p-2 rounded-xl hover:bg-card transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-muted" />
                      </button>
                      <AnimatePresence>
                        {menuOpen === unit.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 top-full mt-2 w-40 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-10"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(unit);
                              }}
                              className="w-full px-4 py-3 text-left text-sm text-text-primary hover:bg-primary/10 flex items-center gap-2"
                            >
                              <Pencil className="w-4 h-4" />
                              Editar
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(unit);
                              }}
                              className="w-full px-4 py-3 text-left text-sm text-danger hover:bg-danger/10 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Excluir
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
            <label className="text-sm font-medium text-text-secondary ml-1 block mb-2">Gênero</label>
            <div className="flex gap-2">
              {UNIT_GENDERS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, genero: g.value as Unit['genero'] })}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-medium transition-all',
                    formData.genero === g.value
                      ? 'bg-primary text-background'
                      : 'bg-card border border-border text-text-secondary hover:border-primary/50'
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="text-sm font-medium text-text-secondary ml-1 block mb-2">
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

          {/* Logo da Unidade */}
          <div>
            <label className="text-sm font-medium text-text-secondary ml-1 block mb-2">
              Logo da Unidade
            </label>
            <div
              className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => addToast({ type: 'info', title: 'Em breve', message: 'Upload de imagem será implementado' })}
            >
              {formData.cores.length > 0 ? (
                <div className="relative">
                  <div
                    className="w-20 h-20 mx-auto rounded-xl flex items-center justify-center"
                    style={{
                      background: formData.cores.length === 1
                        ? formData.cores[0]
                        : `linear-gradient(135deg, ${formData.cores[0]}, ${formData.cores[formData.cores.length - 1]})`,
                    }}
                  >
                    <Image className="w-8 h-8 text-white/50" />
                  </div>
                  <p className="text-sm text-muted mt-2">Clique para adicionar logo</p>
                </div>
              ) : (
                <>
                  <Image className="w-8 h-8 text-muted mx-auto mb-2" />
                  <p className="text-sm text-text-secondary">Selecione as cores primeiro</p>
                </>
              )}
            </div>
          </div>

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