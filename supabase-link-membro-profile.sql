-- ============================================
-- MIGRATION: Correções de permissões e funções
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================

-- 0. SECURITY DEFINER function to create/ensure a user profile exists
--    Called by the client after sign-in when profile is missing
CREATE OR REPLACE FUNCTION public.create_user_profile(
    p_user_id UUID,
    p_nome TEXT,
    p_email TEXT,
    p_role TEXT DEFAULT 'DESBRAVADOR'
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, nome, email, role, ativo)
    VALUES (p_user_id, p_nome, p_email, p_role, true)
    ON CONFLICT (id) DO NOTHING;
END;
$$;

-- 1. SECURITY DEFINER function to link profile to member (bypasses RLS)
--    Also copies clube_id and unidade_id from the member to the profile
CREATE OR REPLACE FUNCTION public.link_membro_profile(
    p_user_id UUID,
    p_membro_id UUID,
    p_clube_id UUID DEFAULT NULL,
    p_unidade_id UUID DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.profiles
    SET
        membro_id = p_membro_id,
        clube_id = COALESCE(p_clube_id, clube_id),
        unidade_id = COALESCE(p_unidade_id, unidade_id)
    WHERE id = p_user_id;
END;
$$;

-- 1b. Function to sync profile fields from member data
--     Called when member is updated (unit change, etc.)
CREATE OR REPLACE FUNCTION public.sync_profile_from_membro(
    p_membro_id UUID
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.profiles p
    SET
        clube_id = m.clube_id,
        unidade_id = m.unidade_id
    FROM public.membros m
    WHERE p.membro_id = m.id
      AND m.id = p_membro_id;
END;
$$;

-- 2. Fix RLS policies for membros_cargos (needed for edit flow)
DROP POLICY IF EXISTS "delete membros_cargos" ON membros_cargos;
CREATE POLICY "delete membros_cargos" ON membros_cargos FOR DELETE USING (true);

-- 3. Fix RLS policies for membros_classes_atuais (needed for edit flow)
DROP POLICY IF EXISTS "insert membros_classes_atuais" ON membros_classes_atuais;
CREATE POLICY "insert membros_classes_atuais" ON membros_classes_atuais FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "delete membros_classes_atuais" ON membros_classes_atuais;
CREATE POLICY "delete membros_classes_atuais" ON membros_classes_atuais FOR DELETE USING (true);
