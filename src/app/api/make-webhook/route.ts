import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const webhookUrl = process.env.MAKE_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error('MAKE_WEBHOOK_URL no está definido en el backend');
      return NextResponse.json(
        { ok: false, error: 'Webhook no configurado en el servidor' },
        { status: 500 }
      );
    }

    // Body que te envía el frontend (por ejemplo, datos del formulario)
    const payload = await req.json();

    // Reenvía al webhook de Make
    const makeRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const makeText = await makeRes.text();

    // Devolvemos algo simple al frontend
    return NextResponse.json(
      {
        ok: makeRes.ok,
        status: makeRes.status,
        rawBody: makeText,
      },
      { status: makeRes.ok ? 200 : 500 }
    );
  } catch (err) {
    console.error('Error llamando a Make:', err);
    return NextResponse.json(
      { ok: false, error: 'Error interno al llamar a Make' },
      { status: 500 }
    );
  }
}
