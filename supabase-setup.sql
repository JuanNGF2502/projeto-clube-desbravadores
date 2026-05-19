-- ============================================
-- SCRIPT DE SETUP - Ignora erros se já existir
-- ============================================

-- Verifica e cria clubes
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

-- Verifica e cria unidades
CREATE TABLE IF NOT EXISTS unidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clube_id UUID REFERENCES clubes(id) ON DELETE CASCADE,
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

-- Verifica e cria classes
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

-- Verifica e cria membros
CREATE TABLE IF NOT EXISTS membros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clube_id UUID REFERENCES clubes(id),
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

-- Inserir classes se não existirem
INSERT INTO classes (id, nome, descricao, ordem, cor, classes_pre_requisito) VALUES
('1', 'Amigo', 'Primeira classe para iniciantes', 1, '#3B82F6', '{}'),
('2', 'Companheiro', 'Segunda classe', 2, '#EF4444', '{"1"}'),
('3', 'Pesquisador', 'Terceira classe', 3, '#22C55E', '{"2"}'),
('4', 'Pioneiro', 'Quarta classe', 4, '#71717A', '{"3"}'),
('5', 'Excursionista', 'Quinta classe', 5, '#8B5CF6', '{"4"}'),
('6', 'Guia', 'Classe maxima', 6, '#EAB308', '{"5"}')
ON CONFLICT (id) DO NOTHING;

-- Inserir club teste
INSERT INTO clubes (id, nome, cidade, estado)
VALUES ('00000000-0000-0000-0000-000000000001', 'Clube Central', 'Sao Paulo', 'SP')
ON CONFLICT (id) DO NOTHING;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_membros_clube ON membros(clube_id);
CREATE INDEX IF NOT EXISTS idx_membros_unidade ON membros(unidade_id);
CREATE INDEX IF NOT EXISTS idx_unidades_clube ON unidades(clube_id);

-- Selecionar dados para verificar
SELECT 'Clubes: ' || COUNT(*)::text FROM clubes;
SELECT 'Unidades: ' || COUNT(*)::text FROM unidades;
SELECT 'Classes: ' || COUNT(*)::text FROM classes;
SELECT 'Membros: ' || COUNT(*)::text FROM membros;