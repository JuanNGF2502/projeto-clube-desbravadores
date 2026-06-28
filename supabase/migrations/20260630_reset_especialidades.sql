-- ============================================================
-- RESET ESPECIALIDADES — Novas categorias
-- ============================================================
-- Remove todas as especialidades existentes e redefine as
-- categorias para a nova lista de 11 categorias.

-- 1. Remove todas as atribuições de membros
DELETE FROM membros_especialidades;

-- 2. Remove todas as especialidades
DELETE FROM especialidades;

-- 3. Remove a constraint existente (se houver CHECK constraint)
ALTER TABLE especialidades DROP CONSTRAINT IF EXISTS especialidades_categoria_check;

-- 4. Remove coluna nivel (não será mais usada)
ALTER TABLE especialidades DROP COLUMN IF EXISTS nivel;

-- 5. Adiciona colunas instrutor e descricao em membros_especialidades
ALTER TABLE membros_especialidades ADD COLUMN IF NOT EXISTS instrutor TEXT;
ALTER TABLE membros_especialidades ADD COLUMN IF NOT EXISTS descricao TEXT;