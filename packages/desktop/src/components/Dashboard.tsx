
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  DollarSign,
  Flame,
  Heart,
  History,
  LogOut,
  Mic,
  Minus,
  Plus,
  ShieldAlert,
  Sparkles,
  Square,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  Zap,
  Loader2,
} from 'lucide-react';
import { AudioEngine } from '../audio/AudioEngine';
import { supabase } from '../App';
import SentinelWidget from './SentinelWidget';
import ExplanationModal, { ExplanationData } from './ExplanationModal';
import DrillDownModal, { DrillDownData } from './DrillDownModal';
import InfoButton from './InfoButton';
import { getKpiMetadata } from './kpiMetadata';
import { colors, baseStyles, getStatusColor, getStatusBg } from './styles';

type SentimentLabel = 'Positive' | 'Neutral' | 'Negative';
type TrendLabel = 'Improving' | 'Declining' | 'Stable';
type MomentumLabel = 'Increasing' | 'Cooling' | 'Flat';

type MeetingSummary = {
  bant?: { budget?: string; authority?: string; need?: string; timeline?: string };
  vibe?: { score?: number; label?: string; signals?: string[] };
  dealArc?: { momentum?: MomentumLabel; resolvedObjections?: string[] };
  sentiment?: {
    score?: number;
    label?: SentimentLabel;
    trend?: TrendLabel;
    stageSignals?: Array<{ stage?: string; score?: number; label?: SentimentLabel }>;
  };
  operational?: {
    interactionCount?: number;
    durationSeconds?: number;
    talkTimeSeconds?: number;
    holdTimeSeconds?: number;
    customerInitiated?: boolean;
  };
  customerIntent?: { primary?: string; confidence?: number; signals?: string[] };
  objections?: { common?: string[]; unresolved?: string[]; frequency?: number; resolutionRate?: number };
  buyerEngagement?: {
    talkToListenRatio?: string;
    buyerParticipationRate?: number;
    buyerQuestionCount?: number;
    interruptionPattern?: string;
  };
  dealHealth?: {
    sentimentTrend?: TrendLabel;
    momentumScore?: number;
    objectionFrequency?: number;
    objectionResolutionRate?: number;
  };
  buyingSignals?: {
    budgetSignal?: string;
    timelineSignal?: string;
    authoritySignal?: string;
    competitorMentions?: string[];
  };
  repEffectiveness?: {
    discoveryDepthScore?: number;
    valueArticulationRate?: number;
    objectionHandlingQuality?: string;
    nextStepClarityScore?: number;
  };
  risk?: {
    riskyLanguage?: string[];
    confusionPoints?: string[];
    overpromiseFlags?: string[];
    skepticismSignals?: string[];
    ghostingRisk?: 'Low' | 'Medium' | 'High';
  };
  dimensions?: { product?: string; geography?: string; repTenure?: string };
  termMonitoring?: { trackedTerms?: Array<{ term?: string; mentions?: number; spike?: boolean }> };
  summary?: string;
};

const average = (values: number[]) => (values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null);
const asNumber = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : null);
const getList = (items?: string[]) => (Array.isArray(items) ? items.filter((item) => item.trim()) : []);
const getSentimentScore = (summary?: MeetingSummary) => asNumber(summary?.sentiment?.score) ?? asNumber(summary?.vibe?.score);
const getResolutionRate = (summary?: MeetingSummary) => asNumber(summary?.objections?.resolutionRate) ?? asNumber(summary?.dealHealth?.objectionResolutionRate);
const getInteractionCount = (summary?: MeetingSummary) => asNumber(summary?.operational?.interactionCount) ?? (summary ? 1 : 0);
const getDurationSeconds = (summary?: MeetingSummary) => asNumber(summary?.operational?.durationSeconds);
const getTalkTimeSeconds = (summary?: MeetingSummary) => asNumber(summary?.operational?.talkTimeSeconds);
const getHoldTimeSeconds = (summary?: MeetingSummary) => asNumber(summary?.operational?.holdTimeSeconds);

function getSentimentLabel(summary?: MeetingSummary) {
  if (summary?.sentiment?.label) return summary.sentiment.label;
  if (summary?.vibe?.label === 'Excited') return 'Positive';
  if (summary?.vibe?.label === 'Skeptical') return 'Negative';
  return 'Neutral';
}

function getIntent(summary?: MeetingSummary) {
  if (summary?.customerIntent?.primary?.trim()) return summary.customerIntent.primary;
  if (summary?.bant?.timeline?.trim()) return 'Buying';
  if (summary?.bant?.need?.trim()) return 'Evaluation';
  return 'Unknown';
}

