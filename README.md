# Let's Go Buffalo

A production-ready local business directory platform for Buffalo and Western New York. Discover local businesses, list your own, and advertise with sponsored search positions.

![Let's Go Buffalo](public/images/logo.png)

## Features

- **Public Website** — Homepage, business directory, Google-style search, category pages, business profiles
- **Authentication** — Registration, login, password reset with role-based access (Visitor, Business Owner, Moderator, Admin)
- **Business Submission** — Multi-step form with draft saving, image uploads, and admin review workflow
- **Admin Dashboard** — Moderation queue, category management, user management, analytics, audit logs
- **Owner Dashboard** — Business management, analytics, advertising campaigns, billing
- **Sponsored Search** — Top-3 bid-based sponsored positions with targeting, impressions, and click tracking
- **Stripe Integration** — Test-mode payments for advertising wallet top-ups
- **SEO & Accessibility** — Structured data, sitemap, robots.txt, semantic HTML, WCAG-friendly contrast

## Tech Stack

- **Framework:** Next.js 16 (App Router), TypeScript, React 19
- **Styling:** Tailwind CSS 4, shadcn/ui, Framer Motion
- **Database:** MongoDB with Prisma ORM (view data in MongoDB Compass)
- **Auth:** Auth.js (NextAuth v5) with credentials provider
- **Payments:** Stripe (test mode)
- **Validation:** Zod, React Hook Form
- **Testing:** Vitest

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB 6+ (local install or MongoDB Compass connection)
- npm

### 1. Clone and Install

```bash
git clone <repo-url>
cd shawn
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="mongodb://127.0.0.1:27017/letsgobuffalo"
AUTH_SECRET="your-random-secret-here"
AUTH_URL="http://localhost:3000"
```

Generate an auth secret:

```bash
openssl rand -base64 32
```

### 3. Database Setup (MongoDB + Compass)

**Connection string for Compass:**
```
mongodb://127.0.0.1:27017
```

**Prisma requires a replica set** for writes. One-time setup (Administrator PowerShell):

1. Edit `C:\Program Files\MongoDB\Server\8.2\bin\mongod.cfg`
2. Add under the file:
   ```yaml
   replication:
     replSetName: rs0
   ```
3. Restart MongoDB: `Restart-Service MongoDB`
4. Initialize replica set and seed:

```bash
npm run db:init-replica
npm run db:setup
```

In Compass, open database **`letsgobuffalo`** to browse `User`, `Business`, `Category`, etc.

See also: `scripts/mongodb-compass-setup.md`

```bash
# Push schema only
npm run db:push

# Seed with demo data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Development Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@letsgobuffalo.com | Demo123! |
| Moderator | moderator@letsgobuffalo.com | Demo123! |
| Business Owner 1 | owner1@example.com | Demo123! |
| Business Owner 2 | owner2@example.com | Demo123! |
| Business Owner 3 | owner3@example.com | Demo123! |

> **Never use these credentials in production.**

## Stripe Test Mode

1. Create a [Stripe account](https://dashboard.stripe.com/register)
2. Get test API keys from Dashboard → Developers → API keys
3. Add to `.env`:

```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

4. For local webhook testing:

```bash
stripe listen --forward-to localhost:3000/api/billing/webhook
```

Use test card `4242 4242 4242 4242` with any future expiry and CVC.

## Image Storage

### Cloudinary (Recommended)

```env
CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"
```

### Development Fallback

Without Cloudinary configured, images are stored as base64 data URLs (development only).

## Maps

```env
NEXT_PUBLIC_MAPBOX_TOKEN="your-mapbox-token"
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm test` | Run tests |
| `npm run db:push` | Push Prisma schema |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

Tests cover:
- Sponsored ranking algorithm (top-3, tie-breaking, deduplication)
- Minimum bid filtering
- Balance eligibility checks

## Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Login, register, password reset
│   ├── admin/             # Admin dashboard
│   ├── dashboard/         # Business owner dashboard
│   ├── api/               # API routes
│   ├── business/[slug]/   # Business profile pages
│   ├── categories/[slug]/ # Category pages
│   ├── directory/         # Business directory
│   └── search/            # Search results
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Header, footer
│   ├── business/          # Business cards, grids
│   └── search/            # Search components
├── lib/
│   ├── services/          # Business logic (search, bidding, email, upload)
│   ├── auth.ts            # NextAuth configuration
│   └── db.ts              # Prisma client
└── types/                 # TypeScript declarations
```

## Sponsored Search Algorithm

The bidding service (`src/lib/services/sponsored-ranking.ts`) is a testable server-side module that:

1. Filters eligible campaigns (active, approved, within dates, sufficient balance)
2. Matches campaign targets (keywords, categories, locations)
3. Ranks by highest daily bid
4. Breaks ties by earliest bid creation date
5. Deduplicates by business (max 1 sponsored slot per business)
6. Returns top 3 (configurable, max 3)
7. Records impressions and clicks

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
docker compose up -d
```

Ensure MongoDB is running (Compass: connect to `mongodb://127.0.0.1:27017`), then sync schema and seed:

```bash
npm run db:push
npm run db:seed
```

### MongoDB Compass

1. Open MongoDB Compass
2. Connect with: `mongodb://127.0.0.1:27017`
3. Select database: `letsgobuffalo`
4. Browse collections: `User`, `Business`, `Category`, etc.

## Contact

- **Email:** admin@letsgobuffalo.com
- **Phone:** (716) 559-5955
- **Region:** Buffalo and Western New York

## License

Private — All rights reserved.
