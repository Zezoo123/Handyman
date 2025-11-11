Handyman (Qatar) – Freelance marketplace for home services

Overview
Handyman is a marketplace connecting households in Qatar with vetted handymen and labor workers for on-demand and scheduled jobs (electricity, installations, plumbing, AC, painting, cleaning, and more). Think of it as a focused, locally-tailored solution similar to Profy (Georgia) with Qatar’s regulations, languages, and payments in mind.

Initial scope
- Household request flow: Create a job request with category, description, photos, preferred time, and location.
- Provider flow: Handymen create profiles, verify identity, list skills, set availability, and accept jobs.
- Matching: Nearby, skilled, verified providers can bid/accept; customer selects or auto-assigns by rules.
- Payments: Price quotes, service fees, and in-app payments/refunds. Local payment gateways for Qatar (later milestone).
- Chat and notifications: In-app chat, updates, reminders.
- Ratings and reviews: Post-completion feedback for quality control.

Platforms
- Mobile: iOS and Android (Expo React Native).
- Web: Customer booking portal and admin dashboard (Next.js).

Tech stack (proposal)
- Monorepo: npm workspaces with `apps/*` and `packages/*`.
- API: Node.js + TypeScript (Express initially; can evolve to NestJS if needed).
- Database: PostgreSQL (managed, e.g., Supabase/RDS). ORM: Prisma (planned).
- Auth: Email/phone OTP and OAuth (Apple/Google) later. Session via JWT/HTTP-only cookies.
- Realtime: WebSockets/Socket.IO for chat and live updates (later milestone).
- Infra: Deploy API on a managed platform (Railway/Render/Fly/EC2). CDN for media. 
- CI/CD: GitHub Actions (lint, typecheck, test).

Repository layout
- `apps/api`: TypeScript Express API.
- `apps/web`: Next.js web app (to be scaffolded).
- `apps/mobile`: Expo React Native app (to be scaffolded).
- `packages/*`: Shared code (types, UI, config) to be added as we grow.

Security and compliance (Qatar context)
- Respect local KYC/verification and invoicing requirements.
- Payment gateway integration aligned with Qatari banks/providers.
- Arabic and English localization; RTL-ready UI.

Near-term roadmap
1) Foundation
   - API skeleton with health check
   - Environment config and secrets
   - Data model draft (users, providers, jobs, bids, payments)
2) Core features
   - Auth (email/phone OTP), profiles, categories
   - Job create/browse/accept flow
   - Basic pricing and status lifecycle
3) Enhancements
   - Chat, notifications, reviews
   - Payments integration (local gateway)
   - Admin analytics and moderation

Local development
1) Prereqs: Node 18+, npm 10+
2) Install dependencies (once dependencies are added):
   - `npm install`
3) Run API (after deps):
   - `npm run dev:api`
4) Environment:
   - Copy `apps/api/.env.example` to `apps/api/.env` and fill values.

Notes
- This is a fresh repo scaffold. We will progressively enhance with Prisma, Next.js, and Expo.
- Decisions (ORM, auth provider, payments) are staged to move fast now and harden later.


