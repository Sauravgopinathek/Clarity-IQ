import OpenAI from 'openai';
import FormData from 'form-data';
import Groq from 'groq-sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const DEFAULT_MODEL = process.env.NVIDIA_LLM_MODEL || 'meta/llama-3.1-70b-instruct';
const NVIDIA_ASR_URL = process.env.NVIDIA_ASR_URL || 'https://ai.api.nvidia.com/v1/audio/transcriptions';
const NVIDIA_LLM_BASE_URL = process.env.NVIDIA_LLM_BASE_URL || 'https://integrate.api.nvidia.com/v1';

type MeetingSummary = {
  summaryJson: unknown;
  createdAt: Date;
};

// Evidence excerpt for KPI drill-down
type EvidenceExcerpt = {
  quote: string;           // Exact quote from transcript
  speaker: 'buyer' | 'rep' | 'unknown';
  sentiment: 'positive' | 'neutral' | 'negative';
  relevance: string;       // Why this quote matters for the KPI
  timestamp?: string;      // Approximate position in conversation
};

// Evidence map for all KPIs
type KpiEvidence = {
  sentimentScore?: EvidenceExcerpt[];
  momentumScore?: EvidenceExcerpt[];
  buyerEngagement?: EvidenceExcerpt[];
  objectionHandling?: EvidenceExcerpt[];
  buyingSignals?: EvidenceExcerpt[];
  riskIndicators?: EvidenceExcerpt[];
  customerIntent?: EvidenceExcerpt[];
  repEffectiveness?: EvidenceExcerpt[];
};

type AnalysisResult = {
  bant: {
    budget: string;
    authority: string;
    need: string;
    timeline: string;
  };
  vibe: {
    score: number;
    label: string;
    signals: string[];
  };
  dealArc: {
    momentum: 'Increasing' | 'Cooling' | 'Flat';
    resolvedObjections: string[];
  };
  summary: string;
  transcript: string;
  sentiment?: {
    score: number;
    label: 'Positive' | 'Neutral' | 'Negative';
    trend: 'Improving' | 'Declining' | 'Stable';
    stageSignals: Array<{
      stage: string;
      score: number;
      label: 'Positive' | 'Neutral' | 'Negative';
    }>;
  };
  operational?: {
    interactionCount: number;
    durationSeconds: number;
    talkTimeSeconds: number;
    holdTimeSeconds: number;
    customerInitiated: boolean;
  };
  customerIntent?: {
    primary: string;
    confidence: number;
    signals: string[];
  };
  objections?: {
    common: string[];
    unresolved: string[];
    frequency: number;
    resolutionRate: number;
  };
  buyerEngagement?: {
    talkToListenRatio: string;
    buyerParticipationRate: number;
    buyerQuestionCount: number;
    interruptionPattern: string;
    buyerQuestions?: string[];  // Actual questions asked by buyer
  };
  dealHealth?: {
    sentimentTrend: 'Improving' | 'Declining' | 'Stable';
    momentumScore: number;
    objectionFrequency: number;
    objectionResolutionRate: number;
  };
  buyingSignals?: {
    budgetSignal: string;
    timelineSignal: string;
    authoritySignal: string;
    competitorMentions: string[];
  };
  repEffectiveness?: {
    discoveryDepthScore: number;
    valueArticulationRate: number;
    objectionHandlingQuality: string;
    nextStepClarityScore: number;
  };
  risk?: {
    riskyLanguage: string[];
    confusionPoints: string[];
    overpromiseFlags: string[];
    skepticismSignals: string[];
    ghostingRisk: 'Low' | 'Medium' | 'High';
  };
  dimensions?: {
    product: string;
    geography: string;
    repTenure: string;
  };
  termMonitoring?: {
    trackedTerms: Array<{
      term: string;
      mentions: number;
      spike: boolean;
    }>;
  };
  // NEW: Evidence excerpts for KPI drill-down
  evidence?: KpiEvidence;
  error?: string;
};

function getNvidiaApiKey(): string {
  return process.env.NVIDIA_API_KEY || '';
}

function getNvidiaLLMClient(): OpenAI {
  return new OpenAI({
    apiKey: getNvidiaApiKey(),
    baseURL: NVIDIA_LLM_BASE_URL,
  });
}

async function transcribeAudioWithGroq(audioBuffer: Buffer, mimeType: string): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) throw new Error('Missing GROQ_API_KEY');

  const groq = new Groq({ apiKey: groqApiKey });
  const ext = mimeType.includes('wav') ? 'wav' : 'webm';
  const tempPath = path.join(os.tmpdir(), `clarityiq-${Date.now()}.${ext}`);
  
  fs.writeFileSync(tempPath, audioBuffer);

  try {
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tempPath),
      model: 'whisper-large-v3',
      language: 'en',
      response_format: 'text'
    });
    // Cleanup temp file
    fs.unlinkSync(tempPath);
    return transcription as unknown as string;
  } catch (error) {
    // Cleanup temp file even on error
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    console.error('Groq transcription error:', error);
    throw new Error('Audio transcription failed via Groq');
  }
}

