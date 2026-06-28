'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, Award, Loader2, Save, UserPlus, X, Check, Users, RotateCcw } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppTextarea } from '@/components/ui/AppInput';
import { AppModal } from '@/components/ui/AppModal';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase/client';
import { SPECIALTY_CATEGORIES, type EspecialidadeCategoria } from '@/types';
import { cn } from '@/utils/cn';
import { getMembrosDisponiveis, getMembrosPorEspecialidade, atribuirEspecialidade, removerEspecialidade, updateProgressoEspecialidade, type AtribuirDados } from '@/lib/queries/especialidades';
import { useClubId } from '@/hooks';

interface Especialidade {
  id: string;
  nome: string;
  categoria: string;
  descricao?: string;
  imagem?: string;
  ativo: boolean;
}

export default function EspecialidadesPage() {
  const CLUB_ID = useClubId();
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEsp, setEditingEsp] = useState<Especialidade | null>(null);
  const [saving, setSaving] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [formData, setFormData] = useState({
    nome: '',
    categoria: SPECIALTY_CATEGORIES[0],
    descricao: '',
  });
  // Atribuição de especialidades
  const [assignEsp, setAssignEsp] = useState<Especialidade | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [membrosDisponiveis, setMembrosDisponiveis] = useState<any[]>([]);
  const [membrosAtribuidos, setMembrosAtribuidos] = useState<any[]>([]);
  const [selectedMembroId, setSelectedMembroId] = useState('');
  const [assignData, setAssignData] = useState({ data_inicio: new Date().toISOString().split('T')[0], instrutor: '', descricao: '' });
  const [assigning, setAssigning] = useState(false);
  const { addToast } = useToast();

  const carregarDados = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('especialidades')
        .select('*')
        .order('nome');

      if (filtroCategoria !== 'TODAS') {
        query = query.eq('categoria', filtroCategoria);
      }

      const { data, error } = await query;
      if (error) throw error;
      setEspecialidades(data || []);
    } catch (error) {
      console.error('Erro ao carregar especialidades:', error);
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao carregar especialidades' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [filtroCategoria]);

  const filtered = especialidades.filter(e =>
    e.nome.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (esp?: Especialidade) => {
    if (esp) {
      setEditingEsp(esp);
      setFormData({
        nome: esp.nome,
        categoria: esp.categoria as EspecialidadeCategoria,
        descricao: esp.descricao || '',
      });
    } else {
      setEditingEsp(null);
      setFormData({ nome: '', categoria: SPECIALTY_CATEGORIES[0], descricao: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      addToast({ type: 'error', title: 'Erro', message: 'Nome é obrigatório' });
      return;
    }
    try {
      setSaving(true);
      if (editingEsp) {
        const { error } = await supabase
          .from('especialidades')
          .update({
            nome: formData.nome,
            categoria: formData.categoria,
            descricao: formData.descricao || null,
          })
          .eq('id', editingEsp.id);
        if (error) throw error;
        addToast({ type: 'success', title: 'Sucesso', message: 'Especialidade atualizada' });
      } else {
        const { error } = await supabase
          .from('especialidades')
          .insert({
            nome: formData.nome,
            categoria: formData.categoria,
            descricao: formData.descricao || null,
            ativo: true,
          });
        if (error) throw error;
        addToast({ type: 'success', title: 'Sucesso', message: 'Especialidade criada' });
      }
      setIsModalOpen(false);
      setEditingEsp(null);
      await carregarDados();
    } catch (error: any) {
      console.error('Erro ao salvar:', JSON.stringify(error));
      addToast({ type: 'error', title: 'Erro', message: error?.message || 'Falha ao salvar especialidade' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (esp: Especialidade) => {
    if (!confirm(`Excluir "${esp.nome}" permanentemente?`)) return;
    try {
      const { error } = await supabase
        .from('especialidades')
        .delete()
        .eq('id', esp.id);
      if (error) throw error;
      addToast({ type: 'success', title: 'Sucesso', message: 'Especialidade excluída' });
      await carregarDados();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao excluir especialidade' });
    }
  };

  const handleOpenAssign = async (esp: Especialidade) => {
    setAssignEsp(esp);
    setSelectedMembroId('');
    setAssignData({ data_inicio: new Date().toISOString().split('T')[0], instrutor: '', descricao: '' });
    try {
      const [membros, atribuidos] = await Promise.all([
        getMembrosDisponiveis(CLUB_ID),
        getMembrosPorEspecialidade(esp.id),
      ]);
      setMembrosDisponiveis(membros);
      setMembrosAtribuidos(atribuidos);
      setIsAssignModalOpen(true);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao carregar membros' });
    }
  };

  const handleAtribuir = async () => {
    if (!selectedMembroId || !assignEsp) return;
    if (!assignData.instrutor.trim()) {
      addToast({ type: 'error', title: 'Erro', message: 'Informe o instrutor' });
      return;
    }
    try {
      setAssigning(true);
      await atribuirEspecialidade(selectedMembroId, assignEsp.id, assignData);
      addToast({ type: 'success', title: 'Sucesso', message: 'Especialidade atribuída ao membro' });
      setSelectedMembroId('');
      setAssignData({ data_inicio: new Date().toISOString().split('T')[0], instrutor: '', descricao: '' });
      const atribuidos = await getMembrosPorEspecialidade(assignEsp.id);
      setMembrosAtribuidos(atribuidos);
    } catch (error) {
      console.error('Erro ao atribuir:', error);
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao atribuir especialidade' });
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoverAtribuicao = async (membroId: string) => {
    if (!assignEsp) return;
    try {
      await removerEspecialidade(membroId, assignEsp.id);
      addToast({ type: 'success', title: 'Removido', message: 'Atribuição removida' });
      const atribuidos = await getMembrosPorEspecialidade(assignEsp.id);
      setMembrosAtribuidos(atribuidos);
    } catch (error) {
      console.error('Erro ao remover:', error);
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao remover atribuição' });
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Especialidades" subtitle="Gerenciamento de especialidades">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Especialidades"
      subtitle={`${especialidades.length} especialidades cadastradas`}
      actions={
        <AppButton variant="primary" size="sm" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-1" />
          Nova
        </AppButton>
      }
    >
      <div className="space-y-4">
        {/* Filtro de categoria */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFiltroCategoria('TODAS')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
              filtroCategoria === 'TODAS' ? 'bg-primary text-white' : 'bg-surface text-muted'
            )}
          >
            Todas
          </button>
          {SPECIALTY_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFiltroCategoria(cat)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                filtroCategoria === cat ? 'bg-primary text-white' : 'bg-surface text-muted'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Busca */}
        <AppInput
          placeholder="Buscar especialidade..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />

        {/* Lista */}
        {filtered.length === 0 ? (
          <AppEmptyState
            icon={<Award className="w-10 h-10 text-primary" />}
            title="Nenhuma especialidade encontrada"
            description="Cadastre a primeira especialidade para começar."
            action={{ label: 'Nova Especialidade', onClick: () => handleOpenModal() }}
          />
        ) : (
          <div className="space-y-2">
            {filtered.map((esp, index) => (
              <motion.div
                key={esp.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <AppCard hover className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-text-primary">{esp.nome}</h4>
                        <AppBadge size="sm" variant="primary">
                          {esp.categoria}
                        </AppBadge>
                      </div>
                      {esp.descricao && (
                        <p className="text-xs text-muted mt-1 line-clamp-1">{esp.descricao}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <AppButton variant="ghost" size="sm" onClick={() => handleOpenAssign(esp)} title="Atribuir a membro">
                        <UserPlus className="w-4 h-4 text-primary" />
                      </AppButton>
                      <AppButton variant="ghost" size="sm" onClick={() => handleOpenModal(esp)}>
                        <Pencil className="w-4 h-4" />
                      </AppButton>
                      <AppButton variant="ghost" size="sm" onClick={() => handleDelete(esp)}>
                        <Trash2 className="w-4 h-4 text-danger" />
                      </AppButton>
                    </div>
                  </div>
                </AppCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <AppModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingEsp(null); }}
        title={editingEsp ? 'Editar Especialidade' : 'Nova Especialidade'}
        size="md"
      >
        <div className="space-y-4">
          <AppInput
            label="Nome *"
            placeholder="Ex: Primeiros Socorros"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          />
          <div>
            <label className="text-sm font-medium mb-1 block">Categoria *</label>
            <select
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value as EspecialidadeCategoria })}
              className="w-full p-3 rounded-xl border border-border bg-card text-text-primary"
            >
              {SPECIALTY_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <AppTextarea
            label="Descrição"
            placeholder="Descrição da especialidade..."
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            rows={3}
          />
          <div className="flex gap-3 pt-2">
            <AppButton variant="secondary" onClick={() => { setIsModalOpen(false); setEditingEsp(null); }} className="flex-1">
              Cancelar
            </AppButton>
            <AppButton onClick={handleSave} isLoading={saving} className="flex-1">
              <Save className="w-4 h-4 mr-1" />
              {editingEsp ? 'Salvar' : 'Criar'}
            </AppButton>
          </div>
        </div>
      </AppModal>
      {/* Atribuir Especialidade Modal */}
      <AppModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Atribuir: ${assignEsp?.nome || ''}`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Membro *</label>
            <select
              value={selectedMembroId}
              onChange={(e) => setSelectedMembroId(e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-card text-text-primary"
            >
              <option value="">Selecione um membro...</option>
              {membrosDisponiveis
                .filter(m => !membrosAtribuidos.some(a => a.membro_id === m.id))
                .map(m => (
                  <option key={m.id} value={m.id}>{m.nome}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Data de Início</label>
            <input
              type="date"
              value={assignData.data_inicio}
              onChange={(e) => setAssignData({ ...assignData, data_inicio: e.target.value })}
              className="w-full p-3 rounded-xl border border-border bg-card text-text-primary"
            />
          </div>

          <AppInput
            label="Instrutor *"
            placeholder="Nome do instrutor"
            value={assignData.instrutor}
            onChange={(e) => setAssignData({ ...assignData, instrutor: e.target.value })}
          />

          <div>
            <label className="text-sm font-medium mb-1 block">Descrição</label>
            <textarea
              placeholder="Observações sobre a atribuição..."
              value={assignData.descricao}
              onChange={(e) => setAssignData({ ...assignData, descricao: e.target.value })}
              className="w-full p-3 rounded-xl border border-border bg-card text-text-primary text-sm min-h-[80px] resize-none"
              rows={3}
            />
          </div>

          <AppButton
                onClick={handleAtribuir}
                disabled={!selectedMembroId || !assignData.instrutor.trim()}
                isLoading={assigning}
                className="w-full"
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Atribuir
              </AppButton>

          {membrosAtribuidos.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">
                Membros com esta especialidade ({membrosAtribuidos.length})
              </h4>
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {membrosAtribuidos.map((ma) => (
                  <div
                    key={ma.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-card border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{ma.membro?.nome || 'Membro'}</p>
                        <p className="text-xs text-muted">
                          {ma.concluido ? '✓ Concluída' : 'Em andamento'}
                          {ma.data_inicio && ` • ${new Date(ma.data_inicio).toLocaleDateString('pt-BR')}`}
                        </p>
                        {ma.instrutor && (
                          <p className="text-xs text-muted">Instrutor: {ma.instrutor}</p>
                        )}
                        {ma.descricao && (
                          <p className="text-xs text-muted mt-0.5 italic line-clamp-1">{ma.descricao}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <AppButton
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          if (!assignEsp) return;
                          await updateProgressoEspecialidade(ma.membro_id, assignEsp.id, !ma.concluido);
                          const atribuidos = await getMembrosPorEspecialidade(assignEsp.id);
                          setMembrosAtribuidos(atribuidos);
                          addToast({
                            type: ma.concluido ? 'warning' : 'success',
                            title: ma.concluido ? 'Desmarcado' : 'Concluída',
                            message: `${ma.membro?.nome || 'Membro'} ${ma.concluido ? 'teve conclusão removida' : 'completou a especialidade'}`,
                          });
                        }}
                        title={ma.concluido ? 'Desmarcar conclusão' : 'Marcar como concluída'}
                      >
                        {ma.concluido ? (
                          <RotateCcw className="w-4 h-4 text-warning" />
                        ) : (
                          <Check className="w-4 h-4 text-success" />
                        )}
                      </AppButton>
                      <AppButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoverAtribuicao(ma.membro_id)}
                      >
                        <X className="w-4 h-4 text-danger" />
                      </AppButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {membrosAtribuidos.length === 0 && (
            <p className="text-sm text-muted text-center py-4">
              Nenhum membro atribuído a esta especialidade ainda
            </p>
          )}
        </div>
      </AppModal>
    </AppLayout>
  );
}
