-- ============================================================
-- Corrige RLS e trigger para sessoes_avaliacao
-- ============================================================

-- Corrige o trigger: a coluna é "atualizado_em", não "updated_at"
-- (trigger_updated_at() seta NEW.updated_at, que não existe nesta tabela)
DROP TRIGGER IF EXISTS set_updated_at ON sessoes_avaliacao;
DROP TRIGGER IF EXISTS set_atualizado_em ON sessoes_avaliacao;

CREATE OR REPLACE FUNCTION public.trigger_atualizado_em()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_atualizado_em BEFORE UPDATE ON sessoes_avaliacao
  FOR EACH ROW EXECUTE FUNCTION trigger_atualizado_em();

-- Recria políticas para incluir LIDER e ADMIN
DROP POLICY IF EXISTS sessoes_avaliacao_insert ON sessoes_avaliacao;
CREATE POLICY sessoes_avaliacao_insert ON sessoes_avaliacao
  FOR INSERT WITH CHECK (
    public.get_user_role() IN ('ADMIN', 'LIDER')
  );

DROP POLICY IF EXISTS sessoes_avaliacao_update ON sessoes_avaliacao;
CREATE POLICY sessoes_avaliacao_update ON sessoes_avaliacao
  FOR UPDATE USING (
    public.get_user_role() IN ('ADMIN', 'LIDER')
  )
  WITH CHECK (
    public.get_user_role() IN ('ADMIN', 'LIDER')
  );

DROP POLICY IF EXISTS sessoes_avaliacao_delete ON sessoes_avaliacao;
CREATE POLICY sessoes_avaliacao_delete ON sessoes_avaliacao
  FOR DELETE USING (
    public.get_user_role() IN ('ADMIN', 'LIDER')
  );

-- GRANT completo para authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sessoes_avaliacao TO authenticated;
