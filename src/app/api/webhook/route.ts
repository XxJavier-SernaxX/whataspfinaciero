// ==============================================================================
// WEBHOOK DE WHATSAPP (/api/webhook) — VERSIÓN COMPLETA
// ==============================================================================
// Aquí Meta nos envía todos los mensajes que le escribes al bot.
//
// GET → Verificación inicial (solo se usa una vez cuando configuras el webhook en Meta)
// POST → Cada mensaje que tú envíes por WhatsApp llega aquí

import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppWebhookPayload } from '@/types/whatsapp';
import { procesarMensaje } from '@/services/message-processor.service';
import { sendWhatsAppMessage } from '@/lib/whatsapp/client';

// ------------------------------------------------------------------------------
// GET: Verificación del Webhook con Meta
// ------------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const myVerifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === myVerifyToken) {
    console.log('✅ Webhook verificado correctamente por Meta');
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Token de verificación inválido', { status: 403 });
}

// ------------------------------------------------------------------------------
// POST: Recepción y procesamiento de mensajes
// ------------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📩 Evento de WhatsApp recibido:', JSON.stringify(body, null, 2));

    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    // Si es una actualización de estado (enviado, entregado, fallido)
    if (value?.statuses) {
      const status = value.statuses[0];
      console.log(`📊 Estado del mensaje ${status.id}: ${status.status}`);
      if (status.errors) {
        console.error('❌ Error de entrega de Meta:', JSON.stringify(status.errors, null, 2));
      }
      return NextResponse.json({ status: 'ok' }, { status: 200 });
    }

    const messages = value?.messages;

    // Si no hay mensajes en el evento (puede ser una notificación de estado), ignoramos
    if (!messages || messages.length === 0) {
      return NextResponse.json({ status: 'ok' }, { status: 200 });
    }

    // Tomamos el primer mensaje del evento
    const mensaje = messages[0];
    const userPhone = mensaje.from; // Número del usuario que te escribió

    // Por ahora solo procesamos mensajes de texto
    // (Audio e imágenes se agregarán en fases posteriores)
    if (mensaje.type !== 'text' || !mensaje.text?.body) {
      await sendWhatsAppMessage(
        userPhone,
        '🤖 Por ahora solo entiendo texto. Pronto también podré procesar audios y fotos.'
      );
      return NextResponse.json({ status: 'ok' }, { status: 200 });
    }

    const textoUsuario = mensaje.text.body;
    console.log(`📩 Mensaje de ${userPhone}: ${textoUsuario}`);

    // Procesamos el mensaje con la IA y obtenemos la respuesta
    const respuesta = await procesarMensaje(userPhone, textoUsuario);

    // Enviamos la respuesta de vuelta al usuario por WhatsApp
    await sendWhatsAppMessage(userPhone, respuesta);
    console.log(`✅ Respuesta enviada a ${userPhone}`);

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('❌ Error en el webhook:', error);
    // Siempre respondemos 200 a Meta para que no reintente el evento
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}
