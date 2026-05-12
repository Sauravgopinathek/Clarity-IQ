import React from 'react';
import { ArrowRight, BrainCircuit, CheckCircle2, Gauge, MessageSquareText, Mic, Radar, ShieldCheck, Sparkles, Zap, Award, TrendingUp, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { colors, shadows } from './styles';

const metrics = [
  { value: '18%', label: 'Lift in forecast accuracy', icon: TrendingUp },
  { value: '<5 min', label: 'To score a fresh call', icon: Zap },
  { value: '3x', label: 'Faster deal reviews', icon: BarChart3 },
];

const features = [
  {
    icon: BrainCircuit,
    title: 'Automated BANT extraction',
    description:
      'Turn long call transcripts into budget, authority, need, and timeline signals your team can act on immediately.',
    gradient: colors.gradientPrimary,
  },
  {
    icon: Gauge,
    title: 'Deal momentum tracking',
    description:
      'Measure buying signals, stall risk, and next-step clarity so reps know which opportunities are accelerating and which are drifting.',
    gradient: colors.gradientSuccess,
  },
  {
    icon: Sparkles,
    title: 'AI vibe checks',
    description:
      'Detect confidence gaps, stakeholder friction, and weak champion energy before they show up as a lost quarter.',
    gradient: colors.gradientPurple,
  },
  {
    icon: ShieldCheck,
    title: 'Manager-ready summaries',
    description:
      'Give leaders concise updates, risk flags, and coaching prompts without making them sit through every recording.',
    gradient: colors.gradientCyan,
  },
];

const steps = [
  {
    icon: Mic,
    title: 'Record the meeting',
    description:
      'Capture customer conversations from discovery to late-stage negotiation with the workflow your team already uses.',
  },
  {
    icon: MessageSquareText,
    title: 'AI analyzes the transcript',
    description:
      'ClarityIQ identifies buying signals, objections, missing stakeholders, and action items in a structured view.',
  },
  {
    icon: Radar,
    title: 'Close with confidence',
    description:
      'Surface the right next move, strengthen coaching, and keep each deal moving with less guesswork.',
  },
];

const proofPoints = [
  { text: 'Spot stalled deals before they slip', icon: Award },
  { text: 'Coach reps with specific evidence', icon: CheckCircle2 },
  { text: 'Keep pipeline reviews aligned', icon: TrendingUp },
];

export default function LandingPage() {
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <header style={styles.topbar}>
          <div style={styles.brand}>
            <span style={styles.brandMark}><Zap size={24} /></span>
            <span style={styles.brandText}>ClarityIQ</span>
          </div>

          <nav style={styles.topnav}>
            <button type="button" onClick={() => scrollToSection('features')} style={styles.navButton}>Features</button>
            <button type="button" onClick={() => scrollToSection('how-it-works')} style={styles.navButton}>How it works</button>
            <button type="button" onClick={() => scrollToSection('footer')} style={styles.navButton}>Contact</button>
          </nav>
        </header>

        <main>
          <section id="hero" style={styles.heroSection}>
            <div style={styles.heroCopy}>
              <div style={styles.eyebrow}>
                <Sparkles size={18} />
                AI sales intelligence for modern revenue teams
              </div>
              <h1 style={styles.heroTitle}>Win more deals with AI sales intelligence.</h1>
              <p style={styles.heroText}>
                ClarityIQ turns customer conversations into momentum signals, risk alerts,
                and next-step clarity so your team can sell with sharper judgment and less pipeline fiction.
              </p>

              <div style={styles.heroActions}>
                <Link to="/login" style={styles.primaryButton}>
                  Start for free
                  <ArrowRight size={20} />
                </Link>
              </div>

              <div style={styles.proofGrid}>
                {proofPoints.map(({ text, icon: Icon }) => (
                  <div key={text} style={styles.proofCard}>
                    <Icon size={20} color={colors.primaryLight} />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <aside style={styles.heroPanel}>
              <div style={styles.insightCard}>
                <div style={styles.cardLabel}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: colors.success,
                    animation: 'pulse 2s ease-in-out infinite',
                  }} />
                  Live deal pulse
                </div>
                <div style={styles.cardTitle}>Acme renewal - 78 momentum</div>
                <div style={styles.signalRow}>
                  <span>Champion strength</span>
                  <strong style={{ color: colors.success }}>High</strong>
                </div>
                <div style={styles.signalRow}>
                  <span>Decision clarity</span>
                  <strong style={{ color: colors.warning }}>Medium</strong>
                </div>
                <div style={{ ...styles.signalRow, color: colors.danger }}>
                  <span>Risk</span>
                  <strong>Security stakeholder missing</strong>
                </div>
              </div>

              <div style={{ ...styles.insightCard, alignSelf: 'flex-end', width: '90%' }}>
                <div style={styles.cardLabel}>
                  <Sparkles size={14} />
                  AI summary
                </div>
                <p style={styles.panelText}>
                  Buyer confirmed budget range, responded well to ROI framing, and requested implementation timing before legal review.
                </p>
              </div>

              <div style={styles.statsStrip}>
                {metrics.map(({ value, label, icon: Icon }) => (
                  <div key={label} style={styles.statCard}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: colors.primaryGlow,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px',
                    }}>
                      <Icon size={20} color={colors.primary} />
                    </div>
                    <strong style={styles.statValue}>{value}</strong>
                    <span style={styles.statLabel}>{label}</span>
                  </div>
                ))}
              </div>
            </aside>
          </section>

          <section id="features" style={styles.section}>
            <div style={styles.sectionHeading}>
              <span style={styles.sectionKicker}>
                <Award size={18} />
                Features
              </span>
              <h2 style={styles.sectionTitle}>Everything your pipeline review wishes it already had.</h2>
              <p style={styles.sectionText}>
                Replace scattered notes and gut-feel forecasting with structured deal intelligence built directly from customer conversations.
              </p>
            </div>

            <div style={styles.featureGrid}>
              {features.map(({ icon: Icon, title, description, gradient }) => (
                <article key={title} style={styles.featureCard}>
                  <div style={{ ...styles.featureIcon, background: gradient }}>
                    <Icon size={24} color="white" />
                  </div>
                  <h3 style={styles.cardHeading}>{title}</h3>
                  <p style={styles.cardText}>{description}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="how-it-works" style={styles.section}>
            <div style={styles.sectionHeading}>
              <span style={styles.sectionKicker}>
                <Radar size={18} />
                How It Works
              </span>
              <h2 style={styles.sectionTitle}>Three steps from raw calls to confident action.</h2>
              <p style={styles.sectionText}>
                ClarityIQ fits naturally into existing sales workflows and makes every conversation easier to operationalize.
              </p>
            </div>

            <div style={styles.stepsGrid}>
              {steps.map(({ icon: Icon, title, description }, index) => (
                <article key={title} style={styles.stepCard}>
                  <div style={styles.stepNumber}>{`0${index + 1}`}</div>
                  <div style={styles.featureIcon}>
                    <Icon size={24} color={colors.primary} />
                  </div>
                  <h3 style={styles.cardHeading}>{title}</h3>
                  <p style={styles.cardText}>{description}</p>
                </article>
              ))}
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.ctaCard}>
              <div>
                <span style={styles.sectionKicker}>
                  <Sparkles size={18} />
                  Ready To Upgrade Forecast Calls?
                </span>
                <h2 style={{ ...styles.sectionTitle, fontSize: '2.5rem', marginTop: '1rem' }}>
                  Give your team a clearer read on every deal.
                </h2>
                <p style={{ ...styles.sectionText, marginTop: '1rem', marginBottom: '2rem' }}>
                  Launch a focused pilot, analyze live conversations, and give managers evidence they can coach from.
                </p>
                <Link to="/login" style={styles.primaryButton}>
                  Get started now
                  <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          </section>
        </main>

        <footer id="footer" style={styles.footer}>
          <div>
            <div style={{ ...styles.brand, marginBottom: '1rem' }}>
              <span style={styles.brandMark}><Zap size={24} /></span>
              <span style={styles.brandText}>ClarityIQ</span>
            </div>
            <p style={styles.footerCopy}>
              AI-driven sales analysis and deal momentum tracking for teams that care about signal quality.
            </p>
          </div>

          <div style={styles.footerLinks}>
            <button type="button" onClick={() => scrollToSection('features')} style={styles.navButton}>Features</button>
            <button type="button" onClick={() => scrollToSection('how-it-works')} style={styles.navButton}>How it works</button>
          </div>

          <p style={styles.footerMeta}>© 2026 ClarityIQ. Built for sharper pipeline decisions.</p>
        </footer>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

const glass = {
  background: colors.bgCard,
  border: `1px solid ${colors.border}`,
  boxShadow: shadows.card,
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
} as const;

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: colors.bgDark,
    backgroundImage: colors.meshGradient,
    color: colors.textPrimary,
    fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, system-ui, sans-serif",
  },
  shell: {
    width: 'min(1180px, calc(100% - 32px))',
    margin: '0 auto',
    padding: '28px 0 48px',
  },
  topbar: {
    ...glass,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
    padding: '18px 24px',
    borderRadius: 999,
    marginBottom: 28,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  brand: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 12,
    fontWeight: 700,
    letterSpacing: '-0.03em',
  },
  brandMark: {
    display: 'inline-grid',
    placeItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 14,
    color: '#ffffff',
    background: colors.gradientPrimary,
    boxShadow: shadows.glow,
  },
  brandText: { 
    fontSize: '1.05rem',
    background: colors.gradientPrimary,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  topnav: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 24,
    color: colors.textSecondary,
  },
  navLink: { 
    color: colors.textSecondary, 
    textDecoration: 'none',
    transition: 'color 0.2s ease',
  },
  navButton: {
    color: colors.textSecondary,
    background: 'none',
    border: 'none',
    padding: '8px 12px',
    cursor: 'pointer',
    font: 'inherit',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },
  heroSection: {
    display: 'grid',
    gridTemplateColumns: '1.05fr 0.95fr',
    gap: 32,
    padding: '28px 0 44px',
  },
  heroCopy: {
    ...glass,
    borderRadius: 32,
    padding: 42,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    color: colors.primaryLight,
    fontSize: '0.84rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  heroTitle: {
    margin: '18px 0 0',
    fontSize: '5rem',
    lineHeight: 0.97,
    letterSpacing: '-0.055em',
    color: colors.textPrimary,
  },
  heroText: {
    maxWidth: '60ch',
    marginTop: 24,
    fontSize: '1.08rem',
    lineHeight: 1.72,
    color: colors.textSecondary,
  },
  heroActions: {
    display: 'flex',
    gap: 14,
    marginTop: 28,
    flexWrap: 'wrap',
  },
  primaryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 48,
    padding: '0 24px',
    borderRadius: 999,
    color: '#ffffff',
    background: colors.gradientPrimary,
    textDecoration: 'none',
    fontWeight: 700,
    boxShadow: shadows.button,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  proofGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 14,
    marginTop: 34,
  },
  proofCard: {
    padding: '14px 16px',
    borderRadius: 18,
    background: 'rgba(255,255,255,0.03)',
    border: `1px solid ${colors.border}`,
    color: colors.textSecondary,
    fontSize: '0.96rem',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.2s ease',
  },
  heroPanel: {
    ...glass,
    borderRadius: 32,
    padding: 28,
    display: 'grid',
    gap: 18,
    alignContent: 'start',
  },
  insightCard: {
    padding: 22,
    background: 'rgba(9, 18, 33, 0.82)',
    borderRadius: 24,
    border: `1px solid ${colors.borderLight}`,
    backdropFilter: 'blur(12px)',
    transition: 'all 0.2s ease',
  },
  cardLabel: {
    color: colors.textSecondary,
    fontSize: '0.82rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cardTitle: {
    marginTop: 12,
    fontSize: '1.15rem',
    fontWeight: 700,
    color: colors.textPrimary,
  },
  panelText: {
    margin: '12px 0 0',
    color: colors.textSecondary,
    lineHeight: 1.7,
  },
  signalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 18,
    paddingTop: 14,
    marginTop: 14,
    borderTop: `1px solid ${colors.border}`,
    color: colors.textSecondary,
  },
  signalAlert: {
    color: colors.danger,
  },
  statsStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 1,
    background: colors.border,
    borderRadius: 24,
    overflow: 'hidden',
  },
  statCard: {
    padding: 18,
    background: 'rgba(8, 16, 29, 0.9)',
    display: 'flex',
    flexDirection: 'column',
  },
  statValue: {
    display: 'block',
    fontSize: '1.45rem',
    letterSpacing: '-0.04em',
    fontWeight: 700,
    color: colors.textPrimary,
  },
  statLabel: {
    display: 'block',
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: '0.92rem',
    lineHeight: 1.5,
  },
  section: {
    padding: '38px 0',
  },
  sectionHeading: {
    maxWidth: 760,
    marginBottom: 28,
  },
  sectionKicker: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    color: colors.primaryLight,
    fontSize: '0.84rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    margin: '18px 0 0',
    fontSize: '3.3rem',
    lineHeight: 1.02,
    letterSpacing: '-0.05em',
    color: colors.textPrimary,
  },
  sectionText: {
    marginTop: 16,
    color: colors.textSecondary,
    lineHeight: 1.72,
    fontSize: '1.02rem',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 18,
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 18,
  },
  featureCard: {
    ...glass,
    padding: 26,
    borderRadius: 24,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  stepCard: {
    ...glass,
    padding: 26,
    borderRadius: 24,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  featureIcon: {
    display: 'inline-grid',
    placeItems: 'center',
    width: 48,
    height: 48,
    marginBottom: 18,
    borderRadius: 16,
    border: `1px solid ${colors.borderLight}`,
    transition: 'all 0.3s ease',
  },
  cardHeading: {
    margin: 0,
    fontSize: '1.2rem',
    letterSpacing: '-0.03em',
    color: colors.textPrimary,
    fontWeight: 700,
  },
  cardText: {
    marginTop: 14,
    color: colors.textSecondary,
    lineHeight: 1.72,
  },
  stepNumber: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    height: 32,
    marginBottom: 18,
    padding: '0 12px',
    borderRadius: 999,
    background: 'rgba(255, 255, 255, 0.05)',
    border: `1px solid ${colors.border}`,
    color: colors.primaryLight,
    fontSize: '0.85rem',
    fontWeight: 700,
  },
  ctaCard: {
    ...glass,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
    padding: 48,
    borderRadius: 32,
    background: `linear-gradient(135deg, ${colors.bgCard} 0%, rgba(99, 102, 241, 0.1) 100%)`,
    borderColor: colors.borderAccent,
  },
  footer: {
    ...glass,
    display: 'grid',
    gridTemplateColumns: '1.1fr auto auto',
    gap: 24,
    alignItems: 'center',
    marginTop: 18,
    padding: 28,
    borderRadius: 32,
  },
  footerLinks: {
    display: 'inline-flex',
    gap: 18,
  },
  footerCopy: {
    maxWidth: '44ch',
    color: colors.textSecondary,
    lineHeight: 1.72,
  },
  footerMeta: {
    color: colors.textMuted,
    textAlign: 'right',
  },
};
