/**
 * Launch Plan Flowchart — single source of truth for journey steps, "why" copy, and deep links.
 * Used by LaunchPlanFlowchart, dashboard module cards, and per-module "Why" blurbs.
 */

export interface LaunchPlanStep {
  id: string;
  title: string;
  shortWhat: string;
  whyBullets: string[];
  nextStep: string;
  href: string;
  queryOrHash?: string;
  module?: "M1" | "M2" | "M3" | "M4" | "M5";
  children?: LaunchPlanStep[];
}

/** Intro step: "Map out our launch plan" — the flowchart itself is the plan */
export const LAUNCH_PLAN_INTRO: Omit<LaunchPlanStep, "href" | "queryOrHash" | "children"> & {
  href: "";
  queryOrHash: undefined;
} = {
  id: "intro",
  title: "Map out our launch plan",
  shortWhat: "This is your launch plan. Each step links to the part of the system where you do the work. Click any step to expand it and jump straight there.",
  whyBullets: [
    "Clinic ads work best when you follow a clear sequence: offer first, then creatives, then campaign setup.",
    "Seeing the full map keeps you from skipping steps or getting lost.",
    "We walk through each step together and explain why it matters.",
  ],
  nextStep: "Start with Offer Lab: define your clinic, service, price, and audience, then score your offer.",
  href: "",
  queryOrHash: undefined,
  module: undefined,
};

