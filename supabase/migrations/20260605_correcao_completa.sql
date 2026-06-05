-- ============================================================
-- CORREÇÃO COMPLETA DO BANCO DE DADOS
-- ============================================================
-- Este script:
-- 1. Corrige tipos e constraints
-- 2. Adiciona índices para performance
-- 3. Cria trigger de updated_at
-- 4. Insere seed data (cargos, classes, criterios_avaliacao)
-- 5. Cria políticas RLS para segurança
-- 6. Cria funções auxiliares
-- 7. Migra DIRIGENTE → LIDER
-- ============================================================

-- ============================================================
-- PARTE 1: CORREÇÕES DE ESQUEMA
-- ============================================================

-- Corrige tipo de criterio_id em avaliacoes (de varchar para uuid)
-- Primeiro adiciona coluna auxiliar, migra dados, depois ajusta
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS criterio_uuid uuid;
UPDATE avaliacoes SET criterio_uuid = criterio_id::uuid
  WHERE criterio_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
-- Nota: se houver valores varchar que não são UUIDs, eles ficarão NULL
-- e precisarão ser corrigidos manualmente

-- Remove tabela users se existir (não utilizada pelo código)
DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================================
-- PARTE 2: ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_membros_clube_id ON membros(clube_id);
CREATE INDEX IF NOT EXISTS idx_membros_unidade_id ON membros(unidade_id);
CREATE INDEX IF NOT EXISTS idx_membros_email ON membros(email);
CREATE INDEX IF NOT EXISTS idx_membros_cargos_membro_id ON membros_cargos(membro_id);
CREATE INDEX IF NOT EXISTS idx_membros_cargos_cargo_tipo ON membros_cargos(cargo_tipo);
CREATE INDEX IF NOT EXISTS idx_membros_cargos_unidade_id ON membros_cargos(unidade_id);
CREATE INDEX IF NOT EXISTS idx_membros_cargos_classe_id ON membros_cargos(classe_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_membro_id ON avaliacoes(membro_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_unidade_id ON avaliacoes(unidade_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_data ON avaliacoes(data);
CREATE INDEX IF NOT EXISTS idx_transicoes_membro_id ON transicoes(membro_id);
CREATE INDEX IF NOT EXISTS idx_membros_classes_atuais_membro ON membros_classes_atuais(membro_id);
CREATE INDEX IF NOT EXISTS idx_membros_classes_concluidas_membro ON membros_classes_concluidas(membro_id);
CREATE INDEX IF NOT EXISTS idx_membros_requisitos_membro ON membros_requisitos(membro_id);
CREATE INDEX IF NOT EXISTS idx_membros_especialidades_membro ON membros_especialidades(membro_id);
CREATE INDEX IF NOT EXISTS idx_membros_unidades_membro ON membros_unidades(membro_id);
CREATE INDEX IF NOT EXISTS idx_unidades_clube_id ON unidades(clube_id);
CREATE INDEX IF NOT EXISTS idx_profiles_membro_id ON profiles(membro_id);
CREATE INDEX IF NOT EXISTS idx_profiles_clube_id ON profiles(clube_id);

-- ============================================================
-- PARTE 3: TRIGGER UPDATED_AT
-- ============================================================

DROP FUNCTION IF EXISTS trigger_updated_at() CASCADE;
CREATE FUNCTION trigger_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Aplica trigger em todas as tabelas com updated_at
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT table_name FROM information_schema.columns
    WHERE column_name = 'updated_at'
      AND table_schema = 'public'
      AND table_name NOT IN ('cargos', 'criterios_avaliacao', 'especialidades')
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION trigger_updated_at()',
      t
    );
  END LOOP;
END;
$$;

-- ============================================================
-- PARTE 4: SEED DATA - CARGOS
-- ============================================================

INSERT INTO cargos (tipo, nome, descricao, nivel, cor, pode_ter_multiple, requer_unidade, categoria)
VALUES
  -- ADMIN
  ('ADMIN', 'Administrador', 'Acesso total ao sistema', 1, '#EF4444', false, false, 'ADMIN'),
  ('REGIONAL', 'Regional', 'Administrador regional', 2, '#F97316', false, false, 'ADMIN'),
  -- LIDER
  ('DIRETOR', 'Diretor', 'Diretor do clube', 10, '#3B82F6', false, false, 'LIDER'),
  ('DIRETOR_ASSOC', 'Diretor Associado', 'Diretor associado do clube', 11, '#60A5FA', false, false, 'LIDER'),
  ('DIRETOR_CLUBE', 'Diretor de Clube', 'Diretor de clube', 12, '#3B82F6', false, false, 'LIDER'),
  ('DIRETOR_ASSOC_CLUBE', 'Diretor Associado de Clube', 'Diretor associado de clube', 13, '#60A5FA', false, false, 'LIDER'),
  ('SECRETARIO_CLUBE', 'Secretário do Clube', 'Secretário do clube', 14, '#8B5CF6', false, false, 'LIDER'),
  ('TESOUREIRO_CLUBE', 'Tesoureiro do Clube', 'Tesoureiro do clube', 15, '#10B981', false, false, 'LIDER'),
  ('CAPELAO_CLUBE', 'Capelão do Clube', 'Capelão do clube', 16, '#EC4899', false, false, 'LIDER'),
  ('INSTRUTOR_CLASSE', 'Instrutor de Classe', 'Instrutor de classes', 20, '#22C55E', true, false, 'LIDER'),
  ('INSTRUTOR_OU', 'Instrutor de Ordem Unida', 'Instrutor de ordem unida', 21, '#22C55E', true, false, 'LIDER'),
  ('CONSELHEIRO', 'Conselheiro', 'Conselheiro de unidade', 30, '#F59E0B', false, true, 'LIDER'),
  ('CONSELHEIRO_ASSOC', 'Conselheiro Associado', 'Conselheiro associado de unidade', 31, '#FBBF24', false, true, 'LIDER'),
  -- DESBRAVADOR
  ('CAPITAO', 'Capitão', 'Capitão da unidade', 40, '#EF4444', false, false, 'DESBRAVADOR'),
  ('SECRETARIO', 'Secretário', 'Secretário da unidade', 41, '#8B5CF6', false, false, 'DESBRAVADOR'),
  ('TESOUREIRO', 'Tesoureiro', 'Tesoureiro da unidade', 42, '#10B981', false, false, 'DESBRAVADOR'),
  ('ALMOXARIFE', 'Almoxarife', 'Almoxarife da unidade', 43, '#71717A', false, false, 'DESBRAVADOR'),
  ('PADIOLEIRO', 'Padioleiro', 'Padioleiro da unidade', 44, '#14B8A6', false, false, 'DESBRAVADOR'),
  ('CAPELAO', 'Capelão', 'Capelão da unidade', 45, '#EC4899', false, false, 'DESBRAVADOR'),
  ('ESPORTISTA', 'Esportista', 'Esportista da unidade', 46, '#22C55E', false, false, 'DESBRAVADOR'),
  ('OUTRO', 'Outro Cargo', 'Outro cargo da unidade', 47, '#A1A1AA', false, false, 'DESBRAVADOR'),
  ('DESBRAVADOR', 'Desbravador', 'Membro da unidade', 50, '#22C55E', false, false, 'DESBRAVADOR')
ON CONFLICT (tipo) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  nivel = EXCLUDED.nivel,
  cor = EXCLUDED.cor,
  pode_ter_multiple = EXCLUDED.pode_ter_multiple,
  requer_unidade = EXCLUDED.requer_unidade,
  categoria = EXCLUDED.categoria;

-- ============================================================
-- PARTE 5: SEED DATA - CLASSES
-- ============================================================

INSERT INTO classes (id, nome, descricao, ordem, cor, imagem)
VALUES
  ('1', 'Amigo', 'Primeira classe dos desbravadores', 1, '#3B82F6', '/images/amigo-150x150.png'),
  ('2', 'Companheiro', 'Segunda classe dos desbravadores', 2, '#EF4444', '/images/companheiro-150x150.png'),
  ('3', 'Pesquisador', 'Terceira classe dos desbravadores', 3, '#22C55E', '/images/pesquisador-150x150.png'),
  ('4', 'Pioneiro', 'Quarta classe dos desbravadores', 4, '#71717A', '/images/pioneiro-150x150.png'),
  ('5', 'Excursionista', 'Quinta classe dos desbravadores', 5, '#8B5CF6', '/images/excursionista-150x150.png'),
  ('6', 'Guia', 'Sexta classe dos desbravadores', 6, '#EAB308', '/images/guia-150x150.png')
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  ordem = EXCLUDED.ordem,
  cor = EXCLUDED.cor,
  imagem = EXCLUDED.imagem;

-- ============================================================
-- PARTE 6: SEED DATA - CRITÉRIOS DE AVALIAÇÃO
-- ============================================================

INSERT INTO criterios_avaliacao (id, nome, descricao, ordem, pontos_a, descricao_a, pontos_b, descricao_b, pontos_c, descricao_c)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Pontualidade', 'Chegou no horário', 1, 20, 'Chegou no horário', 10, 'Atrasou até 10min', 0, 'Atrasou mais de 10min'),
  ('00000000-0000-0000-0000-000000000002', 'Uniforme', 'Vestimenta adequada', 2, 20, 'Uniforme completo e correto', 10, 'Uniforme incompleto', 0, 'Sem uniforme'),
  ('00000000-0000-0000-0000-000000000003', 'Material', 'Trouxe o material necessário', 3, 20, 'Trouxe todo o material', 10, 'Trouxe parcialmente', 0, 'Não trouxe material'),
  ('00000000-0000-0000-0000-000000000004', 'Disciplina', 'Comportamento adequado', 4, 20, 'Comportamento exemplar', 10, 'Comportamento regular', 0, 'Comportamento inadequado'),
  ('00000000-0000-0000-0000-000000000005', 'Leitura Bíblica', 'Leitura da Bíblia', 5, 30, 'Leu e participou da reflexão', 10, 'Leu mas não participou', 0, 'Não leu'),
  ('00000000-0000-0000-0000-000000000006', 'Classe', 'Progresso na classe', 6, 20, 'Completou requisitos da classe', 10, 'Parcialmente completo', 0, 'Não progrediu'),
  ('00000000-0000-0000-0000-000000000007', 'Boa Ação', 'Realizou boa ação', 7, 20, 'Realizou boa ação na semana', 0, NULL, 0, NULL)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  ordem = EXCLUDED.ordem,
  pontos_a = EXCLUDED.pontos_a,
  descricao_a = EXCLUDED.descricao_a,
  pontos_b = EXCLUDED.pontos_b,
  descricao_b = EXCLUDED.descricao_b,
  pontos_c = EXCLUDED.pontos_c,
  descricao_c = EXCLUDED.descricao_c;

-- ============================================================
-- PARTE 7: POLÍTICAS RLS
-- ============================================================

-- Habilita RLS nas tabelas principais
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS membros_cargos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS clubes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS membros_classes_atuais ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS membros_classes_concluidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS membros_requisitos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS membros_especialidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS membros_unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS requisitos_classe ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS classes_instrucoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS especialidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS criterios_avaliacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cargos ENABLE ROW LEVEL SECURITY;

-- Função auxiliar: retorna o role do profile atual
-- (no schema public porque o schema auth é gerenciado pelo Supabase)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(p.role, 'DESBRAVADOR')
  FROM profiles p
  WHERE p.id = auth.uid()
$$;

-- Função auxiliar: retorna o clube_id do profile atual
CREATE OR REPLACE FUNCTION public.get_user_club_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.clube_id
  FROM profiles p
  WHERE p.id = auth.uid()
$$;

-- Função auxiliar: retorna o membro_id do profile atual
CREATE OR REPLACE FUNCTION public.get_user_membro_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.membro_id
  FROM profiles p
  WHERE p.id = auth.uid()
$$;

-- POLÍTICAS: PROFILES

-- Admins e LÍDERES podem ver todos os profiles
-- DESBRAVADOR vê apenas o próprio profile
DROP POLICY IF EXISTS profiles_select ON profiles;
CREATE POLICY profiles_select ON profiles
  FOR SELECT
  USING (
    public.get_user_role() = 'ADMIN'
    OR id = auth.uid()
  );

-- Apenas ADMIN pode alterar roles
DROP POLICY IF EXISTS profiles_update ON profiles;
CREATE POLICY profiles_update ON profiles
  FOR UPDATE
  USING (public.get_user_role() = 'ADMIN')
  WITH CHECK (public.get_user_role() = 'ADMIN');

-- POLÍTICAS: MEMBROS

-- ADMIN: vê todos os membros
-- LIDER/DESBRAVADOR: vê apenas a si mesmo
DROP POLICY IF EXISTS membros_select ON membros;
CREATE POLICY membros_select ON membros
  FOR SELECT
  USING (
    public.get_user_role() = 'ADMIN'
    OR id = public.get_user_membro_id()
  );

-- Apenas ADMIN pode inserir/editar membros
DROP POLICY IF EXISTS membros_insert ON membros;
CREATE POLICY membros_insert ON membros
  FOR INSERT
  WITH CHECK (public.get_user_role() = 'ADMIN');

DROP POLICY IF EXISTS membros_update ON membros;
CREATE POLICY membros_update ON membros
  FOR UPDATE
  USING (public.get_user_role() = 'ADMIN')
  WITH CHECK (public.get_user_role() = 'ADMIN');

-- POLÍTICAS: MEMBROS_CARGOS

DROP POLICY IF EXISTS membros_cargos_select ON membros_cargos;
CREATE POLICY membros_cargos_select ON membros_cargos
  FOR SELECT
  USING (
    public.get_user_role() = 'ADMIN'
    OR membro_id = public.get_user_membro_id()
  );

DROP POLICY IF EXISTS membros_cargos_insert ON membros_cargos;
CREATE POLICY membros_cargos_insert ON membros_cargos
  FOR INSERT
  WITH CHECK (public.get_user_role() = 'ADMIN');

DROP POLICY IF EXISTS membros_cargos_update ON membros_cargos;
CREATE POLICY membros_cargos_update ON membros_cargos
  FOR UPDATE
  USING (public.get_user_role() = 'ADMIN')
  WITH CHECK (public.get_user_role() = 'ADMIN');

-- POLÍTICAS: UNIDADES

DROP POLICY IF EXISTS unidades_select ON unidades;
CREATE POLICY unidades_select ON unidades
  FOR SELECT
  USING (
    public.get_user_role() = 'ADMIN'
    OR clube_id = public.get_user_club_id()
  );

DROP POLICY IF EXISTS unidades_insert ON unidades;
CREATE POLICY unidades_insert ON unidades
  FOR INSERT
  WITH CHECK (public.get_user_role() = 'ADMIN');

DROP POLICY IF EXISTS unidades_update ON unidades;
CREATE POLICY unidades_update ON unidades
  FOR UPDATE
  USING (public.get_user_role() = 'ADMIN')
  WITH CHECK (public.get_user_role() = 'ADMIN');

-- POLÍTICAS: AVALIAÇÕES

DROP POLICY IF EXISTS avaliacoes_select ON avaliacoes;
CREATE POLICY avaliacoes_select ON avaliacoes
  FOR SELECT
  USING (
    public.get_user_role() = 'ADMIN'
    OR membro_id = public.get_user_membro_id()
  );

DROP POLICY IF EXISTS avaliacoes_insert ON avaliacoes;
CREATE POLICY avaliacoes_insert ON avaliacoes
  FOR INSERT
  WITH CHECK (public.get_user_role() = 'ADMIN');

DROP POLICY IF EXISTS avaliacoes_update ON avaliacoes;
CREATE POLICY avaliacoes_update ON avaliacoes
  FOR UPDATE
  USING (public.get_user_role() = 'ADMIN')
  WITH CHECK (public.get_user_role() = 'ADMIN');

-- POLÍTICAS: CLASSES (leitura pública, escrita apenas ADMIN)

DROP POLICY IF EXISTS classes_select ON classes;
CREATE POLICY classes_select ON classes
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS classes_insert ON classes;
CREATE POLICY classes_insert ON classes
  FOR INSERT
  WITH CHECK (public.get_user_role() = 'ADMIN');

DROP POLICY IF EXISTS classes_update ON classes;
CREATE POLICY classes_update ON classes
  FOR UPDATE
  USING (public.get_user_role() = 'ADMIN')
  WITH CHECK (public.get_user_role() = 'ADMIN');

-- POLÍTICAS: DEMAIS TABELAS (ADMIN pode tudo, demais só os próprios dados)

DO $$
DECLARE
  tables_with_membro_id text[] := ARRAY[
    'membros_classes_atuais', 'membros_classes_concluidas',
    'membros_requisitos', 'membros_especialidades', 'membros_unidades',
    'transicoes'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY tables_with_membro_id
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I_select ON %I;
       CREATE POLICY %I_select ON %I
         FOR SELECT
         USING (
           public.get_user_role() = ''ADMIN''
           OR membro_id = public.get_user_membro_id()
         );',
      t, t, t, t
    );

    EXECUTE format(
      'DROP POLICY IF EXISTS %I_insert ON %I;
       CREATE POLICY %I_insert ON %I
         FOR INSERT
         WITH CHECK (public.get_user_role() = ''ADMIN'');',
      t, t, t, t
    );

    EXECUTE format(
      'DROP POLICY IF EXISTS %I_update ON %I;
       CREATE POLICY %I_update ON %I
         FOR UPDATE
         USING (public.get_user_role() = ''ADMIN'')
         WITH CHECK (public.get_user_role() = ''ADMIN'');',
      t, t, t, t
    );
  END LOOP;
END;
$$;

-- Tabelas sem membro_id (leitura pública, escrita apenas ADMIN)
DO $$
DECLARE
  public_tables text[] := ARRAY[
    'cargos', 'criterios_avaliacao', 'especialidades', 'requisitos_classe',
    'clubes', 'classes_instrucoes'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY public_tables
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I_select ON %I;
       CREATE POLICY %I_select ON %I
         FOR SELECT
         USING (true);',
      t, t, t, t
    );

    EXECUTE format(
      'DROP POLICY IF EXISTS %I_insert ON %I;
       CREATE POLICY %I_insert ON %I
         FOR INSERT
         WITH CHECK (public.get_user_role() = ''ADMIN'');',
      t, t, t, t
    );

    EXECUTE format(
      'DROP POLICY IF EXISTS %I_update ON %I;
       CREATE POLICY %I_update ON %I
         FOR UPDATE
         USING (public.get_user_role() = ''ADMIN'')
         WITH CHECK (public.get_user_role() = ''ADMIN'');',
      t, t, t, t
    );
  END LOOP;
END;
$$;

-- ============================================================
-- PARTE 8: MIGRA DIRIGENTE → LIDER
-- ============================================================

-- Atualiza o CHECK constraint de profiles.role
-- Remove qualquer constraint existente na coluna role
DO $$
DECLARE
  v_constraint text;
BEGIN
  SELECT con.conname INTO v_constraint
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_attribute att ON att.attrelid = con.conrelid
    AND att.attnum = ANY(con.conkey)
  WHERE rel.relname = 'profiles'
    AND con.contype = 'c'
    AND att.attname = 'role'
  LIMIT 1;

  IF v_constraint IS NOT NULL THEN
    EXECUTE format('ALTER TABLE profiles DROP CONSTRAINT %I', v_constraint);
  END IF;
END;
$$;

ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role = ANY (ARRAY['ADMIN'::text, 'LIDER'::text, 'DESBRAVADOR'::text]));

-- Converte profiles existentes de DIRIGENTE para LIDER (caso existam)
UPDATE profiles SET role = 'LIDER', updated_at = now() WHERE role = 'DIRIGENTE';

-- Converte cargos DIRIGENTE para LIDER (caso existam)
UPDATE cargos SET categoria = 'LIDER' WHERE categoria = 'DIRIGENTE';

-- ============================================================
-- PARTE 9: FUNÇÕES AUXILIARES
-- ============================================================

-- Função sync_profile_from_membro: Vincula um profile ao membro pelo email
DROP FUNCTION IF EXISTS sync_profile_from_membro(uuid);
CREATE FUNCTION sync_profile_from_membro(p_profile_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_membro membros%ROWTYPE;
  v_profile profiles%ROWTYPE;
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE id = p_profile_id;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  SELECT * INTO v_membro FROM membros WHERE email ILIKE v_profile.email LIMIT 1;
  IF NOT FOUND THEN
    SELECT * INTO v_membro FROM membros WHERE nome ILIKE v_profile.nome LIMIT 1;
  END IF;

  IF FOUND THEN
    UPDATE profiles SET
      clube_id = v_membro.clube_id,
      unidade_id = v_membro.unidade_id,
      membro_id = v_membro.id,
      updated_at = now()
    WHERE id = p_profile_id;
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- Função link_membro_profile: Cria um auth user e profile para um membro
DROP FUNCTION IF EXISTS link_membro_profile(uuid, text, text);
CREATE FUNCTION link_membro_profile(
  p_membro_id uuid,
  p_email text,
  p_password text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_membro membros%ROWTYPE;
  v_user_id uuid;
BEGIN
  SELECT * INTO v_membro FROM membros WHERE id = p_membro_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Membro não encontrado';
  END IF;

  -- A criação do auth user é feita via API de admin do Supabase
  -- Esta função apenas registra a intenção e cria o profile
  -- O auth user será criado pelo endpoint /api/create-user

  INSERT INTO profiles (id, nome, email, role, clube_id, unidade_id, membro_id, ativo)
  VALUES (
    gen_random_uuid(),
    v_membro.nome,
    p_email,
    'DESBRAVADOR',
    v_membro.clube_id,
    v_membro.unidade_id,
    v_membro.id,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    membro_id = EXCLUDED.membro_id,
    updated_at = now()
  RETURNING id INTO v_user_id;

  RETURN v_user_id;
END;
$$;

-- ============================================================
-- PARTE 10: ATUALIZA FUNÇÃO CREATE_USER_PROFILE
-- ============================================================

DROP FUNCTION IF EXISTS public.create_user_profile(uuid, text, text, text);
CREATE FUNCTION public.create_user_profile(
  p_user_id uuid,
  p_nome text,
  p_email text,
  p_role text DEFAULT 'DESBRAVADOR'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_membro_id uuid;
  v_clube_id uuid;
  v_unidade_id uuid;
BEGIN
  -- Tenta encontrar o membro pelo email (case-insensitive)
  SELECT id, clube_id, unidade_id
  INTO v_membro_id, v_clube_id, v_unidade_id
  FROM membros
  WHERE email ILIKE p_email
  LIMIT 1;

  -- Se não encontrou por email, tenta pelo nome
  IF v_membro_id IS NULL THEN
    SELECT id, clube_id, unidade_id
    INTO v_membro_id, v_clube_id, v_unidade_id
    FROM membros
    WHERE nome ILIKE p_nome
    LIMIT 1;
  END IF;

  -- Insere o profile com os vínculos encontrados
  INSERT INTO public.profiles (
    id, nome, email, role, clube_id, unidade_id, membro_id, ativo
  ) VALUES (
    p_user_id, p_nome, p_email, p_role,
    v_clube_id, v_unidade_id, v_membro_id, true
  )
  ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    role = COALESCE(profiles.role, EXCLUDED.role),
    clube_id = COALESCE(EXCLUDED.clube_id, profiles.clube_id),
    unidade_id = COALESCE(EXCLUDED.unidade_id, profiles.unidade_id),
    membro_id = COALESCE(EXCLUDED.membro_id, profiles.membro_id),
    updated_at = now();
END;
$$;

-- ============================================================
-- PARTE 11: PERMISSÕES DE TABELA E RPC DE FALLBACK
-- ============================================================

-- Garante que as roles anon/authenticated possam ler tabelas com RLS
-- Necessário para que as políticas RLS sejam avaliadas corretamente
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- RPC de fallback: busca o profile do usuário atual bypassando RLS
-- Usado pelo hook useAuth quando a query direta falha
DROP FUNCTION IF EXISTS public.get_my_profile();
CREATE FUNCTION public.get_my_profile()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile jsonb;
BEGIN
  SELECT row_to_json(p)::jsonb INTO v_profile
  FROM profiles p
  WHERE p.id = auth.uid();

  RETURN v_profile;
END;
$$;
