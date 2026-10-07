// ==============================================================================
// ENDPOINT DE PRUEBA (/api/test)
// ==============================================================================
// Este endpoint nos permite probar el asistente SIN necesitar WhatsApp.
// Simplemente enviamos un texto por aquí y nos devuelve la respuesta.
//
// Para probarlo en el navegador:
// POST http://localhost:3000/api/test
// Body: { "texto": "gasté 20 mil en comida", "telefono": "573001234567" }

import { NextRequest, NextResponse } from 'next/server';
import { procesarMensaje } from '@/services/message-processor.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { texto, telefono } = body;

    // Validamos que vengan los datos necesarios
    if (!texto || typeof texto !== 'string') {
      return NextResponse.json(
        { error: 'El campo "texto" es obligatorio.' },
        { status: 400 }
      );
    }

    const userPhone = telefono || '573001234567'; // Número de prueba por defecto

    // Procesamos el mensaje exactamente igual que si viniera de WhatsApp
    const respuesta = await procesarMensaje(userPhone, texto);

    return NextResponse.json({
      input: texto,
      telefono: userPhone,
      respuesta,
    });
  } catch (error: any) {
    console.error('Error en endpoint de prueba:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', detalle: error.message },
      { status: 500 }
    );
  }
}

// GET → Para verificar que el servidor esté corriendo
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: '🤖 Asistente financiero activo. Usa POST con { texto, telefono } para probar.',
  });
}