function getFallbackAnalysis(errorMessage: string, transcript = ''): AnalysisResult {
  return {
    bant: { budget: '', authority: '', need: '', timeline: '' },
    vibe: { score: 50, label: 'Neutral', signals: [] },
    dealArc: { momentum: 'Flat', resolvedObjections: [] },
    summary: 'AI analysis failed or was skipped.',
    transcript,
    sentiment: {
      score: 50,
      label: 'Neutral',
      trend: 'Stable',
      stageSignals: []
    },
    operational: {
      interactionCount: 1,
      durationSeconds: 0,
      talkTimeSeconds: 0,
      holdTimeSeconds: 0,
      customerInitiated: true
    },
    customerIntent: {
      primary: 'Unknown',
      confidence: 0,
      signals: []
    },
    objections: {
      common: [],
      unresolved: [],
      frequency: 0,
      resolutionRate: 0
    },
    buyerEngagement: {
      talkToListenRatio: '0:0',
      buyerParticipationRate: 0,
      buyerQuestionCount: 0,
      interruptionPattern: 'Unknown'
    },
    dealHealth: {
      sentimentTrend: 'Stable',
      momentumScore: 50,
      objectionFrequency: 0,
      objectionResolutionRate: 0
    },
    buyingSignals: {
      budgetSignal: '',
      timelineSignal: '',
      authoritySignal: '',
      competitorMentions: []
    },
    repEffectiveness: {
      discoveryDepthScore: 0,
      valueArticulationRate: 0,
      objectionHandlingQuality: '',
      nextStepClarityScore: 0
    },
    risk: {
      riskyLanguage: [],
      confusionPoints: [],
      overpromiseFlags: [],
      skepticismSignals: [],
      ghostingRisk: 'Medium'
    },
    dimensions: {
      product: '',
      geography: '',
      repTenure: ''
    },
    termMonitoring: {
      trackedTerms: []
    },
    error: errorMessage
  };
}

function normalizeMomentum(value: unknown): 'Increasing' | 'Cooling' | 'Flat' {
  return value === 'Increasing' || value === 'Cooling' || value === 'Flat' ? value : 'Flat';
}

function normalizePercent(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.min(100, Math.round(value)))
    : 0;
}

function normalizeCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

function normalizeTrackedTerms(value: unknown): Array<{ term: string; mentions: number; spike: boolean }> {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const record = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};
      return {
        term: typeof record.term === 'string' ? record.term : '',
        mentions: normalizeCount(record.mentions),
        spike: record.spike === true
      };
    })
    .filter((item) => item.term.trim())
    .slice(0, 12);
}

