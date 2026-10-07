import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://api-oracle.lukeapp.cl';
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

const supabaseAdmin =
  supabaseUrl && serviceKey
    ? createClient(supabaseUrl, serviceKey, {
        db: { schema: 'billy' },
      })
    : null;

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }

  try {
    const [catsRes, prodsRes, eventsRes, configRes] = await Promise.all([
      supabaseAdmin.from('categorias').select('*').order('orden'),
      supabaseAdmin.from('productos').select('*').order('orden'),
      supabaseAdmin.from('eventos').select('*').order('orden'),
      supabaseAdmin.from('configuracion_tv').select('*'),
    ]);

    if (catsRes.error) console.error('Error fetching categorias:', catsRes.error);
    if (prodsRes.error) console.error('Error fetching productos:', prodsRes.error);

    return NextResponse.json({
      categorias: catsRes.data || [],
      productos: prodsRes.data || [],
      eventos: eventsRes.data || [],
      configTV: configRes.data || [],
    });
  } catch (err: any) {
    console.error('Error in /api/menu GET:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase no configurado' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { action, data, id } = body;

    switch (action) {
      case 'updateProducto': {
        const { data: updated, error } = await supabaseAdmin
          .from('productos')
          .update(data)
          .eq('id', data.id)
          .select();
        if (error) throw error;
        return NextResponse.json({ success: true, data: updated });
      }

      case 'updateCategoria': {
        const { data: updated, error } = await supabaseAdmin
          .from('categorias')
          .update(data)
          .eq('id', data.id)
          .select();
        if (error) throw error;
        return NextResponse.json({ success: true, data: updated });
      }

      case 'addProducto': {
        const { data: inserted, error } = await supabaseAdmin
          .from('productos')
          .insert(data)
          .select();
        if (error) throw error;
        return NextResponse.json({ success: true, data: inserted });
      }

      case 'deleteProducto': {
        const { error } = await supabaseAdmin
          .from('productos')
          .delete()
          .eq('id', id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }
  } catch (err: any) {
    console.error('Error in /api/menu POST:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
