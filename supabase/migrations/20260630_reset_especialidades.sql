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