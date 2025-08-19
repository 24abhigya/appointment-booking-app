# Full-Stack Take-Home (4 Hours): Appointment Booking

**Live Links (fill after deploy):**
- **Frontend URL:** _e.g., https://your-vercel-app.vercel.app_
- **API URL:** _e.g., https://your-render-api.onrender.com_
- **Repo URL:** _this repo_

**Seed Credentials:**
- Patient → `patient@example.com` / `Passw0rd!`
- Admin → `admin@example.com` / `Passw0rd!`

---

## Goal
Minimal appointment booking app for a small clinic with auth, slot listing, booking with double-book prevention, patient/admin views, and deployed UI+API.

## Tech Stack Choices (and Trade-offs)
- **API:** Node.js + Express + Prisma + JWT
  - *Trade-offs:* Prisma speeds up schema & queries; Postgres with a **unique constraint on `bookings.slotId`** guarantees no double booking at the DB layer. JWT is simple to deploy but needs secret rotation and secure storage.
- **DB:** Postgres (Neon/Railway). Prisma schema is tuned for Postgres.
  - *Trade-offs:* Postgres free tiers are generous; SQLite is simpler locally but not ideal on many hosts.
- **Frontend:** React + Vite
  - *Trade-offs:* Vite keeps builds/dev fast; minimal styling for speed.

## Time Zone
All timestamps are stored and served as **UTC ISO** strings. Slots are generated for **09:00–17:00 UTC** in 30-minute blocks. The API is consistent and documents UTC; the frontend renders local time via `toLocaleString()`.

---

## How to Run Locally

### 1) API
```bash
cd server
cp .env.example .env
# Fill DATABASE_URL and JWT_SECRET at least.

npm install
npm run prisma:generate
# For first-time local dev (creates/migrates tables):
npm run prisma:migrate:dev -- --name init

# Seed users & next-7-days slots (optional; also runs on start if SEED_ON_START=true)
npm run seed

# Start the API
npm run dev
# API on http://localhost:3000
```

### 2) Web
```bash
cd web
cp .env.example .env
# ensure VITE_API_BASE_URL=http://localhost:3000/api

npm install
npm run dev
# App on http://localhost:5173
```

---

## Environment Variables

### API (`server/.env`)
- `PORT` – default 3000
- `JWT_SECRET` – **required**
- `FRONTEND_ORIGIN` – e.g., `http://localhost:5173` (used for CORS allowlist)
- `DATABASE_URL` – Postgres connection string
- `SEED_*` – credentials for seeded admin/patient
- `SEED_ON_START` – `true`/`false` to auto-seed on boot

### Web (`web/.env`)
- `VITE_API_BASE_URL` – e.g., `http://localhost:3000/api`

---

## Deployment (Example: Render + Vercel + Neon)

### Database (Neon)
1. Create a Neon Postgres project.
2. Get the connection string and set as `DATABASE_URL` in Render API service.

### API (Render Free)
1. New → Web Service → Connect repo → `server/` subdirectory.
2. Build command: `npm install && npx prisma generate && npx prisma migrate deploy`
3. Start command: `node src/index.js`
4. Environment:
   - `JWT_SECRET` (set a strong secret)
   - `DATABASE_URL` (from Neon)
   - `FRONTEND_ORIGIN` (set to your deployed frontend origin)
   - `SEED_ON_START=true` (optional on first deploy)

### Frontend (Vercel)
1. New Project → Vercel → `web/` subdirectory.
2. Environment: `VITE_API_BASE_URL` = your Render API base + `/api`.
3. Deploy.

---

## API Endpoints

- `POST /api/register` – `{name, email, password}` → **201** on success
- `POST /api/login` – `{email, password}` → **200** with `{token, role}`
- `GET /api/slots?from=YYYY-MM-DD&to=YYYY-MM-DD` – returns `{ from, to, available: [{id, startAt, endAt}] }`
- `POST /api/book` – `{slotId}` → **201**; unique constraint prevents double booking
- `GET /api/my-bookings` – patient auth; returns list
- `GET /api/all-bookings` – admin auth; returns all

**Error shape:**
```json
{ "error": { "code": "SLOT_TAKEN", "message": "..." } }
```

---

## Auth + RBAC Approach
- JWT issued on login (`sub` = user id, `role` included). 
- `requireAuth` validates token; `requireRole('admin')` protects admin routes.
- Token stored in localStorage on the frontend (simple for this take-home).

---

## Concurrency / Atomicity (Booking)
- Database-level guarantee: `@unique` on `Booking.slotId`.
- Attempting a second booking on the same `slotId` throws a Prisma `P2002` error → translated to **409** with `SLOT_TAKEN`.

---

## Error Handling Strategy
- Validations return **400** `BAD_REQUEST`.
- Auth failures return **401/403** with `UNAUTHENTICATED` / `FORBIDDEN`.
- Not found returns **404** `NOT_FOUND`.
- Double-book: **409** `SLOT_TAKEN`.
- Unhandled → **500** `INTERNAL` with a generic message.

---

## Frontend Pages/Flows
- **Register / Login**
- **Patient Dashboard**: list slots (next 7 days) → Book → My Bookings
- **Admin Dashboard**: all bookings
- Auth persisted across refresh via `localStorage`.

---

## Quick Verification (curl)

> Replace `API=https://your-api.onrender.com/api` with local or hosted URL.

```bash
API=http://localhost:3000/api

# Register a new patient
curl -s -X POST "$API/register" -H "Content-Type: application/json" -d '{"name":"Alice","email":"alice@example.com","password":"Passw0rd!"}'

# Login as patient
TOKEN=$(curl -s -X POST "$API/login" -H "Content-Type: application/json" -d '{"email":"patient@example.com","password":"Passw0rd!"}' | jq -r .token)

# Get slots next 7 days
curl -s "$API/slots"

# Book a slot (replace 123 with a real slot id from /slots)
curl -s -X POST "$API/book" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"slotId":123}'

# My bookings
curl -s "$API/my-bookings" -H "Authorization: Bearer $TOKEN"
```

---

## Basic Tests (Optional)
A placeholder Jest test is included. For a full test setup, export the Express app without starting the server and run integration tests via Supertest.

---

## Security Hygiene
- Passwords hashed with **bcrypt**.
- CORS allowlist via `FRONTEND_ORIGIN`.
- Basic login rate limit via `express-rate-limit`.
- Secrets are **not** logged; `.env.example` guides setup.

---

## Folder Structure

```
appointment-booking/
  server/
    prisma/
      schema.prisma
    src/
      index.js
      prisma.js
      utils.js
      seed.js
      routes/
        auth.js
        slots.js
        bookings.js
        admin.js
    tests/
      auth.test.js
    package.json
    .env.example
  web/
    src/
      App.jsx
      main.jsx
      api.js
      pages/
        Login.jsx
        Register.jsx
        PatientDashboard.jsx
        AdminDashboard.jsx
    index.html
    vite.config.js
    package.json
    .env.example
  README.md
```

---

## Known Limitations & Next Steps (If I had 2 more hours)
- Add end-to-end tests (register→login→list→book→verify).
- Improve UI (toasts, loading spinners, date pickers, pagination).
- Admin features (cancel bookings, manage slots).
- CI (lint/test) and Dockerfiles for local dev parity.
- Refresh tokens & HTTPS-only cookie auth for stronger security.
