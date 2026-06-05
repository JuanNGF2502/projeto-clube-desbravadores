import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServiceSupabase } from '@/lib/supabase-admin';

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

export async function POST(request: NextRequest) {
  try {
    const { memberId, email, password, nome, role } = await request.json();

    if (!memberId || !email || !password || !nome) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: memberId, email, password, nome' },
        { status: 400 }
      );
    }

    // 1. Verify auth via Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token de acesso não fornecido' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const supabase = getAuthedSupabase(token);

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 401 });
    }

    // 2. Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Apenas administradores podem criar usuários' }, { status: 403 });
    }

    // 3. Check if member already has a user account
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, email, nome')
      .eq('membro_id', memberId)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json({
        error: 'Este membro já possui um usuário',
        existingUser: { email: existingProfile.email, nome: existingProfile.nome },
      }, { status: 409 });
    }

    // 4. Create auth user with service role (trigger handle_new_user creates
    //    the profile automatically from user_metadata)
    const serviceSupabase = getServiceSupabase();

    const { data: authData, error: createError } = await serviceSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nome,
        role: role || 'DESBRAVADOR',
      },
    });

    if (createError) throw createError;
    if (!authData.user) throw new Error('Falha ao criar usuário');

    // 5. Fetch member's clube_id and unidade_id
    const { data: member } = await supabase
      .from('membros')
      .select('clube_id, unidade_id')
      .eq('id', memberId)
      .single();

    // 6. Link profile to member via SECURITY DEFINER function
    //    Also copies clube_id and unidade_id from the member to the profile
    try {
      await serviceSupabase.rpc('link_membro_profile', {
        p_user_id: authData.user.id,
        p_membro_id: memberId,
        p_clube_id: member?.clube_id || null,
        p_unidade_id: member?.unidade_id || null,
      });
    } catch (linkError: any) {
      console.warn('Profile link skipped (run migration to enable):', linkError.message);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    });
  } catch (error: any) {
    console.error('Erro create-user:', error);
    const message =
      error.code === 'email_exists'
        ? 'Este email já está em uso'
        : error.message || 'Erro ao criar usuário';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
