-- Script para permitir exclusão de unidades
-- Execute este SQL no Supabase SQL Editor

-- 1. Permitir nulos na coluna unidade_id de avaliacoes
ALTER TABLE avaliacoes ALTER COLUMN unidade_id DROP NOT NULL;

-- 2. Atualizar registros que têm unidade_id para null
UPDATE avaliacoes SET unidade_id = NULL WHERE unidade_id IS NOT NULL;

-- 3. Permitir nulos nas outras tabelas que causam conflito
ALTER TABLE membros ALTER COLUMN unidade_id DROP NOT NULL;
ALTER TABLE membros_cargos ALTER COLUMN unidade_id DROP NOT NULL;

-- 4. Agora pode excluir unidades normalmente