import { Radio } from 'lucide-react';

export default function SentinelWidget() {
  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))',
      backdropFilter: 'blur(20px)',
      color: 'white',
      padding: '0.85rem 1.75rem',
      borderRadius: '9999px',
      display: 'flex',
      alignItems: 'center',
      gap: '0.85rem',
      boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3), 0 0 20px rgba(239, 68, 68, 0.2)',
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      zIndex: 50,
      border: '1px solid rgba(239, 68, 68, 0.3)',
    }}>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; box-shadow: 0 8px 32px rgba(239, 68, 68, 0.3), 0 0 20px rgba(239, 68, 68, 0.2); }
            50% { opacity: .85; box-shadow: 0 8px 32px rgba(239, 68, 68, 0.4), 0 0 30px rgba(239, 68, 68, 0.3); }
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}
      </style>
      <Radio size={18} color="#ef4444" style={{ animation: 'blink 1.2s ease-in-out infinite' }} />
      <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', color: '#f87171' }}>
        SENTINEL ACTIVE
      </span>
      <div style={{ 
        width: '10px', 
        height: '10px', 
        borderRadius: '50%', 
        backgroundColor: '#ef4444',
        boxShadow: '0 0 12px rgba(239, 68, 68, 0.8)',
        animation: 'blink 1.2s ease-in-out infinite',
      }} />
    </div>
  );
}
