-- Tabela de critérios de avaliação semanal
CREATE TABLE IF NOT EXISTS public.criterios_avaliacao (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nome character varying NOT NULL,
  descricao text,
  ordem integer NOT NULL DEFAULT 1,
  pontos_a integer NOT NULL DEFAULT 20,
  descricao_a text,
  pontos_b integer NOT NULL DEFAULT 10,
  descricao_b text,
  pontos_c integer NOT NULL DEFAULT 0,
  descricao_c text,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT criterios_avaliacao_pkey PRIMARY KEY (id)
);

-- Seed com os critérios padrão do projeto
INSERT INTO public.criterios_avaliacao (nome, descricao, ordem, pontos_a, descricao_a, pontos_b, descricao_b, pontos_c, descricao_c, ativo) VALUES
('Pontualidade', 'Presença e pontualidade nos encontros', 1, 20, 'Presente a tempo', 10, 'Atrasado (até 15min)', 0, 'Ausente', true),
('Uniforme', 'Uso correto do uniforme', 2, 20, 'Em ordem', 10, 'Incompleto', 0, 'Sem uniforme', true),
('Material', 'Material necessário para a atividade', 3, 20, 'Completo', 10, 'Incompleto', 0, 'Sem material', true),
('Disciplina', 'Comportamento e ordem', 4, 20, 'Excelente', 10, 'Regular', 0, 'Indisciplinado', true),
('Leitura Bíblica', 'Progresso na leitura bíblica', 5, 30, 'Em dia', 10, 'Atrasado (até 1 semana)', 0, 'Atrasado', true),
('Classe', 'Progresso nas classes', 6, 20, 'Em dia', 10, 'Atrasado (até 3 atividades)', 0, 'Atrasado', true),
('Boa Ação', 'Ajudar alguém que precisa', 7, 20, 'Ajuda alguém que esteja precisando', 0, '—', 0, '—', true),
('Agrupadas', 'Atividades em grupo e trabalho em equipe', 8, 20, 'Participa e contribui', 10, 'Participa parcialmente', 0, 'Não participa', true)
ON CONFLICT DO NOTHING;