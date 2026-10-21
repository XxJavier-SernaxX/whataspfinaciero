// ==============================================================================
// CLIENTE DE GOOGLE GEMINI (IA gratuita)
// ==============================================================================
// Gemini es la inteligencia artificial de Google.
// Modelo confirmado activo: gemini-flash-latest

import { GoogleGenerativeAI } from '@google/generative-ai';

// Obtenemos el modelo dinámicamente en cada petición para asegurar
// que lea la variable de entorno real en runtime dentro de Vercel.
// NOTA: NO usamos responseMimeType porque no todos los modelos lo soportan.
//       El sistema prompt ya le ordena a Gemini responder SOLO JSON.
export function getGeminiModel(modelName: string = 'gemini-flash-latest') {
  const apiKey = process.env.GEMINI_API_KEY || '';
  const genAI = new GoogleGenerativeAI(apiKey);

  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.1,
    },
  });
}
