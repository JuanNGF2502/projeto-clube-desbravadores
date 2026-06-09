'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { BottomNavigation } from '@/components/navigation/BottomNavigation';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import { ClubeSelector } from '@/components/ui/ClubeSelector';
import { Home, Users, BookOpen, User } from 'lucide-react';

interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
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
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { label: 'Início', icon: Home, href: '/dashboard' },
    { label: 'Classes', icon: BookOpen, href: '/classes' },
    { label: 'Unidades', icon: Users, href: '/unidades' },
    { label: 'Perfil', icon: User, href: '/profile' },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen w-full max-w-md mx-auto relative flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <header
        className="sticky top-0 z-40 backdrop-blur-md safe-area-top"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--bg) 90%, transparent)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {backHref && (
              <a
                href={backHref}
                className="p-2 rounded-xl transition-colors"
                style={{ backgroundColor: 'var(--card-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}
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
                <h1 className="text-lg font-bold" style={{ color: 'var(--text-color)' }}>{title}</h1>
              )}
              {subtitle && (
                <p className="text-xs" style={{ color: 'var(--text-secondary-color)' }}>{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ClubeSelector />
            {actions && actions}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 16px))' }}>
        <Breadcrumbs />
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