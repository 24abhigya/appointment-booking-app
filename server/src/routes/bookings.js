import express from 'express';
import { prisma } from '../prisma.js';
import { requireAuth } from '../auth.js';

const router = express.Router();

router.post('/book', requireAuth, async (req, res) => {
  try {
    const { slotId } = req.body;
    if (!slotId) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'slotId required' } });
    }
    // Ensure slot exists
    const slot = await prisma.slot.findUnique({ where: { id: Number(slotId) } });
    if (!slot) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Slot not found' } });
    }
    // Attempt to book (unique constraint prevents double-booking)
    try {
      const booking = await prisma.booking.create({
        data: { userId: req.user.id, slotId: Number(slotId) },
        include: { slot: true },
      });
      return res.status(201).json({ id: booking.id, slot: booking.slot, userId: req.user.id });
    } catch (e) {
      // Prisma unique constraint error
      if (e.code === 'P2002') {
        return res.status(409).json({ error: { code: 'SLOT_TAKEN', message: 'This slot is already booked' } });
      }
      throw e;
    }
  } catch (e) {
    return res.status(500).json({ error: { code: 'INTERNAL', message: 'Unexpected error' } });
  }
});

router.get('/my-bookings', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Patients only' } });
    }
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: { slot: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ bookings });
  } catch (e) {
    return res.status(500).json({ error: { code: 'INTERNAL', message: 'Unexpected error' } });
  }
});

export default router;
