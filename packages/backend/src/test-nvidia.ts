import * as dotenv from 'dotenv';
import * as path from 'path';
import OpenAI from 'openai';

dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.NVIDIA_API_KEY || '';
const baseURL = process.env.NVIDIA_LLM_BASE_URL || 'https://integrate.api.nvidia.com/v1';
const model = process.env.NVIDIA_LLM_MODEL || 'meta/llama-3.1-70b-instruct';

async function test() {
  try {
    const client = new OpenAI({ apiKey, baseURL });

    const response = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: 'Return exactly {"ok":true} as JSON.' }],
      temperature: 0,
      response_format: { type: 'json_object' },
    });

    console.log(response.choices[0]?.message?.content);
  } catch (err) {
    console.error('Test error:', err);
  }
}

test();
