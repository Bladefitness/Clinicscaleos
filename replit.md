# Clinic Growth OS

## Overview
Clinic Growth OS is a premium AI-powered platform that helps healthcare clinics generate high-converting ad creatives automatically. This is a webinar demo designed to look like a $10K SaaS product.

## Recent Changes
- 2026-02-13: Initial build - Dashboard, AI Ad Creative Factory with 3-step wizard, placeholder pages, dark sidebar navigation, Anthropic AI integration for ad generation

## Architecture
- **Frontend**: React + Vite + TypeScript with Tailwind CSS, wouter for routing
- **Backend**: Express.js with Anthropic AI SDK for ad creative generation
- **AI Integration**: Uses Replit AI Integrations (Anthropic) for generating ad creatives via claude-sonnet-4-5
- **Font**: DM Sans (Google Fonts)
- **Design**: Emerald/slate theme, premium SaaS aesthetic

## Key Pages
- `/` - Dashboard with welcome message and feature cards
- `/ad-factory` - AI Ad Creative Factory (main feature) with 3-step wizard
- `/cash-injection` - Coming Soon placeholder
- `/roi-calculator` - Coming Soon placeholder
- `/resources` - Coming Soon placeholder

## Key Files
- `client/src/components/layout/app-sidebar.tsx` - Dark sidebar navigation
- `client/src/pages/ad-factory.tsx` - 3-step wizard (form → loading → results)
- `client/src/components/ad-factory/` - Form, loading screen, results grid, creative cards
- `server/routes.ts` - API endpoint for AI ad creative generation
- `server/lib/prompts.ts` - AI prompt engineering
- `server/lib/fallback-creatives.ts` - Fallback mock data if AI fails

## User Preferences
- Premium SaaS aesthetic (Stripe meets Apple minimalism)
- DM Sans font, emerald-500 to teal-600 gradient accents
- Dark sidebar (slate-950)
- No database needed - stateless demo application
