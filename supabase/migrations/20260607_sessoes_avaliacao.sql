-- ============================================================
-- SESSÕES DE AVALIAÇÃO
-- ============================================================
-- ADMIN cria uma sessão de avaliação para uma unidade em uma
-- data de reunião específica. Quando ativa, LIDERes podem
-- preencher as avaliações dos membros da unidade.
-- ============================================================

CREATE TABLE IF NOT EXISTS sessoes_avaliacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unidade_id UUID NOT NULL REFERENCES unidades(id) ON DELETE CASCADE,
  data_reuniao DATE NOT NULL,
  ativo BOOLEAN DEFAULT false,
  criado_por UUID REFERENCES profiles(id),
  criado_em TIMESTAMPTZ DEFAULT now(),
  atualizado_em TIMESTAMPTZ DEFAULT now()
);

-- Adiciona sessao_id na tabela de avaliações
ALTER TABLE avaliacoes ADD COLUMN IF NOT EXISTS sessao_id UUID REFERENCES sessoes_avaliacao(id) ON DELETE SET NULL;

-- Índices
CREATE INDEX IF NOT EXISTS idx_sessoes_avaliacao_unidade ON sessoes_avaliacao(unidade_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_avaliacao_ativo ON sessoes_avaliacao(ativo);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_sessao ON avaliacoes(sessao_id);

-- Trigger de updated_at
DROP TRIGGER IF EXISTS set_updated_at ON sessoes_avaliacao;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON sessoes_avaliacao
  FOR EACH ROW EXECUTE FUNCTION trigger_updated_at();

-- RLS
ALTER TABLE sessoes_avaliacao ENABLE ROW LEVEL SECURITY;

-- Todos podem ver sessões
DROP POLICY IF EXISTS sessoes_avaliacao_select ON sessoes_avaliacao;
CREATE POLICY sessoes_avaliacao_select ON sessoes_avaliacao
  FOR SELECT USING (true);

-- Apenas ADMIN cria
DROP POLICY IF EXISTS sessoes_avaliacao_insert ON sessoes_avaliacao;
CREATE POLICY sessoes_avaliacao_insert ON sessoes_avaliacao
  FOR INSERT WITH CHECK (public.get_user_role() = 'ADMIN');

-- Apenas ADMIN ativa/desativa
DROP POLICY IF EXISTS sessoes_avaliacao_update ON sessoes_avaliacao;
CREATE POLICY sessoes_avaliacao_update ON sessoes_avaliacao
  FOR UPDATE USING (public.get_user_role() = 'ADMIN')
  WITH CHECK (public.get_user_role() = 'ADMIN');
