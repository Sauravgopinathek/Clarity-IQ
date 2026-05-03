import * as dotenv from 'dotenv';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { analyzeAudio } from './services/ai';

dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('1. Setting up demo user and client in the database...');
    
    // Create or update demo user
    const demoUserId = 'demo-user-123';
    await prisma.user.upsert({
      where: { id: demoUserId },
      update: { email: 'demo@example.com' },
      create: { id: demoUserId, email: 'demo@example.com' }
    });
    
    // Create or update demo client
    let demoClient = await prisma.client.findFirst({
      where: { userId: demoUserId, name: 'Demo Client' }
    });
    
    if (!demoClient) {
      demoClient = await prisma.client.create({
        data: {
          name: 'Demo Client',
          domain: 'example.com',
          userId: demoUserId
        }
      });
    }
    
    console.log('Database setup complete. User ID:', demoUserId, 'Client ID:', demoClient.id);
    
    console.log('\n2. Fetching sample audio file (speech)...');
    // A sample public speech WAV file: Preamble to the US Constitution
    const audioUrl = 'https://www.signalogic.com/melp/EngSamples/Orig/male.wav';
    
    const response = await fetch(audioUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch sample audio: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);
    
    console.log(`Sample audio downloaded: ${audioBuffer.length} bytes.`);
    
    console.log('\n3. Calling Groq AI Services (Whisper ASR + LLM)...');
    console.log('This may take a few seconds...');
    
    // Call the AI service with the audio buffer and empty prior meetings
    const analysisResult = await analyzeAudio(audioBuffer, [], 'audio/wav');
    if (analysisResult.transcript === '') {
      throw new Error('Empty transcript returned');
    }
    
    console.log('\n======================================================');
    console.log('                   ANALYSIS RESULT                    ');
    console.log('======================================================');
    console.log('\n--- TRANSCRIPT ---');
    console.log(analysisResult.transcript);
    
    console.log('\n--- EXTRACTED KPI SUMMARY ---');
    console.log(analysisResult.summary);
    
    console.log('\n--- FULL JSON DATA ---');
    console.log(JSON.stringify(analysisResult, null, 2));
    
  } catch (err) {
    console.error('\nError during e2e test:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
