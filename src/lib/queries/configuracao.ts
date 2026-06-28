import { supabase } from '@/lib/supabase/client';

type PontuacaoResult = { value: boolean; exists: boolean };

export async function getPontuacaoOculta(clubeId: string): Promise<PontuacaoResult> {
  try {
    const { data, error } = await supabase
      .from('clubes')
      .select('*')
      .eq('id', clubeId)
      .maybeSingle();

    if (error) return { value: false, exists: false };
    if (!data) return { value: false, exists: false };

    const val = (data as Record<string, unknown>).pontuacao_oculta;
    return {
      value: val === true,
      exists: val !== undefined,
    };
  } catch {
    return { value: false, exists: false };
  }
}

export async function setPontuacaoOculta(
  clubeId: string,
  oculta: boolean
): Promise<PontuacaoResult> {
  try {
    const { error } = await supabase
      .from('clubes')
      .update({ pontuacao_oculta: oculta })
      .eq('id', clubeId);

    if (error) return { value: oculta, exists: false };
    return { value: oculta, exists: true };
  } catch {
    return { value: oculta, exists: false };
  }
}
