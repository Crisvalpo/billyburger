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

      case 'addCategoria': {
        const catData = { ...data };
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!catData.id || !uuidRegex.test(catData.id)) {
          delete catData.id;
        }

        if (!catData.slug && catData.nombre) {
          catData.slug = catData.nombre
            .toLowerCase()
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        }

        if (catData.orden === undefined || catData.orden === null) {
          const { data: countData } = await supabaseAdmin
            .from('categorias')
            .select('orden')
            .order('orden', { ascending: false })
            .limit(1);
          catData.orden = countData && countData.length > 0 ? (countData[0].orden || 0) + 1 : 1;
        }

        if (catData.activo === undefined) {
          catData.activo = true;
        }

        const { data: inserted, error } = await supabaseAdmin
          .from('categorias')
          .insert(catData)
          .select();
        if (error) {
          console.error('Error insertando en categorias:', error);
          throw error;
        }
        return NextResponse.json({ success: true, data: inserted?.[0] || inserted });
      }

      case 'deleteCategoria': {
        const { error } = await supabaseAdmin
          .from('categorias')
          .delete()
          .eq('id', id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      case 'addProducto': {
        const prodData = { ...data };
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        // Si el id no es un UUID válido de 36 caracteres, eliminarlo para que Postgres use gen_random_uuid()
        if (!prodData.id || !uuidRegex.test(prodData.id)) {
          delete prodData.id;
        }

        // Si categoria_id no es un UUID válido, asignar el primer ID de categoría válido
        if (!prodData.categoria_id || !uuidRegex.test(prodData.categoria_id)) {
          const { data: cat } = await supabaseAdmin
            .from('categorias')
            .select('id')
            .order('orden')
            .limit(1)
            .single();
          if (cat?.id) {
            prodData.categoria_id = cat.id;
          }
        }

        const { data: inserted, error } = await supabaseAdmin
          .from('productos')
          .insert(prodData)
          .select();
        if (error) {
          console.error('Error insertando en productos:', error);
          throw error;
        }
        return NextResponse.json({ success: true, data: inserted?.[0] || inserted });
      }

      case 'deleteProducto': {
        const { error } = await supabaseAdmin
          .from('productos')
          .delete()
          .eq('id', id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      case 'updateConfigTV': {
        const payload = { ...data };
        delete payload.id;
        delete payload.created_at;
        payload.actualizado_el = new Date().toISOString();

        const { data: updated, error } = await supabaseAdmin
          .from('configuracion_tv')
          .update(payload)
          .eq('pantalla_id', payload.pantalla_id)
          .select();
        if (error) {
          console.error('Error in updateConfigTV:', error);
          throw error;
        }
        return NextResponse.json({ success: true, data: updated });
      }

      case 'updateAllConfigTV': {
        const list = Array.isArray(data) ? data : [data];
        const results = [];
        for (const item of list) {
          const payload = { ...item };
          delete payload.id;
          delete payload.created_at;
          payload.actualizado_el = new Date().toISOString();

          const { data: updated, error } = await supabaseAdmin
            .from('configuracion_tv')
            .update(payload)
            .eq('pantalla_id', payload.pantalla_id)
            .select();
          if (error) {
            console.error('Error in updateAllConfigTV:', error);
            throw error;
          }
          if (updated) results.push(...updated);
        }
        return NextResponse.json({ success: true, data: results });
      }

      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }
  } catch (err: any) {
    console.error('Error in /api/menu POST:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