export const LAUNCH_PLAN_STEPS: LaunchPlanStep[] = [
  {
    id: "offer",
    title: "Offer",
    module: "M1",
    href: "/offer-lab",
    shortWhat: "Nail the offer so your ads have something worth clicking. Score it, improve it, then move to creatives.",
    whyBullets: [
      "Weak offers waste ad spend — people click but don't convert.",
      "Strong offers improve CPL and conversion; the rest of the funnel performs better.",
      "Scoring forces clarity on urgency, risk reversal, and value so you don't guess.",
    ],
    nextStep: "Then build creatives in Creative Factory.",
    children: [
      {
        id: "offer-clinic",
        title: "Clinic & Service",
        shortWhat: "Set your clinic type, service, location, and price so the rest of the system is grounded in your business.",
        whyBullets: ["Everything downstream (creatives, targeting, copy) depends on knowing who you are and what you sell.", "Price shapes how we frame the offer and who we target."],
        nextStep: "Add audience and differentiator in the next step.",
        href: "/offer-lab",
        queryOrHash: "?step=1",
        module: "M1",
      },
      {
        id: "offer-research",
        title: "Audience & Research",
        shortWhat: "Define who you're talking to and what makes you different. This drives avatar and messaging in Creative Factory.",
        whyBullets: ["Ads that speak to a specific person outperform generic blasts.", "Your differentiator gives creatives a clear angle and reduces competitor confusion."],
        nextStep: "Build your offer copy in the next step.",
        href: "/offer-lab",
        queryOrHash: "?step=2",
        module: "M1",
      },
      {
        id: "offer-build",
        title: "Build Offer",
        shortWhat: "Write your offer (discount, bonus, guarantee, urgency) and get an AI score plus improvement suggestions.",
        whyBullets: ["Clarity, urgency, and risk reversal are the levers that move conversion.", "Scoring shows gaps vs. market and gives you variations to test."],
        nextStep: "Use the score and variations, then create ads in Creative Factory.",
        href: "/offer-lab",
        queryOrHash: "?step=3",
        module: "M1",
      },
    ],
  },
  {
    id: "creatives",
    title: "Creatives",
    module: "M2",
    href: "/creative-factory",
    shortWhat: "Launch ads that stop the scroll. Research-backed avatars, emotion-based hooks, and image prompts in one flow.",
    whyBullets: [
      "Creative is the biggest lever on CPL — same offer, different creative can 2–3x performance.",
      "Avatar + emotion targeting ensures messaging matches who you're talking to and how they feel.",
      "Multiple creatives let you test and learn instead of betting on one idea.",
    ],
    nextStep: "Then set up your campaign in Campaign HQ.",
    children: [
      {
        id: "creatives-avatar",
        title: "Avatar & Research",
        shortWhat: "Pick or generate avatars and emotional triggers so creatives speak to the right person with the right angle.",
        whyBullets: ["One ad can't speak to everyone; avatars focus copy and creative style.", "Emotion (hope, curiosity, frustration) drives clicks and conversions in healthcare."],
        nextStep: "Add hooks and brief, then generate creatives.",
        href: "/creative-factory",
        queryOrHash: "?step=1",
        module: "M2",
      },
      {
        id: "creatives-hooks",
        title: "Hooks & Brief",
        shortWhat: "Define hooks and creative direction so the AI generates on-strategy headlines and primary text.",
        whyBullets: ["Hooks that stop the scroll get the offer in front of the right people.", "A clear brief reduces generic output and keeps creatives on brand."],
        nextStep: "Generate multiple creatives and pick winners.",
        href: "/creative-factory",
        queryOrHash: "?step=2",
        module: "M2",
      },
      {
        id: "creatives-generate",
        title: "Generate Creatives",
        shortWhat: "Generate ad copy and image prompts; edit and export for Meta (or other platforms).",
        whyBullets: ["Multiple creatives let you A/B test and find winners before scaling.", "Having copy and image prompts ready speeds up campaign setup."],
        nextStep: "Take your best creatives to Campaign HQ and build the campaign.",
        href: "/creative-factory",
        queryOrHash: "?step=3",
        module: "M2",
      },
    ],
  },
  {
    id: "campaign",
    title: "Campaign",
    module: "M3",
    href: "/campaign-hq",
    shortWhat: "Deploy with confidence. Get a 3-phase blueprint (test, scale, optimize), budget allocation, and step-by-step deployment checklist.",
    whyBullets: [
      "Testing first (small budget, multiple ad sets) finds winners before you scale.",
      "A clear checklist reduces setup errors and ensures learning phase isn't broken by early edits.",
      "Kill/scale criteria tell you when to pause losers and duplicate winners instead of guessing.",
    ],
    nextStep: "Use Ad Coach for daily pulse and weekly strategy, then iterate in Iteration Lab.",
    children: [
      {
        id: "campaign-setup",
        title: "Setup (Form)",
        shortWhat: "Enter clinic type, service, location, budget, and goal so we can generate your campaign blueprint.",
        whyBullets: ["The blueprint is tailored to your business and budget.", "3-phase structure (test → scale → optimize) is proven for clinic ads."],
        nextStep: "Generate blueprint, then follow the deployment checklist.",
        href: "/campaign-hq",
        module: "M3",
      },
      {
        id: "campaign-deploy",
        title: "Deploy (Checklist)",
        shortWhat: "Follow the step-by-step deployment checklist in Meta Ads Manager; check off as you go.",
        whyBullets: ["Each step has details and common mistakes so you don't break learning or waste budget.", "Checking off keeps you on track and shows progress."],
        nextStep: "After launch, use Ad Coach and Iteration Lab to optimize.",
        href: "/campaign-hq",
        module: "M3",
      },
    ],
  },
  {
    id: "coach",
    title: "Ad Coach",
    module: "M4",
    href: "/ad-coach",
    shortWhat: "Stay sharp with a daily pulse, weekly brief, and 24/7 chat coach that knows your campaigns.",
    whyBullets: [
      "Daily pulse surfaces what's working and what needs attention without digging through Ads Manager.",
      "Weekly brief keeps strategy aligned so you don't drift.",
      "Chat answers questions in context (CPL, CTR, when to scale, when to kill).",
    ],
    nextStep: "Use Iteration Lab to double down on winners and fix losers.",
    children: [
      {
        id: "coach-pulse",
        title: "Daily Pulse",
        shortWhat: "Quick snapshot of campaign health: CPL, leads, alerts, and recommended actions.",
        whyBullets: ["Catching problems early (e.g. creative fatigue, rising CPL) saves budget.", "Recommended actions are prioritized so you know what to do first."],
        nextStep: "Drill into weekly brief or ask the coach for more detail.",
        href: "/ad-coach",
        queryOrHash: "?tab=pulse",
        module: "M4",
      },
      {
        id: "coach-weekly",
        title: "Weekly Brief",
        shortWhat: "Strategic summary and actions for the week based on performance and goals.",
        whyBullets: ["Weekly cadence avoids reactive tweaking and keeps focus on strategy.", "Brief ties metrics to actions (scale this, test that, fix this)."],
        nextStep: "Implement actions; use Iteration Lab for winner variations and loser diagnosis.",
        href: "/ad-coach",
        queryOrHash: "?tab=weekly",
        module: "M4",
      },
      {
        id: "coach-chat",
        title: "Ask Coach",
        shortWhat: "Chat with your AI Ad Coach about performance, strategy, or any advertising question.",
        whyBullets: ["Instant answers without leaving the app.", "Coach can reference your context (campaigns, CPL, goals) when you connect Meta."],
        nextStep: "Use recommendations in Campaign HQ or Iteration Lab.",
        href: "/ad-coach",
        queryOrHash: "?tab=chat",
        module: "M4",
      },
    ],
  },
  {
    id: "iterate",
    title: "Iterate",
    module: "M5",
    href: "/iteration-lab",
    shortWhat: "Double down on winners, fix losers. Get strategic variations for winning creatives and diagnosis for underperformers.",
    whyBullets: [
      "Winners can be scaled and varied (new hooks, angles) to extend their life.",
      "Losers often have a fixable cause (hook, offer, targeting); diagnosis finds it.",
      "Continuous iteration keeps CPL down and volume up instead of one-and-done launches.",
    ],
    nextStep: "Deploy new creatives or campaigns from Campaign HQ; keep monitoring in Ad Coach.",
    children: [
      {
        id: "iterate-winners",
        title: "Winner Variations",
        shortWhat: "Generate 5 strategic variations of a winning ad to test against the original and find the next winner.",
        whyBullets: ["Creative fatigue is real; variations keep the same audience responding.", "Testing variations is lower risk than entirely new creatives."],
        nextStep: "Launch variations in Campaign HQ; track in Ad Coach.",
        href: "/iteration-lab",
        module: "M5",
      },
      {
        id: "iterate-losers",
        title: "Loser Diagnosis",
        shortWhat: "Get a diagnosis of why an ad underperformed (hook, copy, image, targeting, offer) and what to try next.",
        whyBullets: ["Stopping at 'it didn't work' wastes learning; diagnosis turns failure into a test.", "Fixing one element (e.g. hook) can turn a loser into a winner."],
        nextStep: "Apply fixes (new creative or targeting) and re-test.",
        href: "/iteration-lab",
        module: "M5",
      },
    ],
  },
];

/** All step IDs in order (intro + flattened tree) for progress and "You are here" */
export function getAllStepIds(): string[] {
  const ids: string[] = ["intro"];
  function walk(steps: LaunchPlanStep[]) {
    for (const s of steps) {
      ids.push(s.id);
      if (s.children?.length) walk(s.children);
    }
  }
  walk(LAUNCH_PLAN_STEPS);
  return ids;
}
