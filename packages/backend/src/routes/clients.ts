import { Router } from 'express';
import { prisma } from '../index';
import { requireAuth } from '../middleware/auth';
import { seedDemoData } from '../utils/demo_seeder';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.sub;

    // Automatically seed demo data if this is the demo user
    if (userId === 'demo-user-id') {
      await seedDemoData(prisma, userId);
    }
    const clients = await prisma.client.findMany({
      where: { userId }
    });
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

router.post('/', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.sub;
    const { name, domain } = req.body;
    
    if (!name) return res.status(400).json({ error: 'Name is required' });

    // Ensure the User record exists in our DB, Supabase creates it in auth.users, but we need it in our User table
    // Prisma will auto-create if we use upsert
    await prisma.user.upsert({
      where: { id: userId },
      update: { email: req.user.email ?? undefined },
      create: { id: userId, email: req.user.email }
    });

    const client = await prisma.client.create({
      data: {
        name,
        domain: domain || '',
        userId
      }
    });
    res.status(201).json(client);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const userId = req.user.sub;

    const client = await prisma.client.findFirst({
      where: { id, userId }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Delete all meetings associated with this client to avoid foreign key constraints
    await prisma.meeting.deleteMany({
      where: { clientId: id }
    });

    await prisma.client.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

export default router;
