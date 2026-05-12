import type {
  Metadata,
  Viewport,
} from 'next';

import '@/app/globals.css';

import { Inter } from 'next/font/google';

import { AppProvider } from '@/providers/AppProvider';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Sistema de Desbravadores',
  description: 'Sistema de Gestão Premium para Desbravadores',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#09090B',
};

interface Props {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: Props) {
  return (
    <html
      lang="pt-br"
      suppressHydrationWarning
    >
      <body
        className={`bg-background text-foreground ${inter.className}`}
      >
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}