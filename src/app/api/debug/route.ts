import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Test queries
    const [clubes, unidades, membros, classes] = await Promise.all([
      supabase.from('clubes').select('*'),
      supabase.from('unidades').select('*'),
      supabase.from('membros').select('*'),
      supabase.from('classes').select('*').order('ordem'),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        clubes: clubes.data,
        unidades: unidades.data,
        membros: membros.data,
        classes: classes.data,
        clube_id: '00000000-0000-0000-0000-000000000001',
      },
      errors: {
        clubes: clubes.error?.message,
        unidades: unidades.error?.message,
        membros: membros.error?.message,
        classes: classes.error?.message,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}