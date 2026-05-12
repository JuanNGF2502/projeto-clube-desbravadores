'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Filter, Search, Award, Check } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppModal } from '@/components/ui/AppModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppStatsCard } from '@/components/ui/AppStatsCard';
import { useToast } from '@/components/ui/Toast';
import { Especialidade, EspecialidadeCategoria, SPECIALTY_CATEGORIES } from '@/types';

const initialSpecialties: Especialidade[] = [
  { id: '1', nome: 'Primeiros Socorros', categoria: 'SAÚDE', descricao: 'Aprenda técnicas básicas de primeiros socorros', nivel: 1 },
  { id: '2', nome: 'Orientação', categoria: 'NATUREZA', descricao: 'Aprenda a usar bússola e ler mapas', nivel: 1 },
  { id: '3', nome: 'Camping', categoria: 'NATUREZA', descricao: 'Técnicas de camping e sobrevivência outdoor', nivel: 1 },
  { id: '4', nome: 'Culinária', categoria: 'DOMÉSTICA', descricao: 'Preparação de refeições ao ar livre', nivel: 1 },
  { id: '5', nome: 'Caminhada', categoria: 'RECREATIVA', descricao: 'Longas caminhadas e trilhas', nivel: 1 },
  { id: '6', nome: 'Construção', categoria: 'ARTE manual', descricao: 'Trabalhos manuais e construção', nivel: 1 },
  { id: '7', nome: 'Comunicação', categoria: 'MISSIONÁRIA', descricao: 'Evangelismo e pregação', nivel: 2 },
  { id: '8', nome: 'Saúde Pública', categoria: 'SAÚDE', descricao: 'Promoção da saúde e prevenção', nivel: 2 },
  { id: '9', nome: 'Agricultura', categoria: 'PROFISSIONAL', descricao: 'Cultivo e manejo da terra', nivel: 2 },
];

const specialtyRequirements = [
  'Estudar o material teórico',
  'Completar as horas de prática',
  'Passar na avaliação prática',
  'Apresentar projeto final',
  'Participar de atividades supervisionadas',
];

export default function SpecialtiesPage() {
  const [specialties] = useState<Especialidade[]>(initialSpecialties);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<Especialidade | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completedReqs, setCompletedReqs] = useState<number[]>([]);
  const { addToast } = useToast();

  const filteredSpecialties = specialties.filter((s) => {
    const matchesSearch = s.nome.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || s.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryOptions = [
    { value: '', label: 'Todas as categorias' },
    ...SPECIALTY_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
  ];

  const categoryColors: Record<EspecialidadeCategoria, string> = {
    'ARTE manual': '#F59E0B',
    NATUREZA: '#22C55E',
    SAÚDE: '#EF4444',
    'MISSIONÁRIA': '#3B82F6',
    PROFISSIONAL: '#8B5CF6',
    DOMÉSTICA: '#EC4899',
    RECREATIVA: '#06B6D4',
  };

  const handleSpecialtyClick = (specialty: Especialidade) => {
    setSelectedSpecialty(specialty);
    setIsModalOpen(true);
    setCompletedReqs([]);
  };

  const toggleRequirement = (index: number) => {
    setCompletedReqs((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleMarkComplete = () => {
    if (completedReqs.length === specialtyRequirements.length) {
      addToast({
        type: 'success',
        title: 'Parabéns!',
        message: `${selectedSpecialty?.nome} foi completada com sucesso!`,
      });
    } else {
      const progress = Math.round((completedReqs.length / specialtyRequirements.length) * 100);
      addToast({
        type: 'info',
        title: 'Progresso salvo',
        message: `${progress}% dos requisitos concluídos`,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <AppLayout
      title="Especialidades"
      subtitle={`${specialties.length} especialidades disponíveis`}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-6"
      >
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <AppStatsCard label="Especialidades" value={specialties.length} icon={Star} color="primary" />
          <AppStatsCard label="Concluídas" value={Math.floor(specialties.length * 0.3)} icon={Award} color="success" />
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <AppInput
            placeholder="Buscar especialidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <AppSelect
            options={categoryOptions}
            value={selectedCategory}
            onChange={setSelectedCategory}
            placeholder="Filtrar por categoria"
          />
        </div>

        {/* Category badges */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {SPECIALTY_CATEGORIES.map((cat) => (
            <AppBadge
              key={cat}
              variant={selectedCategory === cat ? 'primary' : 'secondary'}
              size="sm"
              className="flex-shrink-0 cursor-pointer"
              onClick={() => setSelectedCategory(selectedCategory === cat ? '' : cat)}
            >
              {cat}
            </AppBadge>
          ))}
        </div>

        {/* Specialties Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredSpecialties.map((specialty, index) => (
            <motion.div
              key={specialty.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <AppCard
                hover
                onClick={() => handleSpecialtyClick(specialty)}
                className="cursor-pointer text-center"
                padding="sm"
              >
                <div
                  className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: `${categoryColors[specialty.categoria]}20` }}
                >
                  <Star className="w-6 h-6" style={{ color: categoryColors[specialty.categoria] }} />
                </div>
                <h4 className="font-medium text-text-primary text-sm mb-1">{specialty.nome}</h4>
                <AppBadge variant="ghost" size="sm">
                  {specialty.categoria}
                </AppBadge>
                <div className="flex items-center justify-center gap-1 mt-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < specialty.nivel ? 'bg-primary' : 'bg-border'
                      }`}
                    />
                  ))}
                </div>
              </AppCard>
            </motion.div>
          ))}
        </div>

        {filteredSpecialties.length === 0 && (
          <div className="text-center py-12">
            <Star className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-muted">Nenhuma especialidade encontrada</p>
          </div>
        )}
      </motion.div>

      {/* Specialty Detail Modal */}
      <AppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedSpecialty?.nome || ''}
        description={`Especialidade de ${selectedSpecialty?.categoria}`}
        size="lg"
      >
        {selectedSpecialty && (
          <div className="space-y-4">
            <div
              className="h-20 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${categoryColors[selectedSpecialty.categoria]}20` }}
            >
              <Star className="w-10 h-10" style={{ color: categoryColors[selectedSpecialty.categoria] }} />
            </div>

            <p className="text-sm text-muted">{selectedSpecialty.descricao}</p>

            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">Nível:</span>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    i < selectedSpecialty.nivel ? 'bg-primary' : 'bg-card border border-border'
                  }`}
                >
                  <span className={`text-xs ${i < selectedSpecialty.nivel ? 'text-background' : 'text-muted'}`}>
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>

            <div>
              <h4 className="font-medium text-text-primary mb-3">Requisitos</h4>
              <div className="space-y-2">
                {specialtyRequirements.map((req, index) => (
                  <button
                    key={index}
                    onClick={() => toggleRequirement(index)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                      completedReqs.includes(index)
                        ? 'bg-success/10 border-success/30'
                        : 'bg-card border-border hover:border-primary/30'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        completedReqs.includes(index) ? 'bg-success' : 'bg-card border border-border'
                      }`}
                    >
                      {completedReqs.includes(index) && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <span
                      className={`text-sm ${
                        completedReqs.includes(index) ? 'text-success' : 'text-text-primary'
                      }`}
                    >
                      {req}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <AppButton variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
                Fechar
              </AppButton>
              <AppButton onClick={handleMarkComplete} className="flex-1" leftIcon={<Check className="w-4 h-4" />}>
                {completedReqs.length === specialtyRequirements.length ? 'Completar' : 'Salvar'}
              </AppButton>
            </div>
          </div>
        )}
      </AppModal>
    </AppLayout>
  );
}
