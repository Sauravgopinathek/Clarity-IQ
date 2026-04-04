import React from 'react';
import { ArrowRight, BrainCircuit, CheckCircle2, Gauge, MessageSquareText, Mic, Radar, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const metrics = [
  { value: '18%', label: 'Lift in forecast accuracy' },
  { value: '<5 min', label: 'To score a fresh call' },
  { value: '3x', label: 'Faster deal reviews for managers' },
];

const features = [
  {
    icon: BrainCircuit,
    title: 'Automated BANT extraction',
    description:
      'Turn long call transcripts into budget, authority, need, and timeline signals your team can act on immediately.',
  },
  {
    icon: Gauge,
    title: 'Deal momentum tracking',
    description:
      'Measure buying signals, stall risk, and next-step clarity so reps know which opportunities are accelerating and which are drifting.',
  },
  {
    icon: Sparkles,
    title: 'AI vibe checks',
    description:
      'Detect confidence gaps, stakeholder friction, and weak champion energy before they show up as a lost quarter.',
  },
  {
    icon: ShieldCheck,
    title: 'Manager-ready summaries',
    description:
      'Give leaders concise updates, risk flags, and coaching prompts without making them sit through every recording.',
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
  'Spot stalled deals before they slip',
  'Coach reps with specific evidence from real calls',
  'Keep pipeline reviews aligned to actual customer momentum',
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
            <span style={styles.brandMark}><Zap size={22} /></span>
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
                <CheckCircle2 size={16} />
                AI sales analysis for modern revenue teams
              </div>
              <h1 style={styles.heroTitle}>Win more deals with AI sales intelligence.</h1>
              <p style={styles.heroText}>
                ClarityIQ turns customer conversations into momentum signals, risk alerts,
                and next-step clarity so your team can sell with sharper judgment and less pipeline fiction.
              </p>

              <div style={styles.heroActions}>
                <Link to="/login" style={styles.primaryButton}>
                  Start for free
                  <ArrowRight size={18} />
                </Link>
              </div>

              <div style={styles.proofGrid}>
                {proofPoints.map((point) => (
                  <div key={point} style={styles.proofCard}>{point}</div>
                ))}
              </div>
            </div>

            <aside style={styles.heroPanel}>
              <div style={styles.insightCard}>
                <div style={styles.cardLabel}>Live deal pulse</div>
                <div style={styles.cardTitle}>Acme renewal - 78 momentum</div>
                <div style={styles.signalRow}><span>Champion strength</span><strong>High</strong></div>
                <div style={styles.signalRow}><span>Decision clarity</span><strong>Medium</strong></div>
                <div style={{ ...styles.signalRow, ...styles.signalAlert }}><span>Risk</span><strong>Security stakeholder missing</strong></div>
              </div>

              <div style={{ ...styles.insightCard, alignSelf: 'flex-end', width: '86%' }}>
                <div style={styles.cardLabel}>AI summary</div>
                <p style={styles.panelText}>
                  Buyer confirmed budget range, responded well to ROI framing, and requested implementation timing before legal review.
                </p>
              </div>

              <div style={styles.statsStrip}>
                {metrics.map((metric) => (
                  <div key={metric.label} style={styles.statCard}>
                    <strong style={styles.statValue}>{metric.value}</strong>
                    <span style={styles.statLabel}>{metric.label}</span>
                  </div>
                ))}
              </div>
            </aside>
          </section>

          <section id="features" style={styles.section}>
            <div style={styles.sectionHeading}>
              <span style={styles.sectionKicker}>Features</span>
              <h2 style={styles.sectionTitle}>Everything your pipeline review wishes it already had.</h2>
              <p style={styles.sectionText}>
                Replace scattered notes and gut-feel forecasting with structured deal intelligence built directly from customer conversations.
              </p>
            </div>

            <div style={styles.featureGrid}>
              {features.map(({ icon: Icon, title, description }) => (
                <article key={title} style={styles.featureCard}>
                  <div style={styles.featureIcon}><Icon size={22} /></div>
                  <h3 style={styles.cardHeading}>{title}</h3>
                  <p style={styles.cardText}>{description}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="how-it-works" style={styles.section}>
            <div style={styles.sectionHeading}>
              <span style={styles.sectionKicker}>How It Works</span>
              <h2 style={styles.sectionTitle}>Three steps from raw calls to confident action.</h2>
              <p style={styles.sectionText}>
                ClarityIQ fits naturally into existing sales workflows and makes every conversation easier to operationalize.
              </p>
            </div>

            <div style={styles.stepsGrid}>
              {steps.map(({ icon: Icon, title, description }, index) => (
                <article key={title} style={styles.featureCard}>
                  <div style={styles.stepNumber}>{`0${index + 1}`}</div>
                  <div style={styles.featureIcon}><Icon size={22} /></div>
                  <h3 style={styles.cardHeading}>{title}</h3>
                  <p style={styles.cardText}>{description}</p>
                </article>
              ))}
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.ctaCard}>
              <div>
                <span style={styles.sectionKicker}>Ready To Upgrade Forecast Calls?</span>
                <h2 style={styles.sectionTitle}>Give your team a clearer read on every deal.</h2>
                <p style={styles.sectionText}>
                  Launch a focused pilot, analyze live conversations, and give managers evidence they can coach from.
                </p>
              </div>
            </div>
          </section>
        </main>

        <footer id="footer" style={styles.footer}>
          <div>
            <div style={{ ...styles.brand, marginBottom: 12 }}>
              <span style={styles.brandMark}><Zap size={22} /></span>
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

          <p style={styles.footerMeta}>(c) 2026 ClarityIQ. Built for sharper pipeline decisions.</p>
        </footer>
      </div>
    </div>
  );
}

const glass = {
  background: 'linear-gradient(180deg, rgba(12, 23, 42, 0.86), rgba(7, 15, 28, 0.84))',
  border: '1px solid rgba(148, 184, 255, 0.16)',
  boxShadow: '0 24px 80px rgba(1, 8, 20, 0.45)',
  backdropFilter: 'blur(18px)',
} as const;

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at top left, rgba(95, 180, 255, 0.18), transparent 28%), radial-gradient(circle at 80% 20%, rgba(125, 124, 255, 0.2), transparent 26%), radial-gradient(circle at 50% 80%, rgba(70, 224, 170, 0.12), transparent 30%), linear-gradient(180deg, #08111f 0%, #050b15 100%)',
    color: '#ebf2ff',
    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
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
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  },
  brandText: { fontSize: '1.05rem' },
  topnav: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 24,
    color: '#a8b6d8',
  },
  navLink: { color: '#a8b6d8', textDecoration: 'none' },
  navButton: {
    color: '#a8b6d8',
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    font: 'inherit',
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
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    color: '#c8d4ee',
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
  },
  heroText: {
    maxWidth: '60ch',
    marginTop: 24,
    fontSize: '1.08rem',
    lineHeight: 1.72,
    color: '#a8b6d8',
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
    padding: '0 18px',
    borderRadius: 999,
    color: '#07111f',
    background: 'linear-gradient(135deg, #e8f8ff 0%, #5fb4ff 45%, #46e0aa 100%)',
    textDecoration: 'none',
    fontWeight: 700,
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
    border: '1px solid rgba(148, 184, 255, 0.12)',
    color: '#c8d4ee',
    fontSize: '0.96rem',
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
    border: '1px solid rgba(148, 184, 255, 0.18)',
  },
  cardLabel: {
    color: '#a8b6d8',
    fontSize: '0.82rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  cardTitle: {
    marginTop: 12,
    fontSize: '1.15rem',
    fontWeight: 700,
  },
  panelText: {
    margin: '12px 0 0',
    color: '#a8b6d8',
    lineHeight: 1.7,
  },
  signalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 18,
    paddingTop: 14,
    marginTop: 14,
    borderTop: '1px solid rgba(148, 184, 255, 0.14)',
    color: '#a8b6d8',
  },
  signalAlert: {
    color: '#ff8f9d',
  },
  statsStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 1,
    background: 'rgba(148, 184, 255, 0.16)',
    borderRadius: 24,
    overflow: 'hidden',
  },
  statCard: {
    padding: 18,
    background: 'rgba(8, 16, 29, 0.9)',
  },
  statValue: {
    display: 'block',
    fontSize: '1.45rem',
    letterSpacing: '-0.04em',
  },
  statLabel: {
    display: 'block',
    marginTop: 8,
    color: '#a8b6d8',
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
    color: '#c8d4ee',
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
  },
  sectionText: {
    marginTop: 16,
    color: '#a8b6d8',
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
  },
  featureIcon: {
    display: 'inline-grid',
    placeItems: 'center',
    width: 48,
    height: 48,
    marginBottom: 18,
    borderRadius: 16,
    background: 'linear-gradient(135deg, rgba(95, 180, 255, 0.2), rgba(70, 224, 170, 0.16))',
    border: '1px solid rgba(148, 184, 255, 0.24)',
  },
  cardHeading: {
    margin: 0,
    fontSize: '1.2rem',
    letterSpacing: '-0.03em',
  },
  cardText: {
    marginTop: 14,
    color: '#a8b6d8',
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
    border: '1px solid rgba(148, 184, 255, 0.14)',
    color: '#c8d4ee',
    fontSize: '0.85rem',
    fontWeight: 700,
  },
  ctaCard: {
    ...glass,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
    padding: 32,
    borderRadius: 32,
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
    color: '#a8b6d8',
    lineHeight: 1.72,
  },
  footerMeta: {
    color: '#a8b6d8',
    textAlign: 'right',
  },
};
