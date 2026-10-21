// ==============================================================================
// WEBHOOK DE TWILIO PARA WHATSAPP (/api/twilio)
// ==============================================================================
// Twilio nos permite conectar WhatsApp sin pedir verificación de empresa,
// sin documentos comerciales y sin cobros sorpresa.
//
// FLUJO:
// 1. Javier escribe a WhatsApp de Twilio (+1 415 523 8886)
// 2. Twilio llama a este endpoint POST con: From, Body
// 3. procesarMensaje() consulta a Gemini y guarda en Supabase
// 4. Respondemos con TwiML XML y Twilio entrega la respuesta inmediatamente a WhatsApp

import { NextRequest, NextResponse } from 'next/server';
import { procesarMensaje } from '@/services/message-processor.service';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let from = '';
    let bodyText = '';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      from = (formData.get('From') as string) || '';
      bodyText = (formData.get('Body') as string) || '';
    } else {
      const json = await request.json().catch(() => ({}));
      from = json.From || json.from || '';
      bodyText = json.Body || json.body || json.texto || '';
    }

    // Limpiamos el número: Twilio envía "whatsapp:+573170522712"
    // Lo convertimos a formato limpio "573170522712"
    const userPhone = from.replace('whatsapp:', '').replace('+', '').trim() || '573170522712';
    const texto = bodyText.trim();

    console.log(`📩 [Twilio WhatsApp] Mensaje recibido de ${userPhone}: "${texto}"`);

    if (!texto) {
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?><Response><Message>🤔 No recibí ningún texto.</Message></Response>`,
        { status: 200, headers: { 'Content-Type': 'text/xml' } }
      );
    }

    // Procesamos con Gemini + Supabase
    const respuesta = await procesarMensaje(userPhone, texto);

    console.log(`✅ [Twilio WhatsApp] Respuesta para ${userPhone}: ${respuesta.slice(0, 50)}...`);

    // Escapamos caracteres especiales para XML seguro
    const safeXml = respuesta
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // TwiML directo: Twilio envía este mensaje inmediatamente al usuario en WhatsApp
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${safeXml}</Message>
</Response>`;

    return new NextResponse(twiml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml; charset=utf-8' },
    });
  } catch (error: any) {
    console.error('❌ Error en webhook de Twilio:', error);
    const twimlError = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>⚠️ Disculpa, hubo un error temporal procesando tu mensaje. Inténtalo de nuevo.</Message>
</Response>`;
    return new NextResponse(twimlError, {
      status: 200,
      headers: { 'Content-Type': 'text/xml; charset=utf-8' },
    });
  }
}

// GET para verificar que el endpoint esté activo
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Twilio WhatsApp Webhook',
    message: 'Endpoint listo para recibir peticiones de Twilio Sandbox.',
  });
}
