import { supabase } from '@/lib/supabase/client';

// ============================================
// ESTATÍSTICAS GERAIS
// ============================================

export interface EstatsClube {
  totalMembros: number;
  membrosAtivos: number;
  membrosInativos: number;
  totalUnidades: number;
  totalClassesConcluidas: number;
  totalEspecialidades: number;
}

export async function getEstatisticasClube(clubeId: string): Promise<EstatsClube> {
  // Total de membros
  const { count: totalMembros } = await supabase
    .from('membros')
    .select('*', { count: 'exact', head: true })
    .eq('clube_id', clubeId);

  // Membros ativos
  const { count: membrosAtivos } = await supabase
    .from('membros')
    .select('*', { count: 'exact', head: true })
    .eq('clube_id', clubeId)
    .eq('ativo', true);

  // Membros inativos
  const { count: membrosInativos } = await supabase
    .from('membros')
    .select('*', { count: 'exact', head: true })
    .eq('clube_id', clubeId)
    .eq('ativo', false);

  // Total de unidades
  const { count: totalUnidades } = await supabase
    .from('unidades')
    .select('*', { count: 'exact', head: true })
    .eq('clube_id', clubeId)
    .eq('ativo', true);

  // Total de classes concluídas
  const { count: totalClassesConcluidas } = await supabase
    .from('membros_classes_concluidas')
    .select('*', { count: 'exact', head: true })
    .eq('concluido', true);

  // Total de especialidades concluídas
  const { count: totalEspecialidades } = await supabase
    .from('membros_especialidades')
    .select('*', { count: 'exact', head: true })
    .eq('concluido', true);

  return {
    totalMembros: totalMembros || 0,
    membrosAtivos: membrosAtivos || 0,
    membrosInativos: membrosInativos || 0,
    totalUnidades: totalUnidades || 0,
    totalClassesConcluidas: totalClassesConcluidas || 0,
    totalEspecialidades: totalEspecialidades || 0,
  };
}

// ============================================
// RANKING DE UNIDADES
// ============================================

export interface RankingUnidade {
  id: string;
  nome: string;
  cores: string[];
  genero: string;
  totalMembros: number;
  totalPontos: number;
  posicao: number;
}

export async function getRankingUnidades(clubeId: string): Promise<RankingUnidade[]> {
  // Buscar unidades com contagem de membros
  const { data: unidades, error } = await supabase
    .from('unidades')
    .select('*')
    .eq('clube_id', clubeId)
    .eq('ativo', true)
    .order('nome');

  if (error) throw error;

  // Para cada unidade, calcular pontuação
  const rankings = await Promise.all(
    (unidades || []).map(async (unidade, index) => {
      // Contar membros
      const { count: totalMembros } = await supabase
        .from('membros')
        .select('*', { count: 'exact', head: true })
        .eq('unidade_id', unidade.id)
        .eq('ativo', true);

      // Somar avaliações recentes (últimos 30 dias)
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - 30);

      const { data: avaliacoes } = await supabase
        .from('avaliacoes')
        .select('pontos')
        .eq('unidade_id', unidade.id)
        .gte('data', dataInicio.toISOString().split('T')[0]);

      const totalPontos = avaliacoes?.reduce((sum, a) => sum + (a.pontos || 0), 0) || 0;

      return {
        id: unidade.id,
        nome: unidade.nome,
        cores: unidade.cores,
        genero: unidade.genero,
        totalMembros: totalMembros || 0,
        totalPontos,
        posicao: index + 1,
      };
    })
  );

  // Ordenar por pontuação
  return rankings.sort((a, b) => b.totalPontos - a.totalPontos).map((r, i) => ({
    ...r,
    posicao: i + 1,
  }));
}

// ============================================
// ATIVIDADE RECENTE
// ============================================

export interface TransicaoRecente {
  id: string;
  tipo: string;
  data: string;
  descricao: string;
  membro_nome: string;
  membro_foto?: string;
}

