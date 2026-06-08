-- Corrige sync_profile_from_membro para aceitar p_membro_id (em vez de p_profile_id)
-- e adiciona FK de avaliacoes.criterio_id para criterios_avaliacao.id

-- ==========================================
-- 1. Corrige função sync_profile_from_membro
-- ==========================================
DROP FUNCTION IF EXISTS sync_profile_from_membro(uuid);

CREATE FUNCTION sync_profile_from_membro(p_membro_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_membro membros%ROWTYPE;
BEGIN
  SELECT * INTO v_membro FROM membros WHERE id = p_membro_id;
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Atualiza profiles vinculados a este membro (por membro_id ou email)
  UPDATE profiles SET
    nome = v_membro.nome,
    clube_id = v_membro.clube_id,
    unidade_id = v_membro.unidade_id,
    updated_at = now()
  WHERE membro_id = p_membro_id
     OR (email IS NOT NULL AND email ILIKE v_membro.email);

  RETURN true;
END;
$$;

-- ==========================================
-- 2. Adiciona FK de avaliacoes para criterios_avaliacao
-- ==========================================
ALTER TABLE avaliacoes
  DROP COLUMN IF EXISTS criterio_uuid;

-- Remove registros com criterio_id inválido (não UUID)
DELETE FROM avaliacoes
  WHERE criterio_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

ALTER TABLE avaliacoes
  ALTER COLUMN criterio_id TYPE uuid
  USING criterio_id::uuid;

ALTER TABLE avaliacoes
  ADD CONSTRAINT fk_avaliacoes_criterio
  FOREIGN KEY (criterio_id)
  REFERENCES criterios_avaliacao(id)
  ON DELETE RESTRICT;
