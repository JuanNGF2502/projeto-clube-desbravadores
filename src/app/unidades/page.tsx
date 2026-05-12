'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Users, Search, Image, Mic } from 'lucide-react';
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

// Mock scores for units
const unitScores: Record<string, number> = {
  '1': 850,
  '2': 720,
};

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
  };

  return (
    <AppLayout title="Unidades" subtitle={`${units.length} unidades cadastradas`}>
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
          description="Gerencie suas unidades pelo perfil"
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
                        <h3 className="font-semibold" style={{ color: 'var(--text-color)' }}>{unit.nome}</h3>
                        <AppBadge
                          variant={unit.genero === 'M' ? 'info' : unit.genero === 'F' ? 'danger' : 'success'}
                          size="sm"
                        >
                          {unit.genero === 'M' ? 'Masculina' : unit.genero === 'F' ? 'Feminina' : 'Mista'}
                        </AppBadge>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary-color)' }}>
                        {unit.membrosCount} membros
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{unitScores[unit.id] || 0}</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary-color)' }}>pontos</p>
                      </div>
                      <svg className="w-5 h-5" style={{ color: 'var(--text-secondary-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Create/Edit Modal - triggered from profile */}
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
            <label className="text-sm font-medium ml-1 block mb-2" style={{ color: 'var(--text-secondary-color)' }}>Gênero</label>
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
                      : 'border transition-colors'
                  )}
                  style={{
                    backgroundColor: formData.genero === g.value ? undefined : 'var(--card-color)',
                    borderColor: formData.genero === g.value ? undefined : 'var(--border-color)',
                    color: formData.genero === g.value ? undefined : 'var(--text-secondary-color)',
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="text-sm font-medium ml-1 block mb-2" style={{ color: 'var(--text-secondary-color)' }}>
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
            <label className="text-sm font-medium ml-1 block mb-2" style={{ color: 'var(--text-secondary-color)' }}>
              Logo da Unidade
            </label>
            <div
              className="border-2 border-dashed rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
              style={{ borderColor: 'var(--border-color)' }}
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
                  <p className="text-sm mt-2" style={{ color: 'var(--text-secondary-color)' }}>Clique para adicionar logo</p>
                </div>
              ) : (
                <>
                  <Image className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-secondary-color)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-secondary-color)' }}>Selecione as cores primeiro</p>
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