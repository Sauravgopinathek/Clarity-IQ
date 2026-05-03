/**
 * Deepgram Diarization Service
 *
 * Provides speaker-labeled transcription using Deepgram's Nova-3 model.
 * When a DEEPGRAM_API_KEY is present, this replaces Groq Whisper for
 * transcription and provides exact talk-time and speaker-turn data.
 */

import { DeepgramClient } from '@deepgram/sdk';

export type DiarizationResult = {
  /** Full transcript with [Rep]: / [Buyer]: labels on each turn */
  labeledTranscript: string;
  /** Plain transcript without speaker labels (fallback use) */
  plainTranscript: string;
  /** Rep talk time in seconds */
  repTalkSeconds: number;
  /** Buyer talk time in seconds */
  buyerTalkSeconds: number;
  /** Total duration in seconds */
  durationSeconds: number;
  /** Number of speaker turns (back-and-forth exchanges) */
  interactionCount: number;
  /** Formatted ratio string e.g. "45:55" (rep:buyer) */
  talkToListenRatio: string;
  /** Buyer participation as 0-100 integer */
  buyerParticipationRate: number;
};

type DeepgramWord = {
  word: string;
  start: number;
  end: number;
  speaker: number;
};

type DeepgramAlternative = {
  words?: DeepgramWord[];
};

type DeepgramChannel = {
  alternatives?: DeepgramAlternative[];
};

type DeepgramResult = {
  results?: {
    channels?: Array<{
      alternatives?: Array<{
        words?: DeepgramWord[];
      }>;
    }>;
  };
  metadata?: {
    duration?: number;
  };
};

/**
 * Transcribes audio with speaker diarization using Deepgram.
 * Returns labeled transcript, per-speaker timing, and engagement metrics.
 */
export async function transcribeWithDiarization(
  audioBuffer: Buffer,
  mimeType: string
): Promise<DiarizationResult> {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) throw new Error('Missing DEEPGRAM_API_KEY');

  const deepgram = new DeepgramClient({ apiKey });

  const result = await deepgram.listen.v1.media.transcribeFile(
    audioBuffer,
    {
      model: 'nova-3',
      diarize: true,
      punctuate: true,
      smart_format: true,
      language: 'en',
    }
  );

  if (!result) throw new Error('Deepgram returned no result');

  // DEBUG: Inspect the structure to fix the "no words" error
  console.log('[AI] Deepgram raw response:', JSON.stringify(result, null, 2).slice(0, 500));

  const deepgramResult = result as unknown as DeepgramResult | undefined;
  const words: DeepgramWord[] =
    deepgramResult?.results?.channels?.[0]?.alternatives?.[0]?.words ?? [];

  const durationSeconds = deepgramResult?.metadata?.duration ?? 0;

  if (!words.length) {
    throw new Error('Deepgram returned no words');
  }

  // ── Step 1: Calculate per-speaker talk time ──────────────────────────────
  const speakerTime: Record<number, number> = {};
  for (const word of words) {
    const duration = word.end - word.start;
    speakerTime[word.speaker] = (speakerTime[word.speaker] ?? 0) + duration;
  }

  // ── Step 2: Identify Rep vs Buyer (more talk time = Rep) ─────────────────
  const speakers = Object.keys(speakerTime).map(Number);
  const repSpeakerId =
    speakers.length === 1
      ? speakers[0]
      : speakers.reduce((a, b) => (speakerTime[a] > speakerTime[b] ? a : b));

  const repTalkSeconds = Math.round(speakerTime[repSpeakerId] ?? 0);
  const totalBuyerSeconds = Math.round(
    Object.entries(speakerTime)
      .filter(([id]) => Number(id) !== repSpeakerId)
      .reduce((sum, [, t]) => sum + t, 0)
  );

  const totalTalkSeconds = repTalkSeconds + totalBuyerSeconds;

  // ── Step 3: Build labeled transcript ─────────────────────────────────────
  type Turn = { speaker: number; text: string[] };
  const turns: Turn[] = [];
  let currentTurn: Turn | null = null;

  for (const word of words) {
    if (!currentTurn || currentTurn.speaker !== word.speaker) {
      currentTurn = { speaker: word.speaker, text: [] };
      turns.push(currentTurn);
    }
    currentTurn.text.push(word.word);
  }

  const plainTranscript = turns.map((t) => t.text.join(' ')).join(' ');
  const labeledTranscript = turns
    .map((t) => {
      const label = t.speaker === repSpeakerId ? '[Rep]' : '[Buyer]';
      return `${label}: ${t.text.join(' ')}`;
    })
    .join('\n');

  // ── Step 4: Compute engagement metrics ───────────────────────────────────
  const interactionCount = turns.length;
  const buyerParticipationRate =
    totalTalkSeconds > 0
      ? Math.round((totalBuyerSeconds / totalTalkSeconds) * 100)
      : 0;
  const repPercent =
    totalTalkSeconds > 0 ? Math.round((repTalkSeconds / totalTalkSeconds) * 100) : 50;
  const buyerPercent = 100 - repPercent;
  const talkToListenRatio = `${repPercent}:${buyerPercent}`;

  return {
    labeledTranscript,
    plainTranscript,
    repTalkSeconds,
    buyerTalkSeconds: totalBuyerSeconds,
    durationSeconds: Math.round(durationSeconds),
    interactionCount,
    talkToListenRatio,
    buyerParticipationRate,
  };
}

/** Returns true if a Deepgram API key is configured */
export function isDeepgramConfigured(): boolean {
  return Boolean(process.env.DEEPGRAM_API_KEY);
}