function formatPercent(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? `${Math.round(value)}%` : '--';
}

function formatSeconds(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return '--';
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const seconds = value % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function collectTopStrings(values: string[], limit = 4) {
  const counts = new Map<string, number>();
  values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit);
}

function getSentimentColor(label?: string) {
  if (label === 'Positive') return colors.success;
  if (label === 'Negative') return colors.danger;
  return colors.textSecondary;
}

function getTrendColor(label?: string) {
  if (label === 'Improving' || label === 'Increasing' || label === 'Low') return colors.success;
  if (label === 'Declining' || label === 'Cooling' || label === 'High') return colors.danger;
  return colors.textSecondary;
}

function Pill({ text, variant = 'default' }: { text: string; variant?: 'success' | 'danger' | 'warning' | 'info' | 'default' }) {
  const bgMap = {
    success: colors.successBg,
    danger: colors.dangerBg,
    warning: colors.warningBg,
    info: colors.infoBg,
    default: 'rgba(148, 163, 184, 0.1)',
  };
  const colorMap = {
    success: colors.success,
    danger: colors.danger,
    warning: colors.warning,
    info: colors.info,
    default: colors.textSecondary,
  };
  return (
    <span style={{ ...baseStyles.pill, background: bgMap[variant], color: colorMap[variant], border: `1px solid ${colorMap[variant]}30` }}>
      {text}
    </span>
  );
}

