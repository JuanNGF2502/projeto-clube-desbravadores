import { supabase } from '@/lib/supabase';

export interface CriterioAvaliacaoDB {
  id: string;
  nome: string;
  descricao?: string;
  ordem: number;
  pontos_a: number;
  descricao_a?: string;
  pontos_b: number;
  descricao_b?: string;
  pontos_c: number;
  descricao_c?: string;
  ativo: boolean;
}

export interface AvaliacaoInput {
  membro_id: string;
  unidade_id: string;
  criterio_id: string;
  nivel: 'A' | 'B' | 'C';
  pontos: number;
  observacao?: string;
}

// ============================================
// CRITÉRIOS DE AVALIAÇÃO
// ============================================

export async function getCriteriosAvaliacao(ativo: boolean = true): Promise<CriterioAvaliacaoDB[]> {
  let query = supabase
    .from('criterios_avaliacao')
    .select('*')
    .order('ordem');

  if (ativo) {
    query = query.eq('ativo', true);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function getCriterioById(id: string): Promise<CriterioAvaliacaoDB | null> {
  const { data, error } = await supabase
    .from('criterios_avaliacao')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

// ============================================
// AVALIAÇÕES
// ============================================

export async function criarAvaliacao(avaliacao: AvaliacaoInput) {
  const { data, error } = await supabase
    .from('avaliacoes')
    .insert({
      membro_id: avaliacao.membro_id,
      unidade_id: avaliacao.unidade_id,
      criterio_id: avaliacao.criterio_id,
      nivel: avaliacao.nivel,
      pontos: avaliacao.pontos,
      observacao: avaliacao.observacao || null,
      data: new Date().toISOString().split('T')[0],
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function criarAvaliacoesBatch(avaliacoes: AvaliacaoInput[]) {
  const dados = avaliacoes.map(a => ({
    ...a,
    data: new Date().toISOString().split('T')[0],
    observacao: a.observacao || null,
  }));

  const { data, error } = await supabase
    .from('avaliacoes')
    .insert(dados)
    .select();

  if (error) throw error;
  return data;
}

export async function getAvaliacoesPorMembro(membroId: string, limite: number = 20) {
  const { data, error } = await supabase
    .from('avaliacoes')
    .select(`
      *,
      unidade:unidades(nome),
      criterio:criterios_avaliacao(nome)
    `)
    .eq('membro_id', membroId)
    .order('data', { ascending: false })
    .limit(limite);

  if (error) throw error;
  return data || [];
}

export async function getAvaliacoesPorUnidadeData(unidadeId: string, dataAvaliacao?: string) {
  const dataRef = dataAvaliacao || new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('avaliacoes')
    .select(`
      *,
      membro:membros(id, nome, foto),
      criterio:criterios_avaliacao(nome)
    `)
    .eq('unidade_id', unidadeId)
    .eq('data', dataRef);

  if (error) throw error;
  return data || [];
}

export async function getHistoricoAvaliacoesMembro(membroId: string) {
  // Buscar todas as avaliações do membro
  const { data: avaliacoes, error } = await supabase
    .from('avaliacoes')
    .select(`
      *,
      unidade:unidades(nome),
      criterio:criterios_avaliacao(nome)
    `)
    .eq('membro_id', membroId)
    .order('data', { ascending: false });

  if (error) throw error;

  // Agrupar por data
  const porData: Record<string, any> = {};

  (avaliacoes || []).forEach(av => {
    const dataKey = av.data;
    if (!porData[dataKey]) {
      porData[dataKey] = {
        data: av.data,
        diaSemana: new Date(av.data).toLocaleDateString('pt-BR', { weekday: 'long' }),
        totalPontos: 0,
        avaliacoes: [],
      };
    }
    porData[dataKey].totalPontos += av.pontos || 0;
    porData[dataKey].avaliacoes.push({
      criterio: av.criterio?.nome || av.criterio_id,
      nivel: av.nivel,
      pontos: av.pontos,
    });
  });

  return Object.values(porData);
}

export async function getEstatisticasAvaliacaoMembro(membroId: string, ultimosDias: number = 30) {
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - ultimosDias);

  const { data, error } = await supabase
    .from('avaliacoes')
    .select('pontos, nivel, data')
    .eq('membro_id', membroId)
    .gte('data', dataLimite.toISOString().split('T')[0]);

  if (error) throw error;

  const avaliacoes = data || [];
  const totalPontos = avaliacoes.reduce((sum, a) => sum + (a.pontos || 0), 0);
  const mediaPontos = avaliacoes.length > 0 ? Math.round(totalPontos / avaliacoes.length) : 0;

  const classificacaoA = avaliacoes.filter(a => a.nivel === 'A').length;
  const classificacaoB = avaliacoes.filter(a => a.nivel === 'B').length;
  const classificacaoC = avaliacoes.filter(a => a.nivel === 'C').length;

  return {
    totalAvaliacoes: avaliacoes.length,
    totalPontos,
    mediaPontos,
    classificacaoA,
    classificacaoB,
    classificacaoC,
  };
}