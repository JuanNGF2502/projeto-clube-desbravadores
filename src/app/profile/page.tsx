"use client";

import { motion } from "framer-motion";
import { User, Settings, LogOut, ShieldCheck, Sun, Moon } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AppCard } from "@/components/ui/AppCard";
import { useToast } from "@/components/ui/Toast";
import { useTheme } from "@/providers/ThemeProvider";
import { cn } from "@/utils/cn";

export default function ProfilePage() {
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const settingsItems = [
    { label: "Meus Dados", icon: User },
    { label: "Segurança", icon: ShieldCheck },
    { label: "Preferências", icon: Settings },
    { label: "Sair", icon: LogOut, variant: "danger" },
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
              onClick={() => {
                if (item.label === "Sair") {
                  addToast({ type: "info", title: "Sair", message: "Funcionalidade em breve" });
                }
              }}
              className="p-4 flex justify-between items-center cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} style={{ color: item.variant === "danger" ? 'var(--color-danger)' : 'var(--text-secondary-color)' }} />
                <span style={{ color: 'var(--text-color)' }}>{item.label}</span>
              </div>
              <svg className="w-5 h-5" style={{ color: 'var(--text-secondary-color)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </AppCard>
          ))}
        </div>
      </motion.div>
    </AppLayout>
  );
}