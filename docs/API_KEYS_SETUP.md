# API Keys Setup — Step by Step

## 1. Anthropic API Key (Required for AI features)

**What it unlocks:** Ad Coach, Offer Lab, Creative Factory (AI creatives), Campaign HQ, Iteration Lab

### How to get it

1. Go to **https://console.anthropic.com**
2. Sign up or log in
3. Go to **API Keys** in the left sidebar
4. Click **Create Key**
5. Name it (e.g. "Clinic Growth OS") and copy the key (starts with `sk-ant-`)
6. Add to `.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
   ```

**Note:** Anthropic offers free credits for new accounts. Check pricing at anthropic.com/pricing.

---

## 2. Gemini API Key (Optional — for image generation)

**What it unlocks:** "Generate Image" button on Creative Factory ad cards

### How to get it

1. Go to **https://aistudio.google.com/apikey**
2. Sign in with your Google account
3. Click **Create API Key** → choose or create a project
4. Copy the key
5. Add to `.env`:
   ```
   GEMINI_API_KEY=AIza...
   ```

**Note:** Free tier includes image generation. Leave blank if you don't need AI-generated ad images.

---

## 3. Fal API Key (Optional — for image generation)

**What it unlocks:** Fallback image generation when Gemini hits quota, or primary image provider for better realism

### How to get it

1. Go to **https://fal.ai/dashboard/keys**
2. Sign up or log in
3. Create an API key
4. Add to `.env`:
   ```
   FAL_KEY=your-fal-key-here
   ```

### Image quality options

| Variable | Default | Description |
|----------|---------|-------------|
| `IMAGE_USE_FAL_FIRST` | `false` | Set to `true` to use Fal instead of Gemini for images (bypasses Gemini quota issues) |
| `IMAGE_FAL_MODEL` | — | Set to `nano-banana-pro` for text-heavy creatives (Breaking News, Pattern Interrupt, Direct Offer, Before/After). Better text rendering. |

**Production tip:** For best results with text-heavy ad styles, use:
```
IMAGE_USE_FAL_FIRST=true
IMAGE_FAL_MODEL=nano-banana-pro
```

---

## 4. Where to put the keys

Open `Clinic-Growth-Os-Claude/.env` and paste your keys after the `=` sign:

```env
# Anthropic (required for AI)
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here

# Gemini (optional for images)
GEMINI_API_KEY=AIza-your-actual-key-here

# Fal (optional - fallback or primary image provider)
FAL_KEY=your-fal-key-here
IMAGE_USE_FAL_FIRST=true
IMAGE_FAL_MODEL=nano-banana-pro
```

**Important:** Never commit `.env` to git. It's in `.gitignore` by default.

---

## 5. Restart the app

After adding keys, restart the dev server:

```bash
# Ctrl+C to stop, then:
npm run dev
```

---

## 6. Verify

- **Ad Coach**: Send a message → you should get AI responses (not demo fallback)
- **Creative Factory**: Submit the form → you should get AI-generated creatives
- **Offer Lab**: Score an offer → AI scoring should work
- **Image generation**: Click "Generate Image" on a creative → works with Gemini or Fal (whichever is configured)
