import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log('Datos recibidos:', body);

    return NextResponse.json({
      ok: true,
      recibido: body,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'Error procesando request' },
      { status: 500 }
    );
  }
}
