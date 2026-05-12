// ==========================================
// TIPOS DE CARGO (EXPANSÍVEIS)
// ==========================================

export type CategoriaMembro = 'ADMIN' | 'DIRIGENTE' | 'LIDER' | 'DESBRAVADOR';

export type CargoTipo =
  // Cargos de Admin/Dirigente
  | 'ADMIN'
  | 'REGIONAL'
  | 'DIRETOR'
  | 'DIRETOR_ASSOC'
  // Cargos de Líder
  | 'DIRETOR_CLUBE'
  | 'DIRETOR_ASSOC_CLUBE'
  | 'SECRETARIO_CLUBE'
  | 'TESOUREIRO_CLUBE'
  | 'CAPELAO_CLUBE'
  | 'INSTRUTOR_CLASSE'
  | 'INSTRUTOR_OU'
  | 'CONSELHEIRO'
  | 'CONSELHEIRO_ASSOC'
  // Cargos de Desbravador
  | 'CAPITAO'
  | 'SECRETARIO'
  | 'TESOUREIRO'
  | 'ALMOXARIFE'
  | 'PADIOLEIRO'
  | 'CAPELAO'
  | 'ESPORTISTA'
  | 'OUTRO'
  | 'DESBRAVADOR';

export interface Cargo {
  tipo: CargoTipo;
  nome: string;
  descricao?: string;
  nivel: number;
  cor: string;
  podeTerMultiple: boolean;
  requerUnidade: boolean;
  categoria: CategoriaMembro;
}

