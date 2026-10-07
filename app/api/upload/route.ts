import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

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

    // 1. Si Supabase está configurado, subir al bucket 'billy-images'
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.storage
        .from('billy-images')
        .upload(filename, buffer, {
          contentType: file.type || 'image/jpeg',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('billy-images')
          .getPublicUrl(filename);

        return NextResponse.json({
          url: publicUrlData.publicUrl,
          filename: filename,
          storage: 'supabase',
        });
      } else if (error) {
        console.warn('Supabase storage upload error, fallback a local:', error.message);
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
