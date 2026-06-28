import { supabase } from '@/lib/supabase/client';

const LS_KEY = 'pontuacao_oculta';

export async function getPontuacaoOculta(clubeId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('clubes')
      .select('*')
      .eq('id', clubeId)
      .maybeSingle();

    if (error) return false;
    if (!data) return false;

    return (data as Record<string, unknown>).pontuacao_oculta === true;
  } catch {
    return false;
  }
}

export async function setPontuacaoOculta(clubeId: string, oculta: boolean): Promise<boolean> {
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
