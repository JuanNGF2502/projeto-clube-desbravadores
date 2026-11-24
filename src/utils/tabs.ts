export const TAB_ROUTES = ['/dashboard', '/classes', '/unidades', '/profile'] as const;

export type TabRoute = (typeof TAB_ROUTES)[number];
export type TabDirection = 'next' | 'prev';

/**
 * Índice da aba correspondente ao pathname (inclui subpáginas, ex.: /classes/gerenciar).
 * Retorna -1 quando o caminho não pertence a nenhuma aba principal.
 */
export function getTabIndex(pathname: string): number {
  return TAB_ROUTES.findIndex(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Só habilita o swipe lateral nas telas raiz das abas,
 * evitando conflito com subpáginas (detalhes, gerenciar, etc.).
 */
export function isTabRoot(pathname: string): boolean {
  return (TAB_ROUTES as readonly string[]).includes(pathname);
}
