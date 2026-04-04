import {
  Activity,
  CheckCircle2,
  Clock3,
  Target,
  TrendingUp,
  Users,
  MessageSquare,
  UserCheck,
  HelpCircle,
  ShieldAlert,
  Sparkles,
  BarChart3,
  AlertTriangle,
  History,
  DollarSign,
} from 'lucide-react';

export type KpiMetadata = {
  key: string;
  label: string;
  icon: typeof Activity;
  accent: string;
  bgColor: string;
  description: string;
};

// Main KPI cards (top 6 metrics)
export const mainKpis: KpiMetadata[] = [
  {
    key: 'sentimentScore',
    label: 'Sentiment Score',
    icon: Activity,
    accent: '#2563eb',
    bgColor: '#eff6ff',
    description: 'Overall customer emotional tone during conversations',
  },
  {
    key: 'avgDuration',
    label: 'Avg Conversation Duration',
    icon: Clock3,
    accent: '#7c3aed',
    bgColor: '#f5f3ff',
    description: 'Typical length of customer interactions',
  },
  {
    key: 'customerInteractions',
    label: 'Customer Interactions',
    icon: Users,
    accent: '#0f766e',
    bgColor: '#ecfeff',
    description: 'Count of recorded customer touchpoints',
  },
  {
    key: 'customerIntent',
    label: 'Customer Intent',
    icon: Target,
    accent: '#ea580c',
    bgColor: '#fff7ed',
    description: 'Detected buying posture from conversation signals',
  },
  {
    key: 'momentumScore',
    label: 'Momentum Score',
    icon: TrendingUp,
    accent: '#16a34a',
    bgColor: '#f0fdf4',
    description: 'Deal progression velocity and health',
  },
  {
    key: 'objectionResolution',
    label: 'Objection Resolution',
    icon: CheckCircle2,
    accent: '#dc2626',
    bgColor: '#fef2f2',
    description: 'Rate of successfully addressed customer concerns',
  },
];

// Buyer engagement KPIs
export const buyerEngagementKpis: KpiMetadata[] = [
  {
    key: 'talkToListenRatio',
    label: 'Talk-to-Listen Ratio',
    icon: MessageSquare,
    accent: '#0891b2',
    bgColor: '#ecfeff',
    description: 'Balance between rep and customer speaking time',
  },
  {
    key: 'buyerParticipation',
    label: 'Buyer Participation Rate',
    icon: UserCheck,
    accent: '#059669',
    bgColor: '#ecfdf5',
    description: 'Percentage of active buyer engagement',
  },
  {
    key: 'buyerQuestionCount',
    label: 'Buyer Question Density',
    icon: HelpCircle,
    accent: '#7c3aed',
    bgColor: '#f5f3ff',
    description: 'Number of questions asked by the buyer',
  },
];

// Deal health section KPIs
export const dealHealthKpis: KpiMetadata[] = [
  {
    key: 'dealHealth',
    label: 'Deal Health & Momentum',
    icon: TrendingUp,
    accent: '#16a34a',
    bgColor: '#f0fdf4',
    description: 'Combined assessment of deal progression',
  },
];

// Buying signals KPIs
export const buyingSignalKpis: KpiMetadata[] = [
  {
    key: 'buyingSignals',
    label: 'Buying Signals',
    icon: DollarSign,
    accent: '#2563eb',
    bgColor: '#eff6ff',
    description: 'Budget, timeline, and authority indicators',
  },
];

// Rep effectiveness KPIs
export const repEffectivenessKpis: KpiMetadata[] = [
  {
    key: 'repEffectiveness',
    label: 'Rep Effectiveness',
    icon: BarChart3,
    accent: '#f59e0b',
    bgColor: '#fffbeb',
    description: 'Sales rep performance scores',
  },
];

// Risk section KPIs
export const riskKpis: KpiMetadata[] = [
  {
    key: 'riskIndicators',
    label: 'Risk & Loss Indicators',
    icon: ShieldAlert,
    accent: '#dc2626',
    bgColor: '#fef2f2',
    description: 'Warning signs and deal risk factors',
  },
  {
    key: 'ghostingRisk',
    label: 'Ghosting Risk',
    icon: AlertTriangle,
    accent: '#f97316',
    bgColor: '#fff7ed',
    description: 'Likelihood prospect will stop responding',
  },
];

// Sentiment and funnel KPIs
export const sentimentKpis: KpiMetadata[] = [
  {
    key: 'funnelSentiment',
    label: 'Funnel Stage Sentiment',
    icon: Activity,
    accent: '#2563eb',
    bgColor: '#eff6ff',
    description: 'Sentiment breakdown across sales stages',
  },
];

// Pattern and history KPIs
export const patternKpis: KpiMetadata[] = [
  {
    key: 'patternTrace',
    label: 'Pattern Trace & Term Spikes',
    icon: Sparkles,
    accent: '#8b5cf6',
    bgColor: '#f5f3ff',
    description: 'Detected patterns across conversations',
  },
];

export const historyKpis: KpiMetadata[] = [
  {
    key: 'historicalSentiment',
    label: 'Historical Sentiment Shift',
    icon: History,
    accent: '#64748b',
    bgColor: '#f8fafc',
    description: 'Sentiment trends over time',
  },
];

// Helper to find KPI metadata by key
export function getKpiMetadata(key: string): KpiMetadata | undefined {
  const allKpis = [
    ...mainKpis,
    ...buyerEngagementKpis,
    ...dealHealthKpis,
    ...buyingSignalKpis,
    ...repEffectivenessKpis,
    ...riskKpis,
    ...sentimentKpis,
    ...patternKpis,
    ...historyKpis,
  ];
  return allKpis.find((kpi) => kpi.key === key);
}
