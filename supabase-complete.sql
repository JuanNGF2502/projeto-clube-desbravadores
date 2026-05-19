-- ============================================
-- SCRIPT COMPLETO: CRIA TABELAS + PERMISSÕES
-- Executar no SQL Editor do Supabase
-- ============================================

-- ============================================
-- 1. CRIA TODAS AS TABELAS (IF NOT EXISTS)
-- ============================================

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
    Clube_id UUID NOT NULL REFERENCES clubes(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    genero VARCHAR(10) NOT NULL CHECK (genero IN ('M', 'F')),
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
    categoria VARCHAR(50) NOT NULL,
    descricao TEXT,
    nivel INTEGER,
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
    categoria VARCHAR(20) NOT NULL
);

-- Membros
CREATE TABLE IF NOT EXISTS membros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Clube_id UUID NOT NULL REFERENCES clubes(id),
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

-- Avaliações
CREATE TABLE IF NOT EXISTS avaliacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_id UUID NOT NULL REFERENCES membros(id) ON DELETE CASCADE,
    unidade_id UUID NOT NULL REFERENCES unidades(id),
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    criterio_id VARCHAR(30) NOT NULL,
    nivel CHAR(1) NOT NULL CHECK (nivel IN ('A', 'B', 'C')),
    pontos INTEGER NOT NULL,
    observacao TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transições
CREATE TABLE IF NOT EXISTS transicoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_id UUID NOT NULL REFERENCES membros(id) ON DELETE CASCADE,
    tipo VARCHAR(30) NOT NULL,
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

-- ============================================
-- 2. ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_membros_clube ON membros(Clube_id);
CREATE INDEX IF NOT EXISTS idx_membros_unidade ON membros(unidade_id);
CREATE INDEX IF NOT EXISTS idx_unidades_clube ON unidades(Clube_id);

-- ============================================
-- 3. DADOS INICIAIS
-- ============================================

-- Clube de teste
INSERT INTO clubes (id, nome, cidade, estado)
VALUES ('00000000-0000-0000-0000-000000000001', 'Clube Central', 'Sao Paulo', 'SP')
ON CONFLICT (id) DO NOTHING;

-- Classes
INSERT INTO classes (id, nome, descricao, ordem, cor, classes_pre_requisito) VALUES
('1', 'Amigo', 'Primeira classe para iniciantes', 1, '#3B82F6', '{}'),
('2', 'Companheiro', 'Segunda classe', 2, '#EF4444', '{"1"}'),
('3', 'Pesquisador', 'Terceira classe', 3, '#22C55E', '{"2"}'),
('4', 'Pioneiro', 'Quarta classe', 4, '#71717A', '{"3"}'),
('5', 'Excursionista', 'Quinta classe', 5, '#8B5CF6', '{"4"}'),
('6', 'Guia', 'Classe máxima', 6, '#EAB308', '{"5"}')
ON CONFLICT (id) DO NOTHING;

-- Cargos
INSERT INTO cargos (tipo, nome, descricao, nivel, cor, pode_ter_multiple, requer_unidade, categoria) VALUES
('ADMIN', 'Administrador', 'Acesso total ao sistema', 100, '#DC2626', false, false, 'ADMIN'),
('DIRETOR', 'Diretor do Clube', 'Diretor geral do clube', 80, '#2563EB', false, false, 'DIRIGENTE'),
('CONSELHEIRO', 'Conselheiro(a)', 'Conselheiro de unidade', 45, '#059669', true, true, 'LIDER'),
('CAPITAO', 'Capitão', 'Líder da unidade', 30, '#EA580C', false, true, 'DESBRAVADOR'),
('DESBRAVADOR', 'Desbravador', 'Membro comum', 10, '#64748B', false, true, 'DESBRAVADOR')
ON CONFLICT (tipo) DO NOTHING;

-- ============================================
-- 4. PERMISSÕES (GRANT) - ESSENCIAL!
-- ============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================
-- 5. CONFIRMAÇÃO
-- ============================================

SELECT 'Tabelas criadas com sucesso!' AS status;