-- ============================================================
-- CORREÇÃO RLS: PERMITE LIDER ACESSAR MEMBROS DO CLUBE
-- ============================================================
-- As políticas atuais só permitem ADMIN ver todos os membros.
-- LIDER (conselheiro, diretor, etc) precisa:
--   - Ver membros do seu clube
--   - Gerenciar progresso de classes (membros_requisitos)
--   - Lançar avaliações (avaliacoes)
--   - Gerenciar instrução (classes_instrucoes)
-- ============================================================

-- ============================================================
-- POLÍTICA: MEMBROS
-- ============================================================

DROP POLICY IF EXISTS membros_select ON membros;
CREATE POLICY membros_select ON membros
  FOR SELECT
  USING (
    public.get_user_role() = 'ADMIN'
    OR (
      public.get_user_role() = 'LIDER'
      AND clube_id = public.get_user_club_id()
    )
    OR id = public.get_user_membro_id()
  );

-- LIDER pode editar dados básicos dos membros do seu clube
DROP POLICY IF EXISTS membros_update ON membros;
CREATE POLICY membros_update ON membros
  FOR UPDATE
  USING (
    public.get_user_role() = 'ADMIN'
    OR (
      public.get_user_role() = 'LIDER'
      AND clube_id = public.get_user_club_id()
    )
  )
  WITH CHECK (
    public.get_user_role() = 'ADMIN'
    OR (
      public.get_user_role() = 'LIDER'
      AND clube_id = public.get_user_club_id()
    )
  );

-- ============================================================
-- POLÍTICA: MEMBROS_CARGOS
-- ============================================================

DROP POLICY IF EXISTS membros_cargos_select ON membros_cargos;
CREATE POLICY membros_cargos_select ON membros_cargos
  FOR SELECT
  USING (
    public.get_user_role() = 'ADMIN'
    OR (
      public.get_user_role() = 'LIDER'
      AND EXISTS (
        SELECT 1 FROM membros m
        WHERE m.id = membro_id
          AND m.clube_id = public.get_user_club_id()
      )
    )
    OR membro_id = public.get_user_membro_id()
  );

DROP POLICY IF EXISTS membros_cargos_insert ON membros_cargos;
CREATE POLICY membros_cargos_insert ON membros_cargos
  FOR INSERT
  WITH CHECK (
    public.get_user_role() = 'ADMIN'
    OR (
      public.get_user_role() = 'LIDER'
      AND EXISTS (
        SELECT 1 FROM membros m
        WHERE m.id = membro_id
          AND m.clube_id = public.get_user_club_id()
      )
    )
  );

DROP POLICY IF EXISTS membros_cargos_update ON membros_cargos;
CREATE POLICY membros_cargos_update ON membros_cargos
  FOR UPDATE
  USING (
    public.get_user_role() = 'ADMIN'
    OR (
      public.get_user_role() = 'LIDER'
      AND EXISTS (
        SELECT 1 FROM membros m
        WHERE m.id = membro_id
          AND m.clube_id = public.get_user_club_id()
      )
    )
  )
  WITH CHECK (
    public.get_user_role() = 'ADMIN'
    OR (
      public.get_user_role() = 'LIDER'
      AND EXISTS (
        SELECT 1 FROM membros m
        WHERE m.id = membro_id
          AND m.clube_id = public.get_user_club_id()
      )
    )
  );

-- ============================================================
-- POLÍTICA: AVALIAÇÕES
-- ============================================================

DROP POLICY IF EXISTS avaliacoes_select ON avaliacoes;
CREATE POLICY avaliacoes_select ON avaliacoes
  FOR SELECT
  USING (
    public.get_user_role() = 'ADMIN'
    OR (
      public.get_user_role() = 'LIDER'
      AND EXISTS (
        SELECT 1 FROM membros m
        WHERE m.id = membro_id
          AND m.clube_id = public.get_user_club_id()
      )
    )
    OR membro_id = public.get_user_membro_id()
  );

DROP POLICY IF EXISTS avaliacoes_insert ON avaliacoes;
CREATE POLICY avaliacoes_insert ON avaliacoes
  FOR INSERT
  WITH CHECK (
    public.get_user_role() = 'ADMIN'
    OR (
      public.get_user_role() = 'LIDER'
      AND EXISTS (
        SELECT 1 FROM membros m
        WHERE m.id = membro_id
          AND m.clube_id = public.get_user_club_id()
      )
    )
  );

