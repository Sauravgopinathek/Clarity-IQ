import { PrismaClient } from '@prisma/client';

export async function seedDemoData(prisma: PrismaClient, userId: string) {
  // Check if demo data already exists
  const existingClients = await prisma.client.findMany({
    where: { userId }
  });

  if (existingClients.length > 0) return;

  console.log('[Demo] Seeding data for Demo User...');

  // 1. Create User
  await prisma.user.upsert({
    where: { id: userId },
    update: { email: 'demo@clarityiq.ai' },
    create: { id: userId, email: 'demo@clarityiq.ai' }
  });

  // 2. Create Sample Client
  const client = await prisma.client.create({
    data: {
      name: 'Acme Global (Sample)',
      domain: 'acme.com',
      userId
    }
  });

  // 3. Create Sample Meeting with Full AI Analysis
  const sampleSummary = {
    bant: { budget: "Evaluating budget", authority: "Decision maker present", need: "High urgency", timeline: "Q3 2026" },
    vibe: { score: 85, label: "Excited", signals: ["Strong engagement", "Positive body language"] },
    dealArc: { momentum: "Increasing", resolvedObjections: ["Price matched budget", "Integration verified"] },
    sentiment: { 
      score: 88, 
      label: "Positive", 
      trend: "Improving",
      stageSignals: [
        { stage: "Discovery", score: 80, label: "Neutral" },
        { stage: "Value Prop", score: 90, label: "Positive" },
        { stage: "Closing", score: 95, label: "Positive" }
      ]
    },
    operational: { 
      interactionCount: 24, 
      durationSeconds: 1540, 
      talkTimeSeconds: 680, 
      holdTimeSeconds: 0, 
      customerInitiated: true 
    },
    customerIntent: { primary: "Buying", confidence: 92, signals: ["Asks about onboarding", "Mentions contract"] },
    objections: { 
      common: ["Implementation time", "Legacy support"], 
      unresolved: [], 
      frequency: 2, 
      resolutionRate: 100 
    },
    buyerEngagement: { 
      talkToListenRatio: "42:58", 
      buyerParticipationRate: 58, 
      buyerQuestionCount: 12, 
      interruptionPattern: "Constructive" 
    },
    dealHealth: { sentimentTrend: "Improving", momentumScore: 90, objectionFrequency: 1, objectionResolutionRate: 100 },
    buyingSignals: { budgetSignal: "Confirmed", timelineSignal: "Urgent", authoritySignal: "CEO involved", competitorMentions: ["None"] },
    repEffectiveness: { 
      discoveryDepthScore: 92, 
      valueArticulationRate: 85, 
      objectionHandlingQuality: "Consultative", 
      nextStepClarityScore: 95 
    },
    risk: { riskyLanguage: [], confusionPoints: [], overpromiseFlags: [], skepticismSignals: [], ghostingRisk: "Low" },
    dimensions: { product: "ClarityIQ Enterprise", geography: "USA", repTenure: "Senior" },
    summary: "A high-energy closing call where the buyer confirmed budget and asked for onboarding details. Next steps are booked for contract signing.",
    transcript: "[Rep]: Hi Sarah, glad you could make it.\n[Buyer]: Of course! We are really excited to see how this works.\n[Rep]: Perfect. I've prepared the implementation plan.\n[Buyer]: This looks exactly like what we need. How soon can we start?\n[Rep]: We can have you live by next Tuesday.\n[Buyer]: That's faster than I expected! Let's get the paperwork started."
  };

  await prisma.meeting.create({
    data: {
      title: 'Sample Strategy Session',
      clientId: client.id,
      summaryJson: sampleSummary,
      createdAt: new Date()
    }
  });

  console.log('[Demo] Seeding complete.');
}
