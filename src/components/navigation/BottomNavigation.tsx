'use client';

import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/utils/cn';

interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  active?: boolean;
}

interface BottomNavigationProps {
  items: NavItem[];
}

export function BottomNavigation({
  items,
}: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-white/10 px-6 py-3 flex justify-between items-center max-w-md mx-auto rounded-t-3xl">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex flex-col items-center gap-1 transition-colors',
            item.active
              ? 'text-primary'
              : 'text-muted hover:text-white'
          )}
        >
          <item.icon
            size={22}
            strokeWidth={item.active ? 2.5 : 2}
          />

          <span className="text-[10px] font-medium">
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  );
}