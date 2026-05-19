-- Correção de policy para a tabela profiles
-- Evita recursão infinita e mantém o login funcionando.

ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Removendo policies administrativas que causam recursão em profiles.
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update roles" ON profiles;

-- Garantir privilégios ao role authenticated para leitura/escrita permitida
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.criterios_avaliacao TO authenticated;

-- Garantir privilégios básicos para tabelas de leitura usadas pela aplicação
GRANT SELECT ON TABLE public.unidades TO authenticated;
GRANT SELECT ON TABLE public.clubes TO authenticated;
GRANT SELECT ON TABLE public.membros TO authenticated;
GRANT SELECT ON TABLE public.classes TO authenticated;
GRANT SELECT ON TABLE public.especialidades TO authenticated;
GRANT SELECT ON TABLE public.avaliacoes TO authenticated;
