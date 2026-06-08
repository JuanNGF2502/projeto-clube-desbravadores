-- ============================================================
-- Remove requisitos duplicados da classe Agrupadas (id='7')
-- Adiciona UNIQUE (classe_id, ordem) para prevenir futuras duplicatas
-- ============================================================

-- Primeiro: identifica os IDs duplicados (que serão deletados)
-- e remove referências em membros_requisitos
WITH duplicatas AS (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY classe_id, ordem ORDER BY created_at NULLS FIRST, ctid
    ) AS rn
    FROM requisitos_classe
    WHERE classe_id = '7'
  ) sub
  WHERE rn > 1
),
deleted_progress AS (
  DELETE FROM membros_requisitos
  WHERE requisito_id IN (SELECT id FROM duplicatas)
)
DELETE FROM requisitos_classe
WHERE id IN (SELECT id FROM duplicatas);

-- Remove duplicatas que tenham mesmo nome dentro da mesma classe (fallback)
WITH duplicatas AS (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY classe_id, nome ORDER BY created_at NULLS FIRST, ctid
    ) AS rn
    FROM requisitos_classe
    WHERE classe_id = '7'
  ) sub
  WHERE rn > 1
),
deleted_progress AS (
  DELETE FROM membros_requisitos
  WHERE requisito_id IN (SELECT id FROM duplicatas)
)
DELETE FROM requisitos_classe
WHERE id IN (SELECT id FROM duplicatas);

-- Adiciona UNIQUE constraint para prevenir novas duplicatas
ALTER TABLE requisitos_classe DROP CONSTRAINT IF EXISTS requisitos_classe_classe_id_ordem_key;
ALTER TABLE requisitos_classe ADD CONSTRAINT requisitos_classe_classe_id_ordem_key UNIQUE (classe_id, ordem);
