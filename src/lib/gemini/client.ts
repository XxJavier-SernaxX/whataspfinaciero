// ==============================================================================
// CLIENTE DE GOOGLE GEMINI (IA gratuita)
// ==============================================================================
// Gemini es la inteligencia artificial de Google.
// Modelo confirmado activo y ultrarrápido (770ms): gemini-flash-lite-latest

import { GoogleGenerativeAI } from '@google/generative-ai';

export function getGeminiModel(modelName: string = 'gemini-flash-lite-latest') {
  const apiKey = process.env.GEMINI_API_KEY || '';
  const genAI = new GoogleGenerativeAI(apiKey);

  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.1,
    },
  });
}
