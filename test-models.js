const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/GEMINI_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : '';

const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  const m = 'gemini-3.8-flash';
  try {
    const model = genAI.getGenerativeModel({
      model: m,
      generationConfig: { responseMimeType: 'application/json' }
    });
    const res = await model.generateContent('Devuelve {"saludo": "hola Javier"}');
    console.log(`Model ${m}: SUCCESS ->`, res.response.text());
  } catch (e) {
    console.log(`Model ${m}: FAILED ->`, e.message);
  }
}

test();
