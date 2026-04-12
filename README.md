# Mariyam Driving School

Production-ready full-stack web application for a London-based driving school. Built with Next.js 15 App Router, TypeScript, Tailwind CSS, Neon PostgreSQL, Drizzle ORM, NextAuth.js v5, Stripe, and Resend.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Server Components) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Neon PostgreSQL |
| ORM | Drizzle ORM |
| Auth | NextAuth.js v5 (credentials + Google OAuth) |
| Payments | Stripe Checkout + Webhooks |
| Email | Resend + React Email |
| Storage | Vercel Blob |
| Deployment | Vercel |

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your credentials. If the project is linked to Vercel, you can pull variables directly:

```bash
vercel env pull .env.local --yes
```

### 3. Set up the database

```bash
# Push schema to Neon
npx dotenv -e .env.local -- npx drizzle-kit push

# Seed with sample data (instructors, courses, students)
npx dotenv -e .env.local -- npx tsx lib/db/seed.ts
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
├── (marketing)/          # Public pages (home, courses, about, contact, faq)
├── (auth)/               # Login, register, forgot-password
├── dashboard/            # Student portal (overview, lessons, book, progress, payments, profile)
├── admin/                # Admin panel (overview, students, bookings, lessons, instructors, courses, payments, settings)
└── api/                  # API routes + webhooks
components/
├── ui/                   # shadcn/ui primitives (button, card, badge, input, …)
├── marketing/            # Public-facing sections
├── dashboard/            # Student portal components
└── admin/                # Admin panel components
emails/                   # React Email transactional templates
lib/
├── auth.ts               # NextAuth.js v5 config
├── db/                   # Drizzle schema, migrations, seed
├── stripe.ts             # Stripe client
├── resend.ts             # Resend client
├── utils.ts              # Formatters, helpers
└── validations/          # Zod schemas
```

## Key Features

**Student Portal**
- Register with email/password or Google OAuth
- Multi-step registration wizard (personal details → licence info → test dates)
- Book lessons with course + instructor selection, Stripe payment
- Track upcoming lessons and lesson history
- Progress radar chart with per-competency scores
- Payment history with invoice details

**Admin Panel**
- Overview dashboard with revenue, booking counts, and recent activity
- Student management with search and detailed profiles
- Booking management with status transitions (pending → confirmed → completed)
- Instructor management and lesson progress logs
- Payment tracking with Stripe refund capability
- Environment health check on settings page

## Stripe Webhook

Configure your Stripe webhook endpoint:

```
https://your-domain.com/api/webhooks/stripe
```

Required events:
- `checkout.session.completed`
- `payment_intent.payment_failed`
- `charge.refunded`

For local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

## Demo Credentials

After seeding, an admin account is created:

- **Email**: `admin@mariyamds.co.uk`
- **Password**: `Admin1234!`

Ten student accounts are seeded with emails `student1@example.com` … `student10@example.com`, password `Student1234!`.

## Deployment

Deploy to Vercel:

```bash
vercel deploy
```

Ensure all environment variables from `.env.example` are configured in the Vercel dashboard under **Settings → Environment Variables**, then run the database migration against your production Neon branch.
