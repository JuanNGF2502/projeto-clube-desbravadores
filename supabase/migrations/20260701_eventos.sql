-- Eventos do clube
CREATE TABLE IF NOT EXISTS eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clube_id UUID NOT NULL REFERENCES clubes(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_evento DATE NOT NULL,
  data_fim DATE,
  local TEXT,
  relatorio TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fotos dos eventos
CREATE TABLE IF NOT EXISTS eventos_fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_eventos_clube_data ON eventos(clube_id, data_evento DESC);
CREATE INDEX IF NOT EXISTS idx_eventos_fotos_evento ON eventos_fotos(evento_id);

-- RLS
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_fotos ENABLE ROW LEVEL SECURITY;

-- Policies eventos
CREATE POLICY "eventos_select" ON eventos FOR SELECT USING (true);
CREATE POLICY "eventos_insert" ON eventos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "eventos_update" ON eventos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "eventos_delete" ON eventos FOR DELETE USING (auth.role() = 'authenticated');

-- Policies eventos_fotos
CREATE POLICY "eventos_fotos_select" ON eventos_fotos FOR SELECT USING (true);
CREATE POLICY "eventos_fotos_insert" ON eventos_fotos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "eventos_fotos_delete" ON eventos_fotos FOR DELETE USING (auth.role() = 'authenticated');