function normalizeAnalysis(value: unknown): AnalysisResult {
  const record = typeof value === 'object' && value !== null ? (value as Record<string, any>) : {};
  const bant = typeof record.bant === 'object' && record.bant !== null ? record.bant : {};
  const vibe = typeof record.vibe === 'object' && record.vibe !== null ? record.vibe : {};
  const dealArc =
    typeof record.dealArc === 'object' && record.dealArc !== null ? record.dealArc : {};
  const sentiment =
    typeof record.sentiment === 'object' && record.sentiment !== null ? record.sentiment : {};
  const operational =
    typeof record.operational === 'object' && record.operational !== null ? record.operational : {};
  const customerIntent =
    typeof record.customerIntent === 'object' && record.customerIntent !== null
      ? record.customerIntent
      : {};
  const objections =
    typeof record.objections === 'object' && record.objections !== null ? record.objections : {};
  const buyerEngagement =
    typeof record.buyerEngagement === 'object' && record.buyerEngagement !== null
      ? record.buyerEngagement
      : {};
  const dealHealth =
    typeof record.dealHealth === 'object' && record.dealHealth !== null ? record.dealHealth : {};
  const buyingSignals =
    typeof record.buyingSignals === 'object' && record.buyingSignals !== null
      ? record.buyingSignals
      : {};
  const repEffectiveness =
    typeof record.repEffectiveness === 'object' && record.repEffectiveness !== null
      ? record.repEffectiveness
      : {};
  const risk = typeof record.risk === 'object' && record.risk !== null ? record.risk : {};
  const dimensions =
    typeof record.dimensions === 'object' && record.dimensions !== null ? record.dimensions : {};
  const termMonitoring =
    typeof record.termMonitoring === 'object' && record.termMonitoring !== null
      ? record.termMonitoring
      : {};

  return {
    bant: {
      budget: typeof bant.budget === 'string' ? bant.budget : '',
      authority: typeof bant.authority === 'string' ? bant.authority : '',
      need: typeof bant.need === 'string' ? bant.need : '',
      timeline: typeof bant.timeline === 'string' ? bant.timeline : ''
    },
    vibe: {
      score:
        typeof vibe.score === 'number' && Number.isFinite(vibe.score)
          ? Math.max(0, Math.min(100, vibe.score))
          : 50,
      label: typeof vibe.label === 'string' && vibe.label.trim() ? vibe.label : 'Neutral',
      signals: Array.isArray(vibe.signals)
        ? vibe.signals.filter((item: unknown): item is string => typeof item === 'string').slice(0, 5)
        : []
    },
    dealArc: {
      momentum: normalizeMomentum(dealArc.momentum),
      resolvedObjections: Array.isArray(dealArc.resolvedObjections)
        ? dealArc.resolvedObjections
            .filter((item: unknown): item is string => typeof item === 'string')
            .slice(0, 5)
        : []
    },
    summary:
      typeof record.summary === 'string' && record.summary.trim()
        ? record.summary
        : 'Meeting analyzed successfully.',
    transcript: typeof record.transcript === 'string' ? record.transcript : '',
    sentiment: {
      score:
        typeof sentiment.score === 'number' && Number.isFinite(sentiment.score)
          ? Math.max(0, Math.min(100, Math.round(sentiment.score)))
          : typeof vibe.score === 'number' && Number.isFinite(vibe.score)
            ? Math.max(0, Math.min(100, Math.round(vibe.score)))
            : 50,
      label:
        sentiment.label === 'Positive' || sentiment.label === 'Neutral' || sentiment.label === 'Negative'
          ? sentiment.label
          : 'Neutral',
      trend:
        sentiment.trend === 'Improving' || sentiment.trend === 'Declining' || sentiment.trend === 'Stable'
          ? sentiment.trend
          : 'Stable',
      stageSignals: Array.isArray(sentiment.stageSignals)
        ? sentiment.stageSignals
            .map((item: unknown) => {
              const stageRecord =
                typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};
              return {
                stage: typeof stageRecord.stage === 'string' ? stageRecord.stage : '',
                score:
                  typeof stageRecord.score === 'number' && Number.isFinite(stageRecord.score)
                    ? Math.max(0, Math.min(100, Math.round(stageRecord.score)))
                    : 50,
                label:
                  stageRecord.label === 'Positive' ||
                  stageRecord.label === 'Neutral' ||
                  stageRecord.label === 'Negative'
                    ? stageRecord.label
                    : 'Neutral'
              };
            })
            .filter((item: { stage: string }) => item.stage.trim().length > 0)
            .slice(0, 6)
        : []
    },
    operational: {
      interactionCount: normalizeCount(operational.interactionCount) || 1,
      durationSeconds: normalizeCount(operational.durationSeconds),
      talkTimeSeconds: normalizeCount(operational.talkTimeSeconds),
      holdTimeSeconds: normalizeCount(operational.holdTimeSeconds),
      customerInitiated: operational.customerInitiated !== false
    },
    customerIntent: {
      primary:
        typeof customerIntent.primary === 'string' && customerIntent.primary.trim()
          ? customerIntent.primary
          : 'Unknown',
      confidence: normalizePercent(customerIntent.confidence),
      signals: Array.isArray(customerIntent.signals)
        ? customerIntent.signals
            .filter(
              (item: unknown): item is string => typeof item === 'string' && item.trim().length > 0
            )
            .slice(0, 5)
        : []
    },
    objections: {
      common: Array.isArray(objections.common)
        ? objections.common
            .filter(
              (item: unknown): item is string => typeof item === 'string' && item.trim().length > 0
            )
            .slice(0, 8)
        : [],
      unresolved: Array.isArray(objections.unresolved)
        ? objections.unresolved
            .filter(
              (item: unknown): item is string => typeof item === 'string' && item.trim().length > 0
            )
            .slice(0, 8)
        : [],
      frequency: normalizeCount(objections.frequency),
      resolutionRate: normalizePercent(objections.resolutionRate)
    },
    buyerEngagement: {
      talkToListenRatio:
        typeof buyerEngagement.talkToListenRatio === 'string' && buyerEngagement.talkToListenRatio.trim()
          ? buyerEngagement.talkToListenRatio
          : '0:0',
      buyerParticipationRate: normalizePercent(buyerEngagement.buyerParticipationRate),
      buyerQuestionCount: normalizeCount(buyerEngagement.buyerQuestionCount),
      interruptionPattern:
        typeof buyerEngagement.interruptionPattern === 'string'
          ? buyerEngagement.interruptionPattern
          : 'Unknown'
    },
    dealHealth: {
      sentimentTrend:
        dealHealth.sentimentTrend === 'Improving' ||
        dealHealth.sentimentTrend === 'Declining' ||
        dealHealth.sentimentTrend === 'Stable'
          ? dealHealth.sentimentTrend
          : 'Stable',
      momentumScore: normalizePercent(dealHealth.momentumScore),
      objectionFrequency: normalizeCount(dealHealth.objectionFrequency),
      objectionResolutionRate: normalizePercent(dealHealth.objectionResolutionRate)
    },
    buyingSignals: {
      budgetSignal: typeof buyingSignals.budgetSignal === 'string' ? buyingSignals.budgetSignal : '',
      timelineSignal:
        typeof buyingSignals.timelineSignal === 'string' ? buyingSignals.timelineSignal : '',
      authoritySignal:
        typeof buyingSignals.authoritySignal === 'string' ? buyingSignals.authoritySignal : '',
      competitorMentions: Array.isArray(buyingSignals.competitorMentions)
        ? buyingSignals.competitorMentions
            .filter(
              (item: unknown): item is string => typeof item === 'string' && item.trim().length > 0
            )
            .slice(0, 6)
        : []
    },
    repEffectiveness: {
      discoveryDepthScore: normalizePercent(repEffectiveness.discoveryDepthScore),
      valueArticulationRate: normalizePercent(repEffectiveness.valueArticulationRate),
      objectionHandlingQuality:
        typeof repEffectiveness.objectionHandlingQuality === 'string'
          ? repEffectiveness.objectionHandlingQuality
          : '',
      nextStepClarityScore: normalizePercent(repEffectiveness.nextStepClarityScore)
    },
    risk: {
      riskyLanguage: Array.isArray(risk.riskyLanguage)
        ? risk.riskyLanguage
            .filter(
              (item: unknown): item is string => typeof item === 'string' && item.trim().length > 0
            )
            .slice(0, 6)
        : [],
      confusionPoints: Array.isArray(risk.confusionPoints)
        ? risk.confusionPoints
            .filter(
              (item: unknown): item is string => typeof item === 'string' && item.trim().length > 0
            )
            .slice(0, 6)
        : [],
      overpromiseFlags: Array.isArray(risk.overpromiseFlags)
        ? risk.overpromiseFlags
            .filter(
              (item: unknown): item is string => typeof item === 'string' && item.trim().length > 0
            )
            .slice(0, 6)
        : [],
      skepticismSignals: Array.isArray(risk.skepticismSignals)
        ? risk.skepticismSignals
            .filter(
              (item: unknown): item is string => typeof item === 'string' && item.trim().length > 0
            )
            .slice(0, 6)
        : [],
      ghostingRisk:
        risk.ghostingRisk === 'Low' || risk.ghostingRisk === 'Medium' || risk.ghostingRisk === 'High'
          ? risk.ghostingRisk
          : 'Medium'
    },
    dimensions: {
      product: typeof dimensions.product === 'string' ? dimensions.product : '',
      geography: typeof dimensions.geography === 'string' ? dimensions.geography : '',
      repTenure: typeof dimensions.repTenure === 'string' ? dimensions.repTenure : ''
    },
    termMonitoring: {
      trackedTerms: normalizeTrackedTerms(termMonitoring.trackedTerms)
    },
    error: typeof record.error === 'string' ? record.error : undefined
  };
}

