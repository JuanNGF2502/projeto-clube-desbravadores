'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Phone, Mail, MapPin, Shield, BookOpen, Users, Check, ArrowRight, ArrowLeft, Pencil, Loader2 } from 'lucide-react';
import { AppModal } from '@/components/ui/AppModal';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppBadge } from '@/components/ui/AppBadge';
import { cn } from '@/utils/cn';
import {
  Usuario,
  CargoTipo,
  CategoriaMembro,
  getCargoByTipo,
  getCargosPorCategoria,
  DEFAULT_CLASSES,
  getClasseById,
  Unit,
  ClasseAtual,
} from '@/types';

interface CargoItem {
  tipo: CargoTipo;
  classeId?: string;
  unidadeId?: string;
}

interface MembroFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (usuario: Partial<Usuario>) => void;
  onEdit?: () => void;
  usuario?: Usuario | null;
  unidades: Unit[];
  isSaving?: boolean;
}

export function MembroFormModal({
  isOpen,
  onClose,
  onSave,
  onEdit,
  usuario,
  unidades,
  isSaving = false,
}: MembroFormModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nome: '',
    nomeSocial: '',
    sexo: 'M' as 'M' | 'F',
    dataNascimento: '',
    telefone: '',
    email: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    responsavelNome: '',
    responsavelTelefone: '',
    responsavelParentesco: '',
    observacoes: '',
    unidadeId: '',
    classesAtuais: [] as string[],
    categoriaMembro: '' as 'DESBRAVADOR' | 'LIDER' | '',
    cargos: [] as CargoItem[],
    cargoObservacao: '',
    ativo: true,
  });

  const totalSteps = 4;

  const usuarioRef = useRef(usuario);

  useEffect(() => {
    if (!isOpen) return;
    if (usuario === usuarioRef.current && usuario) return;
    usuarioRef.current = usuario;

    if (usuario) {
      const cargosAtivos = usuario.cargos?.filter(c => c.ativo) || [];
      let categoria: 'DESBRAVADOR' | 'LIDER' | '' = '';

      if (cargosAtivos.length > 0) {
        const temCargoLider = cargosAtivos.some(c => {
          const info = getCargoByTipo(c.tipo);
          return info?.categoria === 'LIDER';
        });
        categoria = temCargoLider ? 'LIDER' : 'DESBRAVADOR';
      } else if (usuario.classesAtuais && usuario.classesAtuais.length > 0) {
        categoria = 'DESBRAVADOR';
      }

      const classesAtuaisIds = usuario.classesAtuais?.map(c => {
        if (typeof c === 'string') return c;
        return c.classeId ? String(c.classeId) : '';
      }).filter(Boolean) || [];

      const cargosList = (cargosAtivos.map(c => ({
        tipo: typeof c === 'string' ? c as CargoTipo : c.tipo,
        classeId: (c as any).classeId || undefined,
        unidadeId: (typeof c === 'string' ? undefined : (c as any).unidadeId) || undefined,
      })) || []).filter(c => c.tipo);

      setFormData({
        nome: usuario.nome,
        nomeSocial: usuario.nomeSocial || '',
        sexo: usuario.sexo,
        dataNascimento: usuario.dataNascimento instanceof Date
          ? usuario.dataNascimento.toISOString().split('T')[0]
          : usuario.dataNascimento
            ? new Date(usuario.dataNascimento).toISOString().split('T')[0]
            : '',
        telefone: usuario.telefone || '',
        email: usuario.email || '',
        logradouro: usuario.endereco?.logradouro || '',
        numero: usuario.endereco?.numero || '',
        bairro: usuario.endereco?.bairro || '',
        cidade: usuario.endereco?.cidade || '',
        estado: usuario.endereco?.estado || '',
        cep: usuario.endereco?.cep || '',
        responsavelNome: usuario.responsavel?.nome || '',
        responsavelTelefone: usuario.responsavel?.telefone || '',
        responsavelParentesco: usuario.responsavel?.parentesco || '',
        observacoes: usuario.observacoes || '',
        unidadeId: usuario.unidadeAtualId || '',
        classesAtuais: classesAtuaisIds,
        categoriaMembro: categoria,
        cargos: cargosList,
        cargoObservacao: '',
        ativo: usuario.ativo !== undefined ? usuario.ativo : true,
      });
    } else {
      setFormData({
        nome: '', nomeSocial: '', sexo: 'M', dataNascimento: '',
        telefone: '', email: '', logradouro: '', numero: '', bairro: '',
        cidade: '', estado: '', cep: '', responsavelNome: '',
        responsavelTelefone: '', responsavelParentesco: '', observacoes: '',
        unidadeId: '', classesAtuais: [], categoriaMembro: '', cargos: [], cargoObservacao: '',
        ativo: true,
      });
    }
    setStep(1);
  }, [isOpen]);

  const updateField = (field: string, value: string | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleClasse = (classeId: string) => {
    setFormData(prev => {
      const exists = prev.classesAtuais.includes(classeId);
      if (exists) {
        return { ...prev, classesAtuais: prev.classesAtuais.filter(id => id !== classeId) };
      }
      return { ...prev, classesAtuais: [...prev.classesAtuais, classeId] };
    });
  };

  const toggleCargo = (cargo: CargoTipo) => {
    setFormData(prev => {
      const exists = prev.cargos.some(c => c.tipo === cargo);
      if (exists) {
        return { ...prev, cargos: prev.cargos.filter(c => c.tipo !== cargo) };
      }
      return { ...prev, cargos: [...prev.cargos, { tipo: cargo }] };
    });
  };

  const updateCargoMeta = (cargo: CargoTipo, field: 'classeId' | 'unidadeId', value: string) => {
    setFormData(prev => ({
      ...prev,
      cargos: prev.cargos.map(c =>
        c.tipo === cargo ? { ...c, [field]: value } : c
      ),
    }));
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    if (isSaving) return;
    const novoUsuario: Partial<Usuario> = {
      id: usuario?.id || crypto.randomUUID(),
      nome: formData.nome,
      nomeSocial: formData.nomeSocial || undefined,
      sexo: formData.sexo,
      dataNascimento: new Date(formData.dataNascimento),
      telefone: formData.telefone || undefined,
      email: formData.email || undefined,
      ativo: formData.ativo,
      clubeId: '1',
      dataCadastro: usuario?.dataCadastro || new Date(),
      classesAtuais: formData.classesAtuais.map(classeId => ({
        classeId,
        dataInicio: new Date(),
      })) as ClasseAtual[],
      classesConcluidas: usuario?.classesConcluidas || [],
      cargos: formData.cargos.map(c => ({
        tipo: c.tipo,
        dataAtribuicao: new Date(),
        unidadeId: c.unidadeId || formData.unidadeId || undefined,
        classeId: c.classeId,
        ativo: true,
        observacao: c.tipo === 'OUTRO' ? formData.cargoObservacao : undefined,
      })),
      unidadeAtualId: formData.unidadeId || undefined,
      unidadesAnteriores: usuario?.unidadesAnteriores || [],
      especialidadesConcluidas: usuario?.especialidadesConcluidas || [],
      transicoes: usuario?.transicoes || [],
      endereco: formData.logradouro ? {
        logradouro: formData.logradouro, numero: formData.numero,
        bairro: formData.bairro, cidade: formData.cidade,
        estado: formData.estado, cep: formData.cep,
      } : undefined,
      responsavel: formData.responsavelNome ? {
        nome: formData.responsavelNome,
        telefone: formData.responsavelTelefone,
        parentesco: formData.responsavelParentesco,
      } : undefined,
      observacoes: formData.observacoes || undefined,
    };
    onSave(novoUsuario);
  };

  const stepLabels = ['Dados', 'Categoria', 'Cargos', 'Finalizar'];
  const isEditing = !!usuario;

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Membro' : 'Novo Membro'}
      size="lg"
      scrollable
    >
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted mb-2">
          <span>Passo {step} de {totalSteps}</span>
          <span>{stepLabels[step - 1]}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Dados Pessoais */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-3">
            <AppInput
              label="Nome completo *"
              value={formData.nome}
              onChange={(e) => updateField('nome', e.target.value)}
              placeholder="Ex: João Silva"
            />

            {isEditing && (
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ativo}
                    onChange={(e) => updateField('ativo', e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary"
                  />
                  <span className="text-sm text-text-primary">Membro ativo</span>
                </label>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <AppSelect
                label="Sexo"
                value={formData.sexo}
                onChange={(value) => updateField('sexo', value)}
                options={[
                  { value: 'M', label: 'Masculino' },
                  { value: 'F', label: 'Feminino' },
                ]}
              />
              <AppInput
                label="Nascimento *"
                type="date"
                value={formData.dataNascimento}
                onChange={(e) => updateField('dataNascimento', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <AppInput
                label="Telefone"
                value={formData.telefone}
                onChange={(e) => updateField('telefone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
              <AppInput
                label="E-mail"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>

          {/* Responsável */}
          <AppCard padding="sm" className="bg-muted/30">
            <p className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Responsável
            </p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <AppInput
                  placeholder="Nome"
                  value={formData.responsavelNome}
                  onChange={(e) => updateField('responsavelNome', e.target.value)}
                />
                <AppInput
                  placeholder="Parentesco"
                  value={formData.responsavelParentesco}
                  onChange={(e) => updateField('responsavelParentesco', e.target.value)}
                />
              </div>
              <AppInput
                placeholder="Telefone do responsável"
                value={formData.responsavelTelefone}
                onChange={(e) => updateField('responsavelTelefone', e.target.value)}
              />
            </div>
          </AppCard>
        </div>
      )}

      {/* Step 2: Categoria */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Selecione a categoria para liberar os cargos disponíveis.
          </p>

          <div className="space-y-3">
            {/* Desbravador */}
            <button
              onClick={() => {
                updateField('categoriaMembro', 'DESBRAVADOR');
                updateField('cargos', []);
              }}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all',
                formData.categoriaMembro === 'DESBRAVADOR'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-text-primary">Desbravador</h4>
                  <p className="text-sm text-muted">Membro em formação</p>
                </div>
                {formData.categoriaMembro === 'DESBRAVADOR' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </button>

            {/* Líder */}
            <button
              onClick={() => {
                updateField('categoriaMembro', 'LIDER');
                updateField('cargos', []);
              }}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all',
                formData.categoriaMembro === 'LIDER'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-text-primary">Líder</h4>
                  <p className="text-sm text-muted">Adulto voluntário</p>
                </div>
                {formData.categoriaMembro === 'LIDER' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Cargos e Classes */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              Cargos de <span className="font-semibold text-text-primary">
                {formData.categoriaMembro === 'DESBRAVADOR' ? 'Desbravador' : 'Líder'}
              </span>
            </p>
            {formData.cargos.length > 0 && (
              <AppBadge variant="primary">
                {formData.cargos.length} selecionado{formData.cargos.length > 1 ? 's' : ''}
              </AppBadge>
            )}
          </div>

          {/* Cargos em 2 colunas */}
          <div className="grid grid-cols-2 gap-2">
            {getCargosPorCategoria(formData.categoriaMembro as CategoriaMembro).map((cargo) => {
              const isSelected = formData.cargos.some(c => c.tipo === cargo.tipo);
              const cargoItem = formData.cargos.find(c => c.tipo === cargo.tipo);
              return (
                <div key={cargo.tipo} className="space-y-2">
                  <button
                    onClick={() => toggleCargo(cargo.tipo)}
                    className={cn(
                      'w-full p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between',
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cargo.cor }}
                      />
                      <span className="font-medium text-text-primary text-sm truncate">{cargo.nome}</span>
                    </div>
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center transition-all flex-shrink-0',
                        isSelected ? 'bg-primary text-white' : 'bg-muted'
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </button>

                  {/* INSTRUTOR_CLASSE: selecionar classe */}
                  {isSelected && cargo.tipo === 'INSTRUTOR_CLASSE' && (
                    <select
                      value={cargoItem?.classeId || ''}
                      onChange={(e) => updateCargoMeta(cargo.tipo, 'classeId', e.target.value)}
                      className="w-full p-2 rounded-lg border border-border bg-background text-text-primary text-sm"
                    >
                      <option value="">Selecione a classe</option>
                      {DEFAULT_CLASSES.map(cl => (
                        <option key={cl.id} value={cl.id}>{cl.nome}</option>
                      ))}
                    </select>
                  )}

                  {/* CONSELHEIRO / CONSELHEIRO_ASSOC: selecionar unidade */}
                  {isSelected && (cargo.tipo === 'CONSELHEIRO' || cargo.tipo === 'CONSELHEIRO_ASSOC') && (
                    <select
                      value={cargoItem?.unidadeId || ''}
                      onChange={(e) => updateCargoMeta(cargo.tipo, 'unidadeId', e.target.value)}
                      className="w-full p-2 rounded-lg border border-border bg-background text-text-primary text-sm"
                    >
                      <option value="">Selecione a unidade</option>
                      {unidades.map(u => (
                        <option key={u.id} value={u.id}>{u.nome}</option>
                      ))}
                    </select>
                  )}
                </div>
              );
            })}
          </div>

          {/* Campo para "Outro" */}
          {formData.cargos.some(c => c.tipo === 'OUTRO') && (
            <AppInput
              label="Descreva o cargo"
              value={formData.cargoObservacao}
              onChange={(e) => updateField('cargoObservacao', e.target.value)}
              placeholder="Ex: Comunicador"
            />
          )}

          {/* Classes em 2 colunas com logos */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-text-primary flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Classes em andamento
              </p>
              <AppBadge variant="info" size="sm">
                {formData.classesAtuais.length} classe{formData.classesAtuais.length !== 1 ? 's' : ''}
              </AppBadge>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DEFAULT_CLASSES.map((classe) => {
                const isSelected = formData.classesAtuais.includes(classe.id);
                const classesConcluidas = usuario?.classesConcluidas?.map(c => c.classeId) || [];

                return (
                  <button
                    key={classe.id}
                    onClick={() => toggleClasse(classe.id)}
                    className={cn(
                      'p-3 rounded-xl border-2 text-left transition-all',
                      isSelected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                        style={{ backgroundColor: classe.cor }}
                      >
                        {classe.imagem ? (
                          <img
                            src={classe.imagem}
                            alt={classe.nome}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-white text-lg font-bold">{classe.nome.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-text-primary text-sm block truncate">{classe.nome}</span>
                        {classesConcluidas.includes(classe.id) && (
                          <span className="text-xs text-success">Concluída</span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Unidade e Finalizar */}
      {step === 4 && (
        <div className="space-y-4">
          <AppSelect
            label="Unidade"
            value={formData.unidadeId}
            onChange={(value) => updateField('unidadeId', value)}
            options={[
              { value: '', label: 'Selecione a unidade' },
              ...unidades.map(u => ({ value: u.id, label: u.nome })),
            ]}
          />

          {formData.unidadeId && (
            <AppCard padding="sm" className="bg-primary/10 border-primary/30">
              {(() => {
                const unidade = unidades.find(u => u.id === formData.unidadeId);
                return unidade ? (
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${unidade.cores[0]}, ${unidade.cores[2]})`,
                      }}
                    >
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">{unidade.nome}</p>
                      <p className="text-xs text-muted">
                        {unidade.genero === 'M' ? 'Masculina' : 'Feminina'}
                      </p>
                    </div>
                  </div>
                ) : null;
              })()}
            </AppCard>
          )}

          {/* Resumo */}
          <AppCard padding="sm" className="bg-muted/30">
            <p className="text-sm font-semibold text-text-primary mb-3">Resumo</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Nome</span>
                <span className="font-medium text-text-primary">{formData.nome || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Categoria</span>
                <span className="font-medium text-text-primary">
                  {formData.categoriaMembro === 'DESBRAVADOR' ? 'Desbravador' :
                   formData.categoriaMembro === 'LIDER' ? 'Líder' : '-'}
                </span>
              </div>
              {formData.cargos.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-muted text-sm">Cargos</span>
                  <div className="flex flex-wrap gap-1">
                    {formData.cargos.map(c => {
                      const info = getCargoByTipo(c.tipo);
                      const detalhes: string[] = [];
                      if (c.tipo === 'INSTRUTOR_CLASSE' && c.classeId) {
                        const cl = getClasseById(c.classeId);
                        if (cl) detalhes.push(cl.nome);
                      }
                      if ((c.tipo === 'CONSELHEIRO' || c.tipo === 'CONSELHEIRO_ASSOC') && c.unidadeId) {
                        const un = unidades.find(u => u.id === c.unidadeId);
                        if (un) detalhes.push(un.nome);
                      }
                      return info ? (
                        <AppBadge key={c.tipo} size="sm" color={info.cor}>
                          {info.nome}{detalhes.length > 0 ? ` (${detalhes.join(', ')})` : ''}
                        </AppBadge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              {formData.classesAtuais.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted">Classes</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {formData.classesAtuais.map(classeId => {
                      const classe = getClasseById(classeId);
                      return classe ? (
                        <AppBadge key={classeId} size="sm" color={classe.cor}>
                          {classe.nome}
                        </AppBadge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Status</span>
                <span className={cn('font-medium', formData.ativo ? 'text-success' : 'text-danger')}>
                  {formData.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </AppCard>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 mt-6 pt-4 border-t border-border">
        {step > 1 && (
          <AppButton variant="secondary" onClick={handlePrev} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </AppButton>
        )}

        {step < totalSteps ? (
          <AppButton
            variant="primary"
            onClick={handleNext}
            className="flex-1"
            disabled={
              (step === 1 && (!formData.nome || !formData.dataNascimento)) ||
              (step === 2 && !formData.categoriaMembro)
            }
          >
            Continuar
            <ArrowRight className="w-4 h-4 ml-2" />
          </AppButton>
        ) : (
          <AppButton
            variant="primary"
            onClick={handleSubmit}
            className="flex-1"
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            {isSaving ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Membro'}
          </AppButton>
        )}
      </div>
    </AppModal>
  );
}