import { supabase } from '@/lib/supabase';
import { Classe } from '@/types';

export interface RequisitoClasse {
  id: string;
  classe_id: string;
  area: string;
  nome: string;
  descricao?: string;
  ordem: number;
}

export interface ProgressoRequisito {
  requisito_id: string;
  completado: boolean;
  data_conclusao?: string;
}

// ============================================
// CLASSES
// ============================================

export async function getClasses(ativo: boolean = true): Promise<Classe[]> {
  let query = supabase
    .from('classes')
    .select('*')
    .order('ordem');

  if (ativo) {
    query = query.eq('ativo', true);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data || []) as unknown as Classe[];
}

export async function getClasseById(id: string): Promise<Classe | null> {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data as unknown as Classe;
}

// ============================================
// REQUISITOS DAS CLASSES
// ============================================

export async function getRequisitosPorClasse(classeId: string): Promise<RequisitoClasse[]> {
  const { data, error } = await supabase
    .from('requisitos_classe')
    .select('*')
    .eq('classe_id', classeId)
    .eq('ativo', true)
    .order('ordem');

  if (error) throw error;
  return data || [];
}

export async function getTodasAreasRequisito(): Promise<string[]> {
  const { data, error } = await supabase
    .from('requisitos_classe')
    .select('area')
    .eq('ativo', true);

  if (error) throw error;
  const areasUnicas = [...new Set(data?.map(r => r.area) || [])];
  return areasUnicas;
}

// ============================================
// PROGRESSO DO MEMBRO NAS CLASSES
// ============================================

export async function getProgressoMembroClasse(membroId: string): Promise<ProgressoRequisito[]> {
  const { data, error } = await supabase
    .from('membros_requisitos')
    .select('requisito_id, completado, data_conclusao')
    .eq('membro_id', membroId);

  if (error) throw error;
  return data || [];
}

export async function updateProgressoRequisito(
  membroId: string,
  requisitoId: string,
  completado: boolean
): Promise<void> {
  // Primeiro verificar se já existe um registro
  const { data: existing } = await supabase
    .from('membros_requisitos')
    .select('*')
    .eq('membro_id', membroId)
    .eq('requisito_id', requisitoId)
    .single();

  if (existing) {
    // Update existente
    const { error } = await supabase
      .from('membros_requisitos')
      .update({
        completado,
        data_conclusao: completado ? new Date().toISOString() : null,
      })
      .eq('membro_id', membroId)
      .eq('requisito_id', requisitoId);

    if (error) throw error;
  } else {
    // Insert novo
    const { error } = await supabase
      .from('membros_requisitos')
      .insert({
        membro_id: membroId,
        requisito_id: requisitoId,
        completado,
        data_conclusao: completado ? new Date().toISOString() : null,
      });

    if (error) throw error;
  }
}

export async function getEstatisticasClasse(classeId: string) {
  // Total de requisitos
  const { count: totalRequisitos } = await supabase
    .from('requisitos_classe')
    .select('*', { count: 'exact', head: true })
    .eq('classe_id', classeId)
    .eq('ativo', true);

  // Membros nesta classe
  const { count: membrosNaClasse } = await supabase
    .from('membros_classes_atuais')
    .select('*', { count: 'exact', head: true })
    .eq('classe_id', classeId);

  // Membros que concluíram esta classe
  const { count: membrosConcluiram } = await supabase
    .from('membros_classes_concluidas')
    .select('*', { count: 'exact', head: true })
    .eq('classe_id', classeId)
    .eq('concluido', true);

  return {
    totalRequisitos: totalRequisitos || 0,
    membrosNaClasse: membrosNaClasse || 0,
    membrosConcluiram: membrosConcluiram || 0,
  };
}

interface AreaRequisito {
  id: string;
  name: string;
  description: string;
  completed: boolean;
}

interface Area {
  id: string;
  name: string;
  icon: string;
  requirements: AreaRequisito[];
}

export interface MembroComProgresso {
  membroId: string;
  membroNome: string;
  membroUnidade: string;
  areas: Area[];
  completedCount: number;
  totalCount: number;
  progressPercentage: number;
}

const getAreaIcon = (area: string): string => {
  const icons: Record<string, string> = {
    'Espiritualidade': 'book',
    'Habilidades': 'star',
    'Vida ao Ar Livre': 'map',
    'Liderança': 'shield',
    'Comunidade': 'heart',
    'Ensino': 'star',
    'Uniforme': 'star',
    'Atividades ao Ar Livre': 'map',
  };
  return icons[area] || 'book';
};

