import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasEnv: !!process.env.MAKE_WEBHOOK_URL,
    // jamás devuelvas la URL completa en producción, esto es solo para probar
  });
}
 