export async function getAtividadeRecente(clubeId: string, limite: number = 10): Promise<TransicaoRecente[]> {
  // First get member IDs from this club
  const { data: membrosData } = await supabase
    .from('membros')
    .select('id')
    .eq('clube_id', clubeId);

  const membroIds = membrosData?.map(m => m.id) || [];

  if (membroIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('transicoes')
    .select(`
      *,
      membro:membros(nome, foto)
    `)
    .in('membro_id', membroIds)
    .order('data', { ascending: false })
    .limit(limite);

  if (error) throw error;

  return (data || []).map(t => ({
    id: t.id,
    tipo: t.tipo,
    data: t.data,
    descricao: t.descricao,
    membro_nome: t.membro?.nome || '',
    membro_foto: t.membro?.foto,
  }));
}

// ============================================
// MEMBROS POR CLASSE
// ============================================

export interface MembrosPorClasse {
  classeId: string;
  classeNome: string;
  classeCor: string;
  count: number;
}

export async function getMembrosPorClasse(_clubeId: string): Promise<MembrosPorClasse[]> {
  // Buscar classes
  const { data: classes } = await supabase
    .from('classes')
    .select('*')
    .eq('ativo', true)
    .order('ordem');

  // Para cada classe, contar membros atuais
  const resultado = await Promise.all(
    (classes || []).map(async (classe) => {
      const { count } = await supabase
        .from('membros_classes_atuais')
        .select('*', { count: 'exact', head: true })
        .eq('classe_id', classe.id);

      return {
        classeId: classe.id,
        classeNome: classe.nome,
        classeCor: classe.cor,
        count: count || 0,
      };
    })
  );

  return resultado;
}

// ============================================
// AVALIAÇÕES SEMANAIS
// ============================================

export interface Avaliacao {
  id: string;
  membro_id: string;
  unidade_id: string;
  data: string;
  criterio_id: string;
  nivel: 'A' | 'B' | 'C';
  pontos: number;
  observacao?: string;
}

export interface AvaliacaoCompleta {
  id: string;
  membro_id: string;
  membro_nome: string;
  unidade_id: string;
  data: string;
  criterio_id: string;
  criterio_nome: string;
  nivel: 'A' | 'B' | 'C';
  pontos: number;
  observacao?: string;
}

export async function getAvaliacoesDaUnidade(unidadeId: string, dataAvaliacao?: string): Promise<AvaliacaoCompleta[]> {
  const dataRef = dataAvaliacao || new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('avaliacoes')
    .select(`
      *,
      membro:membros(nome),
      criterio:criterios_avaliacao(nome)
    `)
    .eq('unidade_id', unidadeId)
    .eq('data', dataRef);

  if (error) throw error;
  if (!data) return [];

  return data.map(a => ({
    id: a.id,
    membro_id: a.membro_id,
    membro_nome: a.membro?.nome || '',
    unidade_id: a.unidade_id,
    data: a.data,
    criterio_id: a.criterio_id,
    criterio_nome: a.criterio?.nome || a.criterio_id,
    nivel: a.nivel,
    pontos: a.pontos,
    observacao: a.observacao,
  }));
}

export async function getAvaliacoesDoMembro(membroId: string, limite: number = 10): Promise<AvaliacaoCompleta[]> {
  const { data, error } = await supabase
    .from('avaliacoes')
    .select(`
      *,
      membro:membros(nome),
      criterio:criterios_avaliacao(nome)
    `)
    .eq('membro_id', membroId)
    .order('data', { ascending: false })
    .limit(limite);

  if (error) throw error;
  if (!data) return [];

  return data.map(a => ({
    id: a.id,
    membro_id: a.membro_id,
    membro_nome: a.membro?.nome || '',
    unidade_id: a.unidade_id,
    data: a.data,
    criterio_id: a.criterio_id,
    criterio_nome: a.criterio?.nome || a.criterio_id,
    nivel: a.nivel,
    pontos: a.pontos,
    observacao: a.observacao,
  }));
}

export async function salvarAvaliacao(
  avaliacao: Omit<Avaliacao, 'id'>
): Promise<Avaliacao> {
  const { data, error } = await supabase
    .from('avaliacoes')
    .insert(avaliacao)
    .select()
    .single();

  if (error) throw error;
  return data as Avaliacao;
}

export async function salvarAvaliacoesBatch(
  avaliacoes: Omit<Avaliacao, 'id'>[]
): Promise<Avaliacao[]> {
  const { data, error } = await supabase
    .from('avaliacoes')
    .insert(avaliacoes)
    .select();

  if (error) throw error;
  return (data || []) as Avaliacao[];
}

export async function getUltimaAvaliacaoDaUnidade(unidadeId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('avaliacoes')
    .select('data')
    .eq('unidade_id', unidadeId)
    .order('data', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows
    throw error;
  }

  return data?.data || null;
}

// ============================================
// RANKING DE MEMBROS POR UNIDADE
// ============================================

export interface RankingMembroData {
  id: string;
  nome: string;
  foto?: string;
  totalPontos: number;
  classificacao: 'A' | 'B' | 'C';
  ultimaAvaliacao: string | null;
  posicao: number;
  cargo?: string;
  classe?: string;
}

export async function getRankingMembrosDaUnidade(unidadeId: string): Promise<RankingMembroData[]> {
  // Primeiro buscar membros da unidade
  const { data: membros, error } = await supabase
    .from('membros')
    .select(`
      id,
      nome,
      foto,
      membros_cargos(cargo_tipo, cargo:cargos(nome), ativo),
      membros_classes_atuais(classe_id, classe:classes(nome))
    `)
    .eq('unidade_id', unidadeId)
    .eq('ativo', true)
    .order('nome');

  if (error) throw error;
  if (!membros || membros.length === 0) return [];

  const membroIds = membros.map(m => m.id);

  // Buscar avaliações dos últimos 30 dias
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - 30);

  const { data: avaliacoes } = await supabase
    .from('avaliacoes')
    .select('*')
    .in('membro_id', membroIds)
    .gte('data', dataLimite.toISOString().split('T')[0]);

  // Calcular pontuação por membro
  const pontuacoes = new Map<string, { total: number; ultimaData: string | null }>();

  membros.forEach(m => {
    pontuacoes.set(m.id, { total: 0, ultimaData: null });
  });

  avaliacoes?.forEach(a => {
    const entry = pontuacoes.get(a.membro_id);
    if (entry) {
      entry.total += a.pontos || 0;
      if (!entry.ultimaData || a.data > entry.ultimaData) {
        entry.ultimaData = a.data;
      }
    }
  });

  // Montar ranking
  const ranking: RankingMembroData[] = membros.map(m => {
    const pontos = pontuacoes.get(m.id) || { total: 0, ultimaData: null };
    let classificacao: 'A' | 'B' | 'C' = 'C';
    if (pontos.total >= 120) classificacao = 'A';
    else if (pontos.total >= 90) classificacao = 'B';

    const cargoAtivo = (m.membros_cargos as any[])?.find((c: any) => c.ativo);
    const classeAtual = (m.membros_classes_atuais as any[])?.[0];

    return {
      id: m.id,
      nome: m.nome,
      foto: m.foto,
      totalPontos: pontos.total,
      classificacao,
      ultimaAvaliacao: pontos.ultimaData,
      posicao: 0, // Será definido após ordenação
      cargo: cargoAtivo?.cargo?.nome || 'Desbravador',
      classe: classeAtual?.classe?.nome || undefined,
    };
  });

  // Ordenar por pontuação
  ranking.sort((a, b) => b.totalPontos - a.totalPontos);

  // Definir posições
  return ranking.map((r, index) => ({
    ...r,
    posicao: index + 1,
  }));
}

