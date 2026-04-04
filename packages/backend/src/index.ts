import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

import clientsRouter from './routes/clients';
import meetingsRouter from './routes/meetings';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Prisma setup with pg adapter
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/clients', clientsRouter);
app.use('/meetings', meetingsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`ClarityIQ backend listening on port ${port}`);
});
