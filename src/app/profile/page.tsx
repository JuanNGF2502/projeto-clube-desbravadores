"use client";

import { motion } from "framer-motion";
import { User, ArrowLeft, Settings, LogOut, ShieldCheck } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppButton } from "@/components/ui/AppButton";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import Link from "next/link";
import { GlassCard } from "@/components/ui/AppCard";

export default function ProfilePage() {
  const navItems = [
    { label: "Início", icon: User, href: "/", active: false },
    { label: "Unidades", icon: User, href: "/unidades", active: false },
    { label: "Classes", icon: User, href: "/classes", active: false },
    { label: "Tutoriais", icon: User, href: "/tutoriais", active: false },
    { label: "Perfil", icon: User, href: "/profile", active: true },
  ];

  return (
    <PageContainer className="px-6 pt-12 pb-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-8"
      >
        <header className="flex items-center gap-4">
          <Link href="/" className="p-2 rounded-full bg-card border border-white/10 text-white">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-white">Perfil</h1>
        </header>

        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-yellow-400 p-1">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
              <User size={48} className="text-white/50" />
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-white">João Silva</h2>
            <p className="text-muted text-sm">Membro Gold Premium</p>
          </div>
        </div>

        <section className="flex flex-col gap-4">
          <h3 className="text-lg font-medium px-1 text-white">Configurações</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: "Meus Dados", icon: User },
              { label: "Segurança", icon: ShieldCheck },
              { label: "Preferências", icon: Settings },
              { label: "Sair", icon: LogOut, variant: "danger" },
            ].map((item) => (
              <GlassCard key={item.label} className="p-4 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 text-white">
                  <item.icon size={20} className={item.variant === "danger" ? "text-red-400" : ""} />
                  <span>{item.label}</span>
                </div>
                <AppButton size="sm" variant="ghost">Editar</AppButton>
              </GlassCard>
            ))}
          </div>
        </section>
      </motion.div>
      <BottomNavigation items={navItems} />
    </PageContainer>
  );
}