// ============================================
// SOMA POR CRITÉRIO DE AVALIAÇÃO
// ============================================

export interface CriterioSoma {
  criterioId: string;
  nome: string;
  totalPontos: number;
  maxPontos: number;
}

export async function getSomaCriteriosUnidade(unidadeId: string): Promise<CriterioSoma[]> {
  const membros = await supabase
    .from('membros')
    .select('id')
    .eq('unidade_id', unidadeId)
    .eq('ativo', true);

  if (!membros.data || membros.data.length === 0) return [];

  const membroIds = membros.data.map(m => m.id);

  const { data: criterios } = await supabase
    .from('criterios_avaliacao')
    .select('id, nome, pontos_a')
    .order('ordem');

  if (!criterios) return [];

  // Mapear criterio_id -> nome para agrupar avaliações corretamente
  const nomePorId: Record<string, { nome: string; max: number }> = {};
  criterios.forEach(c => {
    nomePorId[c.id] = { nome: c.nome, max: c.pontos_a || 20 };
  });

  const { data: avaliacoes } = await supabase
    .from('avaliacoes')
    .select('criterio_id, pontos')
    .in('membro_id', membroIds);

  // Somar por nome do critério (evita duplicatas se houver IDs diferentes p/ mesmo nome)
  const somaPorNome = new Map<string, number>();
  (avaliacoes || []).forEach(a => {
    const info = nomePorId[a.criterio_id];
    if (!info) return;
    somaPorNome.set(info.nome, (somaPorNome.get(info.nome) || 0) + (a.pontos || 0));
  });

  // Usar Map para garantir nome único, preservando ordem
  const vistos = new Set<string>();
  return criterios.reduce((acc: CriterioSoma[], c) => {
    if (vistos.has(c.nome)) return acc;
    vistos.add(c.nome);
    acc.push({
      criterioId: c.id,
      nome: c.nome,
      totalPontos: somaPorNome.get(c.nome) || 0,
      maxPontos: c.pontos_a || 20,
    });
    return acc;
  }, []);
}

