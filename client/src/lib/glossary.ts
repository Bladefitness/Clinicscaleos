/**
 * Glossary definitions for advertising terms. Use with Tooltip or HoverCard so every page shares the same copy.
 */
export const GLOSSARY: Record<string, { term: string; definition: string }> = {
  CPL: {
    term: "CPL",
    definition: "Cost per lead — how much you pay for each form submit or conversion. Lower is better. Clinic benchmarks vary by service and market; Ad Coach can compare yours to targets.",
  },
  CTR: {
    term: "CTR",
    definition: "Click-through rate — percentage of people who see your ad and click it. Higher CTR usually means stronger creative or targeting; it influences how often Meta shows your ad.",
  },
  TOFU: {
    term: "TOFU",
    definition: "Top of funnel — awareness stage. Broad audience, scroll-stopping creatives, educational or curiosity hooks. Usually 50–60% of budget in a 3-phase campaign.",
  },
  MOFU: {
    term: "MOFU",
    definition: "Middle of funnel — consideration. People who have engaged; retargeting or lookalikes. Lead magnets and offers work well here.",
  },
  BOFU: {
    term: "BOFU",
    definition: "Bottom of funnel — conversion. People ready to book or buy. Strong offer, clear CTA, minimal friction.",
  },
  learning_phase: {
    term: "Learning phase",
    definition: "Period after launch when Meta's algorithm finds who to show your ad to. Lasts ~7 days or 50 conversions per ad set. Avoid budget or creative changes during this time or learning resets.",
  },
  kill_scale_criteria: {
    term: "Kill/scale criteria",
    definition: "Rules for when to pause underperforming ad sets (kill) vs. increase budget on winners (scale). Typically: kill if CPL is X% above target for Y days; scale if CPL is stable and under target. Prevents wasting budget on losers and captures more volume from winners.",
  },
};

export function getGlossaryDefinition(key: keyof typeof GLOSSARY): string {
  return GLOSSARY[key]?.definition ?? "";
}
