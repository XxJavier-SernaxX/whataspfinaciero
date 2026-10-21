// ==============================================================================
// SERVICIO DE INTELIGENCIA ARTIFICIAL — Google Gemini (gratuito)
// ==============================================================================
// Reemplaza a OpenAI con el modelo gratuito de Google.
// Gemini 1.5 Flash entiende español perfectamente y devuelve JSON estructurado.

import { getGeminiModel } from '@/lib/gemini/client';
import { AIInterpretation } from '@/types/ai';

export class AIService {
  // ----------------------------------------------------------------------------
  // Instrucciones que le damos a la IA sobre cómo debe comportarse
  // ----------------------------------------------------------------------------
  private static systemPrompt = `
Eres el asistente financiero personal de Javier. Él te escribe mensajes por WhatsApp 
sobre sus finanzas y tú debes entender qué quiere hacer y responder SIEMPRE con un JSON válido.

REGLAS IMPORTANTES:
1. Existen DOS bolsillos/cuentas:
   - "personal": gastos e ingresos personales (comida, transporte, ropa, servicios del hogar, gimnasio, etc.)
   - "emprendimiento": ventas y costos del negocio de impresión 3D y Funkos

2. TIPOS de movimiento:
   - "ingreso": dinero que entra al bolsillo personal (sueldo, regalo, etc.)
   - "gasto": dinero que sale del bolsillo personal (comida, pasaje, etc.)
   - "venta": dinero que entra al emprendimiento (venta de Funkos, llaveros, impresiones)
   - "costo": dinero que sale del emprendimiento (filamento, resina, empaques, materiales)

3. CONVERSIÓN de cantidades:
   - "20 mil" → 20000
   - "20k" → 20000
   - "95 mil" → 95000
   - "un millón" → 1000000

4. Si NO puedes determinar si es personal o emprendimiento → usa account_type: "desconocido"

5. Responde SIEMPRE con este formato JSON exacto (sin texto adicional fuera del JSON):

{
  "action": "registrar_movimiento" | "consultar_saldo" | "consultar_resumen" | "consultar_ganancia" | "consultar_movimientos" | "crear_recordatorio" | "corregir_ultimo" | "eliminar_ultimo" | "pedir_aclaracion" | "otro",
  "movimiento": {
    "account_type": "personal" | "emprendimiento" | "desconocido",
    "type": "ingreso" | "gasto" | "venta" | "costo",
    "amount": 20000,
    "category": "comida",
    "description": "almuerzo en restaurante"
  },
  "recordatorio": {
    "title": "Gimnasio",
    "due_day": 23,
    "amount": 40000,
    "account_type": "personal"
  },
  "consulta": {
    "periodo": "hoy" | "semana" | "mes" | "año" | "historico",
    "account_type": "personal" | "emprendimiento" | "todas",
    "category": "filamento"
  },
  "mensaje_respuesta": "Mensaje amigable para el usuario en español"
}

NOTA: Solo incluye los campos relevantes según la acción detectada.
`;

  // ----------------------------------------------------------------------------
  // Interpretar un mensaje de texto del usuario
  // ----------------------------------------------------------------------------
  static async interpretMessage(userText: string): Promise<AIInterpretation> {
    const prompt = `${this.systemPrompt}\n\nMensaje del usuario: "${userText}"`;
    // Modelos activos y ultrarrápidos con fallback automático
    const candidateModels = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const model = getGeminiModel(modelName);
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // DEBUG: logueamos la respuesta cruda para diagnóstico en Vercel
        console.log(`[Gemini ${modelName}] Respuesta cruda:`, JSON.stringify(responseText));

        // Limpiamos bloques markdown ```json o ``` si vienen presentes
        const cleanedRaw = responseText
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim();

        // Extraemos el bloque JSON: buscamos el primer { y el último }
        const start = cleanedRaw.indexOf('{');
        const end = cleanedRaw.lastIndexOf('}');
        if (start === -1 || end === -1) {
          throw new Error('No se encontró JSON válido en la respuesta de Gemini');
        }
        const cleanedText = cleanedRaw.slice(start, end + 1);

        // Parseamos el JSON que devolvió Gemini
        const parsed = JSON.parse(cleanedText) as AIInterpretation;
        return parsed;
      } catch (err: any) {
        lastError = err;
        console.warn(`Aviso: fallo con el modelo ${modelName}, intentando siguiente...`, err?.message || err);
      }
    }

    console.error('Error final al interpretar mensaje con Gemini tras probar todos los modelos:', lastError);
    return {
      action: 'otro',
      mensaje_respuesta: `🤖 Disculpa, tuve un problema procesando tu mensaje (${lastError?.message || lastError}).`,
    };
  }
}