export default function Dashboard({ session }: { session: any }) {
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [recordingStartedAt, setRecordingStartedAt] = useState<number | null>(null);
  const [audioEngine] = useState(() => new AudioEngine());
  const [backendUrl] = useState(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001');

  // Explanation modal state
  const [explanationModalOpen, setExplanationModalOpen] = useState(false);
  const [explanationData, setExplanationData] = useState<ExplanationData | null>(null);
  const [explanationLoading, setExplanationLoading] = useState(false);

  // Drill-down modal state
  const [drillDownModalOpen, setDrillDownModalOpen] = useState(false);
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null);
  const [drillDownLoading, setDrillDownLoading] = useState(false);

  useEffect(() => { fetchClients(); }, [session]);
  useEffect(() => { if (selectedClient) fetchMeetings(selectedClient); }, [selectedClient]);

  const fetchClients = async () => {
    try {
      const res = await fetch(`${backendUrl}/clients`, { headers: { Authorization: `Bearer ${session.access_token}` } });
      if (res.ok) setClients(await res.json());
    } catch (e) { console.error('Failed to fetch clients', e); }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${backendUrl}/clients`, { method: 'POST', headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newClientName }) });
      if (res.ok) {
        setNewClientName('');
        setShowAddClient(false);
        fetchClients();
      }
    } catch (e) { console.error('Failed to create client', e); }
  };

  const handleDeleteClient = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      const res = await fetch(`${backendUrl}/clients/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${session.access_token}` } });
      if (res.ok) {
        if (selectedClient === id) setSelectedClient(null);
        fetchClients();
      }
    } catch (e) { console.error('Failed to delete client', e); }
  };

  const fetchMeetings = async (clientId: string) => {
    try {
      const res = await fetch(`${backendUrl}/meetings/history/${clientId}`, { headers: { Authorization: `Bearer ${session.access_token}` } });
      if (res.ok) setMeetings(await res.json());
    } catch (e) { console.error('Failed to fetch meeting history', e); }
  };

  // Fetch AI-generated explanation for a KPI
  const fetchExplanation = useCallback(async (kpiKey: string, currentValue?: string | number, icon?: React.ReactNode) => {
    setExplanationLoading(true);
    setExplanationModalOpen(true);
    
    const kpiMeta = getKpiMetadata(kpiKey);
    const clientName = clients.find((c) => c.id === selectedClient)?.name;
    const currentMeetingData = meetings[0];
    
    // Set initial data with loading state
    setExplanationData({
      kpiKey,
      kpiName: kpiMeta?.label || kpiKey,
      explanation: '',
      currentValue,
      icon,
    });

    try {
      const endpoint = currentMeetingData?.id 
        ? `${backendUrl}/meetings/${currentMeetingData.id}/explain`
        : `${backendUrl}/meetings/explain`;
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kpiKey,
          currentValue,
          clientName,
          summaryData: currentMeetingData?.summaryJson,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setExplanationData({
          kpiKey: data.kpiKey,
          kpiName: data.kpiName,
          explanation: data.explanation,
          actionableInsight: data.actionableInsight,
          currentValue,
          icon,
        });
      } else {
        setExplanationData({
          kpiKey,
          kpiName: kpiMeta?.label || kpiKey,
          explanation: kpiMeta?.description || 'Unable to generate explanation. Please try again.',
          currentValue,
          icon,
        });
      }
    } catch (e) {
      console.error('Failed to fetch explanation', e);
      setExplanationData({
        kpiKey,
        kpiName: kpiMeta?.label || kpiKey,
        explanation: kpiMeta?.description || 'Unable to generate explanation. Please try again.',
        currentValue,
        icon,
      });
    } finally {
      setExplanationLoading(false);
    }
  }, [backendUrl, session.access_token, clients, selectedClient, meetings]);

  // Fetch KPI evidence for drill-down (clicking on a KPI card)
  const fetchDrillDown = useCallback(async (kpiKey: string, kpiValue?: string | number, icon?: React.ReactNode) => {
    if (!selectedClient) return;
    
    setDrillDownLoading(true);
    setDrillDownModalOpen(true);
    
    const kpiMeta = getKpiMetadata(kpiKey);
    
    // Set initial data with loading state
    setDrillDownData({
      kpiKey,
      kpiName: kpiMeta?.label || kpiKey,
      kpiValue,
      summary: '',
      excerpts: [],
      transcript: '',
      icon,
    });

    try {
      const res = await fetch(`${backendUrl}/meetings/client/${selectedClient}/evidence`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kpiKey,
          kpiValue,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDrillDownData({
          kpiKey: data.kpiKey,
          kpiName: data.kpiName,
          kpiValue: data.kpiValue,
          summary: data.summary,
          excerpts: data.excerpts || [],
          transcript: data.transcript || '',
          meetingId: data.meetingId,
          meetingDate: data.meetingDate,
          icon,
        });
      } else {
        const errorData = await res.json().catch(() => ({}));
        setDrillDownData({
          kpiKey,
          kpiName: kpiMeta?.label || kpiKey,
          kpiValue,
          summary: errorData.summary || 'Unable to extract evidence. Please ensure you have recorded meetings with transcripts.',
          excerpts: [],
          transcript: '',
          icon,
        });
      }
    } catch (e) {
      console.error('Failed to fetch drill-down evidence', e);
      setDrillDownData({
        kpiKey,
        kpiName: kpiMeta?.label || kpiKey,
        kpiValue,
        summary: 'Unable to fetch evidence. Please try again later.',
        excerpts: [],
        transcript: '',
        icon,
      });
    } finally {
      setDrillDownLoading(false);
    }
  }, [backendUrl, session.access_token, selectedClient]);

  const startMeeting = async () => {
    if (!selectedClient) return alert('Select a client first');
    try {
      await audioEngine.startRecording();
      setRecordingStartedAt(Date.now());
      setIsRecording(true);
    } catch (e) {
      alert('Failed to start recording, check permissions');
    }
  };

  const stopMeeting = () => {
    audioEngine.onStop = async (blob) => {
      const formData = new FormData();
      const extension = blob.type.includes('wav') ? 'wav' : 'webm';
      const durationMs = recordingStartedAt ? Math.max(0, Date.now() - recordingStartedAt) : 0;
      formData.append('audio', blob, `meeting.${extension}`);
      formData.append('clientId', selectedClient!);
      formData.append('durationMs', String(durationMs));

      try {
        const res = await fetch(`${backendUrl}/meetings`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: formData,
        });
        if (res.ok) {
          await fetchMeetings(selectedClient!);
        } else {
          alert('Failed to save meeting');
        }
      } catch (e) {
        console.error('Upload failed', e);
      } finally {
        setRecordingStartedAt(null);
        setIsProcessing(false);
      }
    };

    setIsRecording(false);
    setIsProcessing(true);
    audioEngine.stopRecording();
  };

  const currentMeeting = meetings[0];
  const summary = currentMeeting?.summaryJson as MeetingSummary | undefined;
  const analyzedMeetings = useMemo(() => meetings.filter((meeting) => meeting.summaryJson && Object.keys(meeting.summaryJson).length > 0), [meetings]);
  const allSummaries = analyzedMeetings.map((meeting) => meeting.summaryJson as MeetingSummary).filter(Boolean);

  const sentimentScores = allSummaries.map((item) => getSentimentScore(item)).filter((value): value is number => value !== null);
  const durationScores = allSummaries.map((item) => getDurationSeconds(item)).filter((value): value is number => value !== null && value > 0);
  const interactionTotal = allSummaries.reduce((sum, item) => sum + getInteractionCount(item), 0);
  const customerInitiatedCount = allSummaries.reduce((sum, item) => sum + ((item.operational?.customerInitiated ?? true) ? getInteractionCount(item) : 0), 0);
  const averageSentiment = average(sentimentScores);
  const averageDuration = average(durationScores);
  const latestSentiment = getSentimentScore(summary);
  const latestIntent = getIntent(summary);
  const latestMomentumScore = asNumber(summary?.dealHealth?.momentumScore);
  const latestResolutionRate = getResolutionRate(summary);

  const commonObjections = collectTopStrings(allSummaries.flatMap((item) => getList(item.objections?.common).length ? getList(item.objections?.common) : getList(item.dealArc?.resolvedObjections)));
  const riskyLanguage = getList(summary?.risk?.riskyLanguage);
  const confusionPoints = getList(summary?.risk?.confusionPoints);
  const overpromiseFlags = getList(summary?.risk?.overpromiseFlags);
  const skepticismSignals = getList(summary?.risk?.skepticismSignals);
  const stageSignals = summary?.sentiment?.stageSignals?.filter((item) => item.stage) || [];
  const trackedTermSpikes = (summary?.termMonitoring?.trackedTerms || []).filter((item) => item.term && item.spike);
  const productPatterns = collectTopStrings(allSummaries.map((item) => item.dimensions?.product || '').filter(Boolean));
  const geographyPatterns = collectTopStrings(allSummaries.map((item) => item.dimensions?.geography || '').filter(Boolean));
  const repTenurePatterns = collectTopStrings(allSummaries.map((item) => item.dimensions?.repTenure || '').filter(Boolean));
  const historySentiment = analyzedMeetings.slice().reverse().map((meeting) => {
    const meetingSummary = meeting.summaryJson as MeetingSummary;
    return {
      id: meeting.id,
      createdAt: meeting.createdAt,
      score: getSentimentScore(meetingSummary),
      trend: meetingSummary.sentiment?.trend || meetingSummary.dealHealth?.sentimentTrend || 'Stable',
      momentum: meetingSummary.dealArc?.momentum || 'Flat',
    };
  });

  const kpis = [
    { key: 'sentimentScore', label: 'Sentiment Score', value: latestSentiment !== null ? `${latestSentiment}/100` : averageSentiment !== null ? `${averageSentiment}/100` : '--', helper: summary?.sentiment?.trend ? `Trend ${summary.sentiment.trend}` : 'Latest customer tone', icon: Activity, accent: '#2563eb', bg: '#eff6ff' },
    { key: 'avgDuration', label: 'Avg Conversation Duration', value: formatSeconds(averageDuration), helper: summary && (getTalkTimeSeconds(summary) || getHoldTimeSeconds(summary)) ? `Latest talk ${formatSeconds(getTalkTimeSeconds(summary))} · hold ${formatSeconds(getHoldTimeSeconds(summary))}` : 'Average across recorded conversations', icon: Clock3, accent: '#7c3aed', bg: '#f5f3ff' },
    { key: 'customerInteractions', label: 'Customer Interactions', value: customerInitiatedCount ? customerInitiatedCount.toString() : interactionTotal.toString(), helper: customerInitiatedCount ? 'Customer-initiated interactions captured' : 'Recorded interactions captured', icon: Users, accent: '#0f766e', bg: '#ecfeff' },
    { key: 'customerIntent', label: 'Customer Intent', value: latestIntent, helper: summary?.customerIntent?.signals?.length ? summary.customerIntent.signals.join(' · ') : 'Latest meeting buying posture', icon: Target, accent: '#ea580c', bg: '#fff7ed' },
    { key: 'momentumScore', label: 'Momentum Score', value: latestMomentumScore !== null ? `${latestMomentumScore}/100` : summary?.dealArc?.momentum || '--', helper: summary?.dealHealth?.sentimentTrend ? `Sentiment ${summary.dealHealth.sentimentTrend}` : 'Deal health from latest call', icon: TrendingUp, accent: '#16a34a', bg: '#f0fdf4' },
    { key: 'objectionResolution', label: 'Objection Resolution', value: formatPercent(latestResolutionRate), helper: commonObjections.length ? `Top objection: ${commonObjections[0][0]}` : 'Latest objection handling quality', icon: CheckCircle2, accent: '#dc2626', bg: '#fef2f2' },
  ];

  const renderMomentumIcon = (momentum?: string) => {
    if (momentum === 'Increasing') return <TrendingUp size={20} color={colors.success} />;
    if (momentum === 'Cooling') return <TrendingDown size={20} color={colors.danger} />;
    return <Minus size={20} color={colors.textMuted} />;
  };

  const renderTopPatterns = (title: string, entries: [string, number][]) => (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ color: colors.textSecondary, fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.6rem' }}>{title}</div>
      {entries.length ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {entries.map(([label, count]) => <Pill key={label} text={`${label} (${count})`} variant="info" />)}
        </div>
      ) : (
        <div style={{ color: colors.textMuted, fontSize: '0.85rem' }}>No pattern detected yet.</div>
      )}
    </div>
  );

  const selectedClientName = clients.find((c) => c.id === selectedClient)?.name || 'Client';

  return (
    <div style={baseStyles.container}>
      {/* Sidebar */}
      <div style={baseStyles.sidebar}>
        <div style={baseStyles.sidebarHeader}>
          <div style={baseStyles.logo}>
            <Zap size={20} color="white" />
          </div>
          <span style={baseStyles.brandText}>ClarityIQ</span>
        </div>
        
        <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontWeight: 600, color: colors.textMuted, fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Clients</span>
            <button 
              onClick={() => setShowAddClient(!showAddClient)} 
              style={{ ...baseStyles.buttonGhost, color: colors.primary }}
            >
              <Plus size={18} />
            </button>
          </div>

          {showAddClient && (
            <form onSubmit={handleAddClient} style={{ marginBottom: '1.25rem' }}>
              <input 
                autoFocus 
                placeholder="Enter client name..." 
                value={newClientName} 
                onChange={(e) => setNewClientName(e.target.value)} 
                style={{ ...baseStyles.input, marginBottom: '0.75rem' }} 
              />
              <button type="submit" style={{ ...baseStyles.buttonPrimary, width: '100%', justifyContent: 'center' }}>
                Add Client
              </button>
            </form>
          )}

          {clients.length === 0 && !showAddClient ? (
            <div style={{ color: colors.textMuted, fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
              No clients yet
            </div>
          ) : (
            clients.map((c) => (
              <div 
                key={c.id} 
                onClick={() => setSelectedClient(c.id)} 
                style={{ 
                  ...baseStyles.clientItem, 
                  ...(selectedClient === c.id ? baseStyles.clientItemActive : {}),
                  color: selectedClient === c.id ? colors.primaryLight : colors.textSecondary,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <User size={18} color={selectedClient === c.id ? colors.primary : colors.textMuted} />
                  <span style={{ fontWeight: selectedClient === c.id ? 600 : 400 }}>{c.name}</span>
                </div>
                <button 
                  onClick={(e) => handleDeleteClient(e, c.id)} 
                  style={{ ...baseStyles.buttonGhost, color: colors.danger, opacity: 0.7 }} 
                  title="Delete Client"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        <div style={{ padding: '1.5rem', borderTop: `1px solid ${colors.border}` }}>
          <button 
            onClick={async () => {
              if (session.user?.id === 'demo-user-id') {
                window.dispatchEvent(new CustomEvent('logout-demo'));
              } else {
                await supabase.auth.signOut();
              }
            }}
            style={{ ...baseStyles.buttonGhost, width: '100%', justifyContent: 'flex-start', gap: '0.75rem', color: colors.textMuted }}
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={baseStyles.mainContent}>
        {selectedClient ? (
          <>
            {/* Page Header */}
            <div style={baseStyles.pageHeader}>
              <div>
                <h1 style={baseStyles.pageTitle}>{selectedClientName}</h1>
                <p style={baseStyles.pageSubtitle}>Revenue intelligence & deal insights</p>
              </div>
              {isRecording ? (
                <button onClick={stopMeeting} style={baseStyles.buttonDanger}>
                  <Square size={18} fill="white" /> Stop Recording
                </button>
              ) : isProcessing ? (
                <div style={baseStyles.processingBadge}>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Analyzing with AI...
                </div>
              ) : (
                <button onClick={startMeeting} style={baseStyles.buttonSuccess}>
                  <Mic size={18} /> Start Meeting
                </button>
              )}
            </div>

            {/* KPI Cards Grid */}
            <div style={baseStyles.gridThree}>
              {kpis.map(({ key, label, value, helper, icon: Icon, accent }) => (
                <div 
                  key={key} 
                  style={{ ...baseStyles.kpiCard, cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onClick={() => fetchDrillDown(key, value, <Icon size={24} />)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.3)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                  title="Click to see evidence from transcript"
                >
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: `radial-gradient(circle at top right, ${accent}20, transparent)`, borderRadius: '0 20px 0 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', position: 'relative' }}>
                    <span style={{ ...baseStyles.kpiLabel, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {label}
                      <InfoButton onClick={(e) => { e.stopPropagation(); fetchExplanation(key, value, <Icon size={24} />); }} color={colors.textMuted} hoverColor={colors.primary} />
                    </span>
                    <div style={{ ...baseStyles.iconBox, background: `${accent}20`, color: accent }}>
                      <Icon size={22} />
                    </div>
                  </div>
                  <div style={baseStyles.kpiValue}>{value}</div>
                  <div style={baseStyles.kpiHelper}>{helper}</div>
                </div>
              ))}
            </div>

            {/* Two Column Layout: Sentiment & Buyer Engagement */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {/* Sentiment Panel */}
              <div style={baseStyles.card}>
                <h3 style={baseStyles.sectionTitle}>
                  <Activity size={18} color={colors.primary} />
                  Sentiment & Funnel Risk
                  <InfoButton onClick={() => fetchExplanation('funnelSentiment', undefined, <Activity size={24} />)} color={colors.textMuted} hoverColor={colors.primary} />
                </h3>
                {summary ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div style={baseStyles.metricBox}>
                        <div style={baseStyles.metricLabel}>Current Sentiment</div>
                        <div style={{ ...baseStyles.metricValue, color: getSentimentColor(getSentimentLabel(summary)) }}>
                          {getSentimentLabel(summary)} {latestSentiment !== null && <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>({latestSentiment}/100)</span>}
                        </div>
                      </div>
                      <div style={baseStyles.metricBox}>
                        <div style={baseStyles.metricLabel}>Buyer Intent</div>
                        <div style={baseStyles.metricValue}>{latestIntent}</div>
                      </div>
                      <div style={baseStyles.metricBox}>
                        <div style={baseStyles.metricLabel}>Ghosting Risk</div>
                        <div style={{ ...baseStyles.metricValue, color: getTrendColor(summary.risk?.ghostingRisk) }}>
                          {summary.risk?.ghostingRisk || 'Medium'}
                        </div>
                      </div>
                    </div>

                    {stageSignals.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ color: colors.textSecondary, fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem' }}>Funnel Stages</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                          {stageSignals.map((stage) => (
                            <div key={stage.stage} style={{ ...baseStyles.metricBox, padding: '0.75rem' }}>
                              <div style={{ fontWeight: 600, color: colors.textPrimary, fontSize: '0.9rem' }}>{stage.stage}</div>
                              <div style={{ color: getSentimentColor(stage.label), fontWeight: 700, fontSize: '0.85rem' }}>{stage.label} ({stage.score}/100)</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {riskyLanguage.map((item) => <Pill key={item} text={item} variant="danger" />)}
                      {overpromiseFlags.map((item) => <Pill key={item} text={item} variant="warning" />)}
                      {riskyLanguage.length === 0 && overpromiseFlags.length === 0 && (
                        <span style={{ color: colors.textMuted, fontSize: '0.85rem' }}>No risk flags detected</span>
                      )}
                    </div>
                  </>
                ) : (
                  <p style={{ color: colors.textMuted, margin: 0 }}>Analyze a meeting to see sentiment insights.</p>
                )}
              </div>

              {/* Buyer Engagement */}
              <div style={baseStyles.card}>
                <h3 style={baseStyles.sectionTitle}>
                  <Users size={18} color={colors.info} />
                  Buyer Engagement
                  <InfoButton onClick={() => fetchExplanation('talkToListenRatio', summary?.buyerEngagement?.talkToListenRatio)} color={colors.textMuted} hoverColor={colors.primary} />
                </h3>
                {summary ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={baseStyles.metricBox}>
                      <div style={baseStyles.metricLabel}>Talk-to-Listen Ratio</div>
                      <div style={baseStyles.metricValue}>{summary.buyerEngagement?.talkToListenRatio || '--'}</div>
                    </div>
                    <div style={baseStyles.metricBox}>
                      <div style={baseStyles.metricLabel}>Buyer Participation</div>
                      <div style={baseStyles.metricValue}>{formatPercent(summary.buyerEngagement?.buyerParticipationRate)}</div>
                    </div>
                    <div style={baseStyles.metricBox}>
                      <div style={baseStyles.metricLabel}>Questions Asked</div>
                      <div style={baseStyles.metricValue}>{summary.buyerEngagement?.buyerQuestionCount ?? 0}</div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: colors.textMuted, margin: 0 }}>No engagement data yet.</p>
                )}
              </div>
            </div>

            {/* Three Column: Deal Health, Buying Signals, Rep Effectiveness */}
            <div style={baseStyles.gridThree}>
              {/* Deal Health */}
              <div style={baseStyles.card}>
                <h3 style={baseStyles.sectionTitle}>
                  <TrendingUp size={18} color={colors.success} />
                  Deal Health
                  <InfoButton onClick={() => fetchExplanation('dealHealth', summary?.dealHealth?.momentumScore)} color={colors.textMuted} hoverColor={colors.primary} />
                </h3>
                {summary ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', marginBottom: '1rem' }}>
                      <div style={{ padding: '0.75rem', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                        {renderMomentumIcon(summary.dealArc?.momentum)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: colors.textPrimary }}>{summary.dealArc?.momentum || 'Flat'}</div>
                        <div style={{ color: colors.textMuted, fontSize: '0.85rem' }}>Score: {summary.dealHealth?.momentumScore ?? '--'}/100</div>
                      </div>
                    </div>
                    <div style={{ ...baseStyles.statRow, borderColor: colors.border }}>
                      <span style={baseStyles.statLabel}>Sentiment Trend</span>
                      <span style={{ ...baseStyles.statValue, color: getTrendColor(summary.dealHealth?.sentimentTrend) }}>{summary.dealHealth?.sentimentTrend || 'Stable'}</span>
                    </div>
                    <div style={{ ...baseStyles.statRow, borderColor: colors.border }}>
                      <span style={baseStyles.statLabel}>Resolution Rate</span>
                      <span style={baseStyles.statValue}>{formatPercent(getResolutionRate(summary))}</span>
                    </div>
                  </>
                ) : (
                  <p style={{ color: colors.textMuted, margin: 0 }}>No data yet.</p>
                )}
              </div>

              {/* Buying Signals */}
              <div style={baseStyles.card}>
                <h3 style={baseStyles.sectionTitle}>
                  <Target size={18} color={colors.warning} />
                  Buying Signals
                  <InfoButton onClick={() => fetchExplanation('buyingSignals', undefined)} color={colors.textMuted} hoverColor={colors.primary} />
                </h3>
                {summary ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ ...baseStyles.signalBox, borderColor: colors.info }}>
                      <div style={{ color: colors.textMuted, fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Budget</div>
                      <div style={{ color: colors.textPrimary, fontWeight: 500 }}>{summary.buyingSignals?.budgetSignal || summary.bant?.budget || 'Not identified'}</div>
                    </div>
                    <div style={{ ...baseStyles.signalBox, borderColor: colors.success }}>
                      <div style={{ color: colors.textMuted, fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Timeline</div>
                      <div style={{ color: colors.textPrimary, fontWeight: 500 }}>{summary.buyingSignals?.timelineSignal || summary.bant?.timeline || 'Not identified'}</div>
                    </div>
                    <div style={{ ...baseStyles.signalBox, borderColor: colors.warning }}>
                      <div style={{ color: colors.textMuted, fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Authority</div>
                      <div style={{ color: colors.textPrimary, fontWeight: 500 }}>{summary.buyingSignals?.authoritySignal || summary.bant?.authority || 'Not identified'}</div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: colors.textMuted, margin: 0 }}>No data yet.</p>
                )}
              </div>

              {/* Rep Effectiveness */}
              <div style={baseStyles.card}>
                <h3 style={baseStyles.sectionTitle}>
                  <CheckCircle2 size={18} color={colors.primary} />
                  Rep Effectiveness
                  <InfoButton onClick={() => fetchExplanation('repEffectiveness', undefined)} color={colors.textMuted} hoverColor={colors.primary} />
                </h3>
                {summary ? (
                  <>
                    <div style={{ ...baseStyles.statRow, borderColor: colors.border }}>
                      <span style={baseStyles.statLabel}>Discovery Depth</span>
                      <span style={baseStyles.statValue}>{summary.repEffectiveness?.discoveryDepthScore ?? 0}/100</span>
                    </div>
                    <div style={{ ...baseStyles.statRow, borderColor: colors.border }}>
                      <span style={baseStyles.statLabel}>Value Articulation</span>
                      <span style={baseStyles.statValue}>{summary.repEffectiveness?.valueArticulationRate ?? 0}/100</span>
                    </div>
                    <div style={{ ...baseStyles.statRow, borderColor: colors.border }}>
                      <span style={baseStyles.statLabel}>Next-Step Clarity</span>
                      <span style={baseStyles.statValue}>{summary.repEffectiveness?.nextStepClarityScore ?? 0}/100</span>
                    </div>
                    <div style={{ ...baseStyles.statRow, border: 'none' }}>
                      <span style={baseStyles.statLabel}>Objection Handling</span>
                      <span style={baseStyles.statValue}>{summary.repEffectiveness?.objectionHandlingQuality || '--'}</span>
                    </div>
                  </>
                ) : (
                  <p style={{ color: colors.textMuted, margin: 0 }}>No data yet.</p>
                )}
              </div>
            </div>

            {/* Two Column: Risk & Patterns */}
            <div style={baseStyles.gridTwo}>
              {/* Risk Indicators */}
              <div style={baseStyles.card}>
                <h3 style={baseStyles.sectionTitle}>
                  <ShieldAlert size={18} color={colors.danger} />
                  Risk & Loss Indicators
                  <InfoButton onClick={() => fetchExplanation('riskIndicators', summary?.risk?.ghostingRisk)} color={colors.textMuted} hoverColor={colors.primary} />
                </h3>
                {summary ? (
                  <>
                    {(skepticismSignals.length > 0 || confusionPoints.length > 0) && (
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ color: colors.textSecondary, fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Warning Signals</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {skepticismSignals.map((item) => <Pill key={item} text={item} variant="danger" />)}
                          {confusionPoints.map((item) => <Pill key={item} text={item} variant="warning" />)}
                        </div>
                      </div>
                    )}
                    <div style={{ ...baseStyles.metricBox, padding: '1rem' }}>
                      <div style={{ color: colors.textMuted, fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Executive Summary</div>
                      <div style={{ color: colors.textPrimary, lineHeight: 1.6 }}>{summary.summary || 'Summary will appear after analysis.'}</div>
                    </div>
                  </>
                ) : (
                  <p style={{ color: colors.textMuted, margin: 0 }}>No risk data yet.</p>
                )}
              </div>

              {/* Pattern Trace */}
              <div style={baseStyles.card}>
                <h3 style={baseStyles.sectionTitle}>
                  <Sparkles size={18} color={colors.primaryLight} />
                  Pattern Trace
                  <InfoButton onClick={() => fetchExplanation('patternTrace', undefined)} color={colors.textMuted} hoverColor={colors.primary} />
                </h3>
                {summary ? (
                  <>
                    {renderTopPatterns('Products', productPatterns)}
                    {renderTopPatterns('Geographies', geographyPatterns)}
                    {trackedTermSpikes.length > 0 && (
                      <div>
                        <div style={{ color: colors.textSecondary, fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Term Spikes</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {trackedTermSpikes.map((item) => <Pill key={item.term} text={`${item.term} (${item.mentions})`} variant="info" />)}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p style={{ color: colors.textMuted, margin: 0 }}>Patterns appear after multiple meetings.</p>
                )}
              </div>
            </div>

            {/* History */}
            <div style={baseStyles.card}>
              <h3 style={baseStyles.sectionTitle}>
                <History size={18} color={colors.textSecondary} />
                Meeting History
                <InfoButton onClick={() => fetchExplanation('historicalSentiment', undefined)} color={colors.textMuted} hoverColor={colors.primary} />
              </h3>
              {meetings.length === 0 ? (
                <p style={{ color: colors.textMuted, margin: 0 }}>No meetings recorded yet.</p>
              ) : (
                <div>
                  {historySentiment.map((item) => (
                    <div key={item.id} style={{ ...baseStyles.historyRow, ':hover': { backgroundColor: 'rgba(255,255,255,0.05)' } }}>
                      <span style={{ color: colors.textSecondary }}>{new Date(item.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      <span style={{ fontWeight: 700, color: getSentimentColor(item.score !== null ? (item.score >= 70 ? 'Positive' : item.score <= 40 ? 'Negative' : 'Neutral') : 'Neutral') }}>
                        {item.score !== null ? `${item.score}/100` : '--'}
                      </span>
                      <span style={{ fontWeight: 600, color: getTrendColor(item.trend) }}>{item.trend}</span>
                      <Pill text={item.momentum} variant={item.momentum === 'Increasing' ? 'success' : item.momentum === 'Cooling' ? 'danger' : 'default'} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Empty State */
          <div style={baseStyles.emptyState}>
            <div style={baseStyles.emptyIcon}>
              <User size={56} color={colors.primary} />
            </div>
            <h2 style={{ margin: 0, color: colors.textSecondary, fontWeight: 600 }}>Select a Client</h2>
            <p style={{ marginTop: '0.75rem', color: colors.textMuted }}>Choose a client from the sidebar or add a new one to get started.</p>
          </div>
        )}
      </div>

      {isRecording && <SentinelWidget />}
      
      <ExplanationModal
        isOpen={explanationModalOpen}
        onClose={() => setExplanationModalOpen(false)}
        data={explanationData}
        isLoading={explanationLoading}
      />

      <DrillDownModal
        isOpen={drillDownModalOpen}
        onClose={() => setDrillDownModalOpen(false)}
        data={drillDownData}
        isLoading={drillDownLoading}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
