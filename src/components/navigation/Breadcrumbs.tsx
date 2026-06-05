'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Início',
  unidades: 'Unidades',
  classes: 'Classes',
  especialidades: 'Especialidades',
  clubes: 'Clubes',
  profile: 'Perfil',
  membros: 'Membros',
  avaliacoes: 'Avaliações',
  gerenciar: 'Gerenciar',
};

function getPathSegments(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: { label: string; href: string }[] = [];

  let accumulated = '';
  for (const segment of segments) {
    accumulated += `/${segment}`;
    const label = ROUTE_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({ label, href: accumulated });
  }

  return breadcrumbs;
}

export function Breadcrumbs() {
  const pathname = usePathname();

  if (pathname === '/dashboard' || pathname === '/') return null;

  const segments = getPathSegments(pathname);
  if (segments.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1 px-4 pt-2 pb-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
      <Link
        href="/dashboard"
        className="flex items-center gap-1 text-xs text-muted hover:text-primary transition-colors shrink-0"
      >
        <Home className="w-3 h-3" />
      </Link>
      {segments.map((seg, i) => (
        <div key={seg.href} className="flex items-center gap-1 shrink-0">
          <ChevronRight className="w-3 h-3 text-muted" />
          {i === segments.length - 1 ? (
            <span className="text-xs font-medium text-text-primary truncate max-w-[120px]">
              {seg.label}
            </span>
          ) : (
            <Link
              href={seg.href}
              className="text-xs text-muted hover:text-primary transition-colors truncate max-w-[100px]"
            >
              {seg.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
