// ==============================================================================
// ENDPOINT DE DIAGNÓSTICO (/api/debug)
// ==============================================================================

import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function GET() {
  const token = process.env.WHATSAPP_TOKEN || '';
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';

  const steps: Record<string, any> = {
    whatsapp_config: {
      has_token: !!token,
      token_prefix: token.slice(0, 15) + '...',
      token_length: token.length,
      phone_id: phoneId,
    },
  };

  try {
    const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: '573170522712',
        type: 'text',
        text: {
          preview_url: false,
          body: '🤖 Mensaje de diagnóstico directo desde Vercel. Si lees esto, Vercel puede enviarte mensajes.',
        },
      }),
    });

    const status = res.status;
    const body = await res.json();
    steps.whatsapp_send_result = {
      status,
      response: body,
    };
  } catch (err: any) {
    steps.whatsapp_send_error = err.message;
  }

  return NextResponse.json(steps);
}
