const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/GEMINI_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : '';
console.log('API Key prefix:', apiKey.slice(0, 8) + '...');

const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  const m = 'gemini-flash-latest';
  const model = genAI.getGenerativeModel({
    model: m,
    generationConfig: { temperature: 0.1 }, // SIN responseMimeType
  });

  const prompt = `Eres el asistente financiero. El usuario dice: "gaste 20 mil en comida".
Responde SOLO con este JSON exacto sin texto adicional:
{"action":"registrar_movimiento","movimiento":{"account_type":"personal","type":"gasto","amount":20000,"category":"comida","description":"comida"}}`;

  const res = await model.generateContent(prompt);
  const text = res.response.text();
  console.log('Respuesta cruda:', JSON.stringify(text));
  
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    const extracted = text.slice(start, end + 1);
    const parsed = JSON.parse(extracted);
    console.log('JSON parseado OK:', JSON.stringify(parsed, null, 2));
  } else {
    console.log('ERROR: No se encontró JSON en la respuesta');
  }
}

test().catch(e => console.error('FATAL:', e.message));
