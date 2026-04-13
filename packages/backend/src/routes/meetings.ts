import { Router } from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '../index';
import { requireAuth } from '../middleware/auth';
import { analyzeAudio, explainKpi, extractKpiEvidence } from '../services/ai';

const router = Router();

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Supabase client for storage operations
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

router.use(requireAuth);

router.post('/', upload.single('audio'), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.sub;
    const { clientId } = req.body;
    const parsedDurationMs = Number(req.body.durationMs);
    const durationSeconds =
      Number.isFinite(parsedDurationMs) && parsedDurationMs > 0
        ? Math.round(parsedDurationMs / 1000)
        : 0;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }

    await prisma.user.upsert({
      where: { id: userId },
      update: { email: req.user.email ?? undefined },
      create: { id: userId, email: req.user.email }
    });

    // Upload to Supabase Storage
    const fileName = `${userId}/${clientId}/${Date.now()}-${file.originalname || 'recording.webm'}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('meetings-audio')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype || 'audio/webm',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // Persist a stable URL for the meeting record.
    const { data: urlData } = supabase.storage
      .from('meetings-audio')
      .getPublicUrl(fileName);

    const audioUrl = urlData.publicUrl;

    // Create the initial meeting record
    const meeting = await prisma.meeting.create({
      data: {
        audioUrl,
        clientId,
        userId,
        summaryJson: {}
      }
    });

    // We can respond immediately and process AI in the background 
    // to improve perceived latency, but for the requirement we will await it.
    // Fetch previous meeting summaries for context
    const previousMeetings = await prisma.meeting.findMany({
      where: { clientId, userId, id: { not: meeting.id } },
      orderBy: { createdAt: 'desc' },
      select: { summaryJson: true, createdAt: true },
      take: 5
    });

    const aiAnalysis = await analyzeAudio(
      file.buffer,
      previousMeetings,
      file.mimetype || 'audio/webm'
    );

    if (aiAnalysis.operational) {
      aiAnalysis.operational.durationSeconds =
        durationSeconds || aiAnalysis.operational.durationSeconds || 0;
    }

    // Update the meeting record with the AI summary
    const updatedMeeting = await prisma.meeting.update({
      where: { id: meeting.id },
      data: { summaryJson: aiAnalysis }
    });

    res.status(201).json(updatedMeeting);
  } catch (error) {
    console.error('Error processing meeting:', error);
    res.status(500).json({ error: 'Failed to process meeting' });
  }
});

router.get('/history/:clientId', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.sub;
    const { clientId } = req.params;

    const meetings = await prisma.meeting.findMany({
      where: {
        userId,
        clientId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(meetings);
  } catch (error) {
    console.error('Error fetching meeting history:', error);
    res.status(500).json({ error: 'Failed to fetch meeting history' });
  }
});

// Explain a specific KPI with AI-generated contextual explanation
router.post('/:meetingId/explain', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.sub;
    const { meetingId } = req.params;
    const { kpiKey, currentValue, clientName } = req.body;

    if (!kpiKey) {
      return res.status(400).json({ error: 'kpiKey is required' });
    }

    // Fetch the meeting to get summary data for context
    const meeting = await prisma.meeting.findFirst({
      where: { id: meetingId, userId }
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const explanation = await explainKpi({
      kpiKey,
      currentValue,
      meetingSummary: meeting.summaryJson,
      clientName
    });

    res.json(explanation);
  } catch (error) {
    console.error('Error generating KPI explanation:', error);
    res.status(500).json({ error: 'Failed to generate explanation' });
  }
});

// Explain a KPI without meeting context (for aggregate/overview metrics)
router.post('/explain', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { kpiKey, currentValue, clientName, summaryData } = req.body;

    if (!kpiKey) {
      return res.status(400).json({ error: 'kpiKey is required' });
    }

    const explanation = await explainKpi({
      kpiKey,
      currentValue,
      meetingSummary: summaryData,
      clientName
    });

    res.json(explanation);
  } catch (error) {
    console.error('Error generating KPI explanation:', error);
    res.status(500).json({ error: 'Failed to generate explanation' });
  }
});

// Extract KPI evidence from a meeting transcript (drill-down feature)
router.post('/:meetingId/evidence', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.sub;
    const { meetingId } = req.params;
    const { kpiKey, kpiValue } = req.body;

    if (!kpiKey) {
      return res.status(400).json({ error: 'kpiKey is required' });
    }

    // Fetch the meeting to get transcript and summary
    const meeting = await prisma.meeting.findFirst({
      where: { id: meetingId, userId }
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const summaryJson = meeting.summaryJson as { transcript?: string } | null;
    const transcript = summaryJson?.transcript || '';

    if (!transcript) {
      return res.status(400).json({ 
        error: 'No transcript available for this meeting',
        kpiKey,
        kpiName: kpiKey,
        summary: 'This meeting does not have a transcript available for evidence extraction.',
        excerpts: [],
        transcript: ''
      });
    }

    const evidence = await extractKpiEvidence({
      kpiKey,
      transcript,
      meetingSummary: meeting.summaryJson,
      kpiValue
    });

    res.json(evidence);
  } catch (error) {
    console.error('Error extracting KPI evidence:', error);
    res.status(500).json({ error: 'Failed to extract evidence' });
  }
});

// Get the latest meeting's evidence for a KPI (for dashboard drill-down)
router.post('/client/:clientId/evidence', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.sub;
    const { clientId } = req.params;
    const { kpiKey, kpiValue } = req.body;

    if (!kpiKey) {
      return res.status(400).json({ error: 'kpiKey is required' });
    }

    // Fetch the latest meeting for this client
    const meeting = await prisma.meeting.findFirst({
      where: { clientId, userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!meeting) {
      return res.status(404).json({ 
        error: 'No meetings found for this client',
        kpiKey,
        kpiName: kpiKey,
        summary: 'No meetings have been recorded for this client yet.',
        excerpts: [],
        transcript: ''
      });
    }

    const summaryJson = meeting.summaryJson as { transcript?: string } | null;
    const transcript = summaryJson?.transcript || '';

    if (!transcript) {
      return res.status(400).json({ 
        error: 'No transcript available',
        kpiKey,
        kpiName: kpiKey,
        summary: 'The latest meeting does not have a transcript available for evidence extraction.',
        excerpts: [],
        transcript: ''
      });
    }

    const evidence = await extractKpiEvidence({
      kpiKey,
      transcript,
      meetingSummary: meeting.summaryJson,
      kpiValue
    });

    // Include meeting metadata
    res.json({
      ...evidence,
      meetingId: meeting.id,
      meetingDate: meeting.createdAt
    });
  } catch (error) {
    console.error('Error extracting KPI evidence:', error);
    res.status(500).json({ error: 'Failed to extract evidence' });
  }
});

export default router;
