# Meta Ads 2026 Playbook — Post-Andromeda Best Practices

A step-by-step guide for running Facebook and Instagram ads in 2026 and beyond, optimized for Meta's Andromeda algorithm. Use this playbook to set up campaigns, structure naming, build retargeting funnels, and allocate budget.

---

## 1. Post-Andromeda: What Changed

Meta's Andromeda algorithm (rolled out 2024–2025) fundamentally changed ad delivery. Adapt or underperform.

### Core Shifts

| Old Approach | New Approach |
|--------------|--------------|
| Targeting is the main lever | Creative is the main lever |
| Test audiences first | Test creatives first |
| Narrow audiences, broad creatives | Broad audiences, diverse creatives |
| Campaign structure drives performance | Creative diversity drives performance |

**Key insight:** Andromeda matches *creatives to individuals*, not audiences to creatives. Your creative *is* your targeting now.

### Rules to Live By

- **Creative-first, not targeting-first**: Broad audiences outperform narrow segmentation.
- **Advantage+ is mandatory**: Use Advantage+ Placements, Advantage+ Audience; avoid manual overrides.
- **Learning phase**: 2–4 weeks (vs 5–7 days); need 50+ conversions/week per ad set for stability.
- **Creative diversity**: 15–25 genuinely different angles per ad set (different hooks, formats, angles), not minor variants.
- **Duplicate to scale**: Never increase budget on active ad sets—duplicate with higher budgets instead.

---

## 2. Campaign Structure (Post-Andromeda)

```
Campaign (CBO - Campaign Budget Optimization)
├── Ad Set 1: Broad, Advantage+ Placements
│   ├── Creative 1 (Concept A - Video)
│   ├── Creative 2 (Concept B - Static)
│   ├── Creative 3 (Concept C - Carousel)
│   ├── Creative 4 (Concept D - UGC)
│   └── Creative 5 (Concept E - Testimonial)
└── Ad Set 2: Retargeting (Custom Audiences)
    ├── Creative 1 (Conversion-focused)
    ├── Creative 2 (Offer + urgency)
    └── Creative 3 (Risk reversal)
```

### Structure Rules

- **1–3 ad sets max** per campaign to avoid splitting learnings
- **CBO** at campaign level; let Meta allocate spend
- **Broad targeting**; avoid micro-segmentation
- **5–10 diverse creatives** per ad set (different concepts, not variations)

---

## 3. Funnel Structure: TOFU, MOFU, BOFU

| Stage | Name | Audience | Objective | Budget % | Creative Focus |
|-------|------|----------|-----------|----------|----------------|
| **TOFU** | Awareness/Prospecting | Broad, LAL 3–10%, Advantage+ | Awareness / Traffic | 50–60% | Educational, problem awareness, scroll-stopping hooks |
| **MOFU** | Consideration | Video viewers 25–75%, website visitors 7–30d | Traffic / Engagement | 20–25% | Testimonials, case studies, product demos |
| **BOFU** | Conversion | Add-to-cart, checkout, form starters | Conversions | 10–15% | Direct offers, urgency, risk reversal |
| **Testing** | Creative Testing | Broad | Conversions | 5–10% | New concepts, DCO tests |

### Why Funnel Structure Works

- Single campaigns on cold traffic: 0.5–1% conversion
- Full funnel with retargeting: 5–15% conversion on warm traffic
- Retargeting delivers ~70% higher conversion rates than prospecting

---

## 4. Retargeting Campaign Setup

### Prerequisites

- **Meta Pixel** on website (header/base code)
- **Conversions API (CAPI)** for server-side events
- **Standard events**: ViewContent, AddToCart, InitiateCheckout, Lead, Purchase

### Custom Audiences to Create

In **Meta Ads Manager > Audiences**, create:

| Audience | Source | Retention | Use |
|----------|--------|-----------|-----|
| Website visitors 7d | Pixel | 7 days | Warm retargeting |
| Website visitors 14d | Pixel | 14 days | Warmer retargeting |
| Video viewers 25% | Video engagement | 7 days | Top of retargeting funnel |
| Video viewers 50% | Video engagement | 7 days | Mid retargeting funnel |
| Engagement | Page, Lead Ad, Instagram | 30 days | Broad warm audience |
| Add-to-cart / Checkout | Pixel events | 14 days | High-intent conversion |
| **Exclusion** | Purchasers | 180 days | Exclude from all campaigns |

### Retargeting Sequence (Recommended)

1. **Video 25%** → Educational, trust-building content
2. **Video 50%** → Social proof, testimonials
3. **Website 7–14d** → Offer, urgency
4. **Add-to-cart / Checkout** → Direct offer + scarcity, risk reversal

---

## 5. Naming Conventions

Use consistent naming so you can analyze performance at a glance.

### Campaign

**Format:** `Brand_Objective_FunnelStage_Date`

**Example:** `SunriseMed_Conv_TOFU_Jan2026`

### Ad Set

**Format:** `AudienceType | Exclusion | Placement | Region`

**Example:** `Adv+ Broad | Excl Purch 180d | Advantage+ | Miami FL`

### Ad

**Format:** `CreativeType_Hook_Variation`

**Example:** `Video_Testimonial_20Off_V1`

---

## 6. Budget Allocation

| Campaign Type | Budget % | Purpose |
|---------------|----------|---------|
| Prospecting (TOFU) | 50–60% | Core scaling, cold reach |
| Retargeting (MOFU/BOFU) | 15–25% | Warm conversion |
| Creative Testing | 10–15% | New angles |
| Brand/Awareness | 5–10% | Top-of-funnel seeding |

### Minimums

- **$50/day** per ad set for Conversions objective
- **50 conversions/week** per ad set for learning stability
- Do **not** change budget by more than 20% at once—duplicate instead

### 70/20/10 Alternative

- **70%** — Proven/core campaigns (best performers)
- **20%** — Testing and optimization
- **10%** — New initiatives

---

## 7. Deployment Checklist

Execute these steps in order in Meta Ads Manager.

| Step | Action | Screen |
|------|--------|--------|
| 1 | Create Meta Pixel + CAPI (if not done) | Events Manager |
| 2 | Create Custom Audiences (website, video, engagement, exclusions) | Audiences |
| 3 | Create TOFU campaign with CBO, broad targeting, Advantage+ Placements | Campaign |
| 4 | Add 5–10 diverse creatives to first ad set | Ad Set / Ad |
| 5 | Create retargeting campaign, exclude purchasers | Campaign |
| 6 | Set up conversion events and verify in Events Manager | Events Manager |
| 7 | Launch; avoid edits for first 7 days | — |
| 8 | After 2 weeks: pause losers, duplicate winners with fresh creatives | Ad Set |

---

## 8. Common Mistakes to Avoid

- **Over-segmentation**: 10 ad sets for 10 audiences splits learnings. Use 1–3 ad sets max.
- **Premature optimization**: Wait for 1,000+ impressions and 50+ conversions before making changes.
- **Creative fatigue**: When frequency exceeds 3–4x, rotate in fresh creatives.
- **Fighting automation**: Overriding Advantage+ recommendations works against the system.
- **Budget changes during learning**: Even 20% increases reset learning. Duplicate instead.

---

## 9. Quick Reference

- **Advantage+**: Placements, Audience, Creative—use them.
- **Creative diversity**: Different hooks, formats, angles—not color swaps.
- **Broad > narrow**: Let Andromeda find your audience.
- **Duplicate to scale**: Never bump budget on active ad sets.
- **50 conversions/week**: Minimum for stable learning.
