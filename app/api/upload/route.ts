import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://api.lukeapp.cl';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

const supabaseAdmin = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Nombre único y limpio
    const ext = path.extname(file.name) || '.jpg';
    const filename = `billy-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;

    // Si se envió la URL de la imagen anterior, eliminarla del bucket para no acumular basura
    const oldImageUrl = formData.get('oldImageUrl') as string | null;
    if (oldImageUrl && supabaseAdmin && oldImageUrl.includes('/billy-images/')) {
      try {
        const parts = oldImageUrl.split('/billy-images/');
        const oldFilename = parts[1]?.split('?')[0];
        if (oldFilename) {
          await supabaseAdmin.storage.from('billy-images').remove([oldFilename]);
        }
      } catch (delErr) {
        console.warn('Error eliminando imagen anterior del bucket:', delErr);
      }
    }

    // Subir prioritariamente al bucket de Supabase
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.storage
        .from('billy-images')
        .upload(filename, buffer, {
          contentType: file.type || 'image/jpeg',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabaseAdmin.storage
          .from('billy-images')
          .getPublicUrl(filename);

        return NextResponse.json({
          url: publicUrlData.publicUrl,
          filename: filename,
          storage: 'supabase',
        });
      }

      if (error) {
        console.error('Error al subir a bucket Supabase billy-images:', error);
        return NextResponse.json(
          { error: `Error subiendo a bucket Supabase: ${error.message}` },
          { status: 500 }
        );
      }
    }

    // 2. Fallback local: guardar en /public/uploads/
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, buffer);

    return NextResponse.json({
      url: `/uploads/${filename}`,
      filename: filename,
      storage: 'local',
    });
  } catch (err: any) {
    console.error('Error in upload route:', err);
    return NextResponse.json({ error: err.message || 'Error al subir imagen' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'Falta la URL de la imagen' }, { status: 400 });
    }

    if (supabaseAdmin && url.includes('/billy-images/')) {
      const parts = url.split('/billy-images/');
      const filename = parts[1]?.split('?')[0];
      if (filename) {
        await supabaseAdmin.storage.from('billy-images').remove([filename]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting image from bucket:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
