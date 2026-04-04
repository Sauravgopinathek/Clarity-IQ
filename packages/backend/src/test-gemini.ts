import * as dotenv from 'dotenv';
import * as path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: 'Return exactly {"ok":true} as JSON.',
      config: {
        responseMimeType: 'application/json',
        temperature: 0
      }
    });

    console.log(response.text);
  } catch (err) {
    console.error('Test error:', err);
  }
}

test();
