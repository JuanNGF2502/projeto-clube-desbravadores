-- ============================================
-- SCRIPT COMPLETO DE MIGRACAO - PROJETO CLUBE
-- Execute no SQL Editor do Supabase
-- ============================================

-- ============================================
-- 1. EXTENSOES
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 2. TABELAS BASE
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
    clube_id UUID NOT NULL REFERENCES clubes(id) ON DELETE CASCADE,
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

-- Users (Auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    email TEXT UNIQUE,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. CLASSES E ESPECIALIDADES
-- ============================================

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

-- ============================================
-- 4. CARGOS
-- ============================================

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

-- ============================================
-- 5. MEMBROS
-- ============================================

CREATE TABLE IF NOT EXISTS membros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clube_id UUID NOT NULL REFERENCES clubes(id),
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

-- ============================================
-- 6. RELAÇÕES - UNIDADES
-- ============================================

CREATE TABLE IF NOT EXISTS membros_unidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_id UUID NOT NULL REFERENCES membros(id) ON DELETE CASCADE,
    unidade_id UUID NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
    data_entrada DATE NOT NULL,
    data_saida DATE,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. RELAÇÕES - CARGOS
-- ============================================

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

-- ============================================
-- 8. RELAÇÕES - CLASSES
-- ============================================

CREATE TABLE IF NOT EXISTS membros_classes_atuais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_id UUID NOT NULL REFERENCES membros(id) ON DELETE CASCADE,
    classe_id VARCHAR(10) NOT NULL REFERENCES classes(id),
    data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS membros_classes_concluidas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_id UUID NOT NULL REFERENCES membros(id) ON DELETE CASCADE,
    classe_id VARCHAR(10) NOT NULL REFERENCES classes(id),
    data_inicio DATE NOT NULL,
    data_conclusao DATE NOT NULL,
    concluido BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS membros_requisitos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_id UUID NOT NULL REFERENCES membros(id) ON DELETE CASCADE,
    requisito_id UUID NOT NULL REFERENCES requisitos_classe(id),
    completado BOOLEAN DEFAULT false,
    data_conclusao TIMESTAMPTZ,
    validated_by UUID REFERENCES membros(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. RELAÇÕES - ESPECIALIDADES
-- ============================================

CREATE TABLE IF NOT EXISTS membros_especialidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_id UUID NOT NULL REFERENCES membros(id) ON DELETE CASCADE,
    especialidade_id UUID NOT NULL REFERENCES especialidades(id),
    data_inicio DATE NOT NULL,
    data_conclusao DATE,
    concluido BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. AVALIAÇÕES
-- ============================================

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

-- ============================================
-- 11. TRANSIÇÕES/HISTÓRICO
-- ============================================

CREATE TABLE IF NOT EXISTS transicoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membro_id UUID NOT NULL REFERENCES membros(id) ON DELETE CASCADE,
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

-- ============================================
-- 12. ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_membros_clube ON membros(clube_id);
CREATE INDEX IF NOT EXISTS idx_membros_unidade ON membros(unidade_id);
CREATE INDEX IF NOT EXISTS idx_unidades_clube ON unidades(clube_id);
CREATE INDEX IF NOT EXISTS idx_membros_classes_atuais_membro ON membros_classes_atuais(membro_id);
CREATE INDEX IF NOT EXISTS idx_membros_classes_atuais_classe ON membros_classes_atuais(classe_id);
CREATE INDEX IF NOT EXISTS idx_membros_classes_concluidas_membro ON membros_classes_concluidas(membro_id);
CREATE INDEX IF NOT EXISTS idx_membros_cargos_membro ON membros_cargos(membro_id);
CREATE INDEX IF NOT EXISTS idx_membros_cargos_cargo ON membros_cargos(cargo_tipo);
CREATE INDEX IF NOT EXISTS idx_membros_especialidades_membro ON membros_especialidades(membro_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_membro ON avaliacoes(membro_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_unidade ON avaliacoes(unidade_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_data ON avaliacoes(data);
CREATE INDEX IF NOT EXISTS idx_transicoes_membro ON transicoes(membro_id);
CREATE INDEX IF NOT EXISTS idx_transicoes_data ON transicoes(data);

-- ============================================
-- 13. DADOS INICIAIS
-- ============================================

-- Clube de teste
INSERT INTO clubes (id, nome, cidade, estado)
VALUES ('00000000-0000-0000-0000-000000000001', 'Clube Central', 'São Paulo', 'SP')
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
-- Admin
('ADMIN', 'Administrador', 'Acesso total ao sistema', 100, '#DC2626', true, false, 'ADMIN'),
('REGIONAL', 'Diretor Regional', 'Responsável pela regional', 90, '#7C3AED', true, false, 'ADMIN'),
-- Dirigente
('DIRETOR', 'Diretor do Clube', 'Diretor geral do clube', 80, '#2563EB', false, false, 'DIRIGENTE'),
('DIRETOR_ASSOC', 'Diretor Associado', 'Diretor substituto', 70, '#0891B2', true, false, 'DIRIGENTE'),
-- Líder
('DIRETOR_CLUBE', 'Diretor(a)', 'Diretor de unidade', 65, '#1D4ED8', false, true, 'LIDER'),
('DIRETOR_ASSOC_CLUBE', 'Diretor(a) Associado(a)', 'Diretor substituto de unidade', 60, '#0E7490', true, true, 'LIDER'),
('SECRETARIO_CLUBE', 'Secretário(a)', 'Secretário de unidade', 55, '#7C3AED', false, true, 'LIDER'),
('TESOUREIRO_CLUBE', 'Tesoureiro(a)', 'Tesoureiro de unidade', 55, '#059669', false, true, 'LIDER'),
('CAPELAO_CLUBE', 'Capelão', 'Capelão de unidade', 50, '#92400E', true, true, 'LIDER'),
('INSTRUTOR_CLASSE', 'Instrutor de Classe', 'Instrutor de classe', 50, '#D97706', true, false, 'LIDER'),
('INSTRUTOR_OU', 'Instrutor de Ordem Unida', 'Instrutor de OU', 50, '#BE185D', true, true, 'LIDER'),
('CONSELHEIRO', 'Conselheiro(a)', 'Conselheiro de unidade', 45, '#059669', true, true, 'LIDER'),
('CONSELHEIRO_ASSOC', 'Conselheiro(a) Associado(a)', 'Conselheiro substituto', 40, '#047857', true, true, 'LIDER'),
-- Desbravador
('CAPITAO', 'Capitão', 'Líder da unidade', 30, '#EA580C', false, true, 'DESBRAVADOR'),
('SECRETARIO', 'Secretário', 'Secretário da unidade', 25, '#7C3AED', false, true, 'DESBRAVADOR'),
('TESOUREIRO', 'Tesoureiro', 'Tesoureiro da unidade', 25, '#059669', false, true, 'DESBRAVADOR'),
('ALMOXARIFE', 'Almoxarife', 'Responsável por materiais', 20, '#0891B2', false, true, 'DESBRAVADOR'),
('PADIOLEIRO', 'Padioleiro', 'Auxiliar de primeiros socorros', 20, '#B45309', false, true, 'DESBRAVADOR'),
('CAPELAO', 'Capelão', 'Auxiliar espiritual', 20, '#92400E', false, true, 'DESBRAVADOR'),
('ESPORTISTA', 'Esportista', 'Responsável de esportes', 20, '#2563EB', false, true, 'DESBRAVADOR'),
('OUTRO', 'Outro', 'Outro cargo', 15, '#64748B', true, true, 'DESBRAVADOR'),
('DESBRAVADOR', 'Desbravador', 'Membro comum', 10, '#64748B', false, true, 'DESBRAVADOR')
ON CONFLICT (tipo) DO NOTHING;

-- Requisitos das Classes
INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem) VALUES
-- Classe Amigo (1)
('1', 'Espiritualidade', 'Participar de 3 encontros', 'Estar presente em pelo menos 3 encontros', 1),
('1', 'Espiritualidade', 'Memorizar a Lei', 'Decorar e recitar a Lei dos Desbravadores', 2),
('1', 'Espiritualidade', 'Conhecer a estrutura', 'Saber nomes dos diretores e conselheiros', 3),
('1', 'Uniforme', 'Apresentar a Bíblia', 'Trazer sua própria Bíblia', 4),
('1', 'Uniforme', 'Ter o uniforme básico', 'Camiseta e calça do clube', 5),
('1', 'Atividades ao Ar Livre', 'Primeira caminhada', 'Participar de uma caminhada', 6),
-- Classe Companheiro (2)
('2', 'Espiritualidade', 'Completar classe Amigo', 'Ter todas as especialidades da classe anterior', 1),
('2', 'Espiritualidade', 'Participar de 5 encontros', 'Estar presente em pelo menos 5 encontros', 2),
('2', 'Espiritualidade', 'Liderar uma atividade', 'Coordenar uma atividade da unidade', 3),
('2', 'Habilidades', 'Ensinar uma habilidade', 'Ensinar algo que sabe para outro desbravador', 4),
('2', 'Habilidades', 'Fazer uma caminhada', 'Participar de caminhada de pelo menos 5km', 5),
('2', 'Comunidade', 'Ajudar novo membro', 'Apoiar integração de novo desbravador', 6),
-- Classe Pesquisador (3)
('3', 'Espiritualidade', 'Completar classes anteriores', 'Ter concluído todas as classes até Companheiro', 1),
('3', 'Espiritualidade', 'Estudar 2 especialidades', 'Completar pelo menos 2 especialidades', 2),
('3', 'Espiritualidade', 'Apresentar devoção', 'Conduzir um momento devocional', 3),
('3', 'Vida ao Ar Livre', 'Participar de acampamento', 'Participar de pelo menos 1 acampamento', 4),
('3', 'Vida ao Ar Livre', 'Acender fogo', 'Demonstrar habilidade de fazer fogo', 5),
('3', 'Liderança', 'Ajudar novo membro', 'Acompanhar progresso de um desbravador mais novo', 6),
-- Classe Pioneiro (4)
('4', 'Espiritualidade', 'Completar todas as classes anteriores', 'Ter concluído até Pesquisador', 1),
('4', 'Espiritualidade', 'Estudar 3 especialidades', 'Completar pelo menos 3 especialidades', 2),
('4', 'Vida ao Ar Livre', 'Liderar acampamento', 'Participar da organização de um acampamento', 3),
('4', 'Vida ao Ar Livre', 'Navegação', 'Demonstrar uso de mapa e bússola', 4),
('4', 'Liderança', 'Mentoriar um desbravador', 'Acompanhar o progresso de um desbravador', 5),
('4', 'Liderança', 'Organizar evento', 'Coordenar um evento da unidade', 6),
('4', 'Comunidade', 'Projeto comunitário', 'Participar de projeto de serviço', 7),
-- Classe Excursionista (5)
('5', 'Espiritualidade', 'Completar classes até Pioneiro', 'Ter concluído todas as classes anteriores', 1),
('5', 'Espiritualidade', 'Estudar 4 especialidades', 'Completar pelo menos 4 especialidades', 2),
('5', 'Vida ao Ar Livre', 'Planejar expedição', 'Organizar e liderar uma expedição', 3),
('5', 'Vida ao Ar Livre', 'Sobrevivência', 'Demonstrar técnicas de sobrevivência', 4),
('5', 'Ensino', 'Ensinar especialidades', 'Ministrar pelo menos 2 especialidades', 5),
('5', 'Ensino', 'Uniforme completo', 'Apresentar-se com uniforme completo em 5 ocasiões', 6),
-- Classe Guia (6)
('6', 'Espiritualidade', 'Ser exemplo', 'Demonstrar conduta exemplar', 1),
('6', 'Espiritualidade', 'Completar especialidades', 'Concluir todas as especialidades obrigatórias', 2),
('6', 'Liderança', 'Liderar a unidade', 'Assumir papel de liderança', 3),
('6', 'Liderança', 'Apresentar testemunho', 'Compartilhar sua jornada como desbravador', 4),
('6', 'Comunidade', 'Servir à comunidade', 'Participar de projetos de serviço', 5),
('6', 'Comunidade', 'Projetos sociais', 'Liderar um projeto social', 6);

-- Especialidades
INSERT INTO especialidades (nome, categoria, descricao, nivel) VALUES
-- ARTE MANUAL
('Artesanato', 'ARTE MANUAL', 'Trabalhos manuais diversos', 1),
('Desenho', 'ARTE MANUAL', 'Expressão artística gráfica', 1),
('Pintura', 'ARTE MANUAL', 'Pintura artística', 2),
('Escultura', 'ARTE MANUAL', 'Modelagem e escultura', 3),
-- NATUREZA
('Observação de Pássaros', 'NATUREZA', 'Identificação de aves', 1),
('Jardinagem', 'NATUREZA', 'Cultivo de plantas', 1),
('Agricultura', 'NATUREZA', 'Técnicas agrícolas', 2),
('Zoologia', 'NATUREZA', 'Estudo de animais', 2),
('Botânica', 'NATUREZA', 'Estudo de plantas', 3),
('Ecologia', 'NATUREZA', 'Estudo do meio ambiente', 3),
-- SAÚDE
('Primeiros Socorros', 'SAÚDE', 'Atendimento emergencial', 1),
('Saúde e Higiene', 'SAÚDE', 'Cuidados com a saúde', 1),
('Nutrição', 'SAÚDE', 'Alimentação saudável', 2),
('Enfermagem', 'SAÚDE', 'Cuidados de enfermagem', 3),
-- MISSIONÁRIA
('Canto', 'MISSIONÁRIA', 'Música e canto', 1),
('Pregação', 'MISSIONÁRIA', 'Evangelismo básico', 2),
('Missão', 'MISSIONÁRIA', 'Trabalho missionário', 3),
-- PROFISSIONAL
('Informática', 'PROFISSIONAL', 'Computação básica', 1),
('Cozinha', 'PROFISSIONAL', 'Preparo de alimentos', 2),
('Mecânica', 'PROFISSIONAL', 'Manutenção básica', 2),
('Eletrônica', 'PROFISSIONAL', 'Circuitos básicos', 3),
-- DOMÉSTICA
('Costura', 'DOMÉSTICA', 'Confecção de roupas', 1),
('Organização', 'DOMÉSTICA', 'Arrumação e limpeza', 1),
('Lavanderia', 'DOMÉSTICA', 'Tratamento de roupas', 2),
-- RECREATIVA
('Natação', 'RECREATIVA', 'Nadar', 1),
('Ciclismo', 'RECREATIVA', 'Andar de bicicleta', 1),
('Esportes', 'RECREATIVA', 'Vários esportes', 2),
('Atletismo', 'RECREATIVA', 'Atividades atléticas', 2),
('Orientação', 'RECREATIVA', 'Navegação e orientação', 3),
('Camping', 'RECREATIVA', 'Acampamento', 3)
ON CONFLICT DO NOTHING;

-- Unidades de exemplo
INSERT INTO unidades (id, clube_id, nome, genero, cores) VALUES
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Lobos', 'M', '{"#3B82F6", "#1E40AF", "#1E3A8A"}'),
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000001', 'Águias', 'F', '{"#EC4899", "#BE185D", "#9D174D"}'),
('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000001', 'Falcões', 'F', '{"#F97316", "#EA580C", "#C2410C"}')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 14. VIEWS
-- ============================================

CREATE OR REPLACE VIEW vw_estatisticas_clube AS
SELECT
    c.id as clube_id,
    c.nome as clube_nome,
    COUNT(DISTINCT m.id) FILTER (WHERE m.ativo = true) as total_membros_ativos,
    COUNT(DISTINCT u.id) as total_unidades,
    COUNT(DISTINCT mc.classe_id) FILTER (WHERE mc.concluido = true) as total_classes_concluidas,
    COUNT(DISTINCT me.especialidade_id) FILTER (WHERE me.concluido = true) as total_especialidades_concluidas
FROM clubes c
LEFT JOIN unidades u ON u.clube_id = c.id AND u.ativo = true
LEFT JOIN membros m ON m.clube_id = c.id AND m.ativo = true
LEFT JOIN membros_classes_concluidas mc ON mc.membro_id = m.id
LEFT JOIN membros_especialidades me ON me.membro_id = m.id AND me.concluido = true
GROUP BY c.id, c.nome;

CREATE OR REPLACE VIEW vw_ranking_unidades AS
SELECT
    u.id as unidade_id,
    u.nome as unidade_nome,
    u.cores as unidade_cores,
    COUNT(m.id) as total_membros,
    COALESCE(SUM(a.pontos), 0) as total_pontos,
    ROUND(COALESCE(AVG(a.pontos), 0), 2) as media_pontos,
    ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(a.pontos), 0) DESC) as posicao
FROM unidades u
LEFT JOIN membros m ON m.unidade_id = u.id AND m.ativo = true
LEFT JOIN avaliacoes a ON a.membro_id = m.id
WHERE u.ativo = true
GROUP BY u.id, u.nome, u.cores
ORDER BY total_pontos DESC;

-- ============================================
-- 15. FUNÇÕES
-- ============================================

-- Função para obter classe atual principal do membro
CREATE OR REPLACE FUNCTION fn_classe_atual_principal(membro_uuid UUID)
RETURNS VARCHAR AS $$
DECLARE
    classe_id VARCHAR;
BEGIN
    SELECT mc.classe_id INTO classe_id
    FROM membros_classes_atuais mc
    WHERE mc.membro_id = membro_uuid
    ORDER BY mc.data_inicio DESC
    LIMIT 1;

    IF classe_id IS NULL THEN
        SELECT mcc.classe_id INTO classe_id
        FROM membros_classes_concluidas mcc
        WHERE mcc.membro_id = membro_uuid
        ORDER BY mcc.data_conclusao DESC
        LIMIT 1;
    END IF;

    RETURN COALESCE(classe_id, '1');
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se membro pode avançar de classe
CREATE OR REPLACE FUNCTION fn_pode_avancar_classe(membro_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    classe_atual VARCHAR;
    requisitos_total INTEGER;
    requisitos_concluidos INTEGER;
BEGIN
    SELECT classe_id INTO classe_atual
    FROM membros_classes_atuais
    WHERE membro_id = membro_uuid
    ORDER BY data_inicio DESC
    LIMIT 1;

    IF classe_atual IS NULL THEN
        RETURN false;
    END IF;

    SELECT COUNT(*) INTO requisitos_total
    FROM requisitos_classe
    WHERE classe_id = classe_atual AND ativo = true;

    SELECT COUNT(*) INTO requisitos_concluidos
    FROM membros_requisitos mr
    JOIN requisitos_classe rc ON rc.id = mr.requisito_id
    WHERE mr.membro_id = membro_uuid
      AND rc.classe_id = classe_atual
      AND mr.completado = true;

    RETURN requisitos_concluidos >= requisitos_total;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 16. PERMISSÕES (RLS)
-- ============================================

-- Habilitar RLS nas tabelas sensíveis
ALTER TABLE membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE membros_cargos ENABLE ROW LEVEL SECURITY;
ALTER TABLE membros_classes_atuais ENABLE ROW LEVEL SECURITY;
ALTER TABLE membros_classes_concluidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE membros_especialidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;

-- Políticas para membros (leitura pública, inserção autenticada)
CREATE POLICY "Public read access on membros" ON membros FOR SELECT USING (true);
CREATE POLICY "Public insert on membros" ON membros FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update on membros" ON membros FOR UPDATE USING (true);

CREATE POLICY "Public read access on membros_cargos" ON membros_cargos FOR SELECT USING (true);
CREATE POLICY "Public insert on membros_cargos" ON membros_cargos FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update on membros_cargos" ON membros_cargos FOR UPDATE USING (true);

CREATE POLICY "Public read access on membros_classes_atuais" ON membros_classes_atuais FOR SELECT USING (true);
CREATE POLICY "Public insert on membros_classes_atuais" ON membros_classes_atuais FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read access on membros_classes_concluidas" ON membros_classes_concluidas FOR SELECT USING (true);
CREATE POLICY "Public insert on membros_classes_concluidas" ON membros_classes_concluidas FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update on membros_classes_concluidas" ON membros_classes_concluidas FOR UPDATE USING (true);

CREATE POLICY "Public read access on membros_especialidades" ON membros_especialidades FOR SELECT USING (true);
CREATE POLICY "Public insert on membros_especialidades" ON membros_especialidades FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update on membros_especialidades" ON membros_especialidades FOR UPDATE USING (true);

CREATE POLICY "Public read access on avaliacoes" ON avaliacoes FOR SELECT USING (true);
CREATE POLICY "Public insert on avaliacoes" ON avaliacoes FOR INSERT WITH CHECK (true);

-- Grant permissions for anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ============================================
-- 17. CONFIRMAÇÃO
-- ============================================

SELECT
    'clubes: ' || COUNT(*) AS total FROM clubes
UNION ALL
SELECT 'unidades: ' || COUNT(*) FROM unidades
UNION ALL
SELECT 'classes: ' || COUNT(*) FROM classes
UNION ALL
SELECT 'cargos: ' || COUNT(*) FROM cargos
UNION ALL
SELECT 'requisitos_classe: ' || COUNT(*) FROM requisitos_classe
UNION ALL
SELECT 'especialidades: ' || COUNT(*) FROM especialidades
UNION ALL
SELECT 'membros: ' || COUNT(*) FROM membros;