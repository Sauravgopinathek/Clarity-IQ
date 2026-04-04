import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log('Testing with API key:', apiKey?.substring(0, 10) + '...');

const ai = new GoogleGenAI({ apiKey });

async function run() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: 'hello'
    });
    console.log('Success!', response.text);
  } catch (e) {
    console.error('generateContent failed:', e.message);
  }
}

run();
