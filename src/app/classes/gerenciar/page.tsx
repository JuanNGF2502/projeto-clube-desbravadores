'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, BookOpen, Loader2, ChevronDown, ChevronRight, Save, X } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppTextarea } from '@/components/ui/AppInput';
import { AppModal } from '@/components/ui/AppModal';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';
import { DEFAULT_CLASSES } from '@/types';

interface Requisito {
  id: string;
  classe_id: string;
  area: string;
  nome: string;
  descricao?: string;
  ordem: number;
  ativo: boolean;
}

interface Classe {
  id: string;
  nome: string;
  cor: string;
  ordem: number;
  descricao?: string;
}

// Áreas disponíveis
const AREAS = [
  'Espiritualidade',
  'Habilidades',
  'Vida ao Ar Livre',
  'Liderança',
  'Comunidade',
  'Ensino',
  'Uniforme',
  'Atividades ao Ar Livre',
];

export default function GerenciarRequisitosPage() {
  const [classes, setClasses] = useState<Classe[]>([]);
  const [requisitos, setRequisitos] = useState<Requisito[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRequisito, setEditingRequisito] = useState<Requisito | null>(null);
  const [formData, setFormData] = useState({
    classe_id: '',
    area: '',
    nome: '',
    descricao: '',
    ordem: 1,
  });
  const { addToast } = useToast();

  const carregarDados = async () => {
    try {
      setIsLoading(true);

      // Buscar classes
      const { data: classesData } = await supabase
        .from('classes')
        .select('*')
        .order('ordem');

      // Se não houver classes no banco, usar default
      const classesList = classesData && classesData.length > 0
        ? classesData.map((c: any) => ({
            id: c.id,
            nome: c.nome,
            cor: c.cor || '#3B82F6',
            ordem: c.ordem,
            descricao: c.descricao,
          }))
        : DEFAULT_CLASSES.map(c => ({
            id: c.id,
            nome: c.nome,
            cor: c.cor,
            ordem: c.ordem,
            descricao: c.descricao,
          }));

      setClasses(classesList);

      // Buscar requisitos
      const { data: requisitosData } = await supabase
        .from('requisitos_classe')
        .select('*')
        .order('ordem');

      setRequisitos(requisitosData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Fallback para dados locais
      setClasses(DEFAULT_CLASSES.map(c => ({
        id: c.id,
        nome: c.nome,
        cor: c.cor,
        ordem: c.ordem,
        descricao: c.descricao,
      })));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const toggleClass = (classeId: string) => {
    const newExpanded = new Set(expandedClasses);
    if (newExpanded.has(classeId)) {
      newExpanded.delete(classeId);
    } else {
      newExpanded.add(classeId);
    }
    setExpandedClasses(newExpanded);
  };

  const getRequisitosPorClasse = (classeId: string) => {
    return requisitos.filter(r => r.classe_id === classeId);
  };

  const handleOpenModal = (classeId?: string, requisito?: Requisito) => {
    if (requisito) {
      setEditingRequisito(requisito);
      setFormData({
        classe_id: requisito.classe_id,
        area: requisito.area,
        nome: requisito.nome,
        descricao: requisito.descricao || '',
        ordem: requisito.ordem,
      });
    } else {
      setEditingRequisito(null);
      setFormData({
        classe_id: classeId || '',
        area: AREAS[0],
        nome: '',
        descricao: '',
        ordem: 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.classe_id || !formData.area || !formData.nome.trim()) {
      addToast({ type: 'error', title: 'Erro', message: 'Preencha todos os campos obrigatórios' });
      return;
    }

    try {
      if (editingRequisito) {
        // Atualizar
        const { error } = await supabase
          .from('requisitos_classe')
          .update({
            area: formData.area,
            nome: formData.nome,
            descricao: formData.descricao || null,
            ordem: formData.ordem,
          })
          .eq('id', editingRequisito.id);

        if (error) throw error;
        addToast({ type: 'success', title: 'Sucesso', message: 'Requisito atualizado' });
      } else {
        // Criar
        const { error } = await supabase
          .from('requisitos_classe')
          .insert({
            classe_id: formData.classe_id,
            area: formData.area,
            nome: formData.nome,
            descricao: formData.descricao || null,
            ordem: formData.ordem,
            ativo: true,
          });

        if (error) throw error;
        addToast({ type: 'success', title: 'Sucesso', message: 'Requisito criado' });
      }

      setIsModalOpen(false);
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao salvar requisito' });
    }
  };

  const handleDelete = async (requisito: Requisito) => {
    if (!confirm(`Tem certeza que deseja excluir "${requisito.nome}"?`)) return;

    try {
      const { error } = await supabase
        .from('requisitos_classe')
        .delete()
        .eq('id', requisito.id);

      if (error) throw error;
      addToast({ type: 'success', title: 'Sucesso', message: 'Requisito excluído' });
      carregarDados();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao excluir requisito' });
    }
  };

  // Agrupar requisitos por área dentro de cada classe
  const getRequisitosPorArea = (classeId: string) => {
    const requisitosClasse = getRequisitosPorClasse(classeId);
    const porArea: Record<string, Requisito[]> = {};

    requisitosClasse.forEach(req => {
      if (!porArea[req.area]) {
        porArea[req.area] = [];
      }
      porArea[req.area].push(req);
    });

    return porArea;
  };

  if (isLoading) {
    return (
      <AppLayout title="Gerenciar Requisitos" subtitle="CRUD de requisitos das classes">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Gerenciar Requisitos"
      subtitle="CRUD completo dos requisitos das classes"
      actions={
        <AppButton variant="primary" size="sm" onClick={() => handleOpenModal(classes[0]?.id)}>
          <Plus className="w-4 h-4 mr-1" />
          Novo Requisito
        </AppButton>
      }
    >
      <div className="space-y-4">
        {classes.map((classe) => {
          const requisitosClasse = getRequisitosPorClasse(classe.id);
          const isExpanded = expandedClasses.has(classe.id);
          const porArea = getRequisitosPorArea(classe.id);

          return (
            <motion.div
              key={classe.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AppCard
                hover
                className="overflow-hidden"
              >
                {/* Header da classe */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleClass(classe.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${classe.cor}20` }}
                    >
                      <BookOpen className="w-5 h-5" style={{ color: classe.cor }} />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: 'var(--text-color)' }}>{classe.nome}</h3>
                      <p className="text-xs" style={{ color: 'var(--text-secondary-color)' }}>
                        {requisitosClasse.length} requisitos
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AppButton
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(classe.id);
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </AppButton>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-muted" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted" />
                    )}
                  </div>
                </div>

                {/* Lista de requisitos por área */}
                {isExpanded && (
                  <div className="border-t border-border p-4 space-y-4">
                    {Object.keys(porArea).length === 0 ? (
                      <p className="text-sm text-muted text-center py-4">
                        Nenhum requisito cadastrado
                      </p>
                    ) : (
                      Object.entries(porArea).map(([area, reqs]) => (
                        <div key={area}>
                          <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>
                            {area}
                          </h4>
                          <div className="space-y-2">
                            {reqs.map((req) => (
                              <div
                                key={req.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm" style={{ color: 'var(--text-color)' }}>
                                    {req.nome}
                                  </p>
                                  {req.descricao && (
                                    <p className="text-xs text-muted line-clamp-1">{req.descricao}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <AppButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOpenModal(undefined, req)}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </AppButton>
                                  <AppButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(req)}
                                  >
                                    <Trash2 className="w-4 h-4 text-danger" />
                                  </AppButton>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </AppCard>
            </motion.div>
          );
        })}
      </div>

      {/* Modal de criar/editar requisito */}
      <AppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRequisito ? 'Editar Requisito' : 'Novo Requisito'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Classe *</label>
            <select
              value={formData.classe_id}
              onChange={(e) => setFormData({ ...formData, classe_id: e.target.value })}
              className="w-full p-3 rounded-xl border border-border bg-card text-text-primary"
            >
              <option value="">Selecione a classe</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Área *</label>
            <select
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              className="w-full p-3 rounded-xl border border-border bg-card text-text-primary"
            >
              {AREAS.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          <AppInput
            label="Nome do Requisito *"
            placeholder="Ex: Ler o livro de Lucas"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          />

          <AppTextarea
            label="Descrição"
            placeholder="Descrição detalhada do requisito..."
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            rows={3}
          />

          <AppInput
            label="Ordem"
            type="number"
            min={1}
            value={formData.ordem}
            onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 1 })}
          />

          <div className="flex gap-3 pt-2">
            <AppButton
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Cancelar
            </AppButton>
            <AppButton onClick={handleSave} className="flex-1">
              <Save className="w-4 h-4 mr-1" />
              Salvar
            </AppButton>
          </div>
        </div>
      </AppModal>
    </AppLayout>
  );
}