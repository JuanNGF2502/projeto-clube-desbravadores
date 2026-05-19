import { supabase } from '@/lib/supabase';
import { Usuario, Unit, CargoTipo } from '@/types';

// ============================================
// CLUBES
// ============================================

export async function getClubes() {
  const { data, error } = await supabase
    .from('clubes')
    .select('*')
    .order('nome');

  if (error) throw error;
  return data;
}

export async function getClubeById(id: string) {
  const { data, error } = await supabase
    .from('clubes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// UNIDADES
// ============================================

export async function getUnidades(clubeId?: string) {
  let query = supabase
    .from('unidades')
    .select('*')
    .order('nome');

  if (clubeId) {
    query = query.eq('clube_id', clubeId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Unit[];
}

export async function getUnidadeById(id: string) {
  const { data, error } = await supabase
    .from('unidades')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Unit;
}

// ============================================
// MEMBROS
// ============================================

export interface MembroFilters {
  search?: string;
  unidadeId?: string;
  classeId?: string;
  cargo?: CargoTipo;
  ativo?: boolean;
}

export async function getMembros(clubeId: string, filters?: MembroFilters) {
  // Primeiro busca membros básicos
  let query = supabase
    .from('membros')
    .select(`
      *,
      unidade:unidades(id, nome, cores, genero)
    `)
    .eq('clube_id', clubeId)
    .order('nome');

  if (filters?.ativo !== undefined) {
    query = query.eq('ativo', filters.ativo);
  }

  if (filters?.unidadeId) {
    query = query.eq('unidade_id', filters.unidadeId);
  }

  if (filters?.search) {
    query = query.ilike('nome', `%${filters.search}%`);
  }

  const { data: membros, error } = await query;

  if (error) throw error;

  if (!membros || membros.length === 0) return [];

  // Agora busca as relações separadamente
  const membroIds = membros.map(m => m.id);

  // Busca cargos dos membros
  const { data: membrosCargos } = await supabase
    .from('membros_cargos')
    .select('*, cargo:cargos(*)')
    .in('membro_id', membroIds);

  // Busca classes atuais dos membros
  const { data: membrosClassesAtuais } = await supabase
    .from('membros_classes_atuais')
    .select('*, classe:classes(*)')
    .in('membro_id', membroIds);

  // Relaciona os dados
  return membros.map(membro => ({
    ...membro,
    membros_cargos: membrosCargos?.filter(c => c.membro_id === membro.id) || [],
    membros_classes_atuais: membrosClassesAtuais?.filter(c => c.membro_id === membro.id) || [],
  }));
}

export async function getMembroById(id: string) {
  const { data, error } = await supabase
    .from('membros')
    .select(`
      *,
      unidade:unidades(nome, cores, genero),
      membros_cargos(*, cargo:cargos(*)),
      membros_classes_atuais(*, classe:classes(*)),
      membros_classes_concluidas(*, classe:classes(*)),
      membros_especialidades(*, especialidade:especialidades(*))
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createMembro(membro: {
  nome: string;
  nome_social?: string | null;
  sexo: string;
  data_nascimento: string;
  telefone?: string | null;
  email?: string | null;
  foto?: string | null;
  ativo?: boolean;
  unidade_id?: string | null;
  clube_id: string;
  endereco?: any;
  responsavel?: any;
  observacoes?: string;
  data_desligamento?: string | null;
  motivo_desligamento?: string | null;
}) {
  const { data, error } = await supabase
    .from('membros')
    .insert(membro)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMembro(id: string, membro: Partial<Usuario>) {
  const { data, error } = await supabase
    .from('membros')
    .update(membro)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMembro(id: string) {
  const { error } = await supabase
    .from('membros')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// RELAÇÕES - CARGOS
// ============================================

export async function createMembroCargo(membroId: string, cargoTipo: string, unidadeId?: string | null) {
  const { data, error } = await supabase
    .from('membros_cargos')
    .insert({
      membro_id: membroId,
      cargo_tipo: cargoTipo,
      unidade_id: unidadeId,
      data_atribuicao: new Date().toISOString().split('T')[0],
      ativo: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Erro createMembroCargo:', error);
    throw error;
  }
  return data;
}

// ============================================
// RELAÇÕES - CLASSES ATUAIS
// ============================================

export async function createMembroClasseAtual(membroId: string, classeId: string) {
  const { data, error } = await supabase
    .from('membros_classes_atuais')
    .insert({
      membro_id: membroId,
      classe_id: classeId,
      data_inicio: new Date().toISOString().split('T')[0],
    })
    .select()
    .single();

  if (error) {
    console.error('Erro createMembroClasseAtual:', error);
    throw error;
  }
  return data;
}

// ============================================
// RELAÇÕES - UNIDADES (HISTÓRICO)
// ============================================

export async function createMembroUnidade(membroId: string, unidadeId: string) {
  const { data, error } = await supabase
    .from('membros_unidades')
    .insert({
      membro_id: membroId,
      unidade_id: unidadeId,
      data_entrada: new Date().toISOString().split('T')[0],
      ativo: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Erro createMembroUnidade:', error);
    throw error;
  }
  return data;
}

// Delete related records
export async function deleteMembroCargos(membroId: string) {
  const { error } = await supabase
    .from('membros_cargos')
    .delete()
    .eq('membro_id', membroId);
  if (error) console.error('Erro deleteMembroCargos:', error);
}

export async function deleteMembroClassesAtuais(membroId: string) {
  const { error } = await supabase
    .from('membros_classes_atuais')
    .delete()
    .eq('membro_id', membroId);
  if (error) console.error('Erro deleteMembroClassesAtuais:', error);
}

// ============================================
// CLASSES
// ============================================

export async function getClasses() {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('ativo', true)
    .order('ordem');

  if (error) throw error;
  return data;
}

export async function getClasseById(id: string) {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// REQUISITOS DAS CLASSES
// ============================================

export async function getRequisitosByClasse(classeId: string) {
  const { data, error } = await supabase
    .from('requisitos_classe')
    .select('*')
    .eq('classe_id', classeId)
    .eq('ativo', true)
    .order('ordem');

  if (error) throw error;
  return data;
}

export async function getProgressoRequisito(membroId: string, requisitoId: string) {
  const { data, error } = await supabase
    .from('membros_requisitos')
    .select('*')
    .eq('membro_id', membroId)
    .eq('requisito_id', requisitoId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data;
}

export async function updateRequisito(membroId: string, requisitoId: string, completado: boolean) {
  const { data, error } = await supabase
    .from('membros_requisitos')
    .upsert({
      membro_id: membroId,
      requisito_id: requisitoId,
      completado,
      data_conclusao: completado ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// ESPECIALIDADES
// ============================================

export async function getEspecialidades(categoria?: string) {
  let query = supabase
    .from('especialidades')
    .select('*')
    .eq('ativo', true)
    .order('nome');

  if (categoria) {
    query = query.eq('categoria', categoria);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

// ============================================
// CARGOS
// ============================================

export async function getCargos() {
  const { data, error } = await supabase
    .from('cargos')
    .select('*')
    .order('nivel');

  if (error) throw error;
  return data;
}

// ============================================
// AVALIAÇÕES
// ============================================

export async function getAvaliacoesPorMembro(membroId: string) {
  const { data, error } = await supabase
    .from('avaliacoes')
    .select('*')
    .eq('membro_id', membroId)
    .order('data', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAvaliacoesPorUnidade(unidadeId: string, dataInicio?: string, dataFim?: string) {
  let query = supabase
    .from('avaliacoes')
    .select(`
      *,
      membro:membros(nome, foto)
    `)
    .eq('unidade_id', unidadeId);

  if (dataInicio) {
    query = query.gte('data', dataInicio);
  }
  if (dataFim) {
    query = query.lte('data', dataFim);
  }

  const { data, error } = await query.order('data', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createAvaliacao(avaliacao: {
  membro_id: string;
  unidade_id: string;
  criterio_id: string;
  nivel: string;
  pontos: number;
  observacao?: string;
}) {
  const { data, error } = await supabase
    .from('avaliacoes')
    .insert(avaliacao)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// TRANSICOES
// ============================================

export async function getTransicoesPorMembro(membroId: string) {
  const { data, error } = await supabase
    .from('transicoes')
    .select('*')
    .eq('membro_id', membroId)
    .order('data', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createTransicao(transicao: {
  membro_id: string;
  tipo: string;
  descricao: string;
  unidade_id?: string;
  classe_id?: string;
  cargo_novo?: string;
  cargo_anterior?: string;
}) {
  const { data, error } = await supabase
    .from('transicoes')
    .insert(transicao)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// CLASSES DO MEMBRO
// ============================================

export async function addClasseAtual(membroId: string, classeId: string) {
  const { data, error } = await supabase
    .from('membros_classes_atuais')
    .insert({
      membro_id: membroId,
      classe_id: classeId,
      data_inicio: new Date().toISOString().split('T')[0],
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function concluirClasse(membroId: string, classeId: string) {
  // Buscar a classe atual
  const { data: classeAtual } = await supabase
    .from('membros_classes_atuais')
    .select('*')
    .eq('membro_id', membroId)
    .eq('classe_id', classeId)
    .single();

  if (!classeAtual) throw new Error('Classe atual não encontrada');

  // Remover da tabela de classes atuais
  await supabase
    .from('membros_classes_atuais')
    .delete()
    .eq('membro_id', membroId)
    .eq('classe_id', classeId);

  // Adicionar às classes concluídas
  const { data, error } = await supabase
    .from('membros_classes_concluidas')
    .insert({
      membro_id: membroId,
      classe_id: classeId,
      data_inicio: classeAtual.data_inicio,
      data_conclusao: new Date().toISOString().split('T')[0],
      concluido: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// MEMBRO-CARGO
// ============================================

export async function addCargo(membroId: string, cargoTipo: string, unidadeId?: string) {
  const { data, error } = await supabase
    .from('membros_cargos')
    .insert({
      membro_id: membroId,
      cargo_tipo: cargoTipo,
      unidade_id: unidadeId,
      data_atribuicao: new Date().toISOString().split('T')[0],
      ativo: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeCargo(membroId: string, cargoTipo: string) {
  const { error } = await supabase
    .from('membros_cargos')
    .update({ ativo: false })
    .eq('membro_id', membroId)
    .eq('cargo_tipo', cargoTipo);

  if (error) throw error;
}