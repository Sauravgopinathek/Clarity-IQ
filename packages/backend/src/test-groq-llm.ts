import * as dotenv from 'dotenv';
import * as path from 'path';
import Groq from 'groq-sdk';

dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.GROQ_API_KEY || '';
const model = process.env.GROQ_LLM_MODEL || 'llama-3.3-70b-versatile';

async function test() {
  try {
    console.log(`Testing Groq LLM with model: ${model}`);
    const client = new Groq({ apiKey });

    const response = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: 'Return exactly {"ok":true} as JSON.' }],
      temperature: 0,
      response_format: { type: 'json_object' },
    });

    console.log('Response:', response.choices[0]?.message?.content);
  } catch (err) {
    console.error('Test error:', err);
  }
}

test();