DROP POLICY IF EXISTS avaliacoes_update ON avaliacoes;
CREATE POLICY avaliacoes_update ON avaliacoes
  FOR UPDATE
  USING (
    public.get_user_role() = 'ADMIN'
    OR (
      public.get_user_role() = 'LIDER'
      AND EXISTS (
        SELECT 1 FROM membros m
        WHERE m.id = membro_id
          AND m.clube_id = public.get_user_club_id()
      )
    )
  )
  WITH CHECK (
    public.get_user_role() = 'ADMIN'
    OR (
      public.get_user_role() = 'LIDER'
      AND EXISTS (
        SELECT 1 FROM membros m
        WHERE m.id = membro_id
          AND m.clube_id = public.get_user_club_id()
      )
    )
  );

-- ============================================================
-- POLÍTICAS: TABELAS COM MEMBRO_ID (classes, progresso, etc)
-- Permite LIDER ver/gerenciar dados dos membros do seu clube
-- ============================================================

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
    -- SELECT: ADMIN ou LIDER (mesmo clube) ou próprio membro
    EXECUTE format(
      'DROP POLICY IF EXISTS %I_select ON %I;
       CREATE POLICY %I_select ON %I
         FOR SELECT
         USING (
           public.get_user_role() = ''ADMIN''
           OR (
             public.get_user_role() = ''LIDER''
             AND EXISTS (
               SELECT 1 FROM membros m
               WHERE m.id = membro_id
                 AND m.clube_id = public.get_user_club_id()
             )
           )
           OR membro_id = public.get_user_membro_id()
         );',
      t, t, t, t
    );

    -- INSERT: ADMIN ou LIDER (mesmo clube)
    EXECUTE format(
      'DROP POLICY IF EXISTS %I_insert ON %I;
       CREATE POLICY %I_insert ON %I
         FOR INSERT
         WITH CHECK (
           public.get_user_role() = ''ADMIN''
           OR (
             public.get_user_role() = ''LIDER''
             AND EXISTS (
               SELECT 1 FROM membros m
               WHERE m.id = membro_id
                 AND m.clube_id = public.get_user_club_id()
             )
           )
         );',
      t, t, t, t
    );

    -- UPDATE: ADMIN ou LIDER (mesmo clube)
    EXECUTE format(
      'DROP POLICY IF EXISTS %I_update ON %I;
       CREATE POLICY %I_update ON %I
         FOR UPDATE
         USING (
           public.get_user_role() = ''ADMIN''
           OR (
             public.get_user_role() = ''LIDER''
             AND EXISTS (
               SELECT 1 FROM membros m
               WHERE m.id = membro_id
                 AND m.clube_id = public.get_user_club_id()
             )
           )
         )
         WITH CHECK (
           public.get_user_role() = ''ADMIN''
           OR (
             public.get_user_role() = ''LIDER''
             AND EXISTS (
               SELECT 1 FROM membros m
               WHERE m.id = membro_id
                 AND m.clube_id = public.get_user_club_id()
             )
           )
         );',
      t, t, t, t
    );
  END LOOP;
END;
$$;

-- ============================================================
-- POLÍTICA: CLASSES_INSTRUCOES
-- LIDER pode gerenciar instruções das classes
-- ============================================================

DROP POLICY IF EXISTS classes_instrucoes_select ON classes_instrucoes;
CREATE POLICY classes_instrucoes_select ON classes_instrucoes
  FOR SELECT
  USING (
    public.get_user_role() = 'ADMIN'
    OR public.get_user_role() = 'LIDER'
  );

DROP POLICY IF EXISTS classes_instrucoes_insert ON classes_instrucoes;
CREATE POLICY classes_instrucoes_insert ON classes_instrucoes
  FOR INSERT
  WITH CHECK (
    public.get_user_role() = 'ADMIN'
    OR public.get_user_role() = 'LIDER'
  );

DROP POLICY IF EXISTS classes_instrucoes_update ON classes_instrucoes;
CREATE POLICY classes_instrucoes_update ON classes_instrucoes
  FOR UPDATE
  USING (public.get_user_role() = 'ADMIN' OR public.get_user_role() = 'LIDER')
  WITH CHECK (public.get_user_role() = 'ADMIN' OR public.get_user_role() = 'LIDER');

-- ============================================================
-- POLÍTICA: PROFILES (LIDER pode ver profiles do clube)
-- ============================================================

DROP POLICY IF EXISTS profiles_select ON profiles;
CREATE POLICY profiles_select ON profiles
  FOR SELECT
  USING (
    public.get_user_role() = 'ADMIN'
    OR (
      public.get_user_role() = 'LIDER'
      AND clube_id = public.get_user_club_id()
    )
    OR id = auth.uid()
  );
