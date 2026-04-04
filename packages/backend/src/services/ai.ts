import { GoogleGenAI } from '@google/genai';

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

type MeetingSummary = {
  summaryJson: unknown;
  createdAt: Date;
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
  error?: string;
};

function getGeminiApiKey(): string {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  // The @google/genai SDK often gets confused if GOOGLE_API_KEY is present in the global env, 
  // overriding what we pass in. So we explicitly delete it from the environment.
  if (process.env.GOOGLE_API_KEY) {
    delete process.env.GOOGLE_API_KEY;
  }
  return new GoogleGenAI({ apiKey });
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

async function analyzeWithGemini(
  audioBuffer: Buffer,
  mimeType: string,
  previousMeetingSummaries: MeetingSummary[]
): Promise<AnalysisResult> {
  const ai = getGeminiClient();
  const historyContext = buildHistoryPrompt(previousMeetingSummaries);
  const trackedTerms = getTrackedTerms();
  const trackedTermsPrompt = trackedTerms.length
    ? `Tracked terms to monitor for spikes: ${trackedTerms.join(', ')}`
    : 'Tracked terms to monitor for spikes: none configured.';

  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: [
      {
        text: [
          'You analyze sales call audio and return only valid JSON.',
          'First, transcribe the meeting audio as accurately as possible.',
          'Then extract a structured analysis with this exact top-level shape:',
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
          '- If exact talk time or hold time cannot be determined from the audio/transcript, set them to 0.',
          '- Infer customer intent using labels like Exploring, Evaluation, Buying, Renewal, Support, or Unknown.',
          '- `dimensions.product`, `dimensions.geography`, and `dimensions.repTenure` should be concise and empty when unknown.',
          '- `termMonitoring.trackedTerms` must only include configured tracked terms that are mentioned or show a likely spike relative to prior meetings.',
          '- Keep `resolvedObjections` and `signals` concise.',
          '- If a field is unknown, use an empty string or empty array.',
          '- Summary should be 1 to 3 sentences and mention momentum relative to prior meetings when supported by context.',
          trackedTermsPrompt,
          `Prior meeting context:\n${historyContext}`
        ].join('\n')
      },
      {
        inlineData: {
          mimeType,
          data: audioBuffer.toString('base64')
        }
      }
    ],
    config: {
      responseMimeType: 'application/json',
      temperature: 0.2
    }
  });

  if (!response.text) {
    throw new Error('Gemini returned an empty response');
  }

  return normalizeAnalysis(JSON.parse(response.text));
}

export async function analyzeAudio(
  audioBuffer: Buffer,
  previousMeetingSummaries: MeetingSummary[],
  mimeType = 'audio/webm'
): Promise<AnalysisResult> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return getFallbackAnalysis('Missing GEMINI_API_KEY');
  }

  try {
    return await analyzeWithGemini(audioBuffer, mimeType, previousMeetingSummaries);
  } catch (error) {
    console.error('Error analyzing audio with Gemini:', error);
    return getFallbackAnalysis(error instanceof Error ? error.message : 'Unknown Gemini error');
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

async function generateExplanationWithGemini(
  kpiKey: string,
  kpiMeta: { name: string; description: string; businessContext: string },
  currentValue: string | number | undefined,
  meetingSummary: unknown,
  clientName?: string
): Promise<ExplanationResponse> {
  const ai = getGeminiClient();
  const summaryContext = meetingSummary ? JSON.stringify(meetingSummary) : 'No meeting data available yet.';
  const clientContext = clientName ? `for client "${clientName}"` : '';
  const valueContext = currentValue !== undefined ? `Current value: ${currentValue}` : '';

  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: [
      {
        text: [
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
        ].join('\n')
      }
    ],
    config: {
      responseMimeType: 'application/json',
      temperature: 0.3
    }
  });

  if (!response.text) {
    throw new Error('Gemini returned empty response for explanation');
  }

  const parsed = JSON.parse(response.text);
  return {
    kpiKey,
    kpiName: kpiMeta.name,
    explanation: typeof parsed.explanation === 'string' ? parsed.explanation : kpiMeta.description,
    actionableInsight: typeof parsed.actionableInsight === 'string' ? parsed.actionableInsight : undefined
  };
}

export async function explainKpi(request: ExplanationRequest): Promise<ExplanationResponse> {
  const apiKey = getGeminiApiKey();
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
    return await generateExplanationWithGemini(
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
