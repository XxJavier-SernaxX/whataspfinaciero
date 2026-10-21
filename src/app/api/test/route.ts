// ==============================================================================
// ENDPOINT DE PRUEBA (/api/test)
// ==============================================================================
// Este endpoint nos permite probar el asistente SIN necesitar WhatsApp.
// Simplemente enviamos un texto por aquí y nos devuelve la respuesta.
//
// Para probarlo:
// POST https://whataspfinaciero-egg7.vercel.app/api/test
// Body: { "texto": "gasté 20 mil en comida", "telefono": "573001234567" }

import { NextRequest, NextResponse } from 'next/server';
import { procesarMensaje } from '@/services/message-processor.service';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // Leemos el body como texto para evitar errores de JSON.parse en el layer de Next.js
  let rawBody = '';
  try {
    rawBody = await request.text();
  } catch (e: any) {
    return NextResponse.json({ error: 'No se pudo leer el body', detalle: e.message }, { status: 400 });
  }

  // Parseamos manualmente
  let body: any = {};
  try {
    body = JSON.parse(rawBody);
  } catch (e: any) {
    return NextResponse.json({
      error: 'Body no es JSON válido',
      detalle: e.message,
      rawBody: rawBody.slice(0, 200),
    }, { status: 400 });
  }

  const { texto, telefono } = body;

  if (!texto || typeof texto !== 'string') {
    return NextResponse.json(
      { error: 'El campo "texto" es obligatorio.' },
      { status: 400 }
    );
  }

  const userPhone = telefono || '573001234567';

  try {
    const respuesta = await procesarMensaje(userPhone, texto);
    return NextResponse.json({ input: texto, telefono: userPhone, respuesta });
  } catch (error: any) {
    console.error('Error en procesarMensaje:', error);
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        detalle: error.message,
        stack: error.stack?.slice(0, 500),
      },
      { status: 500 }
    );
  }
}

// GET → Para verificar que el servidor esté corriendo
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: '🤖 Asistente financiero activo. Usa POST con { texto, telefono } para probar.',
    commit: '0ffdba4',
  });
}
