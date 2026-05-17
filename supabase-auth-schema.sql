-- ============================================
-- TABELA DE USUÁRIOS/PROFILES
-- Vinculada ao Supabase Auth
-- ============================================

-- Tabela de perfis de usuário (extende auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'DESBRAVADOR' CHECK (role IN ('ADMIN', 'DIRIGENTE', 'LIDER', 'DESBRAVADOR')),
    clube_id UUID REFERENCES clubes(id) ON DELETE SET NULL,
    unidade_id UUID REFERENCES unidades(id) ON DELETE SET NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_clube ON profiles(clube_id);
CREATE INDEX IF NOT EXISTS idx_profiles_unidade ON profiles(unidade_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Função para criar profile automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, nome, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nome', SPLIT_PART(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'DESBRAVADOR')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar profile no signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Policies de segurança para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver seus próprios dados
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Usuários podem atualizar seus próprios dados
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Apenas admins podem ver todos os profiles
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Apenas admins podem modificar roles
CREATE POLICY "Admins can update roles"
    ON profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- ============================================
-- EMAIL VERIFICATION
-- ============================================

-- Habilitar verificação de email
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS email_confirmed_at TIMESTAMPTZ;

-- ============================================
-- SENHA
-- ============================================

-- O Supabase Auth já gerencia senhas com bcrypt
-- Não precisamos de tabela adicional