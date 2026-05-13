"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Settings, LogOut, ShieldCheck, Sun, Moon, Plus, Pencil, Trash2, Users, UserPlus, ChevronRight, User2Icon, UserCog } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppModal } from "@/components/ui/AppModal";
import { AppInput } from "@/components/ui/AppInput";
import { AppTextarea } from "@/components/ui/AppInput";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { useToast } from "@/components/ui/Toast";
import { useTheme } from "@/providers/ThemeProvider";
import { cn } from "@/utils/cn";
import { Unit, UNIT_GENDERS, DEFAULT_UNIT_COLORS } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  // Unit management state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [units, setUnits] = useState<Unit[]>([
    { id: '1', nome: 'Lobos', genero: 'M', cores: ['#3B82F6', '#1E40AF', '#1E3A8A'], ativo: true, clubeId: '1', membrosCount: 12, createdAt: new Date() },
    { id: '2', nome: 'Águias', genero: 'M', cores: ['#C6A15B', '#A16207', '#854D0E'], ativo: true, clubeId: '1', membrosCount: 10, createdAt: new Date() },
  ]);
  const [formData, setFormData] = useState({
    nome: '',
    genero: 'M' as 'M' | 'F' | 'MISTA',
    cores: [...DEFAULT_UNIT_COLORS],
    gritoDeGuerra: '',
    significadoLogo: '',
    historiaNome: '',
  });

  const handleSaveUnit = () => {
    if (!formData.nome.trim()) {
      addToast({ type: 'error', title: 'Erro', message: 'Nome é obrigatório' });
      return;
    }

    if (editingUnit) {
      setUnits(units.map(u => u.id === editingUnit.id ? { ...u, nome: formData.nome, genero: formData.genero, cores: formData.cores } : u));
      addToast({ type: 'success', title: 'Unidade atualizada', message: `${formData.nome} foi atualizada` });
    } else {
      setUnits([...units, { id: String(Date.now()), nome: formData.nome, genero: formData.genero, cores: formData.cores, ativo: true, clubeId: '1', membrosCount: 0, createdAt: new Date() }]);
      addToast({ type: 'success', title: 'Unidade criada', message: `${formData.nome} foi criada` });
    }
    setIsModalOpen(false);
    setEditingUnit(null);
    setFormData({ nome: '', genero: 'M', cores: [...DEFAULT_UNIT_COLORS], gritoDeGuerra: '', significadoLogo: '', historiaNome: '' });
  };

  const handleEditUnit = (unit: Unit) => {
    setEditingUnit(unit);
    setFormData({ nome: unit.nome, genero: unit.genero, cores: [...unit.cores], gritoDeGuerra: '', significadoLogo: '', historiaNome: '' });
    setIsModalOpen(true);
  };

  const handleDeleteUnit = (unit: Unit) => {
    setUnits(units.filter(u => u.id !== unit.id));
    addToast({ type: 'success', title: 'Unidade removida', message: `${unit.nome} foi removida` });
  };

  const openCreateModal = () => {
    setEditingUnit(null);
    setFormData({ nome: '', genero: 'M', cores: [...DEFAULT_UNIT_COLORS], gritoDeGuerra: '', significadoLogo: '', historiaNome: '' });
    setIsModalOpen(true);
  };

  const settingsItems = [
    //{ label: "Meus Dados", icon: User, onClick: () => {} },
    { label: "Gerenciar Unidades", icon: UserCog, onClick: () => router.push('/unidades/gerenciar') },
    { label: "Membros do Clube", icon: UserPlus, onClick: () => router.push('/membros') },
    //{ label: "Segurança", icon: ShieldCheck, onClick: () => {} },
    { label: "Sair", icon: LogOut, variant: "danger", onClick: () => addToast({ type: "info", title: "Sair", message: "Funcionalidade em breve" }) },
  ];

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
            <User size={48} style={{ color: 'var(--text-secondary-color)' }} />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>João Silva</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary-color)' }}>Membro Gold Premium</p>
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