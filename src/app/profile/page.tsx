"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Settings, LogOut, ShieldCheck, Sun, Moon, Plus, Pencil, Trash2, Users, UserPlus, ChevronRight, User2Icon, UserCog, BookOpen, Mail, Award, KeyRound, Check, X, ClipboardCheck, Play, Square, Clock, Calendar } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppModal } from "@/components/ui/AppModal";
import { AppInput } from "@/components/ui/AppInput";
import { AppTextarea } from "@/components/ui/AppInput";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { useToast } from "@/components/ui/Toast";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth, Profile } from "@/hooks";
import { cn } from "@/utils/cn";
import { Unit, UNIT_GENDERS, DEFAULT_UNIT_COLORS } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { getTodasUnidades, createUnidade, updateUnidade, deleteUnidade } from '@/lib/queries';
import { getEspecialidadesMembro } from '@/lib/queries/especialidades';
import { getSessoesPorUnidade, criarSessao, ativarSessao, updateSessao, deleteSessao, SessaoAvaliacao } from '@/lib/queries/sessoes-avaliacao';
import { useClubId } from '@/hooks';
import { formatDateBR, toLocalDateString } from '@/utils/date';

export default function ProfilePage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut, isAdmin } = useAuth();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [especialidades, setEspecialidades] = useState<any[]>([]);

  // Unit management state
  const CLUB_ID = useClubId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [formData, setFormData] = useState({
    nome: '',
    genero: 'M' as 'M' | 'F',
    cores: [...DEFAULT_UNIT_COLORS],
    gritoDeGuerra: '',
    significadoLogo: '',
    historiaNome: '',
  });

  // Avaliação session management state
  const [showSessaoModal, setShowSessaoModal] = useState(false);
  const [sessoesPorUnidade, setSessoesPorUnidade] = useState<Record<string, SessaoAvaliacao[]>>({});
  const [batchDate, setBatchDate] = useState(toLocalDateString());
  const [criandoBatch, setCriandoBatch] = useState(false);
  const [editandoSessaoId, setEditandoSessaoId] = useState<string | null>(null);
  const [editandoData, setEditandoData] = useState('');

  const carregarUnidades = async () => {
    if (!CLUB_ID) return;
    try {
      setIsLoadingUnits(true);
      const data = await getTodasUnidades(CLUB_ID);
      setUnits(data || []);
    } catch (error) {
      console.error('Erro ao carregar unidades:', error);
    } finally {
      setIsLoadingUnits(false);
    }
  };

  const carregarSessoesTodasUnidades = async () => {
    if (!CLUB_ID) return;
    try {
      const unitsList = units.length > 0 ? units : await getTodasUnidades(CLUB_ID);
      const map: Record<string, SessaoAvaliacao[]> = {};
      await Promise.all(unitsList.map(async (u) => {
        const sessoes = await getSessoesPorUnidade(u.id);
        map[u.id] = sessoes;
      }));
      setSessoesPorUnidade(map);
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
    }
  };

  const handleCriarBatch = async () => {
    if (!CLUB_ID) return;
    try {
      setCriandoBatch(true);
      const unitsList = units.length > 0 ? units : await getTodasUnidades(CLUB_ID);
      await Promise.all(unitsList.map(u => criarSessao(u.id, batchDate)));
      addToast({ type: 'success', title: 'Sessões criadas', message: `Para ${unitsList.length} unidades na data ${formatDateBR(batchDate)}` });
      await carregarSessoesTodasUnidades();
    } catch (error) {
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao criar sessões' });
    } finally {
      setCriandoBatch(false);
    }
  };

  const handleAtivarSessao = async (sessaoId: string, unidadeId: string, ativo: boolean) => {
    try {
      await ativarSessao(sessaoId, ativo);
      addToast({ type: 'success', title: ativo ? 'Sessão ativada' : 'Sessão desativada', message: '' });
      const sessoes = await getSessoesPorUnidade(unidadeId);
      setSessoesPorUnidade(prev => ({ ...prev, [unidadeId]: sessoes }));
    } catch (error) {
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao alternar sessão' });
    }
  };

  const handleDeleteSessao = async (sessao: SessaoAvaliacao, unidadeId: string) => {
    if (!confirm(`Excluir sessão de ${formatDateBR(sessao.data_reuniao)}?`)) return;
    try {
      await deleteSessao(sessao.id);
      addToast({ type: 'success', title: 'Sessão excluída', message: '' });
      const sessoes = await getSessoesPorUnidade(unidadeId);
      setSessoesPorUnidade(prev => ({ ...prev, [unidadeId]: sessoes }));
    } catch (error) {
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao excluir sessão' });
    }
  };

  const handleEditSessao = async (sessaoId: string, unidadeId: string) => {
    if (!editandoData) return;
    try {
      await updateSessao(sessaoId, editandoData);
      addToast({ type: 'success', title: 'Sessão atualizada', message: '' });
      setEditandoSessaoId(null);
      const sessoes = await getSessoesPorUnidade(unidadeId);
      setSessoesPorUnidade(prev => ({ ...prev, [unidadeId]: sessoes }));
    } catch (error) {
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao editar sessão' });
    }
  };

  const openSessaoModal = () => {
    setShowSessaoModal(true);
    carregarSessoesTodasUnidades();
  };

  useEffect(() => {
    carregarUnidades();
  }, [CLUB_ID]);

  useEffect(() => {
    if (profile?.membro_id) {
      getEspecialidadesMembro(profile.membro_id)
        .then(setEspecialidades)
        .catch(() => setEspecialidades([]));
    }
  }, [profile?.membro_id]);

  const handleSaveUnit = async () => {
    if (!formData.nome.trim()) {
      addToast({ type: 'error', title: 'Erro', message: 'Nome é obrigatório' });
      return;
    }

    try {
      if (editingUnit) {
        await updateUnidade(editingUnit.id, {
          nome: formData.nome,
          genero: formData.genero,
          cores: formData.cores,
          clube_id: CLUB_ID,
          grito_de_guerra: formData.gritoDeGuerra || undefined,
          significado_logo: formData.significadoLogo || undefined,
          historia_nome: formData.historiaNome || undefined,
        });
        addToast({ type: 'success', title: 'Unidade atualizada', message: `${formData.nome} foi atualizada` });
      } else {
        await createUnidade({
          nome: formData.nome,
          genero: formData.genero,
          cores: formData.cores,
          clube_id: CLUB_ID,
          grito_de_guerra: formData.gritoDeGuerra || undefined,
          significado_logo: formData.significadoLogo || undefined,
          historia_nome: formData.historiaNome || undefined,
        });
        addToast({ type: 'success', title: 'Unidade criada', message: `${formData.nome} foi criada` });
      }
      setIsModalOpen(false);
      setEditingUnit(null);
      setFormData({ nome: '', genero: 'M', cores: [...DEFAULT_UNIT_COLORS], gritoDeGuerra: '', significadoLogo: '', historiaNome: '' });
      await carregarUnidades();
    } catch (error) {
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao salvar unidade' });
    }
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setFormData({ nome: unit.nome, genero: unit.genero, cores: [...unit.cores], gritoDeGuerra: '', significadoLogo: '', historiaNome: '' });
    setIsModalOpen(true);
  };

  const handleDeleteUnit = async (unit: Unit) => {
    try {
      await deleteUnidade(unit.id);
      addToast({ type: 'success', title: 'Unidade removida', message: `${unit.nome} foi removida` });
      await carregarUnidades();
    } catch (error) {
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao remover unidade' });
    }
  };

  const openCreateModal = () => {
    setEditingUnit(null);
    setFormData({ nome: '', genero: 'M', cores: [...DEFAULT_UNIT_COLORS], gritoDeGuerra: '', significadoLogo: '', historiaNome: '' });
    setIsModalOpen(true);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) {
      addToast({ type: 'error', title: 'Erro', message: 'As senhas não coincidem' });
      return;
    }

    if (newPassword.length < 6) {
      addToast({ type: 'error', title: 'Erro', message: 'Senha deve ter pelo menos 6 caracteres' });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        addToast({ type: 'error', title: 'Erro', message: error.message });
      } else {
        addToast({ type: 'success', title: 'Senha atualizada', message: 'Sua senha foi alterada com sucesso' });
        handleClosePasswordModal();
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Erro', message: 'Ocorreu um erro ao redefinir a senha' });
    }
  };

  // Obter label do role
  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrador';
      case 'LIDER': return 'Líder';
      default: return 'Desbravador';
    }
  };

  const settingsItems = [
    ...(isAdmin ? [
      { label: "Gerenciar Requisitos das Classes", icon: BookOpen, onClick: () => router.push('/classes/gerenciar') },
      { label: "Gerenciar Unidades", icon: UserCog, onClick: () => router.push('/unidades/gerenciar') },
      { label: "Membros do Clube", icon: UserPlus, onClick: () => router.push('/membros') },
      { label: "Especialidades", icon: Award, onClick: () => router.push('/especialidades') },
      { label: "Gerenciar Avaliações", icon: ClipboardCheck, onClick: openSessaoModal },
    ] : []),
    { label: "Trocar Senha", icon: KeyRound, onClick: () => setShowPasswordModal(true) },
    { label: "Sair", icon: LogOut, variant: "danger", onClick: handleLogout },
  ];

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <AppLayout title="Perfil" subtitle="Sua conta e configurações">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-yellow-400 p-1">
          <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--card-color)' }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={48} style={{ color: 'var(--text-secondary-color)' }} />
            )}
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>
            {profile?.nome || user?.email?.split('@')[0] || 'Usuário'}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary-color)' }}>
            {getRoleLabel(profile?.role)}
          </p>
          {profile?.email && (
            <p className="text-xs flex items-center justify-center gap-1 mt-1" style={{ color: 'var(--text-secondary-color)' }}>
              <Mail size={12} />
              {profile.email}
            </p>
          )}
        </div>
      </motion.div>

      {/* Theme Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mt-8 space-y-3"
      >
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-color)' }}>Aparência</h3>
        <AppCard className="p-4">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--surface-color)' }}>
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="text-left">
                <p className="font-medium" style={{ color: 'var(--text-color)' }}>Tema</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary-color)' }}>
                  {theme === 'dark' ? 'Escuro' : 'Claro'}
                </p>
              </div>
            </div>
            <div className={cn(
              'relative w-14 h-8 rounded-full p-1 transition-colors duration-300',
              theme === 'dark' ? 'bg-primary' : 'bg-[var(--surface-color)]'
            )}>
              <div
                className={cn(
                  'w-6 h-6 rounded-full shadow-md transition-transform duration-300',
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                )}
                style={{ backgroundColor: theme === 'dark' ? 'var(--bg)' : '#FAFAFA' }}
              />
            </div>
          </button>
        </AppCard>
      </motion.div>

      {/* Especialidades */}
      {especialidades.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="mt-8 space-y-3"
        >
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-color)' }}>Especialidades</h3>
          <div className="flex flex-wrap gap-2">
            {especialidades.map((esp) => (
              <div
                key={esp.id}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
                style={{
                  backgroundColor: esp.concluido ? '#22C55E20' : 'var(--surface-color)',
                  border: `1px solid ${esp.concluido ? '#22C55E40' : 'var(--border-color)'}`,
                }}
              >
                <Award className="w-4 h-4" style={{ color: esp.concluido ? '#22C55E' : 'var(--text-secondary-color)' }} />
                <span className="font-medium" style={{ color: 'var(--text-color)' }}>
                  {esp.especialidade?.nome || 'Especialidade'}
                </span>
                {esp.concluido && (
                  <Check className="w-3.5 h-3.5 text-success" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="mt-8 space-y-3"
      >
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-color)' }}>Configurações</h3>
        <div className="space-y-2">
          {settingsItems.map((item) => (
            <AppCard
              key={item.label}
              hover
              onClick={item.onClick}
              className="p-4 flex justify-between items-center cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} style={{ color: item.variant === "danger" ? 'var(--color-danger)' : 'var(--text-secondary-color)' }} />
                <span style={{ color: 'var(--text-color)' }}>{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5" style={{ color: 'var(--text-secondary-color)' }} />
            </AppCard>
          ))}
        </div>
      </motion.div>


      {/* Gerenciar Avaliações Modal */}
      <AppModal
        isOpen={showSessaoModal}
        onClose={() => setShowSessaoModal(false)}
        title="Gerenciar Avaliações"
        description="Crie sessões para todas as unidades de uma vez"
        scrollable
      >
        <div className="space-y-4">
          {/* Input único + botão para adicionar em todas */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-surface/50 border border-border">
            <Calendar className="w-4 h-4 text-muted flex-shrink-0" />
            <input
              type="date"
              value={batchDate}
              onChange={(e) => setBatchDate(e.target.value)}
              className="flex-1 p-2 rounded-lg border border-border bg-card text-text-primary text-sm"
            />
            <AppButton
              variant="primary"
              onClick={handleCriarBatch}
              isLoading={criandoBatch}
            >
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </AppButton>
          </div>
          <p className="text-xs text-muted -mt-2">A data será aplicada a todas as unidades</p>

          {units.length === 0 ? (
            <p className="text-sm text-muted text-center py-4">Nenhuma unidade encontrada</p>
          ) : (
            units.map(unidade => {
              const sessoes = sessoesPorUnidade[unidade.id] || [];
              const ativa = sessoes.find(s => s.ativo);
              return (
                <div key={unidade.id} className="rounded-xl border border-border bg-card overflow-hidden">
                  {/* Header da unidade */}
                  <div className="flex items-center gap-3 p-3 bg-surface/50 border-b border-border">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: unidade.cores[0] + '30' }}
                    >
                      <Users className="w-4 h-4" style={{ color: unidade.cores[0] }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary">{unidade.nome}</p>
                      <p className="text-xs text-muted">
                        {ativa
                          ? `Sessão ativa: ${formatDateBR(ativa.data_reuniao)}`
                          : sessoes.length > 0
                          ? `${sessoes.length} sessão(ões)`
                          : 'Nenhuma sessão'}
                      </p>
                    </div>
                  </div>

                  {/* Lista de sessões */}
                  <div className="divide-y divide-border">
                    {sessoes.length === 0 ? (
                      <p className="text-xs text-muted text-center py-3">Nenhuma sessão criada</p>
                    ) : (
                      sessoes.map(sessao => (
                        <div key={sessao.id} className="flex items-center justify-between px-3 py-2.5">
                          {editandoSessaoId === sessao.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="date"
                                value={editandoData}
                                onChange={(e) => setEditandoData(e.target.value)}
                                className="flex-1 p-1.5 rounded-lg border border-border bg-card text-text-primary text-xs"
                                autoFocus
                              />
                              <AppButton variant="primary" size="sm" onClick={() => handleEditSessao(sessao.id, unidade.id)}>
                                <Check className="w-3.5 h-3.5" />
                              </AppButton>
                              <AppButton variant="ghost" size="sm" onClick={() => setEditandoSessaoId(null)}>
                                <X className="w-3.5 h-3.5" />
                              </AppButton>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${sessao.ativo ? 'bg-success' : 'bg-muted'}`} />
                                <span className="text-sm text-text-primary font-medium">
                                  {formatDateBR(sessao.data_reuniao, { weekday: 'short', day: 'numeric', month: 'short' })}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <AppButton
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditandoSessaoId(sessao.id);
                                    setEditandoData(sessao.data_reuniao);
                                  }}
                                  title="Editar data"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-muted" />
                                </AppButton>
                                {sessao.ativo ? (
                                  <AppButton variant="ghost" size="sm" onClick={() => handleAtivarSessao(sessao.id, unidade.id, false)} title="Desativar">
                                    <Square className="w-3.5 h-3.5 text-warning" />
                                  </AppButton>
                                ) : (
                                  <AppButton variant="ghost" size="sm" onClick={() => handleAtivarSessao(sessao.id, unidade.id, true)} title="Ativar">
                                    <Play className="w-3.5 h-3.5 text-success" />
                                  </AppButton>
                                )}
                                <AppButton variant="ghost" size="sm" onClick={() => handleDeleteSessao(sessao, unidade.id)} title="Excluir">
                                  <Trash2 className="w-3.5 h-3.5 text-danger" />
                                </AppButton>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })
          )}
          <p className="text-xs text-muted text-center">
            A sessão ativa aparece na página da unidade para líderes realizarem as avaliações
          </p>
        </div>
      </AppModal>

      {/* Password Change Modal */}
      <AppModal
        isOpen={showPasswordModal}
        onClose={handleClosePasswordModal}
        title="Trocar Senha"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--text-secondary-color)' }}>
            Digite sua nova senha abaixo.
          </p>
          <AppInput
            label="Nova Senha"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <AppInput
            label="Confirmar Senha"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <div className="flex gap-3">
            <AppButton variant="secondary" onClick={handleClosePasswordModal} className="flex-1">
              Cancelar
            </AppButton>
            <AppButton onClick={handlePasswordReset} className="flex-1">
              <KeyRound className="w-4 h-4 mr-1" />
              Alterar Senha
            </AppButton>
          </div>
        </div>
      </AppModal>

    </AppLayout>
  );
}