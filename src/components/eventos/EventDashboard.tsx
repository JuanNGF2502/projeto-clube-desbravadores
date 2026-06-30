'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Calendar, List, ChevronLeft, ChevronRight, MapPin, Clock,
  Image as ImageIcon, Trash2, Pencil, X, Save, FileText, Loader2,
  Upload, ExternalLink
} from 'lucide-react';
import { AppCard } from '@/components/ui/AppCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppInput, AppTextarea } from '@/components/ui/AppInput';
import { AppModal } from '@/components/ui/AppModal';
import { AppBadge } from '@/components/ui/AppBadge';
import { AppEmptyState } from '@/components/ui/AppEmptyState';
import { useToast } from '@/components/ui/Toast';
import { useClubId, useAuth } from '@/hooks';
import { cn } from '@/utils/cn';
import { formatDateBR } from '@/utils/date';
import { getEventos, getEventoById, criarEvento, atualizarEvento, deletarEvento, uploadFotoEvento, deletarFoto, type Evento, type EventoFoto } from '@/lib/queries/eventos';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export function EventDashboard() {
  const clubId = useClubId();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'lista' | 'calendario'>('lista');
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ titulo: '', descricao: '', data_evento: '', data_fim: '', local: '' });

  const [detailEvento, setDetailEvento] = useState<Evento | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [relatorioText, setRelatorioText] = useState('');
  const [savingRelatorio, setSavingRelatorio] = useState(false);
  const [detailFotos, setDetailFotos] = useState<EventoFoto[]>([]);

  const carregarEventos = useCallback(async () => {
    if (!clubId) return;
    try {
      const data = await getEventos(clubId, mesAtual, anoAtual);
      setEventos(data);
    } catch {
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao carregar eventos' });
    } finally {
      setLoading(false);
    }
  }, [clubId, mesAtual, anoAtual, addToast]);

  useEffect(() => { carregarEventos(); }, [carregarEventos]);

  const diasNoMes = new Date(anoAtual, mesAtual, 0).getDate();
  const primeiroDiaSemana = new Date(anoAtual, mesAtual - 1, 1).getDay();

  const eventoPorData: Record<string, Evento[]> = {};
  eventos.forEach(e => {
    if (!eventoPorData[e.data_evento]) eventoPorData[e.data_evento] = [];
    eventoPorData[e.data_evento].push(e);
  });

  const hoje = new Date().toISOString().split('T')[0];
  const dias = Array.from({ length: diasNoMes }, (_, i) => {
    const dateStr = `${anoAtual}-${String(mesAtual).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
    return { dia: i + 1, dateStr, eventos: eventoPorData[dateStr] || [] };
  });

  const navigateMes = (dir: number) => {
    let novoMes = mesAtual + dir;
    let novoAno = anoAtual;
    if (novoMes > 12) { novoMes = 1; novoAno++; }
    if (novoMes < 1) { novoMes = 12; novoAno--; }
    setMesAtual(novoMes);
    setAnoAtual(novoAno);
  };

  const openFormModal = (evento?: Evento) => {
    if (evento) {
      setEditingEvento(evento);
      setForm({
        titulo: evento.titulo,
        descricao: evento.descricao || '',
        data_evento: evento.data_evento,
        data_fim: evento.data_fim || '',
        local: evento.local || '',
      });
    } else {
      setEditingEvento(null);
      setForm({ titulo: '', descricao: '', data_evento: '', data_fim: '', local: '' });
    }
    setFormModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.titulo.trim() || !form.data_evento || !clubId) return;
    setSaving(true);
    try {
      if (editingEvento) {
        await atualizarEvento(editingEvento.id, form);
        addToast({ type: 'success', title: 'Atualizado', message: 'Evento atualizado' });
      } else {
        await criarEvento({ ...form, clube_id: clubId });
        addToast({ type: 'success', title: 'Criado', message: 'Evento criado' });
      }
      setFormModalOpen(false);
      carregarEventos();
    } catch {
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao salvar evento' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este evento permanentemente?')) return;
    try {
      await deletarEvento(id);
      addToast({ type: 'success', title: 'Excluído', message: 'Evento removido' });
      setDetailModalOpen(false);
      setDetailEvento(null);
      carregarEventos();
    } catch {
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao excluir' });
    }
  };

  const openDetail = async (evento: Evento) => {
    try {
      const full = await getEventoById(evento.id);
      if (full) {
        setDetailEvento(full);
        setDetailFotos(full.fotos || []);
        setRelatorioText(full.relatorio || '');
      }
      setDetailModalOpen(true);
    } catch {
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao carregar detalhes' });
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !detailEvento) return;
    setUploading(true);
    try {
      const url = await uploadFotoEvento(detailEvento.id, file);
      setDetailFotos(prev => [...prev, { id: url, evento_id: detailEvento.id, url, created_at: new Date().toISOString() }]);
      addToast({ type: 'success', title: 'Foto adicionada', message: 'Upload concluído' });
    } catch {
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao fazer upload' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFoto = async (foto: EventoFoto) => {
    try {
      await deletarFoto(foto.id, foto.url);
      setDetailFotos(prev => prev.filter(f => f.id !== foto.id));
      addToast({ type: 'success', title: 'Removida', message: 'Foto removida' });
    } catch {
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao remover foto' });
    }
  };

  const handleSaveRelatorio = async () => {
    if (!detailEvento) return;
    setSavingRelatorio(true);
    try {
      await atualizarEvento(detailEvento.id, { relatorio: relatorioText });
      addToast({ type: 'success', title: 'Salvo', message: 'Relatório salvo' });
      carregarEventos();
    } catch {
      addToast({ type: 'error', title: 'Erro', message: 'Falha ao salvar relatório' });
    } finally {
      setSavingRelatorio(false);
    }
  };

  const isAdmin = true;
  const hasEventosFuturos = eventos.some(e => e.data_evento >= hoje);

  return (
    <AppCard className="p-0 overflow-hidden">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary">Eventos</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'lista' ? 'calendario' : 'lista')}
              className="p-1.5 rounded-lg hover:bg-surface transition-colors"
              title={viewMode === 'lista' ? 'Ver calendário' : 'Ver lista'}
            >
              {viewMode === 'lista' ? <Calendar className="w-4 h-4 text-muted" /> : <List className="w-4 h-4 text-muted" />}
            </button>
            <AppButton variant="primary" size="sm" onClick={() => openFormModal()}>
              <Plus className="w-3 h-3 mr-1" />
              Novo
            </AppButton>
          </div>
        </div>

        {viewMode === 'calendario' ? (
          /* Mini Calendário */
          <div>
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => navigateMes(-1)} className="p-1 hover:bg-surface rounded-lg transition-colors">
                <ChevronLeft className="w-4 h-4 text-muted" />
              </button>
              <span className="text-sm font-medium text-text-primary">
                {MESES[mesAtual - 1]} {anoAtual}
              </span>
              <button onClick={() => navigateMes(1)} className="p-1 hover:bg-surface rounded-lg transition-colors">
                <ChevronRight className="w-4 h-4 text-muted" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
              {DIAS_SEMANA.map(d => (
                <span key={d} className="text-[10px] text-muted font-medium py-1">{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: primeiroDiaSemana }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {dias.map(({ dia, dateStr, eventos: evs }) => {
                const isHoje = dateStr === hoje;
                const hasEvento = evs.length > 0;
                const isPassado = dateStr < hoje;
                return (
                  <button
                    key={dia}
                    onClick={() => {
                      if (hasEvento) {
                        if (evs.length === 1) openDetail(evs[0]);
                        else {
                          setViewMode('lista');
                          setMesAtual(parseInt(dateStr.split('-')[1]));
                          setAnoAtual(parseInt(dateStr.split('-')[0]));
                        }
                      }
                    }}
                    className={cn(
                      'aspect-square rounded-lg text-xs flex flex-col items-center justify-center transition-colors relative',
                      isHoje ? 'bg-primary/20 text-primary font-bold' : 'hover:bg-surface',
                      isPassado && !hasEvento ? 'opacity-40' : '',
                      hasEvento ? 'cursor-pointer' : 'cursor-default'
                    )}
                  >
                    {dia}
                    {hasEvento && <span className="w-1 h-1 rounded-full bg-primary absolute bottom-1" />}
                  </button>
                );
              })}
            </div>

            {eventos.length > 0 && (
              <div className="mt-3 space-y-1">
                {eventos.slice(0, 3).map(e => (
                  <button
                    key={e.id}
                    onClick={() => openDetail(e)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-surface transition-colors text-left"
                  >
                    <div className="w-1 h-8 rounded-full bg-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-primary truncate">{e.titulo}</p>
                      <p className="text-[10px] text-muted">{formatDateBR(e.data_evento)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Lista de Eventos */
          eventos.length > 0 ? (
            <div className="space-y-2">
              {eventos.slice(0, 5).map((evento, i) => {
                const isPassado = evento.data_evento < hoje;
                return (
                  <motion.button
                    key={evento.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => openDetail(evento)}
                    className={cn(
                      'w-full flex items-start gap-3 p-3 rounded-xl border transition-colors text-left',
                      isPassado ? 'border-border opacity-60' : 'border-border hover:border-primary/40'
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                      isPassado ? 'bg-muted/20' : 'bg-primary/20'
                    )}>
                      <Calendar className={cn('w-5 h-5', isPassado ? 'text-muted' : 'text-primary')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{evento.titulo}</p>
                      <p className="text-xs text-muted mt-0.5">{formatDateBR(evento.data_evento)}</p>
                      {evento.local && (
                        <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {evento.local}
                        </p>
                      )}
                      {(evento.fotos?.length || 0) > 0 && (
                        <p className="text-xs text-primary mt-0.5">
                          {evento.fotos!.length} foto{(evento.fotos!.length > 1 ? 's' : '')}
                        </p>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <AppEmptyState
              icon={<Calendar className="w-8 h-8 text-primary" />}
              title="Nenhum evento"
              description="Nenhum evento neste mês"
              action={!isAdmin ? undefined : { label: 'Criar Evento', onClick: () => openFormModal() }}
            />
          )
        )}
      </div>

      {/* Form Modal */}
      <AppModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingEvento ? 'Editar Evento' : 'Novo Evento'}
        size="md"
      >
        <div className="space-y-4">
          <AppInput
            label="Título *"
            placeholder="Nome do evento"
            value={form.titulo}
            onChange={e => setForm({ ...form, titulo: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Data *</label>
              <input
                type="date"
                value={form.data_evento}
                onChange={e => setForm({ ...form, data_evento: e.target.value })}
                className="w-full p-3 rounded-xl border border-border bg-card text-text-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Data Fim</label>
              <input
                type="date"
                value={form.data_fim}
                onChange={e => setForm({ ...form, data_fim: e.target.value })}
                className="w-full p-3 rounded-xl border border-border bg-card text-text-primary"
              />
            </div>
          </div>
          <AppInput
            label="Local"
            placeholder="Onde será o evento"
            value={form.local}
            onChange={e => setForm({ ...form, local: e.target.value })}
            leftIcon={<MapPin className="w-4 h-4 text-muted" />}
          />
          <AppTextarea
            label="Descrição"
            placeholder="Descrição do evento..."
            value={form.descricao}
            onChange={e => setForm({ ...form, descricao: e.target.value })}
            rows={3}
          />
          <div className="flex gap-3 pt-2">
            <AppButton variant="secondary" onClick={() => setFormModalOpen(false)} className="flex-1">
              Cancelar
            </AppButton>
            <AppButton onClick={handleSave} isLoading={saving} disabled={!form.titulo.trim() || !form.data_evento} className="flex-1">
              <Save className="w-4 h-4 mr-1" />
              {editingEvento ? 'Salvar' : 'Criar'}
            </AppButton>
          </div>
        </div>
      </AppModal>

      {/* Detail Modal */}
      <AppModal
        isOpen={detailModalOpen}
        onClose={() => { setDetailModalOpen(false); setDetailEvento(null); }}
        title={detailEvento?.titulo || 'Evento'}
        size="md"
      >
        {detailEvento && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-xl bg-card">
                <p className="text-xs text-muted mb-1">Data</p>
                <p className="font-medium text-text-primary">{formatDateBR(detailEvento.data_evento)}</p>
              </div>
              {detailEvento.data_fim && (
                <div className="p-3 rounded-xl bg-card">
                  <p className="text-xs text-muted mb-1">Data Fim</p>
                  <p className="font-medium text-text-primary">{formatDateBR(detailEvento.data_fim)}</p>
                </div>
              )}
              {detailEvento.local && (
                <div className="p-3 rounded-xl bg-card col-span-2">
                  <p className="text-xs text-muted mb-1">Local</p>
                  <p className="font-medium text-text-primary flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-primary" />
                    {detailEvento.local}
                  </p>
                </div>
              )}
            </div>

            {detailEvento.descricao && (
              <div>
                <h4 className="text-xs font-medium text-muted mb-1">Descrição</h4>
                <p className="text-sm text-text-primary">{detailEvento.descricao}</p>
              </div>
            )}

            {/* Fotos */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-muted">Fotos ({detailFotos.length})</h4>
                <label className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg cursor-pointer transition-colors',
                    'text-text-secondary hover:text-primary hover:bg-primary/5'
                  )}>
                  {uploading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Upload className="w-3 h-3" />
                  )}
                  Adicionar
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
              {detailFotos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {detailFotos.map(foto => (
                    <div key={foto.id} className="relative group rounded-xl overflow-hidden aspect-square bg-surface">
                      <img
                        src={foto.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleRemoveFoto(foto)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-surface text-center">
                  <ImageIcon className="w-6 h-6 text-muted mx-auto mb-1" />
                  <p className="text-xs text-muted">Nenhuma foto ainda</p>
                </div>
              )}
            </div>

            {/* Relatório */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-muted">Relatório</h4>
                <AppButton variant="ghost" size="sm" onClick={handleSaveRelatorio} isLoading={savingRelatorio}>
                  <Save className="w-3 h-3 mr-1" />
                  Salvar
                </AppButton>
              </div>
              <textarea
                placeholder="Descreva como foi o evento, destaques, aprendizados..."
                value={relatorioText}
                onChange={e => setRelatorioText(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-card text-text-primary text-sm min-h-[120px] resize-none"
                rows={5}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-border">
              <AppButton variant="secondary" onClick={() => openFormModal(detailEvento)} className="flex-1">
                <Pencil className="w-4 h-4 mr-1" />
                Editar
              </AppButton>
              <AppButton variant="danger" onClick={() => handleDelete(detailEvento.id)} className="flex-1">
                <Trash2 className="w-4 h-4 mr-1" />
                Excluir
              </AppButton>
            </div>
          </div>
        )}
      </AppModal>
    </AppCard>
  );
}
