import * as dotenv from 'dotenv';
import * as path from 'path';
import OpenAI from 'openai';

dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.NVIDIA_API_KEY || '';
const baseURL = process.env.NVIDIA_LLM_BASE_URL || 'https://integrate.api.nvidia.com/v1';

async function main() {
  const client = new OpenAI({ apiKey, baseURL });
  try {
    const models = await client.models.list();
    console.log('Available models:', models.data.map(m => m.id));
  } catch (err) {
    console.error('Error fetching models:', err);
  }
}

main();
