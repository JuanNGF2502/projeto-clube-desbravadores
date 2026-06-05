import { supabase } from '@/lib/supabase/client';
import { Unit } from '@/types';

// ============================================
// UNIDADES
// ============================================

export async function getUnidadesByClube(clubeId: string): Promise<Unit[]> {
  const { data, error } = await supabase
    .from('unidades')
    .select('*')
    .eq('clube_id', clubeId)
    .eq('ativo', true)
    .order('nome');

  if (error) throw error;

  // Buscar contagem de membros para cada unidade
  if (data && data.length > 0) {
    const unidadesComContagem = await Promise.all(
      data.map(async (unidade) => {
        const { count } = await supabase
          .from('membros')
          .select('*', { count: 'exact', head: true })
          .eq('unidade_id', unidade.id)
          .eq('ativo', true);

        return {
          ...unidade,
          membrosCount: count || 0,
        };
      })
    );
    return unidadesComContagem as Unit[];
  }

  return [];
}

export async function getTodasUnidades(clubeId: string): Promise<Unit[]> {
  const { data, error } = await supabase
    .from('unidades')
    .select('*')
    .eq('clube_id', clubeId)
    .order('nome');

  if (error) throw error;

  if (data && data.length > 0) {
    const unidadesComContagem = await Promise.all(
      data.map(async (unidade) => {
        const { count } = await supabase
          .from('membros')
          .select('*', { count: 'exact', head: true })
          .eq('unidade_id', unidade.id)
          .eq('ativo', true);

        return {
          ...unidade,
          membrosCount: count || 0,
        };
      })
    );
    return unidadesComContagem as Unit[];
  }

  return [];
}

export async function getUnidadeById(id: string): Promise<Unit | null> {
  const { data, error } = await supabase
    .from('unidades')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  // Buscar contagem de membros
  const { count } = await supabase
    .from('membros')
    .select('*', { count: 'exact', head: true })
    .eq('unidade_id', id)
    .eq('ativo', true);

  return {
    ...data,
    membrosCount: count || 0,
  } as Unit;
}

export interface CreateUnidadeInput {
  nome: string;
  genero: 'M' | 'F';
  cores: string[];
  clube_id: string;
  grito_de_guerra?: string;
  significado_logo?: string;
  historia_nome?: string;
}

export async function createUnidade(unidade: CreateUnidadeInput): Promise<Unit> {
  const { data, error } = await supabase
    .from('unidades')
    .insert({
      nome: unidade.nome,
      genero: unidade.genero,
      cores: unidade.cores,
      clube_id: unidade.clube_id,
      ativo: true,
      grito_de_guerra: unidade.grito_de_guerra || null,
      significado_logo: unidade.significado_logo || null,
      historia_nome: unidade.historia_nome || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Unit;
}

export async function updateUnidade(id: string, updates: Partial<CreateUnidadeInput>): Promise<Unit> {
  const { data, error } = await supabase
    .from('unidades')
    .update({
      nome: updates.nome,
      genero: updates.genero,
      cores: updates.cores,
      grito_de_guerra: updates.grito_de_guerra || null,
      significado_logo: updates.significado_logo || null,
      historia_nome: updates.historia_nome || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Unit;
}

export async function deleteUnidade(id: string): Promise<void> {
  const { error } = await supabase
    .from('unidades')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function toggleUnidadeAtivo(id: string): Promise<Unit> {
  // Primeiro buscar o estado atual
  const { data: current, error: fetchError } = await supabase
    .from('unidades')
    .select('ativo')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  const { data, error } = await supabase
    .from('unidades')
    .update({ ativo: !current.ativo })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Unit;
}

// ============================================
// MEMBROS DA UNIDADE
// ============================================

export interface MembroComDados {
  id: string;
  nome: string;
  sexo: string;
  data_nascimento: string;
  telefone?: string;
  email?: string;
  foto?: string;
  ativo: boolean;
  unidade_id?: string;
  membros_cargos?: {
    cargo_tipo: string;
    cargo?: {
      nome: string;
      cor: string;
    };
    ativo: boolean;
  }[];
  membros_classes_atuais?: {
    classe_id: string;
    classe?: {
      nome: string;
      cor: string;
    };
  }[];
}

export async function getMembrosPorUnidade(unidadeId: string): Promise<MembroComDados[]> {
  // Buscar membros da unidade
  const { data: membros, error } = await supabase
    .from('membros')
    .select('*')
    .eq('unidade_id', unidadeId)
    .order('nome');

  if (error) throw error;
  if (!membros || membros.length === 0) return [];

  const membroIds = membros.map(m => m.id);

  // Buscar cargos
  const { data: membrosCargos } = await supabase
    .from('membros_cargos')
    .select('*, cargo:cargos(*)')
    .in('membro_id', membroIds);

  // Buscar classes atuais
  const { data: membrosClassesAtuais } = await supabase
    .from('membros_classes_atuais')
    .select('*, classe:classes(*)')
    .in('membro_id', membroIds);

  return membros.map(membro => ({
    ...membro,
    membros_cargos: membrosCargos?.filter(c => c.membro_id === membro.id) || [],
    membros_classes_atuais: membrosClassesAtuais?.filter(c => c.membro_id === membro.id) || [],
  }));
}