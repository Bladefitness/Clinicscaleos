# Clinic Growth OS — Setup Guide

## Why Ad Coach & Creative Factory May Not Work

These features require **API keys** and optionally a **database**. Without them:
- **Ad Coach**: Shows "temporary issue" or demo responses (now fixed with demo mode)
- **Creative Factory**: Uses fallback creatives (works without API, but AI-generated creatives need Anthropic)
- **Offer Lab, Campaign HQ, Iteration Lab**: Need Anthropic API + PostgreSQL

---

## Quick Start (Demo Mode)

The app now has **demo mode**:
- **Ad Coach**: Returns helpful canned responses when API key is missing
- **Creative Factory**: Returns template creatives when AI fails (works without keys)

Run the app and try both — they should work with limited functionality.

---

## Full Setup (AI + Database)

### 1. Anthropic API Key (Required for AI features)

Get a key from [console.anthropic.com](https://console.anthropic.com).

Add to `.env`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

Or use the Replit integration name:
```
AI_INTEGRATIONS_ANTHROPIC_API_KEY=sk-ant-...
```

### 2. PostgreSQL (Required for saving data)

**Option A — Local:**
```bash
# macOS with Homebrew
brew install postgresql
brew services start postgresql
createdb clinic_growth
```

**Option B — Supabase (free tier):**
1. Create project at [supabase.com](https://supabase.com)
2. Copy connection string from Settings → Database
3. Add to `.env`:
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
   ```

**Option C — Neon (free tier):**
1. Create project at [neon.tech](https://neon.tech)
2. Copy connection string
3. Add to `.env`

Then push the schema:
```bash
npm run db:push
```

### 3. Gemini API Key (Optional — for image generation in Creative Factory)

Get a key from [aistudio.google.com](https://aistudio.google.com/apikey).

Add to `.env`:
```
AI_INTEGRATIONS_GEMINI_API_KEY=...
```

Or:
```
GEMINI_API_KEY=...
```

---

## .env Template

```env
# Database (required for saving offers, creatives, campaigns)
DATABASE_URL=postgresql://localhost:5432/clinic_growth

# AI — Anthropic (required for Ad Coach, Offer Lab, Creative Factory AI, etc.)
ANTHROPIC_API_KEY=sk-ant-your-key

# AI — Gemini (optional, for image generation)
AI_INTEGRATIONS_GEMINI_API_KEY=your-gemini-key
```

---

## Verify Setup

1. **Ad Coach**: Send "hi" — you should get a demo response. With API key, you get AI responses.
2. **Creative Factory**: Submit the form — you should get creatives (fallback or AI). With API key, you get AI-generated creatives.
3. **Offer Lab**: Submit an offer — with DB + API, it saves and scores. Without DB, it may error.
