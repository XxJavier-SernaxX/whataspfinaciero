// ==============================================================================
// CLIENTE DE GOOGLE GEMINI (IA gratuita)
// ==============================================================================
// Gemini es la inteligencia artificial de Google.
// El modelo "gemini-1.5-flash" es gratis y muy capaz para entender lenguaje natural.

import { GoogleGenerativeAI } from '@google/generative-ai';

// Obtenemos el modelo dinámicamente en cada petición para asegurar
// que lea la variable de entorno real en runtime dentro de Vercel.
export function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY || '';
  const genAI = new GoogleGenerativeAI(apiKey);

  return genAI.getGenerativeModel({
    model: 'gemini-3.8-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  });
}
