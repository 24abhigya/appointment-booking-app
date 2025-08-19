import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { prisma } from './prisma.js';
import authRoutes from './routes/auth.js';
import slotsRoutes from './routes/slots.js';
import bookingsRoutes from './routes/bookings.js';
import adminRoutes from './routes/admin.js';
import { runSeed } from './seed.js';

const app = express();

app.use(express.json());
app.use(morgan('dev'));

const corsOrigin = process.env.FRONTEND_ORIGIN || '*';
app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));

// Basic rate limit for login to prevent brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/login', loginLimiter);

app.use('/api', authRoutes);
app.use('/api', slotsRoutes);
app.use('/api', bookingsRoutes);
app.use('/api', adminRoutes);

// Health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;

async function start() {
  if (process.env.SEED_ON_START === 'true') {
    await runSeed();
  }
  app.listen(PORT, () => {
    console.log(`API listening on :${PORT}`);
  });
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
