"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { User, Settings, LogOut, ShieldCheck, Sun, Moon, Plus, Pencil, Trash2, Users, UserPlus, ChevronRight, User2Icon, UserCog, BookOpen, Mail, Award } from "lucide-react";
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
import { supabase } from "@/lib/supabase";
import { getTodasUnidades, createUnidade, updateUnidade, deleteUnidade } from '@/lib/queries';
import { useClubId } from '@/hooks';

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut, isAdmin } = useAuth();

  // Verificar se é uma redefinição de senha
  const isResetPassword = searchParams.get('reset') === 'true';
  const [showResetPassword, setShowResetPassword] = useState(isResetPassword);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  useEffect(() => {
    carregarUnidades();
  }, [CLUB_ID]);

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
        setShowResetPassword(false);
        router.replace('/profile');
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Erro', message: 'Ocorreu um erro ao redefinir a senha' });
    }
  };

  // Obter label do role
  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrador';
      case 'DIRIGENTE': return 'Dirigente';
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
    ] : []),
    { label: "Sair", icon: LogOut, variant: "danger", onClick: handleLogout },
  ];

  // Se está redefinindo senha
  if (showResetPassword) {
    return (
      <AppLayout title="Nova Senha" subtitle="Crie uma nova senha">
        <div className="p-4 space-y-4">
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
          <AppButton onClick={handlePasswordReset} className="w-full">
            Alterar Senha
          </AppButton>
          <button
            onClick={() => {
              setShowResetPassword(false);
              router.replace('/profile');
            }}
            className="w-full text-center text-sm text-primary"
          >
            Cancelar
          </button>
        </div>
      </AppLayout>
    );
  }

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


    </AppLayout>
  );
}