import React from 'react';
import { X, Lightbulb, Loader2, Sparkles } from 'lucide-react';

export type ExplanationData = {
  kpiKey: string;
  kpiName: string;
  explanation: string;
  actionableInsight?: string;
  currentValue?: string | number;
  icon?: React.ReactNode;
};

type ExplanationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  data: ExplanationData | null;
  isLoading: boolean;
};

const colors = {
  bgDark: '#0f0f23',
  bgCard: 'rgba(30, 32, 48, 0.95)',
  primary: '#6366f1',
  primaryLight: '#818cf8',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  border: 'rgba(255, 255, 255, 0.1)',
  success: '#10b981',
  warning: '#f59e0b',
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(8px)',
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: colors.bgCard,
  borderRadius: '20px',
  padding: '2rem',
  maxWidth: '500px',
  width: '90%',
  boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.15)',
  position: 'relative',
  animation: 'fadeInScale 0.25s ease-out',
  border: `1px solid ${colors.border}`,
  backdropFilter: 'blur(20px)',
};

const closeButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: '1rem',
  right: '1rem',
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

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  marginBottom: '1.5rem',
  paddingRight: '2rem',
};

const iconContainerStyle: React.CSSProperties = {
  width: '56px',
  height: '56px',
  borderRadius: '16px',
  background: `linear-gradient(135deg, ${colors.primary}30, ${colors.primaryLight}20)`,
  color: colors.primaryLight,
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
  border: `1px solid ${colors.primary}40`,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1.25rem',
  fontWeight: 700,
  color: colors.textPrimary,
};

const valueStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  color: colors.textSecondary,
  marginTop: '0.35rem',
};

const explanationStyle: React.CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  borderRadius: '14px',
  padding: '1.25rem',
  marginBottom: '1.25rem',
  lineHeight: 1.75,
  color: colors.textSecondary,
  fontSize: '0.95rem',
  border: `1px solid ${colors.border}`,
};

const insightContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.85rem',
  background: `linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))`,
  borderRadius: '14px',
  padding: '1.25rem',
  border: `1px solid rgba(16, 185, 129, 0.2)`,
};

const insightIconStyle: React.CSSProperties = {
  color: colors.success,
  flexShrink: 0,
  marginTop: '2px',
};

const insightTextStyle: React.CSSProperties = {
  color: colors.textSecondary,
  fontSize: '0.9rem',
  lineHeight: 1.65,
};

const loadingContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '3rem 1rem',
  gap: '1.25rem',
};

const loadingTextStyle: React.CSSProperties = {
  color: colors.textMuted,
  fontSize: '0.95rem',
};

export default function ExplanationModal({ isOpen, onClose, data, isLoading }: ExplanationModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div style={modalOverlayStyle} onClick={handleOverlayClick}>
      <div style={modalContentStyle}>
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

        {isLoading ? (
          <div style={loadingContainerStyle}>
            <div style={{ position: 'relative' }}>
              <Loader2 size={36} color={colors.primary} style={{ animation: 'spin 1s linear infinite' }} />
              <Sparkles size={16} color={colors.primaryLight} style={{ position: 'absolute', top: -6, right: -6 }} />
            </div>
            <span style={loadingTextStyle}>AI is analyzing this metric...</span>
          </div>
        ) : data ? (
          <>
            <div style={headerStyle}>
              <div style={iconContainerStyle}>
                {data.icon || <Lightbulb size={26} />}
              </div>
              <div>
                <h3 style={titleStyle}>{data.kpiName}</h3>
                {data.currentValue !== undefined && (
                  <div style={valueStyle}>Current value: <strong style={{ color: colors.primaryLight }}>{data.currentValue}</strong></div>
                )}
              </div>
            </div>

            <div style={explanationStyle}>
              {data.explanation}
            </div>

            {data.actionableInsight && (
              <div style={insightContainerStyle}>
                <Sparkles size={18} style={insightIconStyle} />
                <span style={insightTextStyle}>
                  <strong style={{ color: colors.success }}>Recommended Action:</strong> {data.actionableInsight}
                </span>
              </div>
            )}
          </>
        ) : (
          <div style={loadingContainerStyle}>
            <span style={loadingTextStyle}>No explanation available</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(10px);
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
