import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

type SyncError = {
  id: string;
  error: string;
};

type SyncResultItem = {
  synced: number;
  created: number;
  updated: number;
  errors: SyncError[];
};

type SyncResults = {
  membros: SyncResultItem;
  unidades: SyncResultItem;
  avaliacoes: SyncResultItem;
  classes: SyncResultItem;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clubId, lastSync, changes } = body;

    if (!clubId) {
      return NextResponse.json(
        { error: 'clubId é obrigatório' },
        { status: 400 }
      );
    }

    const results: SyncResults = {
      membros: { synced: 0, created: 0, updated: 0, errors: [] },
      unidades: { synced: 0, created: 0, updated: 0, errors: [] },
      avaliacoes: { synced: 0, created: 0, updated: 0, errors: [] },
      classes: { synced: 0, created: 0, updated: 0, errors: [] },
    };

    // Processar membros
    if (changes?.membros) {
      for (const membro of changes.membros) {
        try {
          if (membro._action === 'create') {
            const { data, error } = await supabase
              .from('membros')
              .insert({
                id: membro.id,
                nome: membro.nome,
                sexo: membro.sexo,
                data_nascimento: membro.data_nascimento,
                telefone: membro.telefone,
                email: membro.email,
                foto: membro.foto,
                ativo: membro.ativo ?? true,
                clube_id: clubId,
                unidade_id: membro.unidade_id,
              })
              .select()
              .single();

            if (error) throw error;
            results.membros.created++;
          } else if (membro._action === 'update') {
            const { error } = await supabase
              .from('membros')
              .update(membro)
              .eq('id', membro.id);

            if (error) throw error;
            results.membros.updated++;
          }
        } catch (err: any) {
          results.membros.errors.push({ id: membro.id, error: err.message });
        }
      }
      results.membros.synced = results.membros.created + results.membros.updated;
    }

    // Processar avaliações
    if (changes?.avaliacoes) {
      for (const avaliacao of changes.avaliacoes) {
        try {
          if (avaliacao._action === 'create') {
            const { data, error } = await supabase
              .from('avaliacoes')
              .insert({
                membro_id: avaliacao.membro_id,
                unidade_id: avaliacao.unidade_id,
                criterio_id: avaliacao.criterio_id,
                nivel: avaliacao.nivel,
                pontos: avaliacao.pontos,
                data: avaliacao.data || new Date().toISOString().split('T')[0],
                observacao: avaliacao.observacao,
              })
              .select()
              .single();

            if (error) throw error;
            results.avaliacoes.created++;
          }
        } catch (err: any) {
          results.avaliacoes.errors.push({ id: avaliacao.id, error: err.message });
        }
      }
      results.avaliacoes.synced = results.avaliacoes.created + results.avaliacoes.updated;
    }

    // Buscar dados atualizados desde o último sync
    const sinceDate = lastSync || '1970-01-01';

    const [membros, unidades, avaliacoes, classes] = await Promise.all([
      // Membros
      lastSync
        ? supabase
            .from('membros')
            .select('*')
            .eq('clube_id', clubId)
            .gte('updated_at', sinceDate)
        : Promise.resolve({ data: [], error: null }),

      // Unidades
      lastSync
        ? supabase
            .from('unidades')
            .select('*')
            .eq('clube_id', clubId)
            .gte('updated_at', sinceDate)
        : Promise.resolve({ data: [], error: null }),

      // Avaliações dos últimos 30 dias
      supabase
        .from('avaliacoes')
        .select('*')
        .in(
          'unidade_id',
          (await supabase.from('unidades').select('id').eq('clube_id', clubId)).data?.map((u) => u.id) || []
        )
        .gte('data', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),

      // Classes
      supabase
        .from('classes')
        .select('*'),
    ]);

    return NextResponse.json({
      success: true,
      synced: results,
      data: {
        membros: membros.data || [],
        unidades: unidades.data || [],
        avaliacoes: avaliacoes.data || [],
        classes: classes.data || [],
      },
      serverTime: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Erro na sincronização', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('clubId');
    const lastSync = searchParams.get('lastSync');

    if (!clubId) {
      return NextResponse.json(
        { error: 'clubId é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar dados desde o último sync
    const sinceDate = lastSync || '1970-01-01';

    const [membros, unidades, avaliacoes, classes, transicoes] = await Promise.all([
      supabase
        .from('membros')
        .select('*')
        .eq('clube_id', clubId)
        .gte('updated_at', sinceDate),

      supabase
        .from('unidades')
        .select('*')
        .eq('clube_id', clubId)
        .gte('updated_at', sinceDate),

      supabase
        .from('avaliacoes')
        .select('*')
        .gte('updated_at', sinceDate),

      supabase
        .from('classes')
        .select('*'),

      supabase
        .from('transicoes')
        .select('*')
        .gte('created_at', sinceDate),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        membros: membros.data || [],
        unidades: unidades.data || [],
        avaliacoes: avaliacoes.data || [],
        classes: classes.data || [],
        transicoes: transicoes.data || [],
      },
      serverTime: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Sync GET error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados', details: error.message },
      { status: 500 }
    );
  }
}