export const CARGOS: Cargo[] = [
  // Admin
  {
    tipo: 'ADMIN',
    nome: 'Administrador',
    descricao: 'Acesso total ao sistema',
    nivel: 100,
    cor: '#DC2626',
    podeTerMultiple: true,
    requerUnidade: false,
    categoria: 'ADMIN',
  },
  {
    tipo: 'REGIONAL',
    nome: 'Diretor Regional',
    nivel: 90,
    cor: '#7C3AED',
    podeTerMultiple: true,
    requerUnidade: false,
    categoria: 'ADMIN',
  },

  // Dirigente
  {
    tipo: 'DIRETOR',
    nome: 'Diretor do Clube',
    nivel: 80,
    cor: '#2563EB',
    podeTerMultiple: false,
    requerUnidade: false,
    categoria: 'DIRIGENTE',
  },
  {
    tipo: 'DIRETOR_ASSOC',
    nome: 'Diretor Associado',
    nivel: 70,
    cor: '#0891B2',
    podeTerMultiple: true,
    requerUnidade: false,
    categoria: 'DIRIGENTE',
  },

  // Líder
  {
    tipo: 'DIRETOR_CLUBE',
    nome: 'Diretor(a)',
    nivel: 65,
    cor: '#1D4ED8',
    podeTerMultiple: false,
    requerUnidade: true,
    categoria: 'LIDER',
  },
  {
    tipo: 'DIRETOR_ASSOC_CLUBE',
    nome: 'Diretor(a) Associado(a)',
    nivel: 60,
    cor: '#0E7490',
    podeTerMultiple: true,
    requerUnidade: true,
    categoria: 'LIDER',
  },
  {
    tipo: 'SECRETARIO_CLUBE',
    nome: 'Secretário(a)',
    nivel: 55,
    cor: '#7C3AED',
    podeTerMultiple: false,
    requerUnidade: true,
    categoria: 'LIDER',
  },
  {
    tipo: 'TESOUREIRO_CLUBE',
    nome: 'Tesoureiro(a)',
    nivel: 55,
    cor: '#059669',
    podeTerMultiple: false,
    requerUnidade: true,
    categoria: 'LIDER',
  },
  {
    tipo: 'CAPELAO_CLUBE',
    nome: 'Capelão',
    nivel: 50,
    cor: '#92400E',
    podeTerMultiple: true,
    requerUnidade: true,
    categoria: 'LIDER',
  },
  {
    tipo: 'INSTRUTOR_CLASSE',
    nome: 'Instrutor de Classe',
    nivel: 50,
    cor: '#D97706',
    podeTerMultiple: true,
    requerUnidade: false,
    categoria: 'LIDER',
  },
  {
    tipo: 'INSTRUTOR_OU',
    nome: 'Instrutor de Ordem Unida',
    nivel: 50,
    cor: '#BE185D',
    podeTerMultiple: true,
    requerUnidade: true,
    categoria: 'LIDER',
  },
  {
    tipo: 'CONSELHEIRO',
    nome: 'Conselheiro(a)',
    nivel: 45,
    cor: '#059669',
    podeTerMultiple: true,
    requerUnidade: true,
    categoria: 'LIDER',
  },
  {
    tipo: 'CONSELHEIRO_ASSOC',
    nome: 'Conselheiro(a) Associado(a)',
    nivel: 40,
    cor: '#047857',
    podeTerMultiple: true,
    requerUnidade: true,
    categoria: 'LIDER',
  },

  // Desbravador
  {
    tipo: 'CAPITAO',
    nome: 'Capitão',
    nivel: 30,
    cor: '#EA580C',
    podeTerMultiple: false,
    requerUnidade: true,
    categoria: 'DESBRAVADOR',
  },
  {
    tipo: 'SECRETARIO',
    nome: 'Secretário',
    nivel: 25,
    cor: '#7C3AED',
    podeTerMultiple: false,
    requerUnidade: true,
    categoria: 'DESBRAVADOR',
  },
  {
    tipo: 'TESOUREIRO',
    nome: 'Tesoureiro',
    nivel: 25,
    cor: '#059669',
    podeTerMultiple: false,
    requerUnidade: true,
    categoria: 'DESBRAVADOR',
  },
  {
    tipo: 'ALMOXARIFE',
    nome: 'Almoxarife',
    nivel: 20,
    cor: '#0891B2',
    podeTerMultiple: false,
    requerUnidade: true,
    categoria: 'DESBRAVADOR',
  },
  {
    tipo: 'PADIOLEIRO',
    nome: 'Padioleiro',
    nivel: 20,
    cor: '#B45309',
    podeTerMultiple: false,
    requerUnidade: true,
    categoria: 'DESBRAVADOR',
  },
  {
    tipo: 'CAPELAO',
    nome: 'Capelão',
    nivel: 20,
    cor: '#92400E',
    podeTerMultiple: false,
    requerUnidade: true,
    categoria: 'DESBRAVADOR',
  },
  {
    tipo: 'ESPORTISTA',
    nome: 'Esportista',
    nivel: 20,
    cor: '#2563EB',
    podeTerMultiple: false,
    requerUnidade: true,
    categoria: 'DESBRAVADOR',
  },
  {
    tipo: 'OUTRO',
    nome: 'Outro',
    nivel: 15,
    cor: '#64748B',
    podeTerMultiple: true,
    requerUnidade: true,
    categoria: 'DESBRAVADOR',
  },
  {
    tipo: 'DESBRAVADOR',
    nome: 'Desbravador',
    nivel: 10,
    cor: '#64748B',
    podeTerMultiple: false,
    requerUnidade: true,
    categoria: 'DESBRAVADOR',
  },
];

export const getCargoByTipo = (tipo: CargoTipo): Cargo | undefined =>
  CARGOS.find(c => c.tipo === tipo);

export const getCargosPorCategoria = (categoria: CategoriaMembro): Cargo[] =>
  CARGOS.filter(c => c.categoria === categoria);

export const getCargosPorNivel = (): Cargo[] =>
  [...CARGOS].sort((a, b) => b.nivel - a.nivel);

export const podeAtribuirCargo = (cargoAtribuidor: CargoTipo, cargoAlvo: CargoTipo): boolean => {
  const cAtribuidor = getCargoByTipo(cargoAtribuidor);
  const cAlvo = getCargoByTipo(cargoAlvo);
  if (!cAtribuidor || !cAlvo) return false;
  return cAtribuidor.nivel > cAlvo.nivel;
};

