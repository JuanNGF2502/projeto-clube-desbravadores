'use client';

import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { getTabIndex, type TabDirection } from '@/utils/tabs';
import { useNavigationStore } from '@/stores/navigationStore';

interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

interface BottomNavigationProps {
  items: NavItem[];
}

export function BottomNavigation({
  items,
}: BottomNavigationProps) {
  const pathname = usePathname();
  const activeTabIndex = getTabIndex(pathname);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
    return pathname.startsWith(href);
  };

  // Mantém a mesma animação direcional do swipe ao trocar de aba pela barra.
  const handleNavigate = (href: string) => {
    const targetIndex = getTabIndex(href);
    if (activeTabIndex < 0 || targetIndex < 0 || targetIndex === activeTabIndex) {
      return;
    }

    const direction: TabDirection =
      targetIndex > activeTabIndex ? 'next' : 'prev';

    useNavigationStore.getState().setTabTransition(direction);
  };

  return (
    <nav className={cn(
      'fixed bottom-0 left-0 right-0 z-50',
      'glass-effect border-t border-white/10',
      'px-4 pt-3',
      'flex justify-between items-center'
    )} style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => handleNavigate(item.href)}
          className={cn(
            'flex flex-col items-center gap-1 transition-colors flex-1 py-1',
            isActive(item.href)
              ? 'text-primary'
              : 'text-muted hover:text-white'
          )}
        >
          <item.icon
            size={22}
            strokeWidth={isActive(item.href) ? 2.5 : 2}
          />

          <span className="text-[10px] font-medium">
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  );
}