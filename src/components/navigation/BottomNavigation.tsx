'use client';

import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';

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

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
    return pathname.startsWith(href);
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