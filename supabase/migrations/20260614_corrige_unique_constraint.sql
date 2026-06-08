-- ============================================================
-- Corrige UNIQUE constraint: (classe_id, ordem) é incorreto
-- porque cada área tem numeração própria.
-- Substitui por (classe_id, area, ordem)
-- ============================================================

ALTER TABLE requisitos_classe DROP CONSTRAINT IF EXISTS requisitos_classe_classe_id_ordem_key;

ALTER TABLE requisitos_classe ADD CONSTRAINT requisitos_classe_classe_id_area_ordem_key UNIQUE (classe_id, area, ordem);

-- Remove requisitos duplicados genuínos (mesma classe, area, ordem)
DELETE FROM membros_requisitos
WHERE requisito_id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY classe_id, area, ordem ORDER BY created_at NULLS FIRST, ctid
    ) AS rn
    FROM requisitos_classe
    WHERE classe_id = '7'
  ) sub
  WHERE rn > 1
);

DELETE FROM requisitos_classe
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY classe_id, area, ordem ORDER BY created_at NULLS FIRST, ctid
    ) AS rn
    FROM requisitos_classe
    WHERE classe_id = '7'
  ) sub
  WHERE rn > 1
);

-- Reinsere área II completa (a migração 20260613 só conseguiu inserir 12 de 29
-- por causa da constraint incorreta)
DELETE FROM membros_requisitos
WHERE requisito_id IN (
  SELECT id FROM requisitos_classe
  WHERE classe_id = '7' AND area = 'II - DESCOBERTA ESPIRITUAL'
);

DELETE FROM requisitos_classe
WHERE classe_id = '7' AND area = 'II - DESCOBERTA ESPIRITUAL';

INSERT INTO requisitos_classe (classe_id, area, nome, descricao, ordem, ativo) VALUES
('7', 'II - DESCOBERTA ESPIRITUAL', 'Memorizar e demonstrar seu conhecimento: Criação, 10 Pragas, 12 Tribos, 39 livros do AT.', '11 - 12 - 13 - 14 - ≥15', 1, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Memorizar e demonstrar seu conhecimento: 10 Mandamentos, 27 livros do NT.', '11 - 12 - 13 - 14 - ≥15', 2, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Memorizar e demonstrar seu conhecimento: Levítico 11 (alimentos comestíveis e não comestíveis).', '12 - 13 - 14 - ≥15', 3, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Memorizar e demonstrar seu conhecimento: Bem-Aventuranças (Sermão da Montanha).', '13 - 14 - ≥15', 4, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Memorizar e demonstrar seu conhecimento: 12 apóstolos, Fruto do Espírito.', '14 - ≥15', 5, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Memorizar e demonstrar seu conhecimento: 3 mensagens angélicas (Ap 14:6-12), 7 igrejas, 12 fundamentos da Nova Jerusalém.', '≥15', 6, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Ler e explicar: João 3:16, Efésios 6:1-3, II Timóteo 3:16, Salmo 1.', '11 - 12 - 13 - 14 - ≥15', 7, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Ler e explicar: Isaías 41:9-10, Hebreus 13:5, Provérbios 22:6, I João 1:9, Salmo 8.', '11 - 12 - 13 - 14 - ≥15', 8, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Ler e explicar: Eclesiastes 12:13-14, Romanos 6:23, Apocalipse 1:3, Isaías 43:1-2, Salmo 51:10, Salmo 16.', '12 - 13 - 14 - ≥15', 9, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Ler e explicar: Isaías 26:3, Romanos 12:12, João 14:1-3, Salmo 37:5, Filipenses 3:12-14, Salmo 23, I Samuel 15:22.', '13 - 14 - ≥15', 10, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Ler e explicar: Romanos 8:28, Apocalipse 21:1-3, II Pedro 1:20-21, I João 2:14, II Crônicas 20:20, Salmo 46.', '14 - ≥15', 11, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Ler e explicar: I Coríntios 13, II Crônicas 7:14, Apocalipse 22:18-20, II Timóteo 4:6-7, Romanos 8:38-39, Mateus 6:33-34.', '≥15', 12, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Leitura Bíblica: Gênesis e Êxodo (capítulos selecionados).', '11 - 12 - 13 - 14 - ≥15', 13, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Leitura Bíblica: Levítico a 2 Samuel (capítulos selecionados).', '11 - 12 - 13 - 14 - ≥15', 14, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Leitura Bíblica: Reis a Salmos (capítulos selecionados).', '12 - 13 - 14 - ≥15', 15, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Leitura Bíblica: Eclesiastes a Mateus (capítulos selecionados).', '13 - 14 - ≥15', 16, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Leitura Bíblica: Mateus a Atos (capítulos selecionados).', '14 - ≥15', 17, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Leitura Bíblica: Atos a Apocalipse (capítulos selecionados).', '≥15', 18, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Conversar sobre o que é cristianismo, características de um verdadeiro discípulo e como ser um cristão verdadeiro.', '13 - 14 - ≥15', 19, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Estudar e entender a pessoa do Espírito Santo e Seu papel no crescimento espiritual.', '14 - ≥15', 20, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Descrever os dons espirituais mencionados por Paulo e seus propósitos para a igreja.', '≥15', 21, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Escolher um tema (parábola, milagre, sermão) e demonstrar conhecimento.', '11 - 12 - 13 - 14 - ≥15', 22, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Escolher uma história bíblica e demonstrar compreensão de como Jesus salva as pessoas.', '12 - 13 - 14 - ≥15', 23, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Participar de um estudo sobre a inspiração da Bíblia com um pastor.', '13 - 14 - ≥15', 24, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Estudar os eventos finais e a segunda vinda de Cristo.', '14 - ≥15', 25, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Estudar o santuário do AT e relacionar com o ministério de Jesus e a cruz.', '≥15', 26, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Convidar três ou mais pessoas para assistirem a uma classe bíblica ou pequeno grupo.', '13 - 14 - ≥15', 27, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Descobrir o verdadeiro significado da observância do sábado através do estudo da Bíblia.', '14 - ≥15', 28, true),
('7', 'II - DESCOBERTA ESPIRITUAL', 'Ler e resumir três histórias de pioneiros adventistas e contar no Clube, Culto JA ou Escola Sabatina.', '≥15', 29, true)
ON CONFLICT (classe_id, area, ordem) DO NOTHING;
