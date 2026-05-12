'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { Home, Users, BookOpen, Star, User } from 'lucide-react';

interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  active?: boolean;
}

interface AppLayoutProps {
  children: ReactNode;
  showNavigation?: boolean;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  backHref?: string;
  className?: string;
}

export function AppLayout({
  children,
  showNavigation = true,
  title,
  subtitle,
  actions,
  backHref,
  className,
}: AppLayoutProps) {
  const navItems: NavItem[] = [
    { label: 'Início', icon: Home, href: '/dashboard', active: false },
    { label: 'Unidades', icon: Users, href: '/unidades', active: false },
    { label: 'Classes', icon: BookOpen, href: '/classes', active: false },
    { label: 'Especiais', icon: Star, href: '/especialidades', active: false },
    { label: 'Perfil', icon: User, href: '/profile', active: false },
  ];

  return (
    <div className="min-h-screen w-full max-w-md mx-auto relative flex flex-col bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {backHref && (
              <a
                href={backHref}
                className="p-2 rounded-xl bg-card border border-border text-text-primary hover:bg-primary/10 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </a>
            )}
            <div>
              {title && (
                <h1 className="text-lg font-bold text-text-primary">{title}</h1>
              )}
              {subtitle && (
                <p className="text-xs text-muted">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn('p-4', className)}
        >
          {children}
        </motion.div>
      </main>

      {showNavigation && <BottomNavigation items={navItems} />}
    </div>
  );
}
