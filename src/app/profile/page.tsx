"use client";

import { motion } from "framer-motion";
import { User, Settings, LogOut, ShieldCheck } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AppCard } from "@/components/ui/AppCard";
import { useToast } from "@/components/ui/Toast";

export default function ProfilePage() {
  const { addToast } = useToast();

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
          <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
            <User size={48} className="text-white/50" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-text-primary">João Silva</h2>
          <p className="text-muted text-sm">Membro Gold Premium</p>
        </div>
      </motion.div>

      {/* Settings */}
      <div className="mt-8 space-y-3">
        <h3 className="text-lg font-semibold text-text-primary">Configurações</h3>
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
              <div className="flex items-center gap-3 text-text-primary">
                <item.icon size={20} className={item.variant === "danger" ? "text-danger" : ""} />
                <span>{item.label}</span>
              </div>
              <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </AppCard>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}