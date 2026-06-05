import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const publicRoutes = [
  '/',
  '/login',
  '/offline',
  '/api/auth',
  '/api/webhooks',
];

const adminRoutes = [
  '/classes/gerenciar',
  '/unidades/gerenciar',
  '/clubes',
  '/especialidades',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

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

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, ativo')
    .eq('id', session.user.id)
    .single();

  if (profile && !profile.ativo) {
    await supabase.auth.signOut();
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('reason', 'inactive');
    return NextResponse.redirect(url);
  }

  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!profile || !['ADMIN', 'LIDER'].includes(profile.role)) {
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
