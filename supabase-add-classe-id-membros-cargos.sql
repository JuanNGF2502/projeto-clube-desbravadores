-- Adiciona coluna classe_id à tabela membros_cargos
-- Permite associar um cargo INSTRUTOR_CLASSE à classe que o instrutor leciona

ALTER TABLE membros_cargos
ADD COLUMN IF NOT EXISTS classe_id VARCHAR(10) REFERENCES classes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_membros_cargos_classe ON membros_cargos(classe_id);
