# CutRemind — Monthly Haircut Reminder SMS System

A production-ready SMS reminder web app for barbershops and salons. Manages client information, schedules monthly recurring reminders, and sends automated SMS notifications via Twilio.

## Live Demo

- **URL:** https://haircut-reminder.vercel.app
- **Login:** `admin@demo.com` / `Demo1234!`

## Features

- **Client Dashboard** — Add, edit, delete clients with reminder dates
- **Monthly SMS Reminders** — Automated Twilio SMS on each client's cut day
- **Test SMS** — Send a real message instantly from the dashboard
- **SMS Delivery Logs** — Full history of every message sent
- **Opt-Out Compliance** — TCPA compliant with STOP handling
- **Mobile Responsive** — Works on any device
- **Cron Scheduling** — Vercel Cron fires daily to check for reminders

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | Next.js API Routes (serverless) |
| Database | Neon (serverless Postgres) + Prisma ORM |
| SMS | Twilio Programmable Messaging |
| Scheduler | Vercel Cron Jobs |
| Deployment | Vercel (free tier) |
| Auth | NextAuth.js v5 (credentials) |

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Push database schema
npx prisma db push

# Seed demo data
npm run seed

# Start development server
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon Postgres connection string |
| `NEXTAUTH_SECRET` | Random 32-char string for JWT |
| `NEXTAUTH_URL` | Your app URL |
| `TWILIO_ACCOUNT_SID` | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Twilio auth token |
| `TWILIO_MESSAGING_SERVICE_SID` | Twilio messaging service SID |
| `TWILIO_PHONE_NUMBER` | Twilio phone number (E.164) |
| `SMS_TEMPLATE` | Custom message template |
| `CRON_SECRET` | Secret for cron endpoint auth |

## Built by

**Erwin Kiess** | KLYTICS LLC | San Juan, PR
Stanford ML | AWS Solutions Architect
