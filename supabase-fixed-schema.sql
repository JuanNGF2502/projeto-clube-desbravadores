-- ============================================
-- SCHEMA CORRIGIDO - Renomear colunas Clube_id -> clube_id
-- Executar no SQL Editor do Supabase
-- ============================================

-- 1. RENOMEAR COLUNAS EM TABELAS EXISTENTES
-- (Se as tabelas já foram criadas com Clube_id)

ALTER TABLE IF EXISTS unidades RENAME COLUMN "Clube_id" TO clube_id;
ALTER TABLE IF EXISTS membros RENAME COLUMN "Clube_id" TO clube_id;

-- 2. RECRIAR TABELAS CORRETAMENTE (SE NÃO EXISTIREM)

-- Clubes
CREATE TABLE IF NOT EXISTS clubes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    regional VARCHAR(100),
    associacao VARCHAR(100),
    logo TEXT,
    email VARCHAR(255),
    telefone VARCHAR(20),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unidades
CREATE TABLE IF NOT EXISTS unidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clube_id UUID NOT NULL REFERENCES clubes(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    genero VARCHAR(10) NOT NULL CHECK (genero IN ('M', 'F', 'MISTA')),
    cores TEXT[] DEFAULT '{}',
    grito_de_guerra TEXT,
    significado_logo TEXT,
    historia_nome TEXT,
    logo TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes
CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR(10) PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    descricao TEXT,
    ordem INTEGER NOT NULL UNIQUE,
    cor VARCHAR(7) NOT NULL,
    imagem TEXT,
    classes_pre_requisito TEXT[],
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Requisitos das Classes
CREATE TABLE IF NOT EXISTS requisitos_classe (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classe_id VARCHAR(10) NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    area VARCHAR(50) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    ordem INTEGER NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Especialidades
CREATE TABLE IF NOT EXISTS especialidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('ARTE MANUAL', 'NATUREZA', 'SAÚDE', 'MISSIONÁRIA', 'PROFISSIONAL', 'DOMÉSTICA', 'RECREATIVA')),
    descricao TEXT,
    nivel INTEGER CHECK (nivel IN (1, 2, 3)),
    imagem TEXT,
    requisitos TEXT[],
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cargos
CREATE TABLE IF NOT EXISTS cargos (
    tipo VARCHAR(30) PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    descricao TEXT,
    nivel INTEGER NOT NULL,
    cor VARCHAR(7),
    pode_ter_multiple BOOLEAN DEFAULT false,
    requer_unidade BOOLEAN DEFAULT false,
    categoria VARCHAR(20) NOT NULL CHECK (categoria IN ('ADMIN', 'DIRIGENTE', 'LIDER', 'DESBRAVADOR'))
);

-- Membros
CREATE TABLE IF NOT EXISTS membros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clube_id UUID NOT NULL REFERENCES clubes(id) ON DELETE CASCADE,
    unidade_id UUID REFERENCES unidades(id),
    nome VARCHAR(255) NOT NULL,
    nome_social VARCHAR(255),
    sexo VARCHAR(1) NOT NULL CHECK (sexo IN ('M', 'F')),
    data_nascimento DATE NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    foto TEXT,
    ativo BOOLEAN DEFAULT true,
    data_cadastro DATE NOT NULL DEFAULT CURRENT_DATE,
    data_desligamento DATE,
    motivo_desligamento TEXT,
    endereco JSONB,
    responsavel JSONB,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membros-Unidades (histórico)
CREATE TABLE IF NOT EXISTS membros_unidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_id UUID NOT NULL REFERENCES membros(id) ON DELETE CASCADE,
    unidade_id UUID NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
    data_entrada DATE NOT NULL,
    data_saida DATE,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membros-Cargos
CREATE TABLE IF NOT EXISTS membros_cargos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_id UUID NOT NULL REFERENCES membros(id) ON DELETE CASCADE,
    cargo_tipo VARCHAR(30) NOT NULL REFERENCES cargos(tipo),
    unidade_id UUID REFERENCES unidades(id),
    data_atribuicao DATE NOT NULL DEFAULT CURRENT_DATE,
    ativo BOOLEAN DEFAULT true,
    observacao TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membros-Classes Atuais
CREATE TABLE IF NOT EXISTS membros_classes_atuais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_id UUID NOT NULL REFERENCES membros(id) ON DELETE CASCADE,
    classe_id VARCHAR(10) NOT NULL REFERENCES classes(id),
    data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membros-Classes Concluídas
CREATE TABLE IF NOT EXISTS membros_classes_concluidas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_id UUID NOT NULL REFERENCES membros(id) ON DELETE CASCADE,
    classe_id VARCHAR(10) NOT NULL REFERENCES classes(id),
    data_inicio DATE NOT NULL,
    data_conclusao DATE NOT NULL,
    concluido BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membros-Especialidades
CREATE TABLE IF NOT EXISTS membros_especialidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_id UUID NOT NULL REFERENCES membros(id) ON DELETE CASCADE,
    especialidade_id UUID NOT NULL REFERENCES especialidades(id),
    data_inicio DATE NOT NULL,
    data_conclusao DATE,
    concluido BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membros-Requisitos
CREATE TABLE IF NOT EXISTS membros_requisitos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_id UUID NOT NULL REFERENCES membros(id) ON DELETE CASCADE,
    requisito_id UUID NOT NULL REFERENCES requisitos_classe(id),
    completado BOOLEAN DEFAULT false,
    data_conclusao TIMESTAMPTZ,
    validated_by UUID REFERENCES membros(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes-Instruções
CREATE TABLE IF NOT EXISTS classes_instrucoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    classe_id VARCHAR(10) NOT NULL REFERENCES classes(id),
    requisito_id UUID NOT NULL REFERENCES requisitos_classe(id),
    instrutor_id UUID REFERENCES membros(id),
    data_inicio DATE DEFAULT CURRENT_DATE,
    ensinou BOOLEAN DEFAULT false,
    data_ensino DATE,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Avaliações
CREATE TABLE IF NOT EXISTS avaliacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_id UUID NOT NULL REFERENCES membros(id),
    unidade_id UUID REFERENCES unidades(id),
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    criterio_id VARCHAR(100) NOT NULL,
    nivel VARCHAR(1) NOT NULL CHECK (nivel IN ('A', 'B', 'C')),
    pontos INTEGER NOT NULL,
    observacao TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Critérios de Avaliação
CREATE TABLE IF NOT EXISTS criterios_avaliacao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    ordem INTEGER NOT NULL DEFAULT 1,
    pontos_a INTEGER NOT NULL DEFAULT 20,
    descricao_a TEXT,
    pontos_b INTEGER NOT NULL DEFAULT 10,
    descricao_b TEXT,
    pontos_c INTEGER NOT NULL DEFAULT 0,
    descricao_c TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transições (histórico de mudanças)
CREATE TABLE IF NOT EXISTS transicoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_id UUID NOT NULL REFERENCES membros(id),
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('ENTRADA', 'SAIDA', 'TROCA_UNIDADE', 'TROCA_CARGO', 'CONCLUIU_CLASSE', 'INICIO_CLASSE', 'PROMOCAO', 'RECLASSIFICACAO')),
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    descricao TEXT,
    unidade_id UUID REFERENCES unidades(id),
    unidade_anterior_id UUID REFERENCES unidades(id),
    classe_id VARCHAR(10) REFERENCES classes(id),
    cargo_anterior VARCHAR(30) REFERENCES cargos(tipo),
    cargo_novo VARCHAR(30) REFERENCES cargos(tipo),
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles (tabela do Auth)
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

-- 3. CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_membros_clube ON membros(clube_id);
CREATE INDEX IF NOT EXISTS idx_membros_unidade ON membros(unidade_id);
CREATE INDEX IF NOT EXISTS idx_unidades_clube ON unidades(clube_id);
CREATE INDEX IF NOT EXISTS idx_profiles_clube ON profiles(clube_id);
CREATE INDEX IF NOT EXISTS idx_profiles_unidade ON profiles(unidade_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_membros_cargos_membro ON membros_cargos(membro_id);
CREATE INDEX IF NOT EXISTS idx_membros_cargos_cargo ON membros_cargos(cargo_tipo);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_membro ON avaliacoes(membro_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_unidade ON avaliacoes(unidade_id);

-- 4. HABILITAR RLS NAS TABELAS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubes ENABLE ROW LEVEL SECURITY;

-- 5. POLICIES PARA PROFILES
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

-- 6. PERMISSÕES NECESSÁRIAS PARA AUTHENTICATED
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.criterios_avaliacao TO authenticated;
GRANT SELECT ON TABLE public.unidades TO authenticated;
GRANT SELECT ON TABLE public.clubes TO authenticated;
GRANT SELECT ON TABLE public.membros TO authenticated;
GRANT SELECT ON TABLE public.classes TO authenticated;
GRANT SELECT ON TABLE public.especialidades TO authenticated;
GRANT SELECT ON TABLE public.avaliacoes TO authenticated;

-- Note: Admin policies removed because they caused recursive policy evaluation on profiles.

-- 7. FUNÇÃO PARA CRIAR PROFILE AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    IF to_regclass('public.profiles') IS NOT NULL THEN
        INSERT INTO public.profiles (id, nome, email, role)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'nome', SPLIT_PART(NEW.email, '@', 1)),
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'role', 'DESBRAVADOR')
        ) ON CONFLICT (id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TRIGGER PARA CRIAR PROFILE
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. INSERIR DADOS INICIAIS
INSERT INTO clubes (id, nome, cidade, estado)
VALUES ('00000000-0000-0000-0000-000000000001', 'Clube Central', 'Sao Paulo', 'SP')
ON CONFLICT (id) DO NOTHING;

-- Inserir classes
INSERT INTO classes (id, nome, descricao, ordem, cor, classes_pre_requisito) VALUES
('1', 'Amigo', 'Primeira classe para iniciantes', 1, '#3B82F6', '{}'),
('2', 'Companheiro', 'Segunda classe', 2, '#EF4444', '{"1"}'),
('3', 'Pesquisador', 'Terceira classe', 3, '#22C55E', '{"2"}'),
('4', 'Pioneiro', 'Quarta classe', 4, '#71717A', '{"3"}'),
('5', 'Excursionista', 'Quinta classe', 5, '#8B5CF6', '{"4"}'),
('6', 'Guia', 'Classe maxima', 6, '#EAB308', '{"5"}')
ON CONFLICT (id) DO NOTHING;

-- Inserir cargos
INSERT INTO cargos (tipo, nome, descricao, nivel, cor, pode_ter_multiple, requer_unidade, categoria) VALUES
('ADMIN', 'Administrador', 'Acesso total ao sistema', 100, '#DC2626', true, false, 'ADMIN'),
('DIRETOR', 'Diretor do Clube', 'Diretor geral do clube', 80, '#2563EB', false, false, 'DIRIGENTE'),
('CONSELHEIRO', 'Conselheiro(a)', 'Conselheiro de unidade', 45, '#059669', true, true, 'LIDER'),
('CAPITAO', 'Capitao', 'Lider da unidade', 30, '#EA580C', false, true, 'DESBRAVADOR'),
('SECRETARIO', 'Secretario', 'Secretario da unidade', 25, '#7C3AED', false, true, 'DESBRAVADOR'),
('DESBRAVADOR', 'Desbravador', 'Membro comum', 10, '#64748B', false, true, 'DESBRAVADOR')
ON CONFLICT (tipo) DO NOTHING;

-- Inserir unidades de exemplo
INSERT INTO unidades (id, clube_id, nome, genero, cores) VALUES
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Lobos', 'M', '{"#3B82F6", "#1E40AF", "#1E3A8A"}'),
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Aguias', 'F', '{"#EC4899", "#BE185D", "#9D174D"}'),
('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Falcoes', 'F', '{"#F97316", "#EA580C", "#C2410C"}')
ON CONFLICT (id) DO NOTHING;

-- Inserir criterios de avaliação
INSERT INTO criterios_avaliacao (id, nome, descricao, ordem, pontos_a, descricao_a, pontos_b, descricao_b, pontos_c, descricao_c) VALUES
('00000000-0000-0000-0001-000000000001', 'Presença', 'Assiduidade nas reuniões', 1, 20, 'Presente em todas', 10, 'Presente em algumas', 0, 'Ausente'),
('00000000-0000-0000-0001-000000000002', 'Comportamento', 'Conduta na unidade', 2, 20, 'Excelente', 10, 'Bom', 0, 'Precisa melhorar'),
('00000000-0000-0000-0001-000000000003', 'Aprendizado', 'Aprendizado dos requisitos', 3, 20, 'Completo', 10, 'Parcial', 0, 'Mínimo')
ON CONFLICT (id) DO NOTHING;

-- Verificar criação
SELECT 'clubes' as tabela, COUNT(*) as total FROM clubes
UNION ALL
SELECT 'unidades', COUNT(*) FROM unidades
UNION ALL
SELECT 'classes', COUNT(*) FROM classes
UNION ALL
SELECT 'cargos', COUNT(*) FROM cargos
UNION ALL
SELECT 'membros', COUNT(*) FROM membros
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles;
