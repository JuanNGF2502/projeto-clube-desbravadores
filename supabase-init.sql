-- ============================================
-- SCRIPT COMPLETO DE CRIAÇÃO DO BANCO
-- ============================================

-- 1. Tabela Clubes
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

-- 2. Tabela Unidades
CREATE TABLE IF NOT EXISTS unidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Clube_id UUID REFERENCES clubes(id) ON DELETE CASCADE,
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

-- 3. Tabela Classes
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

-- 4. Tabela Membros
CREATE TABLE IF NOT EXISTS membros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Clube_id UUID REFERENCES clubes(id),
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

-- 5. Tabela Cargos
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

-- Inserir dados iniciais - Clubes
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
INSERT INTO unidades (id, Clube_id, nome, genero, cores) VALUES
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Lobos', 'M', '{"#3B82F6", "#1E40AF", "#1E3A8A"}'),
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Aguias', 'F', '{"#EC4899", "#BE185D", "#9D174D"}'),
('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Falcoes', 'F', '{"#F97316", "#EA580C", "#C2410C"}')
ON CONFLICT (id) DO NOTHING;

-- Inserir membros de exemplo
INSERT INTO membros (id, Clube_id, unidade_id, nome, sexo, data_nascimento, telefone, email, ativo) VALUES
('aaaa1111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Lucas Silva', 'M', '2012-03-15', '(11) 99999-1111', 'lucas@email.com', true),
('aaaa2222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Ana Costa', 'F', '2013-07-22', '(11) 99999-2222', 'ana@email.com', true),
('aaaa3333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Pedro Santos', 'M', '2014-01-10', '(11) 99999-3333', 'pedro@email.com', true),
('aaaa4444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'Maria Oliveira', 'F', '2015-09-05', '(11) 99999-4444', 'maria@email.com', true)
ON CONFLICT (id) DO NOTHING;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_membros_clube ON membros(Clube_id);
CREATE INDEX IF NOT EXISTS idx_membros_unidade ON membros(unidade_id);
CREATE INDEX IF NOT EXISTS idx_unidades_clube ON unidades(Clube_id);

-- Verificar o que foi criado
SELECT 'clubes' as tabela, COUNT(*) as total FROM clubes
UNION ALL
SELECT 'unidades', COUNT(*) FROM unidades
UNION ALL
SELECT 'classes', COUNT(*) FROM classes
UNION ALL
SELECT 'cargos', COUNT(*) FROM cargos
UNION ALL
SELECT 'membros', COUNT(*) FROM membros;