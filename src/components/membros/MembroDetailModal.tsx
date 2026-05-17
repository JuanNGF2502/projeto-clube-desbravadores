'use client';

import { useState, useEffect } from 'react';
import { User, Calendar, Phone, Mail, Shield, Users, Star, Clock, Award, History, ArrowUpRight, ArrowDownLeft, RefreshCw, GraduationCap, BadgeCheck, LogIn, LogOut, Pencil, ClipboardCheck, TrendingUp } from 'lucide-react';
import { AppModal } from '@/components/ui/AppModal';
import { AppCard } from '@/components/ui/AppCard';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppButton } from '@/components/ui/AppButton';
import { cn } from '@/utils/cn';
import {
  Usuario,
  Cargo,
  CargoTipo,
  getCargoByTipo,
  getClasseById,
  DEFAULT_CLASSES,
  Transicao,
  TipoTransicao,
} from '@/types';
import { getTransicoesPorMembro } from '@/lib/queries';
import { getHistoricoAvaliacoesMembro, getEstatisticasAvaliacaoMembro } from '@/lib/queries/avaliacoes';

interface MembroDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (membro: Usuario) => void;
  membro: Usuario | null;
  unidadeCores?: string[];
}

export function MembroDetailModal({
  isOpen,
  onClose,
  onEdit,
  membro,
  unidadeCores,
}: MembroDetailModalProps) {
  const [transicoes, setTransicoes] = useState<Transicao[]>([]);
  const [carregandoTransicoes, setCarregandoTransicoes] = useState(false);
  const [historicoAvaliacoes, setHistoricoAvaliacoes] = useState<any[]>([]);
  const [estatisticasAvaliacao, setEstatisticasAvaliacao] = useState<any>(null);
  const [carregandoAvaliacoes, setCarregandoAvaliacoes] = useState(false);

  useEffect(() => {
    if (isOpen && membro?.id) {
      carregarTransicoes(membro.id);
      carregarAvaliacoes(membro.id);
    }
  }, [isOpen, membro?.id]);

  const carregarTransicoes = async (membroId: string) => {
    try {
      setCarregandoTransicoes(true);
      const data = await getTransicoesPorMembro(membroId);
      setTransicoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar transições:', error);
    } finally {
      setCarregandoTransicoes(false);
    }
  };

  const carregarAvaliacoes = async (membroId: string) => {
    try {
      setCarregandoAvaliacoes(true);
      const [historico, stats] = await Promise.all([
        getHistoricoAvaliacoesMembro(membroId),
        getEstatisticasAvaliacaoMembro(membroId, 30),
      ]);
      setHistoricoAvaliacoes(historico);
      setEstatisticasAvaliacao(stats);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
      setCarregandoAvaliacoes(false);
    }
  };

  if (!membro) return null;

  const cargosAtivos = membro.cargos?.filter(c => c.ativo) || [];
  const classesAtuais = membro.classesAtuais?.map(c => getClasseById(c.classeId)).filter(Boolean) || [];
  const classesConcluidas = membro.classesConcluidas?.filter(c => c.concluido) || [];

  const calcularIdade = (dataNasc: Date): number => {
    const hoje = new Date();
    const nasc = new Date(dataNasc);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const mes = hoje.getMonth() - nasc.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }
    return idade;
  };

  const formatarData = (data: Date): string => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getCargoPrincipal = (): Cargo | null => {
    const ordemPrioridade: CargoTipo[] = [
      'ADMIN', 'REGIONAL', 'DIRETOR', 'DIRETOR_ASSOC',
      'DIRETOR_CLUBE', 'DIRETOR_ASSOC_CLUBE', 'SECRETARIO_CLUBE', 'TESOUREIRO_CLUBE',
      'CAPELAO_CLUBE', 'INSTRUTOR_CLASSE', 'INSTRUTOR_OU',
      'CONSELHEIRO', 'CONSELHEIRO_ASSOC',
      'CAPITAO', 'SECRETARIO', 'TESOUREIRO', 'ALMOXARIFE',
      'PADIOLEIRO', 'CAPELAO', 'ESPORTISTA', 'OUTRO',
      'DESBRAVADOR',
    ];

    for (const tipo of ordemPrioridade) {
      if (cargosAtivos.some(c => c.tipo === tipo)) {
        return getCargoByTipo(tipo) || null;
      }
    }
    return null;
  };

  const cargoPrincipal = getCargoPrincipal();

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>Detalhes do Membro</span>
          {onEdit && (
            <AppButton variant="ghost" size="sm" onClick={() => onEdit(membro)}>
              <Pencil className="w-4 h-4" />
              Editar
            </AppButton>
          )}
        </div>
      }
      size="lg"
      scrollable
    >
      {/* Header com avatar */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: unidadeCores
              ? `linear-gradient(135deg, ${unidadeCores[0]}, ${unidadeCores[2]})`
              : cargoPrincipal?.cor || '#64748B',
          }}
        >
          {membro.foto ? (
            <img src={membro.foto} alt={membro.nome} className="w-full h-full rounded-2xl object-cover" />
          ) : (
            <span className="text-3xl font-bold text-white">{membro.nome.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-text-primary">{membro.nome}</h2>
          {membro.nomeSocial && (
            <p className="text-sm text-muted">Nome social: {membro.nomeSocial}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {cargoPrincipal && (
              <AppBadge color={cargoPrincipal.cor}>
                {cargoPrincipal.nome}
              </AppBadge>
            )}
            {cargosAtivos.length > 1 && (
              <AppBadge variant="secondary" size="sm">
                +{cargosAtivos.length - 1} cargo{cargosAtivos.length > 2 ? 's' : ''}
              </AppBadge>
            )}
            {!membro.ativo && (
              <AppBadge variant="danger">Inativo</AppBadge>
            )}
          </div>
        </div>
      </div>

      {/* Informações básicas */}
      <div className="space-y-4">
        {/* Dados pessoais */}
        <AppCard padding="sm">
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Dados Pessoais
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted text-xs">Sexo</p>
              <p className="font-medium text-text-primary">{membro.sexo === 'M' ? 'Masculino' : 'Feminino'}</p>
            </div>
            <div>
              <p className="text-muted text-xs">Idade</p>
              <p className="font-medium text-text-primary">{calcularIdade(membro.dataNascimento)} anos</p>
            </div>
            <div>
              <p className="text-muted text-xs">Nascimento</p>
              <p className="font-medium text-text-primary">{formatarData(membro.dataNascimento)}</p>
            </div>
            <div>
              <p className="text-muted text-xs">Membro desde</p>
              <p className="font-medium text-text-primary">{formatarData(membro.dataCadastro)}</p>
            </div>
          </div>
        </AppCard>

        {/* Contato */}
        {(membro.telefone || membro.email || membro.responsavel) && (
          <AppCard padding="sm">
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              Contato
            </h3>
            <div className="space-y-2 text-sm">
              {membro.telefone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted" />
                  <span className="text-text-primary">{membro.telefone}</span>
                </div>
              )}
              {membro.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted" />
                  <span className="text-text-primary">{membro.email}</span>
                </div>
              )}
              {membro.responsavel && (
                <div className="mt-2 pt-2 border-t border-border">
                  <p className="text-xs text-muted mb-1">Responsável</p>
                  <p className="font-medium text-text-primary">{membro.responsavel.nome}</p>
                  <p className="text-sm text-muted">{membro.responsavel.telefone} ({membro.responsavel.parentesco})</p>
                </div>
              )}
            </div>
          </AppCard>
        )}

        {/* Classes */}
        <AppCard padding="sm">
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            Classes
          </h3>
          <div className="space-y-2">
            {classesAtuais.length > 0 && (
              <div>
                <p className="text-xs text-muted mb-2">Em andamento</p>
                <div className="flex flex-wrap gap-2">
                  {classesAtuais.map(classe => classe && (
                    <div
                      key={classe.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{ backgroundColor: `${classe.cor}20` }}
                    >
                      {classe.imagem && (
                        <img
                          src={classe.imagem}
                          alt={classe.nome}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                      )}
                      <span className="font-medium text-text-primary">{classe.nome}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {classesConcluidas.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-muted mb-2">Concluídas ({classesConcluidas.length})</p>
                <div className="flex flex-wrap gap-2">
                  {membro.classesConcluidas
                    .filter(c => c.concluido)
                    .map((classe, idx) => {
                      const info = getClasseById(classe.classeId);
                      return info ? (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-2 py-1 rounded-lg"
                          style={{ backgroundColor: `${info.cor}20` }}
                        >
                          {info.imagem && (
                            <img
                              src={info.imagem}
                              alt={info.nome}
                              className="w-6 h-6 rounded-md object-cover"
                            />
                          )}
                          <span className="text-sm font-medium" style={{ color: info.cor }}>
                            {info.nome}
                          </span>
                        </div>
                      ) : null;
                    })}
                </div>
              </div>
            )}

            {classesAtuais.length === 0 && classesConcluidas.length === 0 && (
              <p className="text-sm text-muted">Nenhuma classe iniciada</p>
            )}
          </div>
        </AppCard>

        {/* Cargos */}
        {cargosAtivos.length > 0 && (
          <AppCard padding="sm">
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Cargos
            </h3>
            <div className="flex flex-wrap gap-2">
              {cargosAtivos.map(cargo => {
                const info = getCargoByTipo(cargo.tipo);
                return info ? (
                  <AppBadge key={cargo.tipo} color={info.cor}>
                    {info.nome}
                  </AppBadge>
                ) : null;
              })}
            </div>
          </AppCard>
        )}

        {/* Especialidades */}
        {membro.especialidadesConcluidas && membro.especialidadesConcluidas.length > 0 && (
          <AppCard padding="sm">
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              Especialidades
            </h3>
            <div className="flex flex-wrap gap-2">
              <AppBadge variant="warning">
                {membro.especialidadesConcluidas.length} especialidade{membro.especialidadesConcluidas.length > 1 ? 's' : ''} concluída{membro.especialidadesConcluidas.length > 1 ? 's' : ''}
              </AppBadge>
            </div>
          </AppCard>
        )}

        {/* Histórico de Avaliações */}
        {(historicoAvaliacoes.length > 0 || estatisticasAvaliacao) && (
          <AppCard padding="sm">
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-primary" />
              Avaliações Recentes
            </h3>

            {carregandoAvaliacoes ? (
              <div className="flex items-center justify-center py-4">
                <Clock className="w-4 h-4 animate-spin text-muted" />
                <span className="ml-2 text-sm text-muted">Carregando avaliações...</span>
              </div>
            ) : (
              <>
                {/* Estatísticas dos últimos 30 dias */}
                {estatisticasAvaliacao && (
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="text-center p-2 rounded-lg bg-surface">
                      <p className="text-lg font-bold text-text-primary">{estatisticasAvaliacao.totalAvaliacoes}</p>
                      <p className="text-xs text-muted">Avaliações</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-surface">
                      <p className="text-lg font-bold text-text-primary">{estatisticasAvaliacao.totalPontos}</p>
                      <p className="text-xs text-muted">Pontos</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-surface">
                      <p className="text-lg font-bold text-success">{estatisticasAvaliacao.classificacaoA}</p>
                      <p className="text-xs text-muted">Class A</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-surface">
                      <p className="text-lg font-bold text-primary">{estatisticasAvaliacao.mediaPontos}</p>
                      <p className="text-xs text-muted">Média</p>
                    </div>
                  </div>
                )}

                {/* Histórico por data */}
                {historicoAvaliacoes.length > 0 && (
                  <div className="space-y-3">
                    {historicoAvaliacoes.slice(0, 5).map((avaliacaoDia: any) => (
                      <div key={avaliacaoDia.data} className="p-3 rounded-lg bg-surface">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted" />
                            <span className="text-sm font-medium text-text-primary">
                              {new Date(avaliacaoDia.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                            </span>
                            <span className="text-xs text-muted capitalize">({avaliacaoDia.diaSemana})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-text-primary">{avaliacaoDia.totalPontos}</span>
                            <span className="text-xs text-muted">pts</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {avaliacaoDia.avaliacoes.map((av: any, idx: number) => (
                            <AppBadge
                              key={idx}
                              size="sm"
                              variant={
                                av.nivel === 'A' ? 'success' :
                                av.nivel === 'B' ? 'primary' : 'warning'
                              }
                            >
                              {av.criterio}: {av.nivel}
                            </AppBadge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </AppCard>
        )}

        {/* Observações */}
        {membro.observacoes && (
          <AppCard padding="sm">
            <h3 className="font-semibold text-text-primary mb-2">Observações</h3>
            <p className="text-sm text-muted">{membro.observacoes}</p>
          </AppCard>
        )}

        {/* Timeline de Histórico */}
        <AppCard padding="sm">
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            Histórico de Atividades
          </h3>

          {carregandoTransicoes ? (
            <div className="flex items-center justify-center py-4">
              <Clock className="w-4 h-4 animate-spin text-muted" />
              <span className="ml-2 text-sm text-muted">Carregando histórico...</span>
            </div>
          ) : transicoes.length > 0 ? (
            <div className="relative">
              {/* Linha vertical */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-4">
                {transicoes.map((transicao, index) => (
                  <TimelineItem key={transicao.id || index} transicao={transicao} />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted text-center py-4">
              Nenhum registro de histórico encontrado
            </p>
          )}
        </AppCard>
      </div>
    </AppModal>
  );
}

// Componente para cada item da timeline
function TimelineItem({ transicao }: { transicao: Transicao }) {
  const getIcon = () => {
    switch (transicao.tipo) {
      case 'ENTRADA':
        return <LogIn className="w-4 h-4" />;
      case 'SAIDA':
        return <LogOut className="w-4 h-4" />;
      case 'TROCA_UNIDADE':
        return <RefreshCw className="w-4 h-4" />;
      case 'TROCA_CARGO':
        return <BadgeCheck className="w-4 h-4" />;
      case 'CONCLUIU_CLASSE':
      case 'INICIO_CLASSE':
        return <GraduationCap className="w-4 h-4" />;
      case 'PROMOCAO':
        return <ArrowUpRight className="w-4 h-4" />;
      case 'RECLASSIFICACAO':
        return <ArrowDownLeft className="w-4 h-4" />;
      default:
        return <History className="w-4 h-4" />;
    }
  };

  const getColor = () => {
    switch (transicao.tipo) {
      case 'ENTRADA':
        return 'bg-success text-success';
      case 'SAIDA':
        return 'bg-danger text-danger';
      case 'TROCA_UNIDADE':
        return 'bg-warning text-warning';
      case 'TROCA_CARGO':
        return 'bg-primary text-primary';
      case 'CONCLUIU_CLASSE':
        return 'bg-success text-success';
      case 'INICIO_CLASSE':
        return 'bg-info text-info';
      case 'PROMOCAO':
        return 'bg-success text-success';
      case 'RECLASSIFICACAO':
        return 'bg-warning text-warning';
      default:
        return 'bg-muted text-muted';
    }
  };

  const getLabel = () => {
    switch (transicao.tipo) {
      case 'ENTRADA':
        return 'Entrada no Clube';
      case 'SAIDA':
        return 'Saída do Clube';
      case 'TROCA_UNIDADE':
        return 'Transferência de Unidade';
      case 'TROCA_CARGO':
        return 'Mudança de Cargo';
      case 'CONCLUIU_CLASSE':
        return 'Conclusão de Classe';
      case 'INICIO_CLASSE':
        return 'Início de Classe';
      case 'PROMOCAO':
        return 'Promoção';
      case 'RECLASSIFICACAO':
        return 'Reclassificação';
      default:
        return 'Atualização';
    }
  };

  const formatarData = (data: Date | string): string => {
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="relative flex items-start gap-3 pl-2">
      {/* Ícone */}
      <div className={cn('relative z-10 flex items-center justify-center w-8 h-8 rounded-full', getColor())}>
        {getIcon()}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm text-text-primary">{getLabel()}</span>
          <span className="text-xs text-muted">{formatarData(transicao.data)}</span>
        </div>
        <p className="text-sm text-muted mt-0.5">{transicao.descricao}</p>
        {transicao.observacoes && (
          <p className="text-xs text-muted mt-1 italic">{transicao.observacoes}</p>
        )}
      </div>
    </div>
  );
}