function getTrackedTerms(): string[] {
  const raw = process.env.TRACKED_TERMS || '';
  return raw
    .split(',')
    .map((term) => term.trim())
    .filter(Boolean)
    .slice(0, 20);
}

function buildHistoryPrompt(previousMeetingSummaries: MeetingSummary[]): string {
  if (previousMeetingSummaries.length === 0) {
    return 'No prior meetings are available for this client.';
  }

  return previousMeetingSummaries
    .map((meeting, index) => {
      const createdAt =
        meeting.createdAt instanceof Date
          ? meeting.createdAt.toISOString()
          : new Date(meeting.createdAt).toISOString();

      return `Previous meeting ${index + 1} (${createdAt}): ${JSON.stringify(meeting.summaryJson)}`;
    })
    .join('\n');
}

async function analyzeWithNvidia(
  audioBuffer: Buffer,
  mimeType: string,
  previousMeetingSummaries: MeetingSummary[]
): Promise<AnalysisResult> {
  // Phase 1: Speech-to-Text via Groq Whisper API
  const transcript = await transcribeAudioWithGroq(audioBuffer, mimeType);

  if (!transcript.trim()) {
    return getFallbackAnalysis('Groq Whisper returned an empty transcript');
  }

  // Phase 2: Analyze transcript via NVIDIA NIM LLM
  const client = getNvidiaLLMClient();
  const historyContext = buildHistoryPrompt(previousMeetingSummaries);
  const trackedTerms = getTrackedTerms();
  const trackedTermsPrompt = trackedTerms.length
    ? `Tracked terms to monitor for spikes: ${trackedTerms.join(', ')}`
    : 'Tracked terms to monitor for spikes: none configured.';

  const systemPrompt = [
    'You analyze sales call transcripts and return only valid JSON.',
    'Extract a structured analysis with this exact top-level shape:',
    '{"bant":{"budget":"","authority":"","need":"","timeline":""},"vibe":{"score":0,"label":"","signals":[]},"dealArc":{"momentum":"Flat","resolvedObjections":[]},"sentiment":{"score":0,"label":"Neutral","trend":"Stable","stageSignals":[{"stage":"","score":0,"label":"Neutral"}]},"operational":{"interactionCount":1,"durationSeconds":0,"talkTimeSeconds":0,"holdTimeSeconds":0,"customerInitiated":true},"customerIntent":{"primary":"","confidence":0,"signals":[]},"objections":{"common":[],"unresolved":[],"frequency":0,"resolutionRate":0},"buyerEngagement":{"talkToListenRatio":"","buyerParticipationRate":0,"buyerQuestionCount":0,"interruptionPattern":""},"dealHealth":{"sentimentTrend":"Stable","momentumScore":0,"objectionFrequency":0,"objectionResolutionRate":0},"buyingSignals":{"budgetSignal":"","timelineSignal":"","authoritySignal":"","competitorMentions":[]},"repEffectiveness":{"discoveryDepthScore":0,"valueArticulationRate":0,"objectionHandlingQuality":"","nextStepClarityScore":0},"risk":{"riskyLanguage":[],"confusionPoints":[],"overpromiseFlags":[],"skepticismSignals":[],"ghostingRisk":"Medium"},"dimensions":{"product":"","geography":"","repTenure":""},"termMonitoring":{"trackedTerms":[{"term":"","mentions":0,"spike":false}]},"summary":"","transcript":""}',
    'Rules:',
    '- `vibe.score` must be an integer from 0 to 100.',
    '- `vibe.label` must be one of Excited, Neutral, Skeptical.',
    '- `dealArc.momentum` must be one of Increasing, Cooling, Flat.',
    '- `sentiment.score`, `buyerParticipationRate`, `resolutionRate`, `momentumScore`, `discoveryDepthScore`, `valueArticulationRate`, and `nextStepClarityScore` must be integers from 0 to 100.',
    '- `sentiment.label` and each stage signal label must be one of Positive, Neutral, Negative.',
    '- `sentiment.trend` and `dealHealth.sentimentTrend` must be one of Improving, Declining, Stable.',
    '- `risk.ghostingRisk` must be one of Low, Medium, High.',
    '- `operational.interactionCount` should usually be 1 for a single uploaded meeting.',
    '- If exact talk time or hold time cannot be determined, set them to 0.',
    '- Infer customer intent using labels like Exploring, Evaluation, Buying, Renewal, Support, or Unknown.',
    '- `dimensions.product`, `dimensions.geography`, and `dimensions.repTenure` should be concise and empty when unknown.',
    '- `termMonitoring.trackedTerms` must only include configured tracked terms that are mentioned or show a likely spike relative to prior meetings.',
    '- Keep `resolvedObjections` and `signals` concise.',
    '- If a field is unknown, use an empty string or empty array.',
    '- Summary should be 1 to 3 sentences and mention momentum relative to prior meetings when supported by context.',
    '- The `transcript` field in your JSON output must contain the full transcript provided below.',
    trackedTermsPrompt,
    `Prior meeting context:\n${historyContext}`
  ].join('\n');

  const response = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Analyze the following sales call transcript:\n\n${transcript}` }
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  });

  const text = response.choices[0]?.message?.content;
  if (!text) {
    throw new Error('NVIDIA LLM returned an empty response');
  }

  const parsed = normalizeAnalysis(JSON.parse(text));
  // Ensure transcript is preserved even if the LLM omitted it
  if (!parsed.transcript) {
    parsed.transcript = transcript;
  }
  return parsed;
}

export async function analyzeAudio(
  audioBuffer: Buffer,
  previousMeetingSummaries: MeetingSummary[],
  mimeType = 'audio/webm'
): Promise<AnalysisResult> {
  const apiKey = getNvidiaApiKey();

  if (!apiKey) {
    return getFallbackAnalysis('Missing NVIDIA_API_KEY');
  }

  try {
    return await analyzeWithNvidia(audioBuffer, mimeType, previousMeetingSummaries);
  } catch (error) {
    console.error('Error analyzing audio with NVIDIA:', error);
    return getFallbackAnalysis(error instanceof Error ? error.message : 'Unknown NVIDIA error');
  }
}

// KPI explanation metadata for generating contextual explanations
const KPI_EXPLANATIONS: Record<string, { name: string; description: string; businessContext: string }> = {
  sentimentScore: {
    name: 'Sentiment Score',
    description: 'A 0-100 measure of overall customer emotional tone during the conversation.',
    businessContext: 'High scores (70+) indicate positive reception; low scores (<40) signal concern or dissatisfaction that needs attention.'
  },
  avgDuration: {
    name: 'Average Conversation Duration',
    description: 'The typical length of customer interactions, including talk time and hold time.',
    businessContext: 'Longer conversations can indicate engaged buyers or complex issues; very short calls may suggest disinterest.'
  },
  customerInteractions: {
    name: 'Customer Interactions',
    description: 'Count of recorded customer-initiated touchpoints.',
    businessContext: 'More interactions typically indicate higher engagement and buying intent.'
  },
  customerIntent: {
    name: 'Customer Intent',
    description: 'The primary buying posture detected from conversation signals.',
    businessContext: 'Intent categories: Exploring (early stage), Evaluation (comparing options), Buying (ready to purchase), Renewal, Support.'
  },
  momentumScore: {
    name: 'Momentum Score',
    description: 'A 0-100 measure of deal progression velocity based on sentiment trends and engagement.',
    businessContext: 'Increasing momentum suggests deal is advancing; Cooling momentum requires immediate attention to prevent loss.'
  },
  objectionResolution: {
    name: 'Objection Resolution Rate',
    description: 'Percentage of customer objections that were successfully addressed during conversations.',
    businessContext: 'High resolution rates (>70%) indicate effective sales handling; low rates may predict deal stalls.'
  },
  talkToListenRatio: {
    name: 'Talk-to-Listen Ratio',
    description: 'Balance between rep speaking time vs. customer speaking time.',
    businessContext: 'Ideal ratio lets customer talk more (30:70 to 40:60). Too much rep talk can indicate poor discovery.'
  },
  buyerParticipation: {
    name: 'Buyer Participation Rate',
    description: 'Percentage of conversation time where the buyer actively engaged.',
    businessContext: 'Higher participation (>40%) signals genuine interest; low participation may indicate disengagement.'
  },
  buyerQuestionCount: {
    name: 'Buyer Question Density',
    description: 'Number of questions asked by the buyer during the conversation.',
    businessContext: 'More questions typically indicate active evaluation and interest in your solution.'
  },
  ghostingRisk: {
    name: 'Ghosting Risk',
    description: 'Likelihood that the prospect will stop responding based on engagement signals.',
    businessContext: 'High risk requires proactive outreach; Medium risk needs next-step clarity; Low risk indicates engaged buyer.'
  },
  dealHealth: {
    name: 'Deal Health & Momentum',
    description: 'Combined assessment of sentiment trends, objection handling, and deal progression.',
    businessContext: 'Tracks whether the deal is moving forward, stalling, or at risk of loss.'
  },
  buyingSignals: {
    name: 'Buying Signals',
    description: 'Detected indicators of purchase readiness: budget, timeline, and authority signals.',
    businessContext: 'Strong signals in all three areas (BANT) indicate high likelihood to close.'
  },
  repEffectiveness: {
    name: 'Rep Effectiveness',
    description: 'Scores measuring sales rep performance: discovery depth, value articulation, and objection handling.',
    businessContext: 'Helps identify coaching opportunities and best practices to replicate.'
  },
  riskIndicators: {
    name: 'Risk & Loss Indicators',
    description: 'Warning signs including skepticism language, confusion points, and over-promising.',
    businessContext: 'Early detection of risk factors allows proactive intervention before deal loss.'
  },
  funnelSentiment: {
    name: 'Funnel Stage Sentiment',
    description: 'Sentiment scores broken down by sales funnel stages.',
    businessContext: 'Identifies which stages have friction and where deals commonly stall or decline.'
  },
  patternTrace: {
    name: 'Pattern Trace & Term Spikes',
    description: 'Detects recurring patterns across conversations including product mentions, geographic trends, and term frequency spikes.',
    businessContext: 'Helps identify emerging themes, popular features, and potential market shifts across your customer conversations.'
  },
  historicalSentiment: {
    name: 'Historical Sentiment Shift',
    description: 'Timeline view of sentiment scores and momentum across all recorded meetings.',
    businessContext: 'Visualizes relationship health over time, helping identify when engagement improved or declined.'
  }
};

export type ExplanationRequest = {
  kpiKey: string;
  currentValue?: string | number;
  meetingSummary?: unknown;
  clientName?: string;
};

export type ExplanationResponse = {
  kpiKey: string;
  kpiName: string;
  explanation: string;
  actionableInsight?: string;
};

async function generateExplanationWithNvidiaLLM(
  kpiKey: string,
  kpiMeta: { name: string; description: string; businessContext: string },
  currentValue: string | number | undefined,
  meetingSummary: unknown,
  clientName?: string
): Promise<ExplanationResponse> {
  const client = getNvidiaLLMClient();
  const summaryContext = meetingSummary ? JSON.stringify(meetingSummary) : 'No meeting data available yet.';
  const clientContext = clientName ? `for client "${clientName}"` : '';
  const valueContext = currentValue !== undefined ? `Current value: ${currentValue}` : '';

  const prompt = [
    'You are a sales intelligence assistant explaining KPIs to business users.',
    'Generate a brief, actionable explanation for a dashboard metric.',
    '',
    `KPI: ${kpiMeta.name}`,
    `Definition: ${kpiMeta.description}`,
    `Business Context: ${kpiMeta.businessContext}`,
    valueContext,
    '',
    `Meeting Analysis Data ${clientContext}:`,
    summaryContext,
    '',
    'Return JSON with this exact shape:',
    '{"explanation":"2-3 sentence explanation of what this metric shows and why it has this value based on the meeting data","actionableInsight":"1 sentence specific action the sales rep should take"}',
    '',
    'Rules:',
    '- Write for non-technical business users',
    '- Reference specific details from the meeting data when available',
    '- Keep explanation under 50 words',
    '- Make actionableInsight specific and practical',
    '- If no meeting data, explain what the metric will show once data is available'
  ].join('\n');

  const response = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const text = response.choices[0]?.message?.content;
  if (!text) {
    throw new Error('NVIDIA LLM returned empty response for explanation');
  }

  const parsed = JSON.parse(text);
  return {
    kpiKey,
    kpiName: kpiMeta.name,
    explanation: typeof parsed.explanation === 'string' ? parsed.explanation : kpiMeta.description,
    actionableInsight: typeof parsed.actionableInsight === 'string' ? parsed.actionableInsight : undefined
  };
}

export async function explainKpi(request: ExplanationRequest): Promise<ExplanationResponse> {
  const apiKey = getNvidiaApiKey();
  const kpiMeta = KPI_EXPLANATIONS[request.kpiKey];

  if (!kpiMeta) {
    return {
      kpiKey: request.kpiKey,
      kpiName: request.kpiKey,
      explanation: 'This metric is not yet documented. Please contact support for more information.'
    };
  }

  if (!apiKey) {
    return {
      kpiKey: request.kpiKey,
      kpiName: kpiMeta.name,
      explanation: `${kpiMeta.description} ${kpiMeta.businessContext}`
    };
  }

  try {
    return await generateExplanationWithNvidiaLLM(
      request.kpiKey,
      kpiMeta,
      request.currentValue,
      request.meetingSummary,
      request.clientName
    );
  } catch (error) {
    console.error('Error generating KPI explanation:', error);
    return {
      kpiKey: request.kpiKey,
      kpiName: kpiMeta.name,
      explanation: `${kpiMeta.description} ${kpiMeta.businessContext}`
    };
  }
}

// KPI Evidence Extraction Types
export type EvidenceExcerptResponse = {
  quote: string;
  speaker: 'buyer' | 'rep' | 'unknown';
  sentiment: 'positive' | 'neutral' | 'negative';
  relevance: string;
  timestamp?: string;
};

export type KpiEvidenceResponse = {
  kpiKey: string;
  kpiName: string;
  kpiValue?: string | number;
  summary: string;
  excerpts: EvidenceExcerptResponse[];
  transcript: string;
};

// Map KPI keys to the relevant data paths in the analysis
const KPI_EVIDENCE_CONFIG: Record<string, { name: string; focusAreas: string; extractionPrompt: string }> = {
  sentimentScore: {
    name: 'Sentiment Score',
    focusAreas: 'emotional tone, positive/negative language, enthusiasm, frustration, satisfaction signals',
    extractionPrompt: 'Extract quotes showing emotional tone - positive expressions (excitement, agreement, satisfaction) and negative expressions (frustration, skepticism, disappointment). Focus on buyer emotional state.'
  },
  momentumScore: {
    name: 'Momentum Score',
    focusAreas: 'deal progression signals, commitment language, next steps, urgency, stalling indicators',
    extractionPrompt: 'Extract quotes showing deal momentum - forward movement signals (scheduling next steps, asking about implementation, discussing contracts) and stalling signals (postponement, uncertainty, need to consult others).'
  },
  buyerEngagement: {
    name: 'Buyer Engagement',
    focusAreas: 'buyer questions, participation level, active listening signals, interruption patterns',
    extractionPrompt: 'Extract buyer questions and engagement signals - questions asked by buyer, expressions of interest, requests for clarification, and moments of active participation.'
  },
  buyerQuestionCount: {
    name: 'Buyer Question Density',
    focusAreas: 'all questions asked by the buyer, inquiry patterns, curiosity signals',
    extractionPrompt: 'Extract ALL questions asked by the buyer during the conversation. Include direct questions and implied questions. Note the nature of each question (discovery, clarification, objection, buying signal).'
  },
  objectionResolution: {
    name: 'Objection Handling',
    focusAreas: 'objections raised, concerns expressed, how they were addressed, resolution success',
    extractionPrompt: 'Extract objections and concerns raised by the buyer, followed by how the rep addressed them. Note whether each objection was resolved, partially addressed, or left unresolved.'
  },
  buyingSignals: {
    name: 'Buying Signals',
    focusAreas: 'budget mentions, timeline discussions, authority signals, competitive mentions',
    extractionPrompt: 'Extract BANT-related signals - any discussion of budget/pricing, timeline/urgency, decision-making authority, and competitor mentions.'
  },
  customerIntent: {
    name: 'Customer Intent',
    focusAreas: 'buying intent signals, evaluation stage indicators, decision readiness',
    extractionPrompt: 'Extract quotes indicating buyer intent - are they exploring, evaluating, ready to buy, or seeking support? Look for commitment language and decision signals.'
  },
  riskIndicators: {
    name: 'Risk Indicators',
    focusAreas: 'skepticism, confusion, over-promises, ghosting risk signals',
    extractionPrompt: 'Extract warning signals - buyer skepticism, confusion moments, rep over-promising, and any indicators the buyer may disengage (vague responses, avoiding commitment).'
  },
  repEffectiveness: {
    name: 'Rep Effectiveness',
    focusAreas: 'discovery depth, value articulation, objection handling, next step clarity',
    extractionPrompt: 'Extract examples of rep performance - good/poor discovery questions, how well they articulated value, objection handling quality, and clarity of proposed next steps.'
  },
  dealHealth: {
    name: 'Deal Health',
    focusAreas: 'overall deal progression, relationship quality, commitment level',
    extractionPrompt: 'Extract quotes showing overall deal health - positive signs (engagement, commitment, enthusiasm) and concerning signs (hesitation, pushback, disengagement).'
  },
  talkToListenRatio: {
    name: 'Talk-to-Listen Ratio',
    focusAreas: 'speaking balance, who dominates conversation, listening quality',
    extractionPrompt: 'Identify patterns showing who dominated the conversation. Extract examples of rep monologues, buyer extended responses, and conversational balance.'
  }
};

async function extractKpiEvidenceWithNvidiaLLM(
  kpiKey: string,
  kpiConfig: { name: string; focusAreas: string; extractionPrompt: string },
  transcript: string,
  meetingSummary: unknown,
  kpiValue?: string | number
): Promise<KpiEvidenceResponse> {
  const client = getNvidiaLLMClient();
  const summaryContext = meetingSummary ? JSON.stringify(meetingSummary) : '{}';

  const prompt = [
    `You are analyzing a sales conversation transcript to extract evidence for the "${kpiConfig.name}" metric.`,
    '',
    '## Task',
    kpiConfig.extractionPrompt,
    '',
    '## Focus Areas',
    kpiConfig.focusAreas,
    '',
    kpiValue !== undefined ? `## Current KPI Value: ${kpiValue}` : '',
    '',
    '## Meeting Analysis Context',
    summaryContext,
    '',
    '## Transcript',
    transcript,
    '',
    '## Output Format',
    'Return valid JSON with this exact structure:',
    '{',
    '  "summary": "2-3 sentence summary explaining how the conversation contributed to this KPI score",',
    '  "excerpts": [',
    '    {',
    '      "quote": "Exact quote from transcript (keep concise, 1-3 sentences max)",',
    '      "speaker": "buyer" or "rep" or "unknown",',
    '      "sentiment": "positive" or "neutral" or "negative",',
    '      "relevance": "Brief explanation of why this quote matters for this KPI"',
    '    }',
    '  ]',
    '}',
    '',
    'Rules:',
    '- Extract 3-8 most relevant excerpts, prioritizing the most impactful quotes',
    '- Use exact quotes from the transcript (minor cleanup for readability is OK)',
    '- Keep each quote concise - focus on the key phrase or statement',
    '- Identify speaker as buyer/rep based on context',
    '- Summary should directly explain the KPI score'
  ].join('\n');

  const response = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const text = response.choices[0]?.message?.content;
  if (!text) {
    throw new Error('NVIDIA LLM returned an empty response');
  }

  const parsed = JSON.parse(text);
  
  // Normalize and validate the response
  const excerpts: EvidenceExcerptResponse[] = Array.isArray(parsed.excerpts)
    ? parsed.excerpts
        .filter((e: any) => typeof e.quote === 'string' && e.quote.trim())
        .map((e: any) => ({
          quote: e.quote.trim(),
          speaker: ['buyer', 'rep', 'unknown'].includes(e.speaker) ? e.speaker : 'unknown',
          sentiment: ['positive', 'neutral', 'negative'].includes(e.sentiment) ? e.sentiment : 'neutral',
          relevance: typeof e.relevance === 'string' ? e.relevance : '',
          timestamp: typeof e.timestamp === 'string' ? e.timestamp : undefined
        }))
        .slice(0, 10)
    : [];

  return {
    kpiKey,
    kpiName: kpiConfig.name,
    kpiValue,
    summary: typeof parsed.summary === 'string' ? parsed.summary : `Analysis of ${kpiConfig.name} from conversation.`,
    excerpts,
    transcript
  };
}

