# Clinic Growth OS

## Overview
Clinic Growth OS is a premium AI-powered advertising operating system for healthcare clinics. Features 5 modules covering the complete ad lifecycle: offer creation, creative generation, campaign planning, performance coaching, and iteration optimization. Designed as a webinar demo to showcase a $10K SaaS product.

## Recent Changes
- 2026-02-13: Built complete 5-module system with PostgreSQL persistence, AI integration (Anthropic), sidebar navigation with M1-M5 badges, and comprehensive dashboard
- 2026-02-13: Initial build - Dashboard, AI Ad Creative Factory with 3-step wizard, Anthropic AI integration

## Architecture
- **Frontend**: React + Vite + TypeScript with Tailwind CSS, wouter for routing
- **Backend**: Express.js with Anthropic AI SDK, PostgreSQL via Drizzle ORM
- **Database**: PostgreSQL with 7 tables (offers, avatars, creatives, campaigns, metrics_snapshots, coaching_sessions, iterations)
- **AI Integration**: Uses Replit AI Integrations (Anthropic) for all AI features via claude-sonnet-4-5
- **Font**: DM Sans (Google Fonts)
- **Design**: Emerald/slate theme, premium SaaS aesthetic

## Key Pages
- `/` - Dashboard with module overview cards, quick stats, and CTA links
- `/offer-lab` - M1: Offer Intelligence Engine (score offers, AI variations, competitor insights)
- `/creative-factory` - M2: AI Ad Creative Factory (3-step wizard: form, loading, results)
- `/campaign-hq` - M3: Campaign Architect (AI blueprints, deployment checklist)
- `/ad-coach` - M4: AI Ad Coach (daily pulse, weekly brief, chat coach)
- `/iteration-lab` - M5: Iteration Engine (winner variations, loser diagnosis)

## Key Files
- `client/src/App.tsx` - Main app with Shadcn SidebarProvider and routing
- `client/src/components/layout/app-sidebar.tsx` - Sidebar navigation with M1-M5 badges
- `client/src/pages/dashboard.tsx` - Module overview dashboard
- `client/src/pages/offer-lab.tsx` - Offer scoring and analysis
- `client/src/pages/creative-factory.tsx` - Ad creative generation wizard
- `client/src/pages/campaign-hq.tsx` - Campaign blueprint generator
- `client/src/pages/ad-coach.tsx` - Daily pulse, weekly brief, and AI chat
- `client/src/pages/iteration-lab.tsx` - Winners/losers boards with AI analysis
- `client/src/components/ad-factory/` - Form, loading screen, results grid, creative cards
- `server/routes.ts` - All API endpoints (14+ routes)
- `server/storage.ts` - DatabaseStorage with full CRUD for all tables
- `server/lib/prompts.ts` - AI prompt engineering for all modules
- `server/lib/seed-data.ts` - Demo data for metrics features
- `shared/schema.ts` - Drizzle schema, Zod validation, TypeScript types

## API Routes
- POST /api/offers/score - Score an offer with AI
- POST /api/generate - Generate ad creatives with AI
- POST /api/campaigns/blueprint - Generate campaign blueprint with AI
- GET /api/metrics/daily-pulse - Get daily performance pulse (demo data)
- GET /api/metrics/weekly-brief - Get weekly strategy brief (demo data)
- POST /api/coach/chat - Chat with AI ad coach
- POST /api/iterations/analyze - Analyze winners/losers with AI

## User Preferences
- Premium SaaS aesthetic (Stripe meets Apple minimalism)
- DM Sans font, emerald-500 to teal-600 gradient accents
- Shadcn sidebar navigation
- PostgreSQL for data persistence
