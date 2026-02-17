export function generateDemoMetrics() {
  const today = new Date();
  const metrics = [];
  const adSets = [
    { name: "Avatar Test - Busy Professional", cplBase: 22, ctrBase: 2.1 },
    { name: "Avatar Test - Aging Gracefully", cplBase: 18, ctrBase: 2.5 },
    { name: "Avatar Test - New Mom", cplBase: 28, ctrBase: 1.8 },
    { name: "Emotion Test - Hope", cplBase: 16, ctrBase: 2.8 },
    { name: "Emotion Test - Frustration", cplBase: 24, ctrBase: 1.9 },
    { name: "Style Test - Pattern Interrupt", cplBase: 15, ctrBase: 3.1 },
    { name: "Style Test - Testimonial", cplBase: 20, ctrBase: 2.3 },
    { name: "Scale - Winner Combo", cplBase: 14, ctrBase: 3.4 },
  ];

  for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    const dateStr = date.toISOString().split("T")[0];

    for (const adSet of adSets) {
      const variance = 0.7 + Math.random() * 0.6;
      const trendFactor = 1 - (dayOffset / 28) * 0.2;
      const impressions = Math.round((800 + Math.random() * 600) * trendFactor);
      const ctr = +(adSet.ctrBase * variance).toFixed(2);
      const clicks = Math.round(impressions * (ctr / 100));
      const cpl = +(adSet.cplBase * variance).toFixed(2);
      const leads = Math.max(1, Math.round(clicks * 0.15 * variance));
      const spend = +(leads * cpl).toFixed(2);
      const cpc = clicks > 0 ? +(spend / clicks).toFixed(2) : 0;
      const frequency = +(1 + (13 - dayOffset) * 0.15 + Math.random() * 0.3).toFixed(2);

      metrics.push({
        date: dateStr,
        adSetName: adSet.name,
        impressions,
        clicks,
        leads,
        spend: spend.toString(),
        cpl: cpl.toString(),
        ctr: ctr.toString(),
        cpc: cpc.toString(),
        frequency: frequency.toString(),
        roas: +(leads * 150 / Math.max(spend, 1)).toFixed(2).toString(),
      });
    }
  }

  return metrics;
}

export function getDailyPulseData() {
  return {
    summary: "Strong day overall. Your 'Aging Gracefully - Hope' ad set is crushing it at $14.20 CPL, well below the $18 benchmark. The 'New Mom - Frustration' set needs attention — CPL spiked to $34 and frequency hit 2.8. Consider pausing and rotating fresh creative.",
    alert_level: "yellow" as const,
    winners: [
      { name: "Aging Gracefully - Hope", metric: "$14.20 CPL (21% below benchmark)", insight: "Testimonial style + hope emotion is resonating strongly with 45-55 women" },
      { name: "Pattern Interrupt - Scale", metric: "3.4% CTR", insight: "Scroll-stopping hook is driving highest click-through rate in account" },
    ],
    losers: [
      { name: "New Mom - Frustration", metric: "$34.00 CPL (89% above target)", insight: "Frequency at 2.8 suggests creative fatigue. Audience may be too narrow." },
      { name: "Busy Professional - Envy", metric: "0.9% CTR", insight: "Hook isn't resonating. Consider switching to a curiosity-based hook." },
    ],
    actions: [
      { priority: "high" as const, action: "Pause 'New Mom - Frustration' ad set", reasoning: "CPL is 89% above target and frequency indicates creative fatigue" },
      { priority: "high" as const, action: "Increase budget 20% on 'Aging Gracefully - Hope'", reasoning: "Consistently performing below benchmark CPL for 3+ days" },
      { priority: "medium" as const, action: "Create 3 new creatives for the New Mom avatar", reasoning: "Need fresh creative to re-test this avatar with different hooks" },
      { priority: "low" as const, action: "Test a curiosity hook for Busy Professional", reasoning: "Current envy hook has low CTR, try 'What your doctor isn't telling you about...' angle" },
    ],
    spend_today: "$287.40",
    leads_today: 14,
    avg_cpl: "$20.53",
  };
}

export function getWeeklyBriefData() {
  return {
    executive_summary: "This week generated 89 leads at an average CPL of $19.40 — 12% better than last week. Total spend was $1,726. The 'Aging Gracefully' avatar continues to outperform, driving 34 of the 89 leads. We've identified 2 clear winners ready to scale and 1 ad set to kill. Recommend shifting 30% of budget from underperformers to proven winners.",
    total_spend: "$1,726.00",
    total_leads: 89,
    avg_cpl: "$19.40",
    best_performing: {
      name: "Aging Gracefully - Hope (Testimonial)",
      cpl: "$14.20",
      leads: 34,
      insight: "This combination has been the top performer for 2 consecutive weeks. The testimonial format with hope-based messaging resonates strongly with women 45-55 who want natural-looking results.",
    },
    worst_performing: {
      name: "New Mom - Frustration (Pattern Interrupt)",
      cpl: "$34.00",
      leads: 8,
      insight: "The frustration angle may be too negative for new moms. They respond better to empowerment messaging. Frequency hit 3.1 suggesting creative fatigue.",
    },
    trends: [
      { metric: "Overall CPL", direction: "down" as const, insight: "CPL decreased 12% week-over-week as we scaled winners and paused losers" },
      { metric: "CTR", direction: "up" as const, insight: "Average CTR improved from 2.1% to 2.4% after implementing new Pattern Interrupt creatives" },
      { metric: "Frequency", direction: "up" as const, insight: "Average frequency increased from 2.1 to 2.5 — approaching the 3.0 warning threshold on 2 ad sets" },
      { metric: "Lead Quality", direction: "stable" as const, insight: "Appointment show rate holding steady at 68% from Facebook leads" },
    ],
    recommendations: [
      { action: "Scale 'Aging Gracefully - Hope' to $80/day", expected_impact: "Project 15+ additional leads at similar CPL", priority: "high" as const },
      { action: "Kill 'New Mom - Frustration' ad set", expected_impact: "Save ~$45/day in wasted spend", priority: "high" as const },
      { action: "Launch 5 new 'Aging Gracefully' variations", expected_impact: "Extend the life of the winning avatar before fatigue hits", priority: "medium" as const },
      { action: "Test empowerment angle for New Mom avatar", expected_impact: "Could recover this avatar segment with better emotional targeting", priority: "medium" as const },
    ],
    next_week_plan: "Focus on scaling the Aging Gracefully winner while launching fresh creatives. Kill underperformers to redistribute budget. Target: 100+ leads at sub-$18 CPL.",
  };
}