// ==========================================
// HISTÓRICO E GRADUAÇÃO
// ==========================================

export type TipoTransicao =
  | 'ENTRADA'
  | 'SAIDA'
  | 'TROCA_UNIDADE'
  | 'TROCA_CARGO'
  | 'CONCLUIU_CLASSE'
  | 'INICIO_CLASSE'
  | 'PROMOCAO'
  | 'RECLASSIFICACAO';

export interface Transicao {
  id: string;
  tipo: TipoTransicao;
  data: Date;
  descricao: string;
  usuarioId: string;
  unidadeId?: string;
  unidadeAnteriorId?: string;
  classeId?: string;
  cargoAnterior?: CargoTipo;
  cargoNovo?: CargoTipo;
  observacoes?: string;
}

// ==========================================
// CLASSES
// ==========================================

export interface Classe {
  id: string;
  nome: string;
  descricao?: string;
  ordem: number;
  cor: string;
  requisitos?: string[];
  classesPreRequisito?: string[];
  imagem?: string;
}

export const DEFAULT_CLASSES: Classe[] = [
  {
    id: '1',
    nome: 'Amigo',
    descricao: 'Primeira classe para iniciantes',
    ordem: 1,
    cor: '#3B82F6', // Azul
    classesPreRequisito: [],
    imagem: '/images/amigo-150x150.png',
  },
  {
    id: '2',
    nome: 'Companheiro',
    descricao: 'Segunda classe',
    ordem: 2,
    cor: '#EF4444', // Vermelho
    classesPreRequisito: ['1'],
    imagem: '/images/companheiro-150x150.png',
  },
  {
    id: '3',
    nome: 'Pesquisador',
    descricao: 'Terceira classe',
    ordem: 3,
    cor: '#22C55E', // Verde
    classesPreRequisito: ['2'],
    imagem: '/images/pesquisador-150x150.png',
  },
  {
    id: '4',
    nome: 'Pioneiro',
    descricao: 'Quarta classe',
    ordem: 4,
    cor: '#71717A', // Cinza
    classesPreRequisito: ['3'],
    imagem: '/images/pioneiro-150x150.png',
  },
  {
    id: '5',
    nome: 'Excursionista',
    descricao: 'Quinta classe',
    ordem: 5,
    cor: '#8B5CF6', // Roxo
    classesPreRequisito: ['4'],
    imagem: '/images/excursionista-150x150.png',
  },
  {
    id: '6',
    nome: 'Guia',
    descricao: 'Classe máxima',
    ordem: 6,
    cor: '#EAB308', // Amarelo
    classesPreRequisito: ['5'],
    imagem: '/images/guia-150x150.png',
  },
];

export const getClasseById = (id: string): Classe | undefined =>
  DEFAULT_CLASSES.find(c => c.id === id);

export const getProximaClasse = (classeId: string): Classe | undefined => {
  const classe = getClasseById(classeId);
  if (!classe) return undefined;
  return DEFAULT_CLASSES.find(c => c.ordem === classe.ordem + 1);
};

export const podeAvancarClasse = (classesConcluidas: string[], classeAtualId: string): boolean => {
  const classeAtual = getClasseById(classeAtualId);
  if (!classeAtual) return false;
  return classesConcluidas.includes(classeAtualId) && !!getProximaClasse(classeAtualId);
};

// ==========================================
// ESPECIALIDADES
// ==========================================

export interface Especialidade {
  id: string;
  nome: string;
  categoria: EspecialidadeCategoria;
  descricao?: string;
  nivel: 1 | 2 | 3;
  imagem?: string;
  requisitos?: string[];
}

export type EspecialidadeCategoria =
  | 'ARTE manual'
  | 'NATUREZA'
  | 'SAÚDE'
  | 'MISSIONÁRIA'
  | 'PROFISSIONAL'
  | 'DOMÉSTICA'
  | 'RECREATIVA';

