// ==============================================================================
// CLIENTE DE GOOGLE GEMINI (IA gratuita)
// ==============================================================================
// Gemini es la inteligencia artificial de Google.
// El modelo "gemini-1.5-flash" es gratis y muy capaz para entender lenguaje natural.

import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializamos el cliente con la clave de la variable de entorno
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Exportamos el modelo listo para usar en el servicio de IA
// gemini-3.8-flash: el modelo más reciente y recomendado para nuevas cuentas
export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-3.8-flash',
  generationConfig: {
    // Le decimos a Gemini que siempre responda en formato JSON
    responseMimeType: 'application/json',
    temperature: 0.1, // Más bajo = respuestas más precisas y consistentes
  },
});
