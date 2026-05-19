// Clubes
export { getClubes, getClubeById } from './membros';

// Membros
export {
  getMembros,
  getMembroById,
  getUnidades,
  getUnidadeById,
  getClasses,
  getCargos,
  createMembro,
  updateMembro,
  deleteMembro,
  createMembroCargo,
  createMembroClasseAtual,
  createMembroUnidade,
  deleteMembroCargos,
  deleteMembroClassesAtuais,
  createTransicao,
  getTransicoesPorMembro,
  getProgressoRequisito,
  updateRequisito,
} from './membros';

// Unidades
export {
  getUnidadesByClube,
  getTodasUnidades,
  createUnidade,
  updateUnidade,
  deleteUnidade,
  toggleUnidadeAtivo,
  getMembrosPorUnidade,
} from './unidades';

// Classes (from classes.ts)
export {
  getClasseById as getClasseByIdFromClasses,
  getRequisitosPorClasse,
  getEstatisticasClasse,
  getMembrosComProgresso,
  getEspecialidades as getEspecialidadesFromClasses,
  getEspecialidadesPorCategoria,
  updateProgressoRequisito,
  // Controle de instrução
  getInstrucoesPorClasse,
  getStatusInstrucaoPorClasse,
  salvarInstrucaoRequisito,
  getProgressoInstrucaoClasse,
} from './classes';

// Dashboard
export * from './dashboard';

// Avaliações
export * from './avaliacoes';