export type KpiEvidenceRequest = {
  kpiKey: string;
  transcript: string;
  meetingSummary?: unknown;
  kpiValue?: string | number;
};

export async function extractKpiEvidence(request: KpiEvidenceRequest): Promise<KpiEvidenceResponse> {
  const apiKey = getNvidiaApiKey();
  const kpiConfig = KPI_EVIDENCE_CONFIG[request.kpiKey];

  // Fallback for unknown KPI
  if (!kpiConfig) {
    return {
      kpiKey: request.kpiKey,
      kpiName: request.kpiKey,
      kpiValue: request.kpiValue,
      summary: 'Evidence extraction is not available for this metric.',
      excerpts: [],
      transcript: request.transcript
    };
  }

  // No API key - return empty evidence
  if (!apiKey) {
    return {
      kpiKey: request.kpiKey,
      kpiName: kpiConfig.name,
      kpiValue: request.kpiValue,
      summary: 'AI analysis requires API key configuration.',
      excerpts: [],
      transcript: request.transcript
    };
  }

  // No transcript available
  if (!request.transcript || request.transcript.trim().length === 0) {
    return {
      kpiKey: request.kpiKey,
      kpiName: kpiConfig.name,
      kpiValue: request.kpiValue,
      summary: 'No transcript available for this meeting. Evidence cannot be extracted.',
      excerpts: [],
      transcript: ''
    };
  }

  try {
    return await extractKpiEvidenceWithNvidiaLLM(
      request.kpiKey,
      kpiConfig,
      request.transcript,
      request.meetingSummary,
      request.kpiValue
    );
  } catch (error) {
    console.error('Error extracting KPI evidence:', error);
    return {
      kpiKey: request.kpiKey,
      kpiName: kpiConfig.name,
      kpiValue: request.kpiValue,
      summary: 'Unable to extract evidence at this time.',
      excerpts: [],
      transcript: request.transcript
    };
  }
}
