'use client';

import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  scrollable?: boolean;
  padded?: boolean;
}

export function PageContainer({
  children,
  className,
  scrollable = true,
  padded = true,
}: PageContainerProps) {
  return (
    <main
      className={cn(
        'min-h-screen w-full max-w-md mx-auto relative flex flex-col',
        scrollable ? 'overflow-y-auto' : 'overflow-hidden',
        padded && 'p-4',
        className
      )}
    >
      {children}
    </main>
  );
}
