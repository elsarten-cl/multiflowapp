import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Leemos el body que nos manda la app
    const body = await req.json();

    // 2. Enviamos ese mismo body al webhook de Make
    const webhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error('MAKE_WEBHOOK_URL no está definido');
      return NextResponse.json(
        { ok: false, error: 'MAKE_WEBHOOK_URL no configurado' },
        { status: 500 }
      );
    }

    const makeRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const rawBody = await makeRes.text();

    return NextResponse.json(
      {
        ok: makeRes.ok,
        status: makeRes.status,
        rawBody,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error enviando a Make:', err);
    return NextResponse.json(
      { ok: false, error: 'Error interno enviando a Make' },
      { status: 500 }
    );
  }
}
