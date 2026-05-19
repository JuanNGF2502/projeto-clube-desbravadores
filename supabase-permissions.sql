-- ============================================
-- SCRIPT DE PERMISSÕES (Para Supabase Dashboard)
-- ============================================

-- CONCEDE ACESSO AO SCHEMA
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- CONCEDE PERMISSÕES EM TODAS AS TABELAS
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

SELECT 'Permissões concedidas!' AS status;