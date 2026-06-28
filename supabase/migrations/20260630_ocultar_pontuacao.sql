-- ============================================================
-- ADICIONA CONTROLE DE OCULTAÇÃO DE PONTUAÇÃO
-- ============================================================
-- Permite que o admin oculte a pontuação de todos os usuários

ALTER TABLE clubes ADD COLUMN IF NOT EXISTS pontuacao_oculta BOOLEAN NOT NULL DEFAULT false;

-- Política RLS: qualquer usuário autenticado pode ler esta coluna
-- Apenas ADMIN pode alterar
DROP POLICY IF EXISTS clubes_select ON clubes;
CREATE POLICY clubes_select ON clubes
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS clubes_update ON clubes;
CREATE POLICY clubes_update ON clubes
  FOR UPDATE
  USING (public.get_user_role() = 'ADMIN')
  WITH CHECK (public.get_user_role() = 'ADMIN');
