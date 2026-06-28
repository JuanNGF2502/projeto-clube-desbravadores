'use client';

import { ReactNode } from 'react';

import { ThemeProvider } from './ThemeProvider';
import { QueryProvider } from './QueryProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/hooks';
import { PontuacaoProvider } from '@/contexts/PontuacaoContext';

interface Props {
  children: ReactNode;
}

export function AppProvider({ children }: Props) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <PontuacaoProvider>
              {children}
            </PontuacaoProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}