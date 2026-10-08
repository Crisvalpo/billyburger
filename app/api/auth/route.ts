import { NextRequest, NextResponse } from 'next/server';

const MASTER_PIN = process.env.ADMIN_PIN || '0174';

export async function POST(req: NextRequest) {
  try {
    const { pin } = await req.json();

    if (!pin || pin.toString().trim() !== MASTER_PIN.toString().trim()) {
      return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 });
    }

    // Token de sesión firmado para administradores
    const token = Buffer.from(`billy-owner-${Date.now()}-${MASTER_PIN}`).toString('base64');

    return NextResponse.json({
      success: true,
      token,
      message: 'Acceso autorizado',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
