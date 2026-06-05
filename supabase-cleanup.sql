-- ============================================
-- CLEANUP: Remove todos os dados exceto admin
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================

-- 1. Limpar dados relacionados a membros (ordem importa devido a FKs)
DELETE FROM membros_requisitos;
DELETE FROM membros_classes_concluidas;
DELETE FROM membros_classes_atuais;
DELETE FROM membros_unidades;
DELETE FROM membros_cargos;
DELETE FROM membros_especialidades;
DELETE FROM transicoes;
DELETE FROM avaliacoes;
DELETE FROM classes_instrucoes;

-- 2. Deletar profiles que não são ADMIN
DELETE FROM profiles WHERE role != 'ADMIN';

-- 3. Deletar todos os membros
DELETE FROM membros;
