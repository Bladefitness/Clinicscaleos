# Launch Plan Flowchart Vision (Notebook-LLM Style)

This doc extends the [Clinic Ads Education Strategy](.cursor/plans) with the **flowchart-as-central-experience** design: expandable steps that link to specific parts of the system, granular sub-steps (Offer → price → research → Creatives → …), and progress on the chart so users "walk through together."

---

## Concept: "We map our launch plan, then walk through together"

1. **First step:** "Map out our launch plan" — the flowchart itself is the plan. When the user lands on the dashboard (or a Launch Plan view), they see a flowchart that was "created" for them. The first node can expand to explain: "This is your launch plan. Each step links to the part of the system where you do the work."

2. **Each step is expandable (Notebook-LLM style):** Clicking a step/node **expands it in place** (accordion or inline panel). Expanded content includes:
   - **What** — one sentence
   - **Why** — 2–3 bullets
   - **Next** — what comes after
   - **"Do this step"** button → **deep-links into the app** (e.g. Offer Lab at wizard step 2, Creative Factory at step 1, etc.)
   - Optional: **"Mark done"** so the flowchart shows progress (checkmark, "You are here")

3. **Progress on the flowchart:** As the user completes steps (tracked via WorkflowContext or a progress store), the flowchart updates: completed steps get a checkmark, the current step is highlighted ("You are here"), upcoming steps are muted. The chart is the shared map they "walk through together" with the system.

---

## Granular steps (linked to specific parts of the system)

The flowchart is not just five modules; it breaks down into concrete sub-steps that map to real UI:

| Parent   | Sub-steps | Deep link target |
|---------|-----------|-------------------|
| **Offer** | Clinic & Service, Price, Research (Audience), Build Offer, Score | `/offer-lab` with `?step=1`, `?step=2`, `?step=3` (match [WIZARD_STEPS](client/src/pages/offer-lab.tsx): Clinic & Service, Audience, Build Offer) |
| **Creatives** | Avatar & research, Hooks & brief, Generate creatives | `/creative-factory` with `?step=1`, `?step=2`, `?step=3` if supported |
| **Campaign** | Setup (form), Blueprint, Deploy (checklist) | `/campaign-hq` (form vs blueprint view can use query/hash if needed) |
| **Coach** | Daily pulse, Weekly brief, Ask coach | `/ad-coach` with `?tab=pulse|weekly|chat` if desired |
| **Iterate** | Analyze winners/losers, Variations / diagnosis | `/iteration-lab` |

- **Offer Lab** already has `wizardStep` 1–3. Add support for reading `?step=1|2|3` from the URL on mount and setting `wizardStep` so that "Do this step" from the flowchart opens the correct step (e.g. `/offer-lab?step=2` → Audience).
- Same idea for Creative Factory and Ad Coach so every flowchart node can jump to the right place.

---

## Where the flowchart lives

- **Option A (recommended):** Dashboard becomes flowchart-first: hero + quick stats at top, then the **Launch Plan Flowchart** as the main content. Module cards become a secondary grid below or a "Jump to module" strip so power users can still open Offer Lab / Creative Factory directly.
- **Option B:** New route `/launch-plan` that is the full-page flowchart; dashboard keeps a compact "Your launch plan" preview and a link to the full flowchart.

---

## Data structure

- **Single source of truth:** e.g. `client/src/lib/launch-plan-steps.ts` (or `content/launch-plan.ts`).
- Define a **tree** of steps and sub-steps. Each node: `id`, `title`, `shortWhat`, `whyBullets`, `nextStep` (copy), `href` (route path), `queryOrHash` (optional, e.g. `?step=2`), `module` (M1–M5 for styling), optional `children` for sub-steps.

Example (Offer branch):

```ts
{
  id: "offer",
  title: "Offer",
  module: "M1",
  href: "/offer-lab",
  shortWhat: "Nail the offer so your ads have something worth clicking.",
  whyBullets: ["Weak offers waste ad spend.", "Strong offers improve CPL and conversion."],
  nextStep: "Then build creatives in Creative Factory.",
  children: [
    { id: "offer-clinic", title: "Clinic & Service", href: "/offer-lab", queryOrHash: "?step=1", ... },
    { id: "offer-price", title: "Price", href: "/offer-lab", queryOrHash: "?step=1", ... },
    { id: "offer-research", title: "Audience & Research", href: "/offer-lab", queryOrHash: "?step=2", ... },
    { id: "offer-build", title: "Build Offer", href: "/offer-lab", queryOrHash: "?step=3", ... },
    { id: "offer-score", title: "Score & Improve", href: "/offer-lab", ... },
  ],
}
```

---

## Component architecture

- **LaunchPlanFlowchart** (`client/src/components/launch-plan/LaunchPlanFlowchart.tsx`): Renders the full flowchart from `launch-plan-steps.ts`. State: `expandedId` (which step is expanded), optional `completedIds` / `currentId` from context or progress store.
- **FlowchartNode:** A single step or sub-step. Click toggles expand; when expanded, shows What/Why/Next + "Do this step" button (uses `href` + `queryOrHash`). Shows icon, title, and status (pending / current / completed) when progress is available.
- **Connectors:** Lines or arrows between nodes (SVG or CSS). Layout: vertical list of parent sections, each with a column of sub-steps and connector lines; or horizontal flow with vertical sub-steps under each parent.
- **Deep linking:** Use wouter `Link` or `useLocation().push(href + (queryOrHash || ""))`.

---

## Progress and "You are here"

- Extend [WorkflowContext](client/src/context/workflow-context.tsx) or add a small progress store, e.g. `launchPlanProgress: { completedStepIds: string[], currentStepId?: string }`.
- When the user clicks "Mark done" on a flowchart step (or when they complete a wizard step / generate a blueprint), update progress. Flowchart reads this to show checkmarks and highlight the current step.
- Optional: persist to localStorage so progress survives refresh.

---

## Implementation order (flowchart-specific)

1. Add `launch-plan-steps.ts` with the full tree (Offer with sub-steps, Creatives, Campaign, Coach, Iterate) and copy (shortWhat, whyBullets, nextStep).
2. Add `?step=` support in Offer Lab (and optionally Creative Factory, Ad Coach) so deep links open the right step.
3. Build `FlowchartNode` (expandable, What/Why/Next, "Do this step" button, status).
4. Build `LaunchPlanFlowchart` (reads steps, renders nodes + connectors, manages `expandedId`).
5. Add flowchart to dashboard as the main content block; optionally wire progress (WorkflowContext or progress store + "Mark done").
6. Optional: "How clinic ads work" testing-loop diagram below the flowchart (Test → Measure → Kill/Scale → Iterate), collapsible.

---

## Summary

- **Flowchart = central experience:** "We map our launch plan" → flowchart is created and displayed; each step is expandable (Notebook-LLM style) and links to a specific part of the system.
- **Granular sub-steps:** Offer (clinic, price, research, build offer, score) → Creatives (avatar, hooks, generate) → Campaign (setup, blueprint, deploy) → Coach → Iterate.
- **Deep links:** Every node has `href` + optional `queryOrHash` so "Do this step" opens the right page and step (e.g. `/offer-lab?step=2`).
- **Progress:** Flowchart reflects completed / current / upcoming so users "walk through together" with the system.
