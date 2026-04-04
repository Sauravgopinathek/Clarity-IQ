import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Gauge,
  MessageSquareText,
  Mic,
  Radar,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

const metrics = [
  { value: '18%', label: 'Lift in forecast accuracy' },
  { value: '<5 min', label: 'To score a fresh call' },
  { value: '3x', label: 'Faster deal reviews for managers' },
]

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
]

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
]

const proofPoints = [
  'Spot stalled deals before they slip',
  'Coach reps with specific evidence from real calls',
  'Keep pipeline reviews aligned to actual customer momentum',
]

function App() {
  return (
    <div className="page-shell">
      <header className="topbar">
        <a className="brand" href="#hero" aria-label="ClarityIQ home">
          <span className="brand-mark">CQ</span>
          <span className="brand-text">ClarityIQ</span>
        </a>

        <nav className="topnav" aria-label="Primary">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#footer">Contact</a>
        </nav>

        <a className="button button-ghost" href="mailto:hello@clarityiq.ai">
          Book a demo
        </a>
      </header>

      <main>
        <section className="hero-section" id="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <CheckCircle2 size={16} />
              AI sales analysis for modern revenue teams
            </div>
            <h1>Win more deals with AI sales intelligence.</h1>
            <p className="hero-text">
              ClarityIQ turns customer conversations into momentum signals,
              risk alerts, and next-step clarity so your team can sell with
              sharper judgment and less pipeline fiction.
            </p>

            <div className="hero-actions">
              <a className="button button-primary" href="mailto:hello@clarityiq.ai">
                Start for free
                <ArrowRight size={18} />
              </a>
              <a className="button button-secondary" href="#how-it-works">
                See how it works
              </a>
            </div>

            <ul className="proof-list" aria-label="Key benefits">
              {proofPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>

          <aside className="hero-panel" aria-label="Product preview">
            <div className="panel-orbit panel-orbit-one" />
            <div className="panel-orbit panel-orbit-two" />

            <div className="insight-card insight-card-primary">
              <div className="card-label">Live deal pulse</div>
              <div className="card-title">Acme renewal - 78 momentum</div>
              <div className="signal-row">
                <span>Champion strength</span>
                <strong>High</strong>
              </div>
              <div className="signal-row">
                <span>Decision clarity</span>
                <strong>Medium</strong>
              </div>
              <div className="signal-row alert-row">
                <span>Risk</span>
                <strong>Security stakeholder missing</strong>
              </div>
            </div>

            <div className="insight-card insight-card-secondary">
              <div className="card-label">AI summary</div>
              <p>
                Buyer confirmed budget range, responded well to ROI framing, and
                requested implementation timing before legal review.
              </p>
            </div>

            <div className="stats-strip">
              {metrics.map((metric) => (
                <div className="stat" key={metric.label}>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="section" id="features">
          <div className="section-heading">
            <span className="section-kicker">Features</span>
            <h2>Everything your pipeline review wishes it already had.</h2>
            <p>
              Replace scattered notes and gut-feel forecasting with structured
              deal intelligence built directly from customer conversations.
            </p>
          </div>

          <div className="feature-grid">
            {features.map(({ icon: Icon, title, description }) => (
              <article className="feature-card" key={title}>
                <div className="feature-icon">
                  <Icon size={22} />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section how-it-works" id="how-it-works">
          <div className="section-heading">
            <span className="section-kicker">How It Works</span>
            <h2>Three steps from raw calls to confident action.</h2>
            <p>
              ClarityIQ fits naturally into existing sales workflows and makes
              every conversation easier to operationalize.
            </p>
          </div>

          <div className="steps-grid">
            {steps.map(({ icon: Icon, title, description }, index) => (
              <article className="step-card" key={title}>
                <div className="step-number">0{index + 1}</div>
                <div className="feature-icon">
                  <Icon size={22} />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section cta-section" aria-label="Call to action">
          <div className="cta-card">
            <div>
              <span className="section-kicker">Ready To Upgrade Forecast Calls?</span>
              <h2>Give your team a clearer read on every deal.</h2>
              <p>
                Launch a focused pilot, analyze live conversations, and give
                managers evidence they can coach from.
              </p>
            </div>
            <a className="button button-primary" href="mailto:hello@clarityiq.ai">
              Talk to ClarityIQ
              <ArrowRight size={18} />
            </a>
          </div>
        </section>
      </main>

      <footer className="footer" id="footer">
        <div>
          <a className="brand brand-footer" href="#hero">
            <span className="brand-mark">CQ</span>
            <span className="brand-text">ClarityIQ</span>
          </a>
          <p className="footer-copy">
            AI-driven sales analysis and deal momentum tracking for teams that
            care about signal quality.
          </p>
        </div>

        <div className="footer-links" aria-label="Footer links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="mailto:hello@clarityiq.ai">hello@clarityiq.ai</a>
        </div>

        <p className="footer-meta">
          (c) 2026 ClarityIQ. Built for sharper pipeline decisions.
        </p>
      </footer>
    </div>
  )
}

export default App
