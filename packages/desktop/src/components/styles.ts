// ClarityIQ Design System - Modern Dark Theme with Glassmorphism
import React from 'react';

// Font stack: SF Pro for Mac, Segoe UI for Windows, clean fallbacks
const fontStack = "'SF Pro Display', 'Segoe UI', -apple-system, system-ui, sans-serif";

export const colors = {
  // Primary palette
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4f46e5',
  
  // Backgrounds
  bgDark: '#0f0f23',
  bgCard: 'rgba(30, 32, 48, 0.8)',
  bgCardHover: 'rgba(40, 42, 60, 0.9)',
  bgSidebar: 'rgba(20, 22, 38, 0.95)',
  bgInput: 'rgba(255, 255, 255, 0.05)',
  
  // Text
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  
  // Status colors
  success: '#10b981',
  successBg: 'rgba(16, 185, 129, 0.15)',
  warning: '#f59e0b',
  warningBg: 'rgba(245, 158, 11, 0.15)',
  danger: '#ef4444',
  dangerBg: 'rgba(239, 68, 68, 0.15)',
  info: '#3b82f6',
  infoBg: 'rgba(59, 130, 246, 0.15)',
  
  // Borders
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.12)',
  
  // Gradients
  gradientPrimary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  gradientSuccess: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
  gradientDanger: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
};

export const shadows = {
  card: '0 8px 32px rgba(0, 0, 0, 0.3)',
  cardHover: '0 12px 40px rgba(0, 0, 0, 0.4)',
  button: '0 4px 16px rgba(99, 102, 241, 0.3)',
  glow: '0 0 40px rgba(99, 102, 241, 0.2)',
};

export const baseStyles = {
  // Root container
  container: {
    display: 'flex',
    height: '100vh',
    background: `linear-gradient(135deg, ${colors.bgDark} 0%, #1a1a2e 50%, #16213e 100%)`,
    fontFamily: fontStack,
    color: colors.textPrimary,
    fontWeight: 400,
    letterSpacing: '-0.01em',
  } as React.CSSProperties,

  // Sidebar
  sidebar: {
    width: '280px',
    backgroundColor: colors.bgSidebar,
    borderRight: `1px solid ${colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    backdropFilter: 'blur(20px)',
  } as React.CSSProperties,

  sidebarHeader: {
    padding: '1.5rem',
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  } as React.CSSProperties,

  logo: {
    background: colors.gradientPrimary,
    padding: '0.5rem',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,

  brandText: {
    fontWeight: 600,
    fontSize: '1.15rem',
    background: colors.gradientPrimary,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-0.02em',
  } as React.CSSProperties,

  // Cards
  card: {
    backgroundColor: colors.bgCard,
    border: `1px solid ${colors.border}`,
    borderRadius: '16px',
    padding: '1.5rem',
    backdropFilter: 'blur(20px)',
    transition: 'all 0.3s ease',
  } as React.CSSProperties,

  cardHover: {
    backgroundColor: colors.bgCardHover,
    borderColor: colors.borderLight,
    boxShadow: shadows.cardHover,
  } as React.CSSProperties,

  // KPI Card specific
  kpiCard: {
    backgroundColor: colors.bgCard,
    border: `1px solid ${colors.border}`,
    borderRadius: '20px',
    padding: '1.5rem',
    backdropFilter: 'blur(20px)',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  } as React.CSSProperties,

  kpiValue: {
    fontSize: '2rem',
    fontWeight: 600,
    color: colors.textPrimary,
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  } as React.CSSProperties,

  kpiLabel: {
    color: colors.textSecondary,
    fontSize: '0.8rem',
    fontWeight: 500,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  } as React.CSSProperties,

  kpiHelper: {
    color: colors.textMuted,
    fontSize: '0.85rem',
    marginTop: '0.5rem',
  } as React.CSSProperties,

  // Icon containers
  iconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    display: 'grid',
    placeItems: 'center',
    transition: 'transform 0.2s ease',
  } as React.CSSProperties,

  // Buttons
  buttonPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: colors.gradientPrimary,
    color: 'white',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
    boxShadow: shadows.button,
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  buttonSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: colors.gradientSuccess,
    color: 'white',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  buttonDanger: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: colors.gradientDanger,
    color: 'white',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
    boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  buttonGhost: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: colors.textSecondary,
    padding: '0.5rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  // Input
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: colors.bgInput,
    border: `1px solid ${colors.border}`,
    borderRadius: '10px',
    color: colors.textPrimary,
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  // Pills / Tags
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.4rem 0.85rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: 600,
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  // Section headers
  sectionTitle: {
    margin: '0 0 1.25rem 0',
    color: colors.textPrimary,
    fontSize: '0.95rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    letterSpacing: '-0.01em',
  } as React.CSSProperties,

  // Stats
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 0',
    borderBottom: `1px solid ${colors.border}`,
  } as React.CSSProperties,

  statLabel: {
    color: colors.textSecondary,
    fontSize: '0.9rem',
  } as React.CSSProperties,

  statValue: {
    color: colors.textPrimary,
    fontWeight: 600,
    fontSize: '0.9rem',
  } as React.CSSProperties,

  // Client list item
  clientItem: {
    padding: '0.85rem 1rem',
    cursor: 'pointer',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
    transition: 'all 0.2s ease',
    border: `1px solid transparent`,
  } as React.CSSProperties,

  clientItemActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
  } as React.CSSProperties,

  // Main content area
  mainContent: {
    flex: 1,
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  } as React.CSSProperties,

  // Page header
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  } as React.CSSProperties,

  pageTitle: {
    margin: 0,
    color: colors.textPrimary,
    fontWeight: 600,
    fontSize: '1.5rem',
    letterSpacing: '-0.02em',
  } as React.CSSProperties,

  pageSubtitle: {
    color: colors.textMuted,
    marginTop: '0.5rem',
    fontSize: '0.95rem',
  } as React.CSSProperties,

  // Grid layouts
  gridThree: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.25rem',
    marginBottom: '1.5rem',
  } as React.CSSProperties,

  gridTwo: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    marginBottom: '1.5rem',
  } as React.CSSProperties,

  // Empty state
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: colors.textMuted,
  } as React.CSSProperties,

  emptyIcon: {
    background: `rgba(99, 102, 241, 0.1)`,
    padding: '2rem',
    borderRadius: '50%',
    marginBottom: '1.5rem',
  } as React.CSSProperties,

  // Processing state
  processingBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    color: colors.primaryLight,
    borderRadius: '12px',
    fontWeight: 600,
  } as React.CSSProperties,

  // History row
  historyRow: {
    padding: '1rem 1.25rem',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.6fr 0.6fr 0.6fr',
    gap: '1rem',
    alignItems: 'center',
    marginBottom: '0.75rem',
    transition: 'all 0.2s ease',
  } as React.CSSProperties,

  // Metric box
  metricBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    padding: '1rem',
    border: `1px solid ${colors.border}`,
  } as React.CSSProperties,

  metricLabel: {
    color: colors.textMuted,
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
  } as React.CSSProperties,

  metricValue: {
    fontSize: '1.05rem',
    fontWeight: 600,
    color: colors.textPrimary,
  } as React.CSSProperties,

  // Signal indicator with colored border
  signalBox: {
    paddingLeft: '1rem',
    borderLeft: '3px solid',
    marginBottom: '1rem',
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
