// ==============================================================================
// SERVICIO DE INTELIGENCIA ARTIFICIAL (AI SERVICE)
// ==============================================================================
// Este módulo utiliza la API de OpenAI para:
// 1. Interpretar lenguaje natural y convertirlo en acciones estructuradas (JSON).
// 2. Reconocer si un movimiento es personal o del emprendimiento.
// 3. Devolver datos limpios para que el backend decida qué registrar.

import { openai } from '@/lib/openai/client';
import { AIInterpretation } from '@/types/ai';

export class AIService {
  // ----------------------------------------------------------------------------
  // Prompt del sistema con instrucciones claras para la IA
  // ----------------------------------------------------------------------------
  private static systemPrompt = `
Eres el asistente financiero inteligente de Javier. Tu trabajo es interpretar mensajes de finanzas enviados por WhatsApp.
IMPORTANTE:
- Existen dos bolsillos/cuentas: "personal" y "emprendimiento".
- Las compras de insumos para negocio (ej: filamento, resina, empaques, pintura, impresiones 3D) corresponden a "emprendimiento" como "costo".
- Las ventas de productos (ej: Funkos, llaveros, impresiones 3D) corresponden a "emprendimiento" como "venta".
- Los gastos cotidianos (ej: comida, almuerzo, pasajes, ropa, servicios del hogar, gimnasio) corresponden a "personal" como "gasto".
- Los ingresos personales (ej: sueldo, nómina, regalo) corresponden a "personal" como "ingreso".
- Si no estás seguro si es personal o del emprendimiento, indica account_type: "desconocido" y pide aclaración amablemente en mensaje_respuesta.
- Cuando el usuario mencione cifras como "20 mil", "20k", debes interpretarlas como 20000.
- Devuelve SIEMPRE tu respuesta en formato JSON válido que cumpla con la estructura requerida.
`;

  // ----------------------------------------------------------------------------
  // Interpretar texto recibido del usuario
  // ----------------------------------------------------------------------------
  static async interpretMessage(userText: string): Promise<AIInterpretation> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Rápido, económico y muy preciso
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: userText },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2, // Respuestas deterministas y exactas
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Respuesta vacía de OpenAI');
      }

      const parsed = JSON.parse(content) as AIInterpretation;
      return parsed;
    } catch (error) {
      console.error('Error al interpretar mensaje con OpenAI:', error);
      return {
        action: 'otro',
        mensaje_respuesta: 'Disculpa, tuve un problema entendiendo tu mensaje. ¿Podrías repetirlo?',
      };
    }
  }
}
