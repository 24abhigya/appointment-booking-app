import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma.js';
import { next7DaysRangeUTC, generateSlotsForRangeUTC } from './utils.js';

async function upsertUser({ email, name, password, role }) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role },
    create: { email, name, passwordHash, role },
  });
}

async function seedUsers() {
  const admin = await upsertUser({
    email: process.env.SEED_ADMIN_EMAIL || 'admin@example.com',
    name: process.env.SEED_ADMIN_NAME || 'Admin',
    password: process.env.SEED_ADMIN_PASSWORD || 'Passw0rd!',
    role: 'admin',
  });

  const patient = await upsertUser({
    email: process.env.SEED_PATIENT_EMAIL || 'patient@example.com',
    name: process.env.SEED_PATIENT_NAME || 'Patient',
    password: process.env.SEED_PATIENT_PASSWORD || 'Passw0rd!',
    role: 'patient',
  });

  return { admin, patient };
}

async function seedSlots() {
  const now = new Date();
  const { start, end } = next7DaysRangeUTC(now);
  const slotsToInsert = [];
  for (const { start: s, end: e } of generateSlotsForRangeUTC(start, end)) {
    slotsToInsert.push({ startAt: s, endAt: e });
  }
  // Insert if not existing; rely on unique(startAt,endAt)
  for (const slot of slotsToInsert) {
    try {
      await prisma.slot.create({ data: slot });
    } catch (e) {
      // ignore duplicates
    }
  }
  const count = await prisma.slot.count({ where: { startAt: { gte: start, lt: end } } });
  return { countInRange: count };
}

export async function runSeed() {
  const users = await seedUsers();
  const slots = await seedSlots();
  return { users, slots };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runSeed()
    .then((r) => {
      console.log('Seed complete:', r);
      process.exit(0);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
