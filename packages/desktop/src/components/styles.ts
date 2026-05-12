// ClarityIQ Design System - Premium Dark Theme with Advanced Glassmorphism
import React from 'react';

// Premium font stack - warm, human-friendly typography
const fontStack = "'Plus Jakarta Sans', 'Inter', 'SF Pro Display', -apple-system, system-ui, sans-serif";

export const colors = {
  // Primary palette - Enhanced with more vibrant tones
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',
  primaryGlow: 'rgba(99, 102, 241, 0.4)',
  
  // Backgrounds - Deeper, richer tones
  bgDark: '#0a0a1a',
  bgCard: 'rgba(25, 27, 43, 0.85)',
  bgCardHover: 'rgba(35, 37, 53, 0.95)',
  bgSidebar: 'rgba(15, 17, 28, 0.98)',
  bgInput: 'rgba(255, 255, 255, 0.06)',
  bgOverlay: 'rgba(0, 0, 0, 0.75)',
  
  // Aliases for consistency
  bg: '#0a0a1a',
  cardBg: 'rgba(25, 27, 43, 0.85)',
  
  // Text - Enhanced contrast
  textPrimary: '#ffffff',
  textSecondary: '#a0aec0',
  textMuted: '#718096',
  
  // Aliases for consistency
  text: '#ffffff',
  
  // Status colors - More vibrant
  success: '#10b981',
  successBg: 'rgba(16, 185, 129, 0.18)',
  successGlow: 'rgba(16, 185, 129, 0.3)',
  warning: '#f59e0b',
  warningBg: 'rgba(245, 158, 11, 0.18)',
  warningGlow: 'rgba(245, 158, 11, 0.3)',
  danger: '#ef4444',
  dangerBg: 'rgba(239, 68, 68, 0.18)',
  dangerGlow: 'rgba(239, 68, 68, 0.3)',
  info: '#3b82f6',
  infoBg: 'rgba(59, 130, 246, 0.18)',
  infoGlow: 'rgba(59, 130, 246, 0.3)',
  
  // Accent colors
  purple: '#a855f7',
  purpleBg: 'rgba(168, 85, 247, 0.18)',
  cyan: '#06b6d4',
  cyanBg: 'rgba(6, 182, 212, 0.18)',
  
  // Borders - More subtle
  border: 'rgba(255, 255, 255, 0.06)',
  borderLight: 'rgba(255, 255, 255, 0.10)',
  borderAccent: 'rgba(99, 102, 241, 0.25)',
  
  // Gradients - Enhanced
  gradientPrimary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  gradientSuccess: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
  gradientDanger: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
  gradientWarning: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
  gradientInfo: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
  gradientPurple: 'linear-gradient(135deg, #a855f7 0%, #c084fc 100%)',
  gradientCyan: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
  
  // Mesh gradients for backgrounds
  meshGradient: 'radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(168, 85, 247, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(6, 182, 212, 0.15) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(16, 185, 129, 0.15) 0px, transparent 50%)',
};

export const shadows = {
  card: '0 10px 40px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)',
  cardHover: '0 20px 60px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(0, 0, 0, 0.3)',
  button: '0 8px 24px rgba(99, 102, 241, 0.35), 0 2px 8px rgba(99, 102, 241, 0.2)',
  buttonHover: '0 12px 32px rgba(99, 102, 241, 0.45), 0 4px 12px rgba(99, 102, 241, 0.3)',
  glow: '0 0 60px rgba(99, 102, 241, 0.25)',
  glowSuccess: '0 0 40px rgba(16, 185, 129, 0.25)',
  glowDanger: '0 0 40px rgba(239, 68, 68, 0.25)',
  inner: 'inset 0 2px 8px rgba(0, 0, 0, 0.2)',
  subtle: '0 2px 8px rgba(0, 0, 0, 0.15)',
};