export const SPECIALTY_CATEGORIES: EspecialidadeCategoria[] = [
  'ARTE manual',
  'NATUREZA',
  'SAÚDE',
  'MISSIONÁRIA',
  'PROFISSIONAL',
  'DOMÉSTICA',
  'RECREATIVA',
];

// ==========================================
// USUÁRIO COMPLETO
// ==========================================

export interface HistoricoClasse {
  classeId: string;
  dataInicio: Date;
  dataConclusao?: Date;
  concluido: boolean;
}

export interface CargoAtribuido {
  tipo: CargoTipo;
  dataAtribuicao: Date;
  unidadeId?: string;
  ativo: boolean;
  observacao?: string;
}

export interface ClasseAtual {
  classeId: string;
  dataInicio: Date;
}

export interface Usuario {
  id: string;
  nome: string;
  nomeSocial?: string;
  sexo: 'M' | 'F';
  dataNascimento: Date;
  telefone?: string;
  email?: string;
  foto?: string;
  ativo: boolean;
  clubeId: string;
  dataCadastro: Date;
  dataDesligamento?: Date;
  motivoDesligamento?: string;
  // Múltiplas classes atuais (pode fazer mais de uma classe ao mesmo tempo)
  classesAtuais: ClasseAtual[];
  classesConcluidas: HistoricoClasse[];
  cargos: CargoAtribuido[];
  unidadeAtualId?: string;
  unidadesAnteriores: {
    unidadeId: string;
    dataEntrada: Date;
    dataSaida?: Date;
  }[];
  especialidadesConcluidas: string[];
  transicoes: Transicao[];
  endereco?: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  responsavel?: {
    nome: string;
    telefone: string;
    parentesco: string;
  };
  observacoes?: string;
}

// Helper para obter a classe atual principal
export const getClasseAtualPrincipal = (usuario: Usuario): string => {
  return usuario.classesAtuais[0]?.classeId || usuario.classesConcluidas[usuario.classesConcluidas.length - 1]?.classeId || '1';
};

// ==========================================
// ENTITY TYPES (compatibilidade)
// ==========================================

export interface Club {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  regional: string;
  associacao: string;
  ativo: boolean;
  logo?: string;
  createdAt: Date;
}

export interface Unit {
  id: string;
  nome: string;
  genero: 'M' | 'F' | 'MISTA';
  cores: string[];
  gritoDeGuerra?: string;
  logo?: string;
  significadoLogo?: string;
  historiaNome?: string;
  ativo: boolean;
  clubeId: string;
  membrosCount?: number;
  createdAt: Date;
}

// Mantido para compatibilidade
export type Role = CargoTipo;

export interface Membro {
  id: string;
  nome: string;
  sexo: 'M' | 'F';
  dataNascimento: Date;
  telefone?: string;
  email?: string;
  foto?: string;
  ativo: boolean;
  unidadeId: string;
  clubeId: string;
  classesConcluidas?: string[];
  especialidadesConcluidas?: string[];
}

// ==========================================
// RANKING
// ==========================================

export type PontuacaoNivel = 'A' | 'B' | 'C';

export interface CriterioAvaliacao {
  id: string;
  nome: string;
  opcoes: {
    opcao: PontuacaoNivel;
    descricao: string;
    pontos: number;
  }[];
}

export interface AvaliacaoSemanal {
  id: string;
  membroId: string;
  unidadeId: string;
  data: Date;
  criterios: {
    criterioId: string;
    nivel: PontuacaoNivel;
    pontos: number;
  }[];
  totalPontos: number;
  classificacao: PontuacaoNivel;
}

export interface RankingMembro {
  id: string;
  nome: string;
  funcao: string;
  foto?: string;
  totalPontos: number;
  classificacao: PontuacaoNivel;
  ultimaAvaliacao: Date;
  historico: {
    data: Date;
    pontos: number;
    classificacao: PontuacaoNivel;
  }[];
}

