-- ============================================================
-- GRANT permissão para sessoes_avaliacao
-- ============================================================
-- A migration 20260607 criou a tabela DEPOIS do GRANT ON ALL TABLES,
-- então precisamos conceder explicitamente para authenticated.
-- ============================================================

GRANT SELECT ON public.sessoes_avaliacao TO anon, authenticated;
GRANT INSERT, UPDATE ON public.sessoes_avaliacao TO authenticated;