export const baseStyles = {
  // Root container - Enhanced with mesh gradient
  container: {
    display: 'flex',
    height: '100vh',
    background: `${colors.bgDark}`,
    backgroundImage: colors.meshGradient,
    fontFamily: fontStack,
    color: colors.textPrimary,
    fontWeight: 400,
    letterSpacing: '-0.01em',
    position: 'relative',
  } as React.CSSProperties,

  // Sidebar - Enhanced glassmorphism
  sidebar: {
    width: '300px',
    backgroundColor: colors.bgSidebar,
    borderRight: `1px solid ${colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    boxShadow: '4px 0 24px rgba(0, 0, 0, 0.2)',
  } as React.CSSProperties,

  sidebarHeader: {
    padding: '2rem 1.5rem',
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  } as React.CSSProperties,

  logo: {
    background: colors.gradientPrimary,
    padding: '0.65rem',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.glow,
  } as React.CSSProperties,

  brandText: {
    fontWeight: 700,
    fontSize: '1.25rem',
    background: colors.gradientPrimary,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-0.03em',
  } as React.CSSProperties,

  // Cards - Premium glassmorphism
  card: {
    backgroundColor: colors.bgCard,
    border: `1px solid ${colors.border}`,
    borderRadius: '20px',
    padding: '2rem',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: shadows.card,
    position: 'relative',
  } as React.CSSProperties,

  cardHover: {
    backgroundColor: colors.bgCardHover,
    borderColor: colors.borderLight,
    boxShadow: shadows.cardHover,
    transform: 'translateY(-2px)',
  } as React.CSSProperties,

  // KPI Card - Enhanced with gradient borders
  kpiCard: {
    backgroundColor: colors.bgCard,
    border: `1px solid ${colors.border}`,
    borderRadius: '24px',
    padding: '2rem',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: shadows.card,
  } as React.CSSProperties,

  kpiValue: {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: colors.textPrimary,
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
    marginBottom: '0.5rem',
  } as React.CSSProperties,

  kpiLabel: {
    color: colors.textSecondary,
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  } as React.CSSProperties,

  kpiHelper: {
    color: colors.textMuted,
    fontSize: '0.875rem',
    marginTop: '0.75rem',
    lineHeight: 1.5,
  } as React.CSSProperties,

  // Icon containers - Enhanced with glow
  iconBox: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    display: 'grid',
    placeItems: 'center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: shadows.subtle,
  } as React.CSSProperties,

  // Buttons - Premium design
  buttonPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.875rem 1.75rem',
    background: colors.gradientPrimary,
    color: 'white',
    borderRadius: '14px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9375rem',
    boxShadow: shadows.button,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
  } as React.CSSProperties,

  buttonSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.875rem 1.75rem',
    background: colors.gradientSuccess,
    color: 'white',
    borderRadius: '14px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9375rem',
    boxShadow: `0 8px 24px ${colors.successGlow}`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  } as React.CSSProperties,

  buttonDanger: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.875rem 1.75rem',
    background: colors.gradientDanger,
    color: 'white',
    borderRadius: '14px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9375rem',
    boxShadow: `0 8px 24px ${colors.dangerGlow}`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  } as React.CSSProperties,

  buttonGhost: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: colors.textSecondary,
    padding: '0.625rem',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  } as React.CSSProperties,

  // Generic button
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.875rem 1.75rem',
    borderRadius: '14px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9375rem',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  } as React.CSSProperties,

  // Input - Enhanced
  input: {
    width: '100%',
    padding: '0.875rem 1.25rem',
    backgroundColor: colors.bgInput,
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    color: colors.textPrimary,
    fontSize: '0.9375rem',
    outline: 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(8px)',
  } as React.CSSProperties,

  // Pills / Tags - Enhanced
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    borderRadius: '999px',
    fontSize: '0.8125rem',
    fontWeight: 600,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(8px)',
  } as React.CSSProperties,

  // Section headers - Enhanced
  sectionTitle: {
    margin: '0 0 1.5rem 0',
    color: colors.textPrimary,
    fontSize: '1.125rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    letterSpacing: '-0.02em',
  } as React.CSSProperties,

  // Stats
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 0',
    borderBottom: `1px solid ${colors.border}`,
  } as React.CSSProperties,

  statLabel: {
    color: colors.textSecondary,
    fontSize: '0.9375rem',
    fontWeight: 500,
  } as React.CSSProperties,

  statValue: {
    color: colors.textPrimary,
    fontWeight: 700,
    fontSize: '1rem',
  } as React.CSSProperties,

  // Client list item - Enhanced
  clientItem: {
    padding: '1rem 1.25rem',
    cursor: 'pointer',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    border: `1px solid transparent`,
  } as React.CSSProperties,

  clientItemActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
    borderColor: colors.borderAccent,
    boxShadow: `0 4px 16px ${colors.primaryGlow}`,
  } as React.CSSProperties,

  // Main content area
  mainContent: {
    flex: 1,
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  } as React.CSSProperties,

  // Page header - Enhanced
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2.5rem',
  } as React.CSSProperties,

  pageTitle: {
    margin: 0,
    color: colors.textPrimary,
    fontWeight: 700,
    fontSize: '2rem',
    letterSpacing: '-0.03em',
  } as React.CSSProperties,

  pageSubtitle: {
    color: colors.textMuted,
    marginTop: '0.5rem',
    fontSize: '1rem',
    fontWeight: 400,
  } as React.CSSProperties,

  // Grid layouts - Enhanced spacing
  gridThree: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
    marginBottom: '2rem',
  } as React.CSSProperties,

  gridTwo: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    marginBottom: '2rem',
  } as React.CSSProperties,

  // Empty state - Enhanced
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: colors.textMuted,
    padding: '4rem',
  } as React.CSSProperties,

  emptyIcon: {
    background: `rgba(99, 102, 241, 0.12)`,
    padding: '2.5rem',
    borderRadius: '50%',
    marginBottom: '2rem',
    boxShadow: shadows.glow,
  } as React.CSSProperties,

  // Processing state - Enhanced
  processingBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
    padding: '0.875rem 1.75rem',
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
    color: colors.primaryLight,
    borderRadius: '14px',
    fontWeight: 600,
    border: `1px solid ${colors.borderAccent}`,
    boxShadow: shadows.glow,
  } as React.CSSProperties,

  // History row - Enhanced
  historyRow: {
    padding: '1.25rem 1.5rem',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: `1px solid ${colors.border}`,
    borderRadius: '16px',
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.6fr 0.6fr 0.6fr',
    gap: '1.25rem',
    alignItems: 'center',
    marginBottom: '1rem',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(8px)',
  } as React.CSSProperties,

  // Metric box - Enhanced
  metricBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: '16px',
    padding: '1.25rem',
    border: `1px solid ${colors.border}`,
    backdropFilter: 'blur(8px)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  } as React.CSSProperties,

  metricLabel: {
    color: colors.textMuted,
    fontSize: '0.6875rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: '0.625rem',
  } as React.CSSProperties,

  metricValue: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: colors.textPrimary,
    letterSpacing: '-0.02em',
  } as React.CSSProperties,

  // Signal indicator - Enhanced
  signalBox: {
    paddingLeft: '1.25rem',
    borderLeft: '4px solid',
    marginBottom: '1.25rem',
  } as React.CSSProperties,
};

// Helper to get status color
export const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'positive':
    case 'improving':
    case 'increasing':
    case 'low':
      return colors.success;
    case 'negative':
    case 'declining':
    case 'cooling':
    case 'high':
      return colors.danger;
    default:
      return colors.textSecondary;
  }
};

// Helper to get status background
export const getStatusBg = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'positive':
    case 'improving':
    case 'increasing':
    case 'low':
      return colors.successBg;
    case 'negative':
    case 'declining':
    case 'cooling':
    case 'high':
      return colors.dangerBg;
    default:
      return 'rgba(148, 163, 184, 0.1)';
  }
};