export interface RankingUnidade {
  id: string;
  nome: string;
  cores: string[];
  totalPontos: number;
  mediaPontos: number;
  posicao: number;
}

export const CRITERIOS_AVALIACAO: CriterioAvaliacao[] = [
  {
    id: 'pontualidade',
    nome: 'Pontualidade',
    opcoes: [
      { opcao: 'A', descricao: 'Presente a tempo', pontos: 20 },
      { opcao: 'B', descricao: 'Atrasado (até 15m)', pontos: 10 },
      { opcao: 'C', descricao: 'Ausente', pontos: 0 },
    ],
  },
  {
    id: 'uniforme',
    nome: 'Uniforme',
    opcoes: [
      { opcao: 'A', descricao: 'Em ordem', pontos: 20 },
      { opcao: 'B', descricao: 'Incompleto', pontos: 10 },
      { opcao: 'C', descricao: 'Sem uniforme', pontos: 0 },
    ],
  },
  {
    id: 'material',
    nome: 'Material',
    opcoes: [
      { opcao: 'A', descricao: 'Completo', pontos: 20 },
      { opcao: 'B', descricao: 'Incompleto', pontos: 10 },
      { opcao: 'C', descricao: 'Sem material', pontos: 0 },
    ],
  },
  {
    id: 'disciplina',
    nome: 'Disciplina',
    opcoes: [
      { opcao: 'A', descricao: 'Excelente', pontos: 20 },
      { opcao: 'B', descricao: 'Regular', pontos: 10 },
      { opcao: 'C', descricao: 'Indisciplinado', pontos: 0 },
    ],
  },
  {
    id: 'leituraBiblica',
    nome: 'Leitura Bíblica',
    opcoes: [
      { opcao: 'A', descricao: 'Em dia', pontos: 30 },
      { opcao: 'B', descricao: 'Atrasado (até 1 semana)', pontos: 10 },
      { opcao: 'C', descricao: 'Atrasado', pontos: 0 },
    ],
  },
  {
    id: 'classe',
    nome: 'Classe',
    opcoes: [
      { opcao: 'A', descricao: 'Em dia', pontos: 20 },
      { opcao: 'B', descricao: 'Atrasado (até 3 atv)', pontos: 10 },
      { opcao: 'C', descricao: 'Atrasado', pontos: 0 },
    ],
  },
  {
    id: 'boaAcao',
    nome: 'Boa Ação',
    opcoes: [
      { opcao: 'A', descricao: 'Ajuda alguém que esteja precisando', pontos: 20 },
      { opcao: 'B', descricao: '—', pontos: 0 },
    ],
  },
];

export const CLASSIFICACOES = [
  { nivel: 'A' as PontuacaoNivel, label: 'Excelente', min: 120, max: 150, cor: '#22C55E' },
  { nivel: 'B' as PontuacaoNivel, label: 'Bom', min: 90, max: 119, cor: '#3B82F6' },
  { nivel: 'C' as PontuacaoNivel, label: 'Precisa melhorar', min: 0, max: 89, cor: '#F59E0B' },
];

export function calcularClassificacao(pontos: number): PontuacaoNivel {
  if (pontos >= 120) return 'A';
  if (pontos >= 90) return 'B';
  return 'C';
}

export function calcularTotalPontos(criterios: { pontos: number }[]): number {
  return criterios.reduce((acc, c) => acc + c.pontos, 0);
}

// ==========================================
// UTILIDADES
// ==========================================

export const UNIT_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#14B8A6',
  '#0EA5E9', '#8B5CF6', '#EC4899', '#71717A', '#C6A15B',
];

export const DEFAULT_UNIT_COLORS = ['#3B82F6', '#1E40AF', '#1E3A8A'];

export const UNIT_GENDERS = [
  { value: 'M', label: 'Masculina' },
  { value: 'F', label: 'Feminina' },
  { value: 'MISTA', label: 'Mista' },
];
