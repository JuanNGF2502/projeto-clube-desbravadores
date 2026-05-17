'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, Loader2, MapPin, Mail, Phone, Building2, Check } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppModal } from '@/components/ui/AppModal';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/stores/appStore';

interface ClubeData {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  regional?: string;
  associacao?: string;
  logo?: string;
  email?: string;
  telefone?: string;
  ativo: boolean;
  created_at?: string;
}

export default function ClubesPage() {
  const { addToast } = useToast();
  const { setClubeAtual } = useAppStore();

  const [clubes, setClubes] = useState<ClubeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const [editingClube, setEditingClube] = useState<ClubeData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    cidade: '',
    estado: '',
    regional: '',
    associacao: '',
    email: '',
    telefone: '',
  });

  const carregarClubes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('clubes')
        .select('*')
        .order('nome');

      if (error) throw error;
      setClubes(data || []);
    } catch (error) {
      console.error('Erro ao carregar clubes:', error);
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao carregar clubes' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarClubes();
  }, []);

  const filteredClubes = clubes.filter(c =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.estado || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (clube?: ClubeData) => {
    if (clube) {
      setEditingClube(clube);
      setFormData({
        nome: clube.nome,
        cidade: clube.cidade,
        estado: clube.estado,
        regional: clube.regional || '',
        associacao: clube.associacao || '',
        email: clube.email || '',
        telefone: clube.telefone || '',
      });
    } else {
      setEditingClube(null);
      setFormData({
        nome: '',
        cidade: '',
        estado: '',
        regional: '',
        associacao: '',
        email: '',
        telefone: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.cidade || !formData.estado) {
      addToast({ type: 'error', title: 'Erro', message: 'Preencha os campos obrigatórios' });
      return;
    }

    try {
      setIsLoadingSave(true);

      if (editingClube) {
        const { error } = await supabase
          .from('clubes')
          .update({
            nome: formData.nome,
            cidade: formData.cidade,
            estado: formData.estado,
            regional: formData.regional || null,
            associacao: formData.associacao || null,
            email: formData.email || null,
            telefone: formData.telefone || null,
          })
          .eq('id', editingClube.id);

        if (error) throw error;
        addToast({ type: 'success', title: 'Sucesso', message: 'Clube atualizado' });
      } else {
        const { data, error } = await supabase
          .from('clubes')
          .insert({
            nome: formData.nome,
            cidade: formData.cidade,
            estado: formData.estado,
            regional: formData.regional || null,
            associacao: formData.associacao || null,
            email: formData.email || null,
            telefone: formData.telefone || null,
            ativo: true,
          })
          .select()
          .single();

        if (error) throw error;

        if (clubes.length === 0 && data) {
          setClubeAtual({
            id: data.id,
            nome: data.nome,
            cidade: data.cidade,
            estado: data.estado,
          });
        }

        addToast({ type: 'success', title: 'Sucesso', message: 'Clube criado' });
      }

      setIsModalOpen(false);
      carregarClubes();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao salvar clube' });
    } finally {
      setIsLoadingSave(false);
    }
  };

  const handleDelete = async (clube: ClubeData) => {
    if (!confirm(`Tem certeza que deseja excluir "${clube.nome}"?`)) return;

    try {
      const { error } = await supabase
        .from('clubes')
        .delete()
        .eq('id', clube.id);

      if (error) throw error;
      addToast({ type: 'success', title: 'Sucesso', message: 'Clube excluído' });
      carregarClubes();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao excluir clube' });
    }
  };

  const handleSelecionar = (clube: ClubeData) => {
    setClubeAtual({
      id: clube.id,
      nome: clube.nome,
      cidade: clube.cidade,
      estado: clube.estado,
    });
    addToast({
      type: 'success',
      title: 'Clube selecionado',
      message: `${clube.nome} agora é o clube ativo`,
    });
  };

  if (isLoading) {
    return (
      <AppLayout title="Clubes" subtitle="Gerencie os clubes">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Clubes"
      subtitle="Gerencie os clubes do sistema"
      actions={
        <AppButton variant="primary" size="sm" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-1" />
          Novo Clube
        </AppButton>
      }
    >
      <div className="mb-4">
        <AppInput
          placeholder="Buscar clubes por nome, cidade ou estado..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search className="w-5 h-5" />}
        />
      </div>

      {filteredClubes.length === 0 ? (
        <AppEmptyState
          icon={Building2}
          title="Nenhum clube encontrado"
          description={searchTerm ? 'Tente buscar com outros termos' : 'Cadastre o primeiro clube'}
          action={
            !searchTerm && (
              <AppButton size="sm" onClick={() => handleOpenModal()}>
                <Plus className="w-4 h-4 mr-1" />
                Novo Clube
              </AppButton>
            )
          }
        />
      ) : (
        <div className="grid gap-4">
          {filteredClubes.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AppCard hover>
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#3B82F620' }}
                  >
                    {c.logo ? (
                      <img src={c.logo} alt={c.nome} className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      <Building2 className="w-7 h-7 text-primary" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-text-primary">{c.nome}</h3>
                      <AppBadge variant={c.ativo ? 'success' : 'secondary'} size="sm">
                        {c.ativo ? 'Ativo' : 'Inativo'}
                      </AppBadge>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-muted">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {c.cidade} - {c.estado}
                      </div>
                    </div>

                    {(c.associacao || c.regional) && (
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted">
                        {c.associacao && <span>{c.associacao}</span>}
                        {c.regional && <span>Regional: {c.regional}</span>}
                      </div>
                    )}

                    {(c.email || c.telefone) && (
                      <div className="flex items-center gap-3 mt-2 text-sm text-muted">
                        {c.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {c.email}
                          </div>
                        )}
                        {c.telefone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {c.telefone}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <AppButton variant="ghost" size="sm" onClick={() => handleSelecionar(c)} title="Selecionar">
                      <Check className="w-4 h-4" />
                    </AppButton>
                    <AppButton variant="ghost" size="sm" onClick={() => handleOpenModal(c)}>
                      <Pencil className="w-4 h-4" />
                    </AppButton>
                    <AppButton variant="ghost" size="sm" onClick={() => handleDelete(c)}>
                      <Trash2 className="w-4 h-4 text-danger" />
                    </AppButton>
                  </div>
                </div>
              </AppCard>
            </motion.div>
          ))}
        </div>
      )}

      <AppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClube ? 'Editar Clube' : 'Novo Clube'}
        size="md"
      >
        <div className="space-y-4">
          <AppInput
            label="Nome do Clube *"
            placeholder="Ex: Clube de Desbravadores Central"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <AppInput
              label="Cidade *"
              placeholder="Ex: São Paulo"
              value={formData.cidade}
              onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
            />
            <AppInput
              label="Estado *"
              placeholder="Ex: SP"
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <AppInput
              label="Regional"
              placeholder="Ex: Sudeste"
              value={formData.regional}
              onChange={(e) => setFormData({ ...formData, regional: e.target.value })}
            />
            <AppInput
              label="Associação"
              placeholder="Ex: Associação Paulista"
              value={formData.associacao}
              onChange={(e) => setFormData({ ...formData, associacao: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <AppInput
              label="Email"
              type="email"
              placeholder="clube@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <AppInput
              label="Telefone"
              placeholder="(11) 99999-9999"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <AppButton variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancelar
            </AppButton>
            <AppButton onClick={handleSave} isLoading={isLoadingSave} className="flex-1">
              <Check className="w-4 h-4 mr-1" />
              Salvar
            </AppButton>
          </div>
        </div>
      </AppModal>
    </AppLayout>
  );
}