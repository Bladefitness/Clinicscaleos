# API Troubleshooting Strategies

Based on the project's skills (api-research, n8n http_api_integration, react-best-practices), these strategies help isolate and fix API integration issues when keys are confirmed correct.

---

## 1. Isolate: Test APIs Directly (api-research pattern)

**Before debugging the app**, verify the APIs work outside it:

### Anthropic (Ad Coach, Creative Factory copy)
```bash
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-4-5",
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Reply with OK"}]
  }'
```

- **401** → Key invalid, expired, or wrong region
- **429** → Rate limited; add delays
- **200** → Key works; problem is in app (env loading, request shape)

### Gemini (Creative Factory images)
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=$GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Say hello"}]}]}'
```

- **401/403** → Key invalid or lacks image model access
- **200** → Key works; check model ID and request format in app

---

## 2. Document & Cache API Details (api-research)

Create `docs/api-cache/` files for each API:

| File | Contents |
|------|----------|
| `anthropic.md` | Base URL, auth header (`x-api-key`), error codes, rate limits |
| `gemini.md` | Base URL, auth (query param), model IDs, image generation specifics |

**Anthropic error codes** (from official docs):
| Code | Type | Action |
|------|------|--------|
| 401 | authentication_error | Check key at console.anthropic.com; create new key |
| 403 | permission_error | Key lacks resource access |
| 429 | rate_limit_error | Add delays; respect X-RateLimit headers |
| 529 | overloaded_error | Retry with backoff |

---

## 3. Parallelize Bulk Operations (react-best-practices)

**Current**: Bulk image generation is sequential (waterfall).

**Improvement**: Run requests in parallel with limits to respect rate limits:

```typescript
// Instead of: for (const idx of indices) { await generateSingleImage(...) }
// Use: Promise.all in batches of 3-5
const BATCH_SIZE = 4;
for (let i = 0; i < indices.length; i += BATCH_SIZE) {
  const batch = indices.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(idx => generateSingleImage(creatives[idx].image_prompt, idx)));
  if (i + BATCH_SIZE < indices.length) await new Promise(r => setTimeout(r, 1000)); // rate limit
}
```

---

## 4. Retry & Backoff (n8n http_api_integration pattern)

APIs can fail transiently (429, 529, network). Add retry with exponential backoff:

```typescript
async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e: any) {
      const isRetryable = e?.status === 429 || e?.status === 529;
      if (!isRetryable || i === maxRetries - 1) throw e;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
  throw new Error("Max retries exceeded");
}
```

---

## 5. Env Loading Verification

**Pattern**: Load env before any other imports and log what was loaded (no key values):

```typescript
// At top of load-env.ts, after config():
if (process.env.NODE_ENV === "development") {
  const keys = ["ANTHROPIC_API_KEY", "GEMINI_API_KEY", "DATABASE_URL"];
  keys.forEach(k => console.log(`[env] ${k}: ${process.env[k] ? "set (" + process.env[k].length + " chars)" : "MISSING"}`));
}
```

This helps confirm:
- `.env` is loaded
- Keys are not empty
- Overrides (e.g. from shell) are applied correctly

---

## 6. Fallback API Pattern (n8n http_api_integration)

The app already uses fallback creatives when Anthropic fails. Extend for images:

- If Gemini fails, show placeholder or “Image generation unavailable” instead of a broken state
- Surface the error (e.g. toast) so the user knows it’s an API issue

---

## 7. Checklist When Keys Are "Correct" But Still Failing

- [ ] **Direct curl test** – Does the key work outside the app?
- [ ] **Key scope** – Anthropic: correct org/project; Gemini: API enabled + image model access
- [ ] **Key format** – Anthropic: `sk-ant-` or `sk-proj-`; Gemini: `AIza`
- [ ] **Region** – Anthropic has region restrictions; try `us-east-1` if unsure
- [ ] **Rate limits** – 401-like errors can sometimes be 429; check response body
- [ ] **Model ID** – `claude-sonnet-4-5`, `gemini-2.5-flash-image` are current; verify in docs
- [ ] **Env at runtime** – Log key presence (length only) on server startup
- [ ] **SDK vs REST** – Anthropic SDK uses `x-api-key`; if using REST directly, confirm header

---

## 8. Next Steps

1. Run the curl commands above with your keys; note status and body.
2. Add the startup env log to `load-env.ts` and restart.
3. If curl succeeds but the app fails, add retry/backoff and parallel batches for bulk image generation.
4. Update `docs/api-cache/` with any new findings.
