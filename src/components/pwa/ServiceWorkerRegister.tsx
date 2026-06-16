'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js?v=3', { scope: '/' }).catch(() => {});
    }
  }, []);

  return null;
}
