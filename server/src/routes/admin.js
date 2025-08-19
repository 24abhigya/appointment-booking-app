import express from 'express';
import { prisma } from '../prisma.js';
import { requireAuth, requireRole } from '../auth.js';

const router = express.Router();

router.get('/all-bookings', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        slot: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ bookings });
  } catch (e) {
    return res.status(500).json({ error: { code: 'INTERNAL', message: 'Unexpected error' } });
  }
});

export default router;
