import type {
  Metadata,
  Viewport,
} from 'next';

import '@/app/globals.css';

import { Inter } from 'next/font/google';

import { AppProvider } from '@/providers/AppProvider';
import { PWABanner } from '@/components/pwa';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Sistema de Desbravadores',
  description: 'Sistema de Gestão Premium para Desbravadores',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Desbravadores',
  },
  icons: {
    icon: [
      { url: '/icons/icon-source.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-72x72.svg', sizes: '72x72', type: 'image/svg+xml' },
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/icon-source.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-72x72.svg', sizes: '72x72', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    type: 'website',
    title: 'Sistema de Desbravadores',
    description: 'Sistema de Gestão Premium para Desbravadores',
    siteName: 'Desbravadores',
  },
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
      <head>
        {/* iPhone Safe Area */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Desbravadores" />

        {/* Android */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Desbravadores" />
        <meta name="theme-color" content="#09090B" />

        {/* Windows */}
        <meta name="msapplication-TileColor" content="#09090B" />
        <meta name="msapplication-square70x70logo" content="/icons/icon-source.svg" />
        <meta name="msapplication-square150x150logo" content="/icons/icon-source.svg" />
        <meta name="msapplication-wide310x150logo" content="/icons/icon-source.svg" />
        <meta name="msapplication-square310x310logo" content="/icons/icon-source.svg" />

        {/* iPad/iPhone */}
        <link rel="apple-touch-icon" href="/icons/icon-source.svg" />

      </head>
      <body
        className={`bg-background text-foreground ${inter.className}`}
        style={{
          // iOS safe area
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
        }}
      >
        <AppProvider>
          <PWABanner />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
