import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const requestCookies = await cookies();
    const cookieItems: Array<{ name: string; value: string; options: Record<string, any> }> = [];
    let cookieHeaders: Record<string, string> = {};

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: async () => {
            const allCookies = await requestCookies.getAll();
            return allCookies.map((cookie) => ({
              name: cookie.name,
              value: cookie.value,
            }));
          },
          setAll: async (cookiesToSet, headers) => {
            cookieItems.push(...cookiesToSet);
            cookieHeaders = headers;
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`);
      cookieItems.forEach((cookie) => {
        response.cookies.set(cookie.name, cookie.value, cookie.options);
      });
      Object.entries(cookieHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}