// ============================================
// ESTATÍSTICAS DA UNIDADE
// ============================================

export interface EstatisticasUnidade {
  totalMembros: number;
  mediaPontos: number;
  totalPontos: number;
  ultimaAvaliacao: string | null;
  distribuicaoClassificacao: {
    A: number;
    B: number;
    C: number;
  };
  criterios: CriterioSoma[];
}

export async function getEstatisticasUnidade(unidadeId: string): Promise<EstatisticasUnidade> {
  // Contar membros
  const { count: totalMembros } = await supabase
    .from('membros')
    .select('*', { count: 'exact', head: true })
    .eq('unidade_id', unidadeId)
    .eq('ativo', true);

  // Buscar ranking para calcular estatísticas
  const ranking = await getRankingMembrosDaUnidade(unidadeId);

  // Buscar soma por critério
  const criterios = await getSomaCriteriosUnidade(unidadeId);

  const totalPontos = ranking.reduce((sum, m) => sum + m.totalPontos, 0);
  const mediaPontos = ranking.length > 0 ? Math.round(totalPontos / ranking.length) : 0;

  const distribuicaoClassificacao = {
    A: ranking.filter(m => m.classificacao === 'A').length,
    B: ranking.filter(m => m.classificacao === 'B').length,
    C: ranking.filter(m => m.classificacao === 'C').length,
  };

  const ultimaAvaliacao = ranking.length > 0
    ? ranking.reduce((latest, m) => {
        if (!m.ultimaAvaliacao) return latest;
        if (!latest) return m.ultimaAvaliacao;
        return m.ultimaAvaliacao > latest ? m.ultimaAvaliacao : latest;
      }, null as string | null)
    : null;

  return {
    totalMembros: totalMembros || 0,
    mediaPontos,
    totalPontos,
    ultimaAvaliacao,
    distribuicaoClassificacao,
    criterios,
  };
}