-- Permissões para tabela classes_instrucoes

-- Habilitar RLS na tabela
ALTER TABLE classes_instrucoes ENABLE ROW LEVEL SECURITY;

-- Política de leitura para usuários autenticados
CREATE POLICY "Permitir leitura classes_instrucoes"
ON classes_instrucoes FOR SELECT
TO authenticated
USING (true);

-- Política de inserção para usuários autenticados
CREATE POLICY "Permitir inserção classes_instrucoes"
ON classes_instrucoes FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política de atualização para usuários autenticados
CREATE POLICY "Permitir atualização classes_instrucoes"
ON classes_instrucoes FOR UPDATE
TO authenticated
USING (true);

-- Também permitir para usuários anonimos (modo desenvolvimento)
CREATE POLICY "Permitir leitura classes_instrucoes anon"
ON classes_instrucoes FOR SELECT
TO anon
USING (true);

CREATE POLICY "Permitir inserção classes_instrucoes anon"
ON classes_instrucoes FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Permitir atualização classes_instrucoes anon"
ON classes_instrucoes FOR UPDATE
TO anon
USING (true);