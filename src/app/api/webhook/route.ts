// ==============================================================================
// RUTA DE WEBHOOK PARA WHATSAPP (/api/webhook)
// ==============================================================================
// Aquí es donde Meta (WhatsApp) tocará la puerta de nuestro servidor.
//
// 1. GET: Se usa una sola vez cuando registramos el webhook en el panel de Meta.
//    Meta nos envía un código secreto (hub.verify_token) y nosotros le respondemos
//    con el "challenge" para demostrar que somos los dueños del servidor.
//
// 2. POST: Se ejecuta cada vez que tú envías un mensaje, audio o foto a tu bot.

import { NextRequest, NextResponse } from 'next/server';

// ------------------------------------------------------------------------------
// 1. Verificación del Webhook (GET)
// ------------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const myVerifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  // Verificamos que el modo sea 'subscribe' y que el token coincida con el nuestro
  if (mode === 'subscribe' && token === myVerifyToken) {
    console.log('✅ Webhook verificado correctamente por Meta');
    return new NextResponse(challenge, { status: 200 });
  }

  // Si el token no coincide, rechazamos la conexión
  return new NextResponse('Token de verificación inválido', { status: 403 });
}

// ------------------------------------------------------------------------------
// 2. Recepción de Mensajes (POST)
// ------------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Mostramos en consola lo que llega para poder inspeccionarlo en desarrollo
    console.log('📩 Evento recibido de WhatsApp:', JSON.stringify(body, null, 2));

    // Meta exige responder rápidamente con código 200 (OK)
    // para saber que el mensaje fue recibido con éxito.
    return NextResponse.json({ status: 'received' }, { status: 200 });
  } catch (error) {
    console.error('❌ Error procesando evento del webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
