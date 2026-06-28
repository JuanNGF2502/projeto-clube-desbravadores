import { supabase } from '@/lib/supabase/client';

export interface AtribuirDados {
  data_inicio: string;
  instrutor: string;
  descricao: string;
}

export interface MembroEspecialidade {
  id: string;
  membro_id: string;
  especialidade_id: string;
  data_inicio?: string;
  data_conclusao?: string;
  concluido: boolean;
  instrutor?: string;
  descricao?: string;
  especialidade?: {
    id: string;
    nome: string;
    categoria: string;
  };
  membro?: {
    id: string;
    nome: string;
    unidade_id?: string;
  };
}

export async function getEspecialidadesMembro(membroId: string): Promise<MembroEspecialidade[]> {
  const { data, error } = await supabase
    .from('membros_especialidades')
    .select('*, especialidade:especialidades(*)')
    .eq('membro_id', membroId)
    .order('data_inicio', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getMembrosPorEspecialidade(especialidadeId: string): Promise<MembroEspecialidade[]> {
  const { data, error } = await supabase
    .from('membros_especialidades')
    .select('*, membro:membros(id, nome, unidade_id)')
    .eq('especialidade_id', especialidadeId)
    .order('data_inicio', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function atribuirEspecialidade(
  membroId: string,
  especialidadeId: string,
  dados: AtribuirDados
): Promise<MembroEspecialidade> {
  const { data, error } = await supabase
    .from('membros_especialidades')
    .insert({
      membro_id: membroId,
      especialidade_id: especialidadeId,
      data_inicio: dados.data_inicio || new Date().toISOString().split('T')[0],
      instrutor: dados.instrutor || null,
      descricao: dados.descricao || null,
      concluido: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removerEspecialidade(membroId: string, especialidadeId: string): Promise<void> {
  const { error } = await supabase
    .from('membros_especialidades')
    .delete()
    .eq('membro_id', membroId)
    .eq('especialidade_id', especialidadeId);

  if (error) throw error;
}

export async function updateProgressoEspecialidade(
  membroId: string,
  especialidadeId: string,
  concluido: boolean
): Promise<void> {
  const { error } = await supabase
    .from('membros_especialidades')
    .update({
      concluido,
      data_conclusao: concluido ? new Date().toISOString() : null,
    })
    .eq('membro_id', membroId)
    .eq('especialidade_id', especialidadeId);

  if (error) throw error;
}

export async function getMembrosDisponiveis(clubeId: string) {
  const { data, error } = await supabase
    .from('membros')
    .select('id, nome, unidade_id')
    .eq('clube_id', clubeId)
    .eq('ativo', true)
    .order('nome');

  if (error) throw error;
  return data || [];
}

export async function getEstatisticasEspecialidades(clubeId: string) {
  const { data: membros } = await supabase
    .from('membros')
    .select('id')
    .eq('clube_id', clubeId)
    .eq('ativo', true);

  if (!membros || membros.length === 0) {
    return { totalAtribuidas: 0, totalConcluidas: 0, membrosComEspecialidade: 0 };
  }

  const membroIds = membros.map(m => m.id);

  const { data: especialidadesMembro } = await supabase
    .from('membros_especialidades')
    .select('concluido, membro_id')
    .in('membro_id', membroIds);

  const data = especialidadesMembro || [];
  const membrosComEsp = new Set(data.map(e => e.membro_id));

  return {
    totalAtribuidas: data.length,
    totalConcluidas: data.filter(e => e.concluido).length,
    membrosComEspecialidade: membrosComEsp.size,
  };
}

export interface MembroEspecialidadesResumo {
  membro: { id: string; nome: string; unidade?: { id: string; nome: string } };
  especialidades: { id: string; nome: string; categoria: string; concluido: boolean; instrutor?: string; data_inicio?: string; data_conclusao?: string }[];
}

export async function getEspecialidadesPorMembros(clubeId: string): Promise<MembroEspecialidadesResumo[]> {
  const { data: membros, error: errMembros } = await supabase
    .from('membros')
    .select('id, nome, unidade:unidades(id, nome)')
    .eq('clube_id', clubeId)
    .eq('ativo', true)
    .order('nome');

  if (errMembros) throw errMembros;
  if (!membros) return [];

  const membroIds = membros.map(m => m.id);

  const { data: atribuicoes, error: errAttr } = await supabase
    .from('membros_especialidades')
    .select('*, especialidade:especialidades(*)')
    .in('membro_id', membroIds)
    .order('especialidade_id');

  if (errAttr) throw errAttr;

  const map = new Map<string, MembroEspecialidadesResumo>();
  for (const m of membros) {
    const unidade = Array.isArray(m.unidade) ? m.unidade[0] : m.unidade;
    map.set(m.id, { membro: { id: m.id, nome: m.nome, unidade }, especialidades: [] });
  }

  for (const a of atribuicoes || []) {
    const entry = map.get(a.membro_id);
    if (entry && a.especialidade) {
      entry.especialidades.push({
        id: a.especialidade.id,
        nome: a.especialidade.nome,
        categoria: a.especialidade.categoria,
        concluido: a.concluido,
        instrutor: a.instrutor,
        data_inicio: a.data_inicio,
        data_conclusao: a.data_conclusao,
      });
    }
  }

  return Array.from(map.values());
}
