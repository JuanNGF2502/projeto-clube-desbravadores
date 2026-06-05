import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase env vars:', { supabaseUrl, supabaseAnonKey });
  throw new Error('Supabase configuration missing');
}

export const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);

// Helper to get URL for auth redirects
export function getAuthRedirectUrl(path: string = '/dashboard') {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${siteUrl}${path}`;
}

export default supabase;