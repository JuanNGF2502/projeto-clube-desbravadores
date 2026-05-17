import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Rotas públicas que não requerem autenticação
const publicRoutes = [
  '/',
  '/login',
  '/offline',
  '/api/auth',
  '/api/webhooks',
];

// Rotas que requerem role de admin
const adminRoutes = [
  '/admin',
];

// Rotas que requerem role de dirigente ou superior
const dirigenteRoutes = [
  '/gerenciar',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get cookies
  const supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key) => request.cookies.get(key)?.value,
        set: (key, value, options) => {
          request.cookies.set({
            name: key,
            value,
            ...options,
          });
          supabaseResponse.cookies.set({
            name: key,
            value,
            ...options,
          });
        },
        remove: (key, options) => {
          request.cookies.set({
            name: key,
            value: '',
            ...options,
          });
          supabaseResponse.cookies.set({
            name: key,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Se não tem sessão, redirecionar para login
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Verificar profile do usuário para permissões
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, ativo')
    .eq('id', session.user.id)
    .single();

  // Se usuário inativo, fazer logout
  if (profile && !profile.ativo) {
    await supabase.auth.signOut();
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('reason', 'inactive');
    return NextResponse.redirect(url);
  }

  // Verificar acesso a rotas de admin
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!profile || profile.role !== 'ADMIN') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }
  }

  // Verificar acesso a rotas de dirigente
  if (dirigenteRoutes.some(route => pathname.startsWith(route))) {
    if (!profile || !['ADMIN', 'DIRIGENTE'].includes(profile.role)) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};