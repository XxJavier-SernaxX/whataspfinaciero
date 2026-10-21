// ==============================================================================
// ENDPOINT DE DIAGNÓSTICO (/api/debug)
// ==============================================================================
// Prueba Gemini directamente y devuelve la respuesta cruda para diagnóstico.
// NO requiere body - solo hace GET.

import { NextResponse } from 'next/server';
import { getGeminiModel } from '@/lib/gemini/client';

export const maxDuration = 60;

export async function GET() {
  const steps: Record<string, any> = {
    env: {
      gemini_key_prefix: (process.env.GEMINI_API_KEY || '').slice(0, 10) + '...',
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NO ENCONTRADO',
    },
  };

  try {
    const model = getGeminiModel('gemini-flash-latest');
    steps.model_created = true;

    const result = await model.generateContent(
      'Responde SOLO con este JSON exactamente, sin texto adicional: {"action":"ok","amount":20000}'
    );
    const rawText = result.response.text();
    steps.raw_response = rawText;
    steps.raw_length = rawText.length;
    steps.first_char_code = rawText.charCodeAt(0);
    steps.first_3_chars = rawText.slice(0, 3).split('').map((c: string) => `'${c}'(${c.charCodeAt(0)})`);

    const start = rawText.indexOf('{');
    const end = rawText.lastIndexOf('}');
    steps.json_start = start;
    steps.json_end = end;

    if (start !== -1 && end !== -1) {
      const extracted = rawText.slice(start, end + 1);
      steps.extracted = extracted;
      const parsed = JSON.parse(extracted);
      steps.parsed_ok = true;
      steps.parsed = parsed;
    } else {
      steps.error = 'No se encontró { } en la respuesta';
    }
  } catch (err: any) {
    steps.gemini_error = err.message;
    steps.error_stack = err.stack?.slice(0, 500);
  }

  return NextResponse.json(steps);
}
