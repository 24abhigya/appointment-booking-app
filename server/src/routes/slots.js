import express from 'express';
import { prisma } from '../prisma.js';
import { parseDateOnly } from '../utils.js';

const router = express.Router();

router.get('/slots', async (req, res) => {
  try {
    const { from, to } = req.query;
    let start, end;
    if (from && to) {
      start = parseDateOnly(from);
      const toDate = parseDateOnly(to);
      // end exclusive: day after 'to'
      end = new Date(Date.UTC(toDate.getUTCFullYear(), toDate.getUTCMonth(), toDate.getUTCDate() + 1));
    } else {
      // default next 7 days (inclusive), end exclusive
      const now = new Date();
      start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + 7));
    }

    const slots = await prisma.slot.findMany({
      where: { startAt: { gte: start, lt: end } },
      orderBy: { startAt: 'asc' },
      include: { bookings: true },
    });

    const available = slots.filter(s => s.bookings.length === 0)
      .map(s => ({ id: s.id, startAt: s.startAt, endAt: s.endAt }));

    return res.json({ from: start, to: end, available });
  } catch (e) {
    return res.status(500).json({ error: { code: 'INTERNAL', message: 'Unexpected error' } });
  }
});

export default router;
