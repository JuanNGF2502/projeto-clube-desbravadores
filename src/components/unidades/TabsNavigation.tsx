'use client';

import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface Tab {
  id: string;
  label: string;
}

interface TabsNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function TabsNavigation({ tabs, activeTab, onTabChange, className }: TabsNavigationProps) {
  return (
    <div className={cn('flex gap-1 bg-card rounded-xl p-1', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'relative flex-1 py-2.5 px-3 text-sm font-medium rounded-lg transition-colors duration-200',
            activeTab === tab.id ? 'text-text-primary' : 'text-muted hover:text-text-secondary'
          )}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-primary/20 rounded-lg"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
