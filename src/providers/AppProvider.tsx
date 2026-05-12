'use client';

import { ReactNode } from 'react';

import { ThemeProvider } from './ThemeProvider';
import { QueryProvider } from './QueryProvider';
import { ToastProvider } from '@/components/ui/Toast';

interface Props {
  children: ReactNode;
}

export function AppProvider({ children }: Props) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}