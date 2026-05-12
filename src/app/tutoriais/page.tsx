"use client";

import { motion } from "framer-motion";
import { BookOpen, ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppButton } from "@/components/ui/AppButton";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import Link from "next/link";
import { GlassCard } from "@/components/ui/AppCard";

export default function TutorialsPage() {
  const navItems = [
    { label: "Início", icon: BookOpen, href: "/", active: false },
    { label: "Unidades", icon: BookOpen, href: "/unidades", active: false },
    { label: "Classes", icon: BookOpen, href: "/classes", active: false },
    { label: "Tutoriais", icon: BookOpen, href: "/tutoriais", active: true },
    { label: "Perfil", icon: BookOpen, href: "/profile", active: false },
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
          <h1 className="text-2xl font-bold text-white">Tutoriais</h1>
        </header>

        <section className="flex flex-col gap-4">
          <h3 className="text-lg font-medium px-1 text-white">Aprenda com a gente</h3>
          <div className="flex flex-col gap-3">
            {[ "Como usar o app", "Guia de Etiqueta", "Acesso ao Lounge", "Dicas de Bem-estar" ].map((tut) => (
              <GlassCard key={tut} className="p-4 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors">
                <span className="text-white">{tut}</span>
                <AppButton size="sm" variant="ghost">Assistir</AppButton>
              </GlassCard>
            ))}
          </div>
        </section>
      </motion.div>
      <BottomNavigation items={navItems} />
    </PageContainer>
  );
}