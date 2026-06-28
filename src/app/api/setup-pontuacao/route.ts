import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServiceSupabase } from '@/lib/supabase-admin';

const SQL_MIGRATION = `-- ============================================================
-- ADICIONA CONTROLE DE OCULTAÇÃO DE PONTUAÇÃO
-- ============================================================
-- Execute este SQL no Supabase Dashboard > SQL Editor

ALTER TABLE clubes ADD COLUMN IF NOT EXISTS pontuacao_oculta BOOLEAN NOT NULL DEFAULT false;

-- Política RLS: qualquer usuário autenticado pode ler
-- Apenas ADMIN pode alterar
DROP POLICY IF EXISTS clubes_select ON clubes;
CREATE POLICY clubes_select ON clubes
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS clubes_update ON clubes;
CREATE POLICY clubes_update ON clubes
  FOR UPDATE
  USING (public.get_user_role() = 'ADMIN')
  WITH CHECK (public.get_user_role() = 'ADMIN');`;

function getAuthedSupabase(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    }
  );
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const supabase = getAuthedSupabase(token);

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Apenas administradores' }, { status: 403 });
    }

    // Test if column exists by trying to query it
    const { error: colError } = await supabase
      .from('clubes')
      .select('pontuacao_oculta')
      .limit(1);

    if (colError && colError.message?.includes('does not exist')) {
      // Try to create column via service role
      try {
        const serviceSupabase = getServiceSupabase();
        const { error: serviceError } = await serviceSupabase
          .from('clubes')
          .select('pontuacao_oculta')
          .limit(1);

        if (serviceError && serviceError.message?.includes('does not exist')) {
          return NextResponse.json({
            needsSetup: true,
            message: 'Coluna pontuacao_oculta não existe no banco. Execute o SQL abaixo no Supabase Dashboard > SQL Editor.',
            sql: SQL_MIGRATION,
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          });
        }

        // Column exists with service role, but not with anon → RLS issue
        return NextResponse.json({ needsSetup: false, message: 'Coluna existe, verifique as políticas RLS.' });
      } catch {
        return NextResponse.json({
          needsSetup: true,
          message: 'Coluna pontuacao_oculta não existe. Execute o SQL no Supabase Dashboard > SQL Editor.',
          sql: SQL_MIGRATION,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        });
      }
    }

    return NextResponse.json({ needsSetup: false, message: 'Sistema pronto!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
