import React, { useState } from 'react';
import { X, Loader2, MessageSquare, User, Headphones, ChevronDown, ChevronUp, Quote, Sparkles } from 'lucide-react';

export type EvidenceExcerpt = {
  quote: string;
  speaker: 'buyer' | 'rep' | 'unknown';
  sentiment: 'positive' | 'neutral' | 'negative';
  relevance: string;
  timestamp?: string;
};

export type DrillDownData = {
  kpiKey: string;
  kpiName: string;
  kpiValue?: string | number;
  summary: string;
  excerpts: EvidenceExcerpt[];
  transcript: string;
  meetingId?: string;
  meetingDate?: string;
  icon?: React.ReactNode;
};

type DrillDownModalProps = {
  isOpen: boolean;
  onClose: () => void;
  data: DrillDownData | null;
  isLoading: boolean;
};

const colors = {
  bgDark: '#0f0f23',
  bgCard: 'rgba(30, 32, 48, 0.98)',
  primary: '#6366f1',
  primaryLight: '#818cf8',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  border: 'rgba(255, 255, 255, 0.1)',
  success: '#10b981',
  successBg: 'rgba(16, 185, 129, 0.15)',
  warning: '#f59e0b',
  warningBg: 'rgba(245, 158, 11, 0.15)',
  danger: '#ef4444',
  dangerBg: 'rgba(239, 68, 68, 0.15)',
  info: '#3b82f6',
  infoBg: 'rgba(59, 130, 246, 0.15)',
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(8px)',
  padding: '2rem',
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: colors.bgCard,
  borderRadius: '20px',
  maxWidth: '800px',
  width: '100%',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.15)',
  position: 'relative',
  animation: 'fadeInScale 0.25s ease-out',
  border: `1px solid ${colors.border}`,
  overflow: 'hidden',
};

