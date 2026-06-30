import { supabase } from '@/lib/supabase/client';

export interface Evento {
  id: string;
  clube_id: string;
  titulo: string;
  descricao?: string;
  data_evento: string;
  data_fim?: string;
  local?: string;
  relatorio?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  fotos?: EventoFoto[];
}

export interface EventoFoto {
  id: string;
  evento_id: string;
  url: string;
  created_at: string;
}

export async function getEventos(clubeId: string, mes?: number, ano?: number): Promise<Evento[]> {
  const now = new Date();
  const targetMes = mes ?? now.getMonth() + 1;
  const targetAno = ano ?? now.getFullYear();

  const primeiroDia = `${targetAno}-${String(targetMes).padStart(2, '0')}-01`;
  const ultimoDia = new Date(targetAno, targetMes, 0).toISOString().split('T')[0];

  let query = supabase
    .from('eventos')
    .select('*, fotos:eventos_fotos(*)')
    .eq('clube_id', clubeId)
    .gte('data_evento', primeiroDia)
    .lte('data_evento', ultimoDia)
    .order('data_evento', { ascending: true });

  const { data, error } = await query;

  if (error) {
    console.error('getEventos error:', JSON.stringify(error, null, 2));
    throw error;
  }
  return data || [];
}

export async function getEventosRecentes(clubeId: string, limite = 3): Promise<Evento[]> {
  const { data, error } = await supabase
    .from('eventos')
    .select('*, fotos:eventos_fotos(*)')
    .eq('clube_id', clubeId)
    .gte('data_evento', new Date().toISOString().split('T')[0])
    .order('data_evento', { ascending: true })
    .limit(limite);

  if (error) {
    console.error('getEventosRecentes error:', JSON.stringify(error));
    throw error;
  }
  return data || [];
}

export async function getEventoById(eventoId: string): Promise<Evento | null> {
  const { data, error } = await supabase
    .from('eventos')
    .select('*, fotos:eventos_fotos(*)')
    .eq('id', eventoId)
    .single();

  if (error) {
    console.error('getEventoById error:', JSON.stringify(error));
    throw error;
  }
  return data;
}

export async function criarEvento(evento: {
  clube_id: string;
  titulo: string;
  descricao?: string;
  data_evento: string;
  data_fim?: string;
  local?: string;
}): Promise<Evento> {
  const { data, error } = await supabase
    .from('eventos')
    .insert(evento)
    .select()
    .single();

  if (error) {
    console.error('criarEvento error:', JSON.stringify(error));
    throw error;
  }
  return data;
}

export async function atualizarEvento(
  id: string,
  updates: Partial<{
    titulo: string;
    descricao: string;
    data_evento: string;
    data_fim: string;
    local: string;
    relatorio: string;
  }>
): Promise<Evento> {
  const { data, error } = await supabase
    .from('eventos')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('atualizarEvento error:', JSON.stringify(error));
    throw error;
  }
  return data;
}

export async function deletarEvento(id: string): Promise<void> {
  const { error } = await supabase
    .from('eventos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('deletarEvento error:', JSON.stringify(error));
    throw error;
  }
}

export async function uploadFotoEvento(eventoId: string, file: File): Promise<EventoFoto> {
  const ext = file.name.split('.').pop() || 'jpg';
  const filePath = `eventos/${eventoId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('eventos')
    .upload(filePath, file);

  if (uploadError) {
    console.error('uploadFotoEvento storage error:', JSON.stringify(uploadError));
    throw uploadError;
  }

  const { data: urlData } = supabase.storage
    .from('eventos')
    .getPublicUrl(filePath);

  const url = urlData.publicUrl;

  const { data, error: dbError } = await supabase
    .from('eventos_fotos')
    .insert({ evento_id: eventoId, url })
    .select()
    .single();

  if (dbError) {
    console.error('uploadFotoEvento db error:', JSON.stringify(dbError));
    throw dbError;
  }

  return data;
}

export async function deletarFoto(fotoId: string, url: string): Promise<void> {
  const filePath = url.split('/').slice(-2).join('/');

  const { error: removeError } = await supabase.storage.from('eventos').remove([filePath]);
  if (removeError) console.error('deletarFoto storage error:', JSON.stringify(removeError));

  const { error } = await supabase
    .from('eventos_fotos')
    .delete()
    .eq('id', fotoId);

  if (error) {
    console.error('deletarFoto db error:', JSON.stringify(error));
    throw error;
  }
}