export async function getMembrosComProgresso(clubeId: string, classeId: string): Promise<MembroComProgresso[]> {
  // Buscar membros desta classe
  const { data: membrosClasses } = await supabase
    .from('membros_classes_atuais')
    .select('membro_id, classe_id')
    .eq('classe_id', classeId);

  if (!membrosClasses || membrosClasses.length === 0) return [];

  const membroIds = membrosClasses.map(mc => mc.membro_id);

  // Buscar membros com suas unidades
  const { data: membros } = await supabase
    .from('membros')
    .select('id, nome, unidade_id')
    .in('id', membroIds);

  // Buscar nomes das unidades
  const unidadeIds = [...new Set(membros?.map(m => m.unidade_id).filter(Boolean) || [])];
  const { data: unidades } = await supabase
    .from('unidades')
    .select('id, nome')
    .in('id', unidadeIds);

  // Buscar requisitos da classe
  const requisitos = await getRequisitosPorClasse(classeId);
  const requisitoIds = requisitos.map(r => r.id);

  // Buscar progresso dos membros
  let progressosDoBanco: { membro_id: string; requisito_id: string; completado: boolean }[] = [];

  if (requisitoIds.length > 0 && membroIds.length > 0) {
    const { data: progressos } = await supabase
      .from('membros_requisitos')
      .select('membro_id, requisito_id, completado')
      .in('membro_id', membroIds)
      .in('requisito_id', requisitoIds);

    progressosDoBanco = progressos || [];
  }

  // Montar resultado com áreas agrupadas
  const membrosComProgresso: MembroComProgresso[] = membrosClasses.map(mc => {
    const membro = membros?.find(m => m.id === mc.membro_id);
    const membroProgressos = progressosDoBanco.filter(p => p.membro_id === mc.membro_id);

    // Encontrar nome da unidade
    const unidade = unidades?.find(u => u.id === membro?.unidade_id);

    // Agrupar requisitos por área
    const areasMap = requisitos.reduce((acc, req) => {
      if (!acc[req.area]) {
        acc[req.area] = {
          id: req.area.toLowerCase(),
          name: req.area,
          icon: getAreaIcon(req.area),
          requirements: [],
        };
      }
      // Usar o progresso real do banco (se existir) ou false como padrão
      const progresso = membroProgressos.find(p => p.requisito_id === req.id);
      acc[req.area].requirements.push({
        id: req.id,
        name: req.nome,
        description: req.descricao || '',
        completed: progresso?.completado || false,
      });
      return acc;
    }, {} as Record<string, Area>);

    const areas = Object.values(areasMap);
    const completedCount = areas.reduce((acc, area) =>
      acc + area.requirements.filter(r => r.completed).length, 0
    );
    const totalCount = requisitos.length;

    return {
      membroId: mc.membro_id,
      membroNome: membro?.nome || 'Desbravador',
      membroUnidade: unidade?.nome || 'Sem unidade',
      areas,
      completedCount,
      totalCount,
      progressPercentage: totalCount > 0 ? Math.floor((completedCount / totalCount) * 100) : 0,
    };
  });

  return membrosComProgresso;
}

// ============================================
// ESPECIALIDADES
// ============================================

export interface EspecialidadeDB {
  id: string;
  nome: string;
  categoria: string;
  descricao?: string;
  nivel: number;
  imagem?: string;
}

export async function getEspecialidades(categoria?: string): Promise<EspecialidadeDB[]> {
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
  return data || [];
}

export async function getEspecialidadesPorCategoria(): Promise<Record<string, EspecialidadeDB[]>> {
  const { data, error } = await supabase
    .from('especialidades')
    .select('*')
    .eq('ativo', true)
    .order('nome');

  if (error) throw error;

  const grouped = (data || []).reduce((acc, esp) => {
    if (!acc[esp.categoria]) {
      acc[esp.categoria] = [];
    }
    acc[esp.categoria].push(esp);
    return acc;
  }, {} as Record<string, EspecialidadeDB[]>);

  return grouped;
}

// ============================================
// CONTROLE DE INSTRUÇÃO (ENSINADO PELO INSTRUTOR)
// ============================================

export interface InstrucaoClasse {
  id: string;
  classe_id: string;
  requisito_id: string;
  instrutor_id?: string;
  data_inicio: string;
  ensinou: boolean;
  data_ensino?: string;
  observacoes?: string;
}

export interface RequisitoComInstrucao extends RequisitoClasse {
  ensinou: boolean;
  data_ensino?: string;
}

export interface AreaComInstrucao {
  id: string;
  name: string;
  icon: string;
  requirements: RequisitoComInstrucao[];
}

// Buscar instruções de uma classe
export async function getInstrucoesPorClasse(classeId: string): Promise<InstrucaoClasse[]> {
  const { data, error } = await supabase
    .from('classes_instrucoes')
    .select('*')
    .eq('classe_id', classeId)
    .order('data_inicio', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Buscar status de instrução de todos os requisitos de uma classe
export async function getStatusInstrucaoPorClasse(classeId: string): Promise<Record<string, boolean>> {
  const instrucoes = await getInstrucoesPorClasse(classeId);
  return instrucoes.reduce((acc, inst) => {
    acc[inst.requisito_id] = inst.ensinou;
    return acc;
  }, {} as Record<string, boolean>);
}

// Marcar requisito como ensinado ou não ensinado
export async function salvarInstrucaoRequisito(
  classeId: string,
  requisitoId: string,
  ensinou: boolean,
  observacoes?: string
): Promise<InstrucaoClasse> {
  console.log('salvarInstrucaoRequisito - params:', { classeId, requisitoId, ensinou });

  // Usar upsert para inserir ou atualizar
  const { data, error } = await supabase
    .from('classes_instrucoes')
    .upsert({
      classe_id: classeId,
      requisito_id: requisitoId,
      ensinou,
      data_inicio: new Date().toISOString().split('T')[0],
      data_ensino: ensinou ? new Date().toISOString().split('T')[0] : null,
      observacoes: observacoes || null,
    }, {
      onConflict: 'classe_id,requisito_id',
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao salvar:', error);
    throw error;
  }
  console.log('Salvo com sucesso:', data);
  return data;
}

// Buscar progresso de instrução da classe (para a UI)
export async function getProgressoInstrucaoClasse(
  classeId: string
): Promise<{ total: number; ensinados: number; percentage: number }> {
  // Buscar todos os requisitos da classe
  const requisitos = await getRequisitosPorClasse(classeId);

  if (requisitos.length === 0) {
    return { total: 0, ensinados: 0, percentage: 0 };
  }

  // Buscar instruções
  const instrucoes = await getInstrucoesPorClasse(classeId);
  const ensinados = instrucoes.filter(i => i.ensinou).length;

  return {
    total: requisitos.length,
    ensinados,
    percentage: Math.round((ensinados / requisitos.length) * 100),
  };
}