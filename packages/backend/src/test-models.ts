import * as dotenv from 'dotenv';
import * as path from 'path';
import Groq from 'groq-sdk';

dotenv.config({ path: path.join(__dirname, '../.env') });

const apiKey = process.env.GROQ_API_KEY || '';

async function main() {
  const client = new Groq({ apiKey });
  try {
    const models = await client.models.list();
    console.log('Available Groq models:', models.data.map(m => m.id));
  } catch (err) {
    console.error('Error fetching models:', err);
  }
}

main();
