-- Verificar estrutura das tabelas
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'membros';

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'unidades';

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'clubes';