import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { transcribeWithDiarization, isDeepgramConfigured } from './services/diarization';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function test() {
  if (!isDeepgramConfigured()) {
    console.error('❌ DEEPGRAM_API_KEY is not set in .env');
    process.exit(1);
  }

  // Use a sample WAV file if provided, otherwise print instructions
  const samplePath = process.argv[2];
  if (!samplePath || !fs.existsSync(samplePath)) {
    console.log('Usage: npx ts-node src/test-deepgram.ts <path-to-audio-file>');
    console.log('Example: npx ts-node src/test-deepgram.ts sample.wav');
    process.exit(0);
  }

  console.log(`Testing Deepgram diarization on: ${samplePath}`);
  const audioBuffer = fs.readFileSync(samplePath);
  const mimeType = samplePath.endsWith('.mp3') ? 'audio/mpeg'
    : samplePath.endsWith('.mp4') || samplePath.endsWith('.m4a') ? 'audio/mp4'
    : samplePath.endsWith('.wav') ? 'audio/wav'
    : 'audio/webm';

  try {
    const result = await transcribeWithDiarization(audioBuffer, mimeType);
    console.log('\n=== DIARIZATION RESULT ===');
    console.log(`Duration:             ${result.durationSeconds}s`);
    console.log(`Speaker Turns:        ${result.interactionCount}`);
    console.log(`Talk-to-Listen Ratio: ${result.talkToListenRatio} (Rep:Buyer)`);
    console.log(`Buyer Participation:  ${result.buyerParticipationRate}%`);
    console.log(`Rep Talk Time:        ${result.repTalkSeconds}s`);
    console.log(`Buyer Talk Time:      ${result.buyerTalkSeconds}s`);
    console.log('\n=== LABELED TRANSCRIPT (first 1000 chars) ===');
    console.log(result.labeledTranscript.slice(0, 1000));
  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();
