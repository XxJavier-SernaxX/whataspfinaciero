// ==============================================================================
// CLIENTE DE CONEXIÓN A OPENAI
// ==============================================================================
// Este archivo inicializa el SDK oficial de OpenAI.
// Lo usaremos para comunicarnos con los modelos GPT (interpretación de texto y visión)
// y Whisper (transcripción de notas de voz).

import OpenAI from 'openai';

// Creamos la instancia utilizando la API key de las variables de entorno
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});