const headerStyle: React.CSSProperties = {
  padding: '1.5rem 2rem',
  borderBottom: `1px solid ${colors.border}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.08), transparent)',
};

const contentStyle: React.CSSProperties = {
  padding: '1.5rem 2rem',
  overflowY: 'auto',
  flex: 1,
};

const closeButtonStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: 'none',
  cursor: 'pointer',
  color: colors.textMuted,
  padding: '0.5rem',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
};

function getSentimentStyles(sentiment: string) {
  switch (sentiment) {
    case 'positive':
      return { bg: colors.successBg, border: colors.success, color: colors.success };
    case 'negative':
      return { bg: colors.dangerBg, border: colors.danger, color: colors.danger };
    default:
      return { bg: 'rgba(148, 163, 184, 0.1)', border: colors.textMuted, color: colors.textSecondary };
  }
}

function getSpeakerIcon(speaker: string) {
  if (speaker === 'buyer') return <User size={14} />;
  if (speaker === 'rep') return <Headphones size={14} />;
  return <MessageSquare size={14} />;
}

function getSpeakerLabel(speaker: string) {
  if (speaker === 'buyer') return 'Buyer';
  if (speaker === 'rep') return 'Sales Rep';
  return 'Unknown';
}

function ExcerptCard({ excerpt }: { excerpt: EvidenceExcerpt }) {
  const sentimentStyles = getSentimentStyles(excerpt.sentiment);
  
  return (
    <div style={{
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      padding: '1rem',
      marginBottom: '0.75rem',
      transition: 'all 0.2s ease',
    }}>
      {/* Quote */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '0.75rem',
      }}>
        <Quote size={18} color={colors.primaryLight} style={{ flexShrink: 0, marginTop: '2px' }} />
        <p style={{
          margin: 0,
          color: colors.textPrimary,
          fontSize: '0.95rem',
          lineHeight: 1.6,
          fontStyle: 'italic',
        }}>
          "{excerpt.quote}"
        </p>
      </div>
      
      {/* Meta row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        {/* Speaker badge */}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.25rem 0.6rem',
          borderRadius: '999px',
          backgroundColor: excerpt.speaker === 'buyer' ? colors.infoBg : 'rgba(148, 163, 184, 0.1)',
          color: excerpt.speaker === 'buyer' ? colors.info : colors.textSecondary,
          fontSize: '0.75rem',
          fontWeight: 600,
        }}>
          {getSpeakerIcon(excerpt.speaker)}
          {getSpeakerLabel(excerpt.speaker)}
        </span>
        
        {/* Sentiment badge */}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.25rem 0.6rem',
          borderRadius: '999px',
          backgroundColor: sentimentStyles.bg,
          color: sentimentStyles.color,
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'capitalize',
        }}>
          {excerpt.sentiment}
        </span>
        
        {/* Timestamp if available */}
        {excerpt.timestamp && (
          <span style={{
            color: colors.textMuted,
            fontSize: '0.75rem',
          }}>
            {excerpt.timestamp}
          </span>
        )}
      </div>
      
      {/* Relevance explanation */}
      {excerpt.relevance && (
        <p style={{
          margin: '0.75rem 0 0 0',
          paddingTop: '0.75rem',
          borderTop: `1px solid ${colors.border}`,
          color: colors.textSecondary,
          fontSize: '0.85rem',
          lineHeight: 1.5,
        }}>
          {excerpt.relevance}
        </p>
      )}
    </div>
  );
}

function TranscriptViewer({ transcript, excerpts }: { transcript: string; excerpts: EvidenceExcerpt[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Simple highlighting - find and highlight excerpt quotes in transcript
  const highlightedTranscript = React.useMemo(() => {
    if (!transcript) return '';
    
    let result = transcript;
    excerpts.forEach((excerpt) => {
      const escapedQuote = excerpt.quote.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedQuote})`, 'gi');
      const sentimentColor = getSentimentStyles(excerpt.sentiment).color;
      result = result.replace(regex, `<mark style="background: ${sentimentColor}20; color: ${sentimentColor}; padding: 2px 4px; border-radius: 4px;">$1</mark>`);
    });
    
    return result;
  }, [transcript, excerpts]);
  
  const previewLength = 500;
  const needsExpand = transcript.length > previewLength;
  const displayText = isExpanded ? highlightedTranscript : highlightedTranscript.slice(0, previewLength) + (needsExpand ? '...' : '');
  
  return (
    <div style={{
      marginTop: '1.5rem',
      padding: '1.25rem',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
      }}>
        <h4 style={{
          margin: 0,
          color: colors.textSecondary,
          fontSize: '0.85rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Full Transcript
        </h4>
        {needsExpand && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: colors.primary,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            {isExpanded ? 'Show less' : 'Show full transcript'}
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>
      
      <div
        style={{
          color: colors.textSecondary,
          fontSize: '0.9rem',
          lineHeight: 1.7,
          whiteSpace: 'pre-wrap',
          maxHeight: isExpanded ? 'none' : '200px',
          overflow: isExpanded ? 'visible' : 'hidden',
        }}
        dangerouslySetInnerHTML={{ __html: displayText }}
      />
    </div>
  );
}

export default function DrillDownModal({ isOpen, onClose, data, isLoading }: DrillDownModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div style={modalOverlayStyle} onClick={handleOverlayClick}>
      <div style={modalContentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {data?.icon && (
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${colors.primary}30, ${colors.primaryLight}20)`,
                display: 'grid',
                placeItems: 'center',
                color: colors.primaryLight,
                border: `1px solid ${colors.primary}40`,
              }}>
                {data.icon}
              </div>
            )}
            <div>
              <h2 style={{
                margin: 0,
                color: colors.textPrimary,
                fontSize: '1.25rem',
                fontWeight: 600,
              }}>
                {data?.kpiName || 'KPI Evidence'}
              </h2>
              {data?.kpiValue !== undefined && (
                <p style={{
                  margin: '0.25rem 0 0 0',
                  color: colors.textSecondary,
                  fontSize: '0.9rem',
                }}>
                  Current value: <strong style={{ color: colors.primaryLight }}>{data.kpiValue}</strong>
                </p>
              )}
            </div>
          </div>
          
          <button
            style={closeButtonStyle}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = colors.textPrimary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = colors.textMuted;
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {isLoading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4rem 1rem',
              gap: '1.25rem',
            }}>
              <div style={{ position: 'relative' }}>
                <Loader2 size={40} color={colors.primary} style={{ animation: 'spin 1s linear infinite' }} />
                <Sparkles size={18} color={colors.primaryLight} style={{ position: 'absolute', top: -8, right: -8 }} />
              </div>
              <span style={{ color: colors.textMuted, fontSize: '0.95rem' }}>
                Analyzing transcript for evidence...
              </span>
            </div>
          ) : data ? (
            <>
              {/* Summary */}
              <div style={{
                padding: '1.25rem',
                backgroundColor: `${colors.primary}10`,
                border: `1px solid ${colors.primary}30`,
                borderRadius: '12px',
                marginBottom: '1.5rem',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.75rem',
                }}>
                  <Sparkles size={16} color={colors.primaryLight} />
                  <span style={{
                    color: colors.primaryLight,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    AI Analysis Summary
                  </span>
                </div>
                <p style={{
                  margin: 0,
                  color: colors.textPrimary,
                  fontSize: '0.95rem',
                  lineHeight: 1.65,
                }}>
                  {data.summary}
                </p>
              </div>
              
              {/* Meeting date if available */}
              {data.meetingDate && (
                <p style={{
                  margin: '0 0 1rem 0',
                  color: colors.textMuted,
                  fontSize: '0.85rem',
                }}>
                  From meeting on {new Date(data.meetingDate).toLocaleDateString(undefined, { 
                    dateStyle: 'long' 
                  })}
                </p>
              )}

              {/* Evidence excerpts */}
              {data.excerpts.length > 0 ? (
                <>
                  <h3 style={{
                    margin: '0 0 1rem 0',
                    color: colors.textSecondary,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Key Evidence ({data.excerpts.length} excerpts)
                  </h3>
                  
                  {data.excerpts.map((excerpt, index) => (
                    <ExcerptCard key={index} excerpt={excerpt} />
                  ))}
                </>
              ) : (
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: colors.textMuted,
                }}>
                  <MessageSquare size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
                  <p style={{ margin: 0 }}>No specific evidence excerpts available for this metric.</p>
                </div>
              )}
              
              {/* Full transcript viewer */}
              {data.transcript && (
                <TranscriptViewer transcript={data.transcript} excerpts={data.excerpts} />
              )}
            </>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4rem 1rem',
            }}>
              <span style={{ color: colors.textMuted }}>No evidence data available</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
