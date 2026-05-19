-- Tabela para controle de instrução de classes

CREATE TABLE IF NOT EXISTS classes_instrucoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classe_id VARCHAR(50) NOT NULL,
  requisito_id VARCHAR(50) NOT NULL,
  instrutor_id VARCHAR(50),
  data_inicio DATE DEFAULT CURRENT_DATE,
  ensinou BOOLEAN DEFAULT false,
  data_ensino DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_classes_instrucoes_classe ON classes_instrucoes(classe_id);
CREATE INDEX IF NOT EXISTS idx_classes_instrucoes_requisito ON classes_instrucoes(requisito_id);

-- Adicionar foreign keys separadamente (após tabela criada)
ALTER TABLE classes_instrucoes
  ADD CONSTRAINT fk_classes_instrucoes_classe
  FOREIGN KEY (classe_id) REFERENCES classes(id) ON DELETE CASCADE;

ALTER TABLE classes_instrucoes
  ADD CONSTRAINT fk_classes_instrucoes_requisito
  FOREIGN KEY (requisito_id) REFERENCES requisitos_classe(id) ON DELETE CASCADE;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_classes_instrucoes_updated_at ON classes_instrucoes;
CREATE TRIGGER update_classes_instrucoes_updated_at
  BEFORE UPDATE ON classes_instrucoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE classes_instrucoes IS 'Controla quais requisitos de cada classe já foram ensinados pelo instrutor';