import { supabase } from '@/lib/supabase/client';

const STORAGE_KEY = (clubeId: string) => `pontuacao_oculta_${clubeId}`;

export async function getPontuacaoOculta(clubeId: string): Promise<boolean> {
  const local = localStorage.getItem(STORAGE_KEY(clubeId));
  if (local !== null) return local === 'true';

  try {
    const { data, error } = await supabase
      .from('clubes')
      .select('*')
      .eq('id', clubeId)
      .maybeSingle();

    if (error) return false;
    if (!data) return false;

    const valor = (data as Record<string, unknown>).pontuacao_oculta === true;
    localStorage.setItem(STORAGE_KEY(clubeId), String(valor));
    return valor;
  } catch {
    return false;
  }
}

export async function setPontuacaoOculta(clubeId: string, oculta: boolean): Promise<boolean> {
  localStorage.setItem(STORAGE_KEY(clubeId), String(oculta));

  try {
    const { error } = await supabase
      .from('clubes')
      .update({ pontuacao_oculta: oculta })
      .eq('id', clubeId);

    return !error;
  } catch {
    return true;
  }
}
