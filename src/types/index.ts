// User roles
export type Role = 'ADMIN' | 'REGIONAL' | 'DIRETOR' | 'CONSELHEIRO' | 'INSTRUTOR' | 'DESBRAVADOR';

// Entity types
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
  cores: string[]; // 3 cores para gradiente
  gritoDeGuerra?: string;
  logo?: string;
  significadoLogo?: string;
  historiaNome?: string;
  conselheiro?: string;
  capitao?: string;
  secretario?: string;
  ativo: boolean;
  clubeId: string;
  membrosCount?: number;
  createdAt: Date;
}

export interface Classe {
  id: string;
  nome: string;
  descricao?: string;
  ordem: number;
  cor: string;
  requisitos?: string[];
}

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

// Default classes
export const DEFAULT_CLASSES: Classe[] = [
  { id: '1', nome: 'Amigo', descricao: 'Primeira classe para iniciantes', ordem: 1, cor: '#22C55E' },
  { id: '2', nome: 'Companheiro', descricao: 'Segunda classe', ordem: 2, cor: '#3B82F6' },
  { id: '3', nome: 'Pesquisador', descricao: 'Terceira classe', ordem: 3, cor: '#8B5CF6' },
  { id: '4', nome: 'Pioneiro', descricao: 'Quarta classe', ordem: 4, cor: '#F59E0B' },
  { id: '5', nome: 'Excursionista', descricao: 'Quinta classe', ordem: 5, cor: '#EF4444' },
  { id: '6', nome: 'Guia', descricao: 'Classe máxima', ordem: 6, cor: '#C6A15B' },
];

// Specialty categories
export const SPECIALTY_CATEGORIES: EspecialidadeCategoria[] = [
  'ARTE manual',
  'NATUREZA',
  'SAÚDE',
  'MISSIONÁRIA',
  'PROFISSIONAL',
  'DOMÉSTICA',
  'RECREATIVA',
];

// Unit colors
export const UNIT_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#14B8A6',
  '#0EA5E9', '#8B5CF6', '#EC4899', '#71717A', '#C6A15B',
];

// Default unit color scheme
export const DEFAULT_UNIT_COLORS = ['#3B82F6', '#1E40AF', '#1E3A8A'];

// Unit gender options
export const UNIT_GENDERS = [
  { value: 'M', label: 'Masculina' },
  { value: 'F', label: 'Feminina' },
  { value: 'MISTA', label: 'Mista' },
];