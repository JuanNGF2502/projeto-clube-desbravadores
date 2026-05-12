'use client';

import { ReactNode, useEffect, useState } from 'react';

interface Props {
  children: ReactNode;
}

export function ThemeProvider({ children }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent flash of wrong theme
  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return <>{children}</>;
}
