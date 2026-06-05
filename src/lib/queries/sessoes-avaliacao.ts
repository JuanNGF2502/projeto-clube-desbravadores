import { supabase } from '@/lib/supabase/client';

export interface SessaoAvaliacao {
  id: string;
  unidade_id: string;
  data_reuniao: string;
  ativo: boolean;
  criado_por?: string;
  criado_em: string;
  atualizado_em: string;
}

export async function getSessoesPorUnidade(unidadeId: string): Promise<SessaoAvaliacao[]> {
  const { data, error } = await supabase
    .from('sessoes_avaliacao')
    .select('*')
    .eq('unidade_id', unidadeId)
    .order('data_reuniao', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getSessaoAtiva(unidadeId: string): Promise<SessaoAvaliacao | null> {
  const { data, error } = await supabase
    .from('sessoes_avaliacao')
    .select('*')
    .eq('unidade_id', unidadeId)
    .eq('ativo', true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function criarSessao(unidadeId: string, dataReuniao: string): Promise<SessaoAvaliacao> {
  const { data, error } = await supabase
    .from('sessoes_avaliacao')
    .insert({
      unidade_id: unidadeId,
      data_reuniao: dataReuniao,
      ativo: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function ativarSessao(sessaoId: string, ativo: boolean): Promise<void> {
  const { error } = await supabase
    .from('sessoes_avaliacao')
    .update({ ativo })
    .eq('id', sessaoId);

  if (error) throw error;
}

export async function deleteSessao(sessaoId: string): Promise<void> {
  const { error } = await supabase
    .from('sessoes_avaliacao')
    .delete()
    .eq('id', sessaoId);

  if (error) throw error;
}

export async function getAvaliacoesPorSessao(sessaoId: string, unidadeId: string) {
  const { data, error } = await supabase
    .from('avaliacoes')
    .select(`
      *,
      membro:membros(id, nome, foto),
      criterio:criterios_avaliacao(nome)
    `)
    .eq('sessao_id', sessaoId)
    .eq('unidade_id', unidadeId);

  if (error) throw error;
  return data || [];
}
