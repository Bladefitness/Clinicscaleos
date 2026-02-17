export function buildOfferScoringPrompt(data: {
  service: string;
  price: string;
  clinicType: string;
  location: string;
  currentOffer: string;
  differentiator: string;
  targetMarket: string;
}): string {
  return `You are an elite healthcare advertising strategist. Score this clinic offer and suggest improvements. Use constructive, encouraging framing: lead with what works, then what to add.

CLINIC INFO:
- Type: ${data.clinicType}
- Service: ${data.service}
- Price: ${data.price || "Not specified"}
- Location: ${data.location}
- Target Market: ${data.targetMarket || "General local audience"}
- Differentiator: ${data.differentiator || "None specified"}

CURRENT OFFER:
"${data.currentOffer}"

Score this offer 1-10 on these criteria (each 1-10):
- Clarity: Is it immediately obvious what they get?
- Urgency: Is there a reason to act NOW?
- Risk Reversal: Does it remove the fear of trying? (guarantees, free trials, etc.)
- Specificity: Are there specific numbers, timeframes, outcomes?
- Value Perception: Does the perceived value far exceed the price/effort?

Also generate 3-5 improved offer variations ranked by projected score.

For competitor insights, analyze what competing ${data.clinicType}s in ${data.location} likely offer for ${data.service} and identify differentiation opportunities. Provide common_competitor_offers as specific example offers (e.g. "Free consultation + 20% off first treatment").

Also estimate market_benchmarks: typical scores (1-10) for clarity, urgency, risk_reversal, specificity, value_perception that similar clinics in this market achieve. This helps users see their gap vs. the market.

For weaknesses, use the enriched format with issue, impact (high|medium|low), and fix_suggestion (actionable, specific). For each variation, add weaknesses_addressed: array of weakness issues that this variation fixes.

Provide improvement_roadmap: 3-5 prioritized actions to get to a 9+ offer, with impact (quick_win|medium|high_effort) and metric_improved.

Return ONLY valid JSON (no markdown, no code fences):
{
  "overall_score": number,
  "breakdown": { "clarity": number, "urgency": number, "risk_reversal": number, "specificity": number, "value_perception": number },
  "weaknesses": [{ "issue": "string", "impact": "high|medium|low", "fix_suggestion": "string" }],
  "strengths": ["string"],
  "verdict": "string (2-3 sentences: start with 1-2 strengths, then 'To reach 9+, consider adding...' with specific improvements — never say the offer 'fails' or is 'bad')",
  "improvement_roadmap": [{ "priority": number, "action": "string", "impact": "quick_win|medium|high_effort", "metric_improved": "string" }],
  "market_benchmarks": { "clarity": number, "urgency": number, "risk_reversal": number, "specificity": number, "value_perception": number },
  "variations": [{ "offer_text": "string", "projected_score": number, "reasoning": "string", "risk_level": "low|medium|high", "weaknesses_addressed": ["string"] }],
  "competitor_insights": {
    "market_temperature": "red_ocean|blue_ocean|mixed",
    "common_competitor_offers": ["string"],
    "differentiation_opportunities": ["string"],
    "recommended_angles": ["string"]
  }
}`;
}

/** Build prompt for AI to synthesize research on patient emotional triggers (no web search needed) */
export function buildAvatarResearchPrompt(data: {
  clinicType: string;
  service: string;
  targetMarket?: string;
  offer?: string;
}): string {
  return `You are a healthcare consumer research analyst. Synthesize what is known about patient psychology and emotional triggers for ${data.clinicType} patients considering ${data.service}.

TARGET: ${data.targetMarket || "General local audience"}
OFFER CONTEXT: ${data.offer || "Not specified"}

Produce a research synthesis covering:
1. Primary emotional triggers (frustration, fear, hope, trust, etc.) that drive people to seek this service
2. Common pain points and objections
3. What motivates purchase decisions (e.g. time savings, visible results, trust in provider)
4. Segment types that typically respond best (e.g. time-poor professionals, appearance-conscious, value seekers)
5. Proven messaging angles from healthcare marketing research

Be specific to ${data.service} - e.g. Botox patients have different triggers than dental implant patients.
Keep it concise (200-400 words). Use bullet points. This will ground avatar creation in evidence.

Return ONLY valid JSON (no markdown, no code fences):
{
  "summary": "2-3 sentence overview of key findings",
  "emotional_triggers": ["trigger 1", "trigger 2", "trigger 3"],
  "pain_points": ["pain 1", "pain 2"],
  "buying_motivations": ["motivation 1", "motivation 2"],
  "top_segments": ["segment 1 with brief description", "segment 2", "segment 3"],
  "messaging_angles": ["angle 1", "angle 2"]
}`;
}

export function buildAvatarGenerationPrompt(data: {
  clinicType: string;
  service: string;
  targetMarket: string;
  offer: string;
  researchFindings?: string;
}): string {
  const researchBlock = data.researchFindings
    ? `\n\nRESEARCH FINDINGS (use these to ground avatar emotions and triggers):\n${data.researchFindings}\n`
    : "";
  return `You are an elite healthcare advertising psychologist specializing in patient avatar creation for Facebook Ads.

CLINIC INFO:
- Type: ${data.clinicType}
- Service: ${data.service}
- Target Market: ${data.targetMarket || "General local audience"}
- Offer: ${data.offer || "Contact us for specials"}
${researchBlock}

Generate 5-8 detailed patient avatars for this clinic. Each avatar represents a distinct segment of people who would buy this service. Base emotions, objections, and buying triggers on the research findings when provided.

Return ONLY valid JSON (no markdown, no code fences):
{
  "avatars": [
    {
      "name": "2-4 word avatar name",
      "situation": "Their current life situation in 1-2 sentences",
      "demographics": "Age range, income level, occupation type",
      "psychographics": "Values, lifestyle, media consumption",
      "emotions": {
        "negative": "The painful emotion driving them (frustration, insecurity, anxiety, etc.)",
        "transition": "The emotional shift they want to make",
        "positive": "How they want to feel after treatment"
      },
      "hooks": {
        "pain": "A hook targeting their pain point (5-8 words)",
        "shift": "A hook about the transformation (5-8 words)",
        "outcome": "A hook about the desired result (5-8 words)"
      },
      "objections": ["Top 2-3 objections this avatar has"],
      "buying_triggers": ["Top 2-3 things that would make them buy NOW"]
    }
  ]
}`;
}

const AVATAR_PAIRS = [
  '"Busy Professional (35-50, high income, time-poor)" + "Aging Gracefully Seeker (45-65, appearance-conscious)"',
  '"New Mom Reclaiming Herself (28-40, post-pregnancy)" + "Health-Conscious Executive (40-55, proactive wellness)"',
  '"Social Media Savvy Millennial (25-38, appearance-driven)" + "Budget-Conscious Value Seeker (30-50, deal-motivated)"',
];

export function buildCreativePrompt(
  data: {
    clinicType: string;
    service: string;
    location: string;
    targetAudience: string;
    offerDetails: string;
    goal: string;
    avatarPair?: string;
  },
  batchIndex?: number
): string {
  const avatarPair = data.avatarPair ?? AVATAR_PAIRS[batchIndex ?? 0] ?? AVATAR_PAIRS[0];
  return `You are an elite healthcare advertising strategist who creates high-converting Facebook and Instagram ads using avatar-based targeting, emotional hooks, and proven direct response frameworks.

Generate exactly 6 ad creatives for this clinic. Return ONLY a valid JSON array — no markdown, no explanation, no code fences.

CLINIC INFO:
- Type: ${data.clinicType}
- Service: ${data.service}
- Location: ${data.location}
- Target: ${data.targetAudience || "General local audience"}
- Offer: ${data.offerDetails || "Contact us for current specials"}
- Goal: ${data.goal}

AVATARS FOR THIS BATCH: ${avatarPair}

AD COPY FORMULAS TO USE (vary across creatives):
1. Story Arc: Personal narrative → turning point → discovery → result → CTA
2. Revelation: "I used to think X... then I discovered Y"
3. Before/After Bridge: Paint the before → show the bridge → describe the after
4. Calculator: "If you spend $X on Y, but miss out on Z..."
5. Text Message: Written like a text conversation between friends

AD STYLE FRAMEWORKS (vary across creatives):
1. Pattern Interrupt: Scroll-stopping unusual angle
2. Native Social: Looks like a friend's post
3. Breaking News: Urgent announcement format
4. Testimonial: Patient story format
5. Before/After: Transformation showcase

Each object in the array must have exactly these keys:
- "id": number (1-6)
- "avatar": short avatar name (2-4 words)
- "emotion": one of: frustration, hope, envy, fear, empowerment, curiosity, urgency, trust
- "style": one of: Pattern Interrupt, Native Social, Breaking News, Testimonial, Before/After, Educational, Social Proof, Direct Offer
- "headline": compelling ad headline, max 10 words
- "primary_text": 2-3 sentences of ad copy, 5th grade reading level, pain → solution → CTA format (80-120 words max)
- "image_prompt": detailed scene description for AI image generation (subject, environment, lighting, mood, camera angle, style)
- "hook": the opening hook angle in 5-8 words
- "category": one of: Avatar Test A, Avatar Test B, Emotion Test, Style Test
- "copy_formula": which formula was used (Story Arc, Revelation, Before/After Bridge, Calculator, Text Message)
- "rationale": 1-2 sentences explaining why this emotion and style were chosen for this avatar and offer (optional but recommended)

Rules:
- Use different emotion + style + copy formula combinations across the 6 creatives
- Write at 5th grade reading level
- Use "you" and "your" language (never "we" or "our")
- Be specific to the clinic type and service
- Make headlines scroll-stopping
- Image prompts: detailed scene description (subject, environment, lighting, mood, camera angle). For Pattern Interrupt describe the PROBLEM state (frustrated, stressed). For Breaking News describe expert/news setup. For Before/After describe both states. Be specific for Lovart/Midjourney-level output`;
}

export function buildCampaignBlueprintPrompt(data: {
  clinicType: string;
  service: string;
  location: string;
  budget: string;
  goal: string;
  audienceInfo: string;
  creativeCount: number;
}): string {
  return `You are a Facebook Ads campaign architect specializing in healthcare advertising. Create a complete campaign blueprint aligned with Meta's post-Andromeda best practices (2026+).

POST-ANDROMEDA RULES (mandatory):
- Creative-first, not targeting-first: broad audiences outperform narrow segmentation
- Use Advantage+ Placements and Advantage+ Audience; avoid manual overrides
- CBO (Campaign Budget Optimization) at campaign level
- 5-10 diverse creatives per ad set (different hooks, formats, angles — not minor variants)
- Duplicate to scale — never increase budget on active ad sets
- 1-3 ad sets max per campaign to avoid splitting learnings

CLINIC INFO:
- Type: ${data.clinicType}
- Service: ${data.service}
- Location: ${data.location}
- Monthly Budget: ${data.budget}
- Goal: ${data.goal}
- Audience: ${data.audienceInfo || "General local audience"}
- Number of Creatives Available: ${data.creativeCount}

Create a FUNNEL-BASED campaign with TOFU, MOFU, and BOFU phases:
- TOFU (50-60% budget): Awareness/Prospecting — Broad, Advantage+, educational/scroll-stopping creatives
- MOFU (20-25% budget): Consideration — Video viewers 25-75%, website visitors 7-30d, testimonials/case studies
- BOFU (10-15% budget): Conversion — Add-to-cart, checkout abandoners, direct offers, urgency
- Creative Testing (5-10%): New concepts, DCO tests

Targeting: Broad, Advantage+ Audience. Exclusions: purchasers last 180 days. No micro-segmentation.

CRITICAL: Respond with ONLY valid JSON. No markdown, no code fences, no text before or after. Never include \`\`\`json.
{
  "campaign_name": "string",
  "objective": "Lead Generation|Conversions|Traffic",
  "total_budget": "string",
  "phases": [
    {
      "phase_name": "string",
      "funnel_stage": "TOFU|MOFU|BOFU|Testing",
      "duration": "string",
      "budget_allocation": "string",
      "ad_sets": [
        {
          "name": "string",
          "budget": "string",
          "targeting": {
            "age_range": "string (or 'Broad')",
            "gender": "string (or 'All')",
            "interests": ["string (optional; prefer empty for broad)"],
            "locations": "string (e.g. ${data.location} + radius)",
            "exclusions": ["string (e.g. Purchasers 180d)"]
          },
          "creative_ids": [1, 2, 3, 4, 5],
          "kill_criteria": "string",
          "scale_criteria": "string"
        }
      ]
    }
  ],
  "retargeting_audiences": [
    "Website visitors 7 days",
    "Website visitors 14 days",
    "Video viewers 25% (7 days)",
    "Video viewers 50% (7 days)",
    "Add-to-cart / Checkout abandoners 14 days",
    "Exclude: Purchasers last 180 days"
  ],
  "naming_examples": {
    "campaign": "Brand_Objective_FunnelStage_Date",
    "ad_set": "AudienceType | Exclusions | Placement | Region",
    "ad": "CreativeType_Hook_Variation"
  },
  "deployment_steps": [
    { "step_number": 1, "screen": "Events Manager", "action": "Create Pixel + CAPI (if not done)", "details": "Set up Meta Pixel and Conversions API for server-side events.", "common_mistakes": "Missing CAPI causes underreporting" },
    { "step_number": 2, "screen": "Audiences", "action": "Create Custom Audiences (website, video, engagement, exclusions)", "details": "Create retargeting audiences per retargeting_audiences list.", "common_mistakes": "Forgetting to exclude purchasers" },
    { "step_number": 3, "screen": "Campaign", "action": "Create TOFU campaign with CBO, broad targeting, Advantage+ Placements", "details": "Campaign Budget Optimization, no manual placement overrides.", "common_mistakes": "Over-segmentation" },
    { "step_number": 4, "screen": "Ad Set", "action": "Add 5-10 diverse creatives to first ad set", "details": "Different concepts: video, static, carousel, UGC, testimonial.", "common_mistakes": "Too few creatives or too similar" },
    { "step_number": 5, "screen": "Campaign", "action": "Create retargeting campaign, exclude purchasers", "details": "Use custom audiences for MOFU/BOFU.", "common_mistakes": "Retargeting purchasers" },
    { "step_number": 6, "screen": "Events Manager", "action": "Set up conversion events and verify", "details": "ViewContent, AddToCart, InitiateCheckout, Lead, Purchase.", "common_mistakes": "Wrong event optimization" },
    { "step_number": 7, "screen": "Campaign", "action": "Launch; avoid edits for first 7 days", "details": "Let learning phase complete before making changes.", "common_mistakes": "Premature optimization" },
    { "step_number": 8, "screen": "Ad Set", "action": "After 2 weeks: pause losers, duplicate winners with fresh creatives", "details": "Duplicate to scale; do not increase budget on active ad sets.", "common_mistakes": "Budget changes reset learning" }
  ],
  "naming_convention": "Campaign: Brand_Objective_FunnelStage_Date. Ad Set: AudienceType | Exclusion | Placement | Region. Ad: CreativeType_Hook_Variation",
  "tracking_setup": ["Meta Pixel header", "Conversions API (CAPI)", "Standard events: ViewContent, AddToCart, InitiateCheckout, Lead, Purchase"]
}`;
}

export function buildDailyPulsePrompt(metricsData: string): string {
  return `You are an AI Ad Coach for a healthcare clinic. Analyze today's campaign metrics and provide an actionable daily briefing.

METRICS DATA:
${metricsData}

HEALTHCARE BENCHMARKS:
- Med Spa CPL: $15-45
- Dental CPL: $20-60
- IV Therapy CPL: $12-35
- Weight Loss CPL: $18-50
- Good CTR: >1.5%
- Warning Frequency: >3.0
- Kill CPL threshold: >150% of benchmark after 3 days

Return ONLY valid JSON (no markdown, no code fences):
{
  "summary": "2-3 sentence executive summary",
  "alert_level": "green|yellow|red",
  "winners": [{ "name": "string", "metric": "string", "insight": "string" }],
  "losers": [{ "name": "string", "metric": "string", "insight": "string" }],
  "actions": [{ "priority": "high|medium|low", "action": "string", "reasoning": "string" }],
  "spend_today": "string",
  "leads_today": number,
  "avg_cpl": "string"
}`;
}

export function buildWeeklyBriefPrompt(metricsData: string): string {
  return `You are an AI Ad Coach for a healthcare clinic. Create a comprehensive weekly strategy brief.

WEEKLY METRICS:
${metricsData}

Provide a strategic weekly brief with trend analysis and next-week recommendations.

Return ONLY valid JSON (no markdown, no code fences):
{
  "executive_summary": "3-4 sentence overview",
  "total_spend": "string",
  "total_leads": number,
  "avg_cpl": "string",
  "best_performing": { "name": "string", "cpl": "string", "leads": number, "insight": "string" },
  "worst_performing": { "name": "string", "cpl": "string", "leads": number, "insight": "string" },
  "trends": [{ "metric": "string", "direction": "up|down|stable", "insight": "string" }],
  "recommendations": [{ "action": "string", "expected_impact": "string", "priority": "high|medium|low" }],
  "next_week_plan": "string"
}`;
}

export function buildAdCoachChatPrompt(data: {
  message: string;
  clinicContext: string;
  campaignData: string;
  conversationHistory?: string;
}): string {
  return `You are an AI Ad Coach for healthcare clinics — think of yourself as a $10,000/month media buyer available 24/7.

CLINIC CONTEXT: ${data.clinicContext || "Healthcare clinic running Facebook Ads"}
CAMPAIGN DATA: ${data.campaignData || "No active campaigns yet"}
${data.conversationHistory ? `CONVERSATION HISTORY:\n${data.conversationHistory}` : ""}

USER QUESTION: "${data.message}"

HEALTHCARE ADVERTISING BENCHMARKS:
- Med Spa CPL: $15-45, Dental CPL: $20-60, IV Therapy CPL: $12-35
- Good CTR: >1.5%, Warning Frequency: >3.0
- Creative fatigue typically hits at 3-5 days for healthcare
- Best performing ad styles: Pattern Interrupt, Before/After, Testimonial

Respond as a knowledgeable, friendly ad coach. Be specific, reference data when available, and always suggest actionable next steps.

Return ONLY valid JSON (no markdown, no code fences):
{
  "response": "Your coaching response (2-4 paragraphs, conversational tone, specific advice)",
  "data_referenced": ["list of data points or benchmarks referenced"],
  "confidence_level": "high|medium|low",
  "follow_up_questions": ["2-3 follow-up questions the user might want to ask"]
}`;
}

export function buildWinnerVariationPrompt(data: {
  creativeName: string;
  creativeHeadline: string;
  creativeCopy: string;
  performanceData: string;
  clinicType: string;
  service: string;
}): string {
  return `You are an elite healthcare advertising strategist. A winning ad creative has been identified. Generate 5 strategic variations to test.

WINNING CREATIVE:
- Avatar: ${data.creativeName}
- Headline: "${data.creativeHeadline}"
- Copy: "${data.creativeCopy}"
- Performance: ${data.performanceData || "Strong CTR and CPL below benchmark"}
- Clinic Type: ${data.clinicType || "Healthcare clinic"}
- Service: ${data.service || "Healthcare service"}

VARIATION STRATEGIES:
1. Same avatar, different emotional hook
2. Same hook angle, different image style
3. Shorter vs longer copy variation
4. Different CTA approach
5. Different copy formula (Story Arc, Revelation, Before/After Bridge, Calculator, Text Message)

Return ONLY valid JSON (no markdown, no code fences):
{
  "variations": [
    {
      "variation_number": number,
      "headline": "string",
      "primary_text": "string (80-120 words)",
      "hook": "string (5-8 words)",
      "image_prompt": "string",
      "what_changed": "string",
      "hypothesis": "string",
      "copy_formula": "string"
    }
  ]
}`;
}

export function buildLoserDiagnosisPrompt(data: {
  creativeName: string;
  creativeHeadline: string;
  creativeCopy: string;
  performanceData: string;
  clinicType: string;
  service: string;
}): string {
  return `You are an elite healthcare advertising strategist. A failing ad creative needs diagnosis and fixes.

FAILING CREATIVE:
- Avatar: ${data.creativeName}
- Headline: "${data.creativeHeadline}"
- Copy: "${data.creativeCopy}"
- Performance: ${data.performanceData || "High CPL and low CTR"}
- Clinic Type: ${data.clinicType || "Healthcare clinic"}
- Service: ${data.service || "Healthcare service"}

DIAGNOSTIC FRAMEWORK:
1. Hook (first 3 seconds / first line) — is it scroll-stopping?
2. Copy (body text) — does it follow pain → solution → CTA?
3. Image/Visual — does the image prompt support the message?
4. Targeting — is the avatar-audience match right?
5. Offer — is the offer compelling enough?

Return ONLY valid JSON (no markdown, no code fences):
{
  "diagnosis": "2-3 sentence overall assessment",
  "likely_failure_point": "hook|copy|image|targeting|offer",
  "evidence": ["specific evidence for the diagnosis"],
  "severity": "critical|moderate|minor",
  "fix_options": [
    {
      "approach": "string",
      "new_headline": "string",
      "new_copy": "string (80-120 words)",
      "new_hook": "string",
      "new_image_prompt": "string",
      "expected_improvement": "string"
    }
  ]
}`;
}

export function buildAdCopierPrompt(data: {
  headline?: string;
  primaryText?: string;
  cta?: string;
  clinicType: string;
  service: string;
  location: string;
  offer: string;
  targetAudience: string;
}): string {
  const adContext = [
    data.headline && `Headline: "${data.headline}"`,
    data.primaryText && `Primary copy: "${data.primaryText.slice(0, 500)}${data.primaryText.length > 500 ? "..." : ""}"`,
    data.cta && `CTA: "${data.cta}"`,
  ].filter(Boolean).join("\n");

  return `You are an elite healthcare advertising strategist. The user has shared a winning ad (or its structure) and wants you to create 5 unique variations with THEIR branding.

USER'S BRANDING:
- Clinic Type: ${data.clinicType}
- Service: ${data.service}
- Location: ${data.location}
- Offer: ${data.offer || "Contact us for current specials"}
- Target Audience: ${data.targetAudience || "General local audience"}

REFERENCE AD (structure/hook/angle to preserve):
${adContext || "User provided an image — infer the hook, structure, and angle from the ad format (e.g. Pattern Interrupt, Testimonial, Before/After, Direct Offer)."}

REQUIREMENTS:
1. Preserve the PROVEN hook angle and ad structure
2. Apply the user's branding: clinic type, service, location, offer
3. Create 5 UNIQUE variations — different headlines, copy, hooks, image concepts
4. Avoid plagiarism — write fresh copy, new image prompts
5. Match Facebook/Instagram best practices (4:5 ratio, scroll-stopping)
6. Vary styles: Pattern Interrupt, Breaking News, Direct Offer, Testimonial, Native Social

Return ONLY valid JSON (no markdown, no code fences):
{
  "creatives": [
    {
      "avatar": "short avatar name (2-4 words)",
      "emotion": "frustration|hope|envy|fear|empowerment|curiosity|urgency|trust",
      "style": "Pattern Interrupt|Breaking News|Direct Offer|Testimonial|Native Social|Before/After",
      "headline": "scroll-stopping headline, max 10 words",
      "primary_text": "2-3 sentences, pain → solution → CTA, 80-120 words",
      "hook": "opening hook in 5-8 words",
      "image_prompt": "detailed scene for AI image gen (subject, environment, lighting, mood, 4:5 FB/IG)"
    }
  ]
}`;
}

/** Phase 3: Headline Analyzer — score headline and return alternatives */
export function buildHeadlineAnalyzerPrompt(data: { headline: string; offer?: string; service?: string }): string {
  return `You are an elite healthcare ad copy strategist. Analyze this ad headline and suggest improvements.

HEADLINE: "${data.headline}"
${data.service ? `SERVICE CONTEXT: ${data.service}` : ""}
${data.offer ? `OFFER CONTEXT: ${data.offer}` : ""}

Score the headline 1-10 on:
- clarity: Is the message immediately obvious?
- emotional_pull: Does it create curiosity or emotion?
- urgency: Does it create a reason to act now?
- specificity: Does it use concrete details (numbers, outcomes, audience)?

Provide brief feedback and 3 alternative headlines that are stronger (different angles, more specific, or more scroll-stopping).

Return ONLY valid JSON (no markdown, no code fences):
{
  "score": number (1-10),
  "breakdown": { "clarity": number, "emotional_pull": number, "urgency": number, "specificity": number },
  "feedback": "string (2-3 sentences)",
  "alternatives": ["headline 1", "headline 2", "headline 3"]
}`;
}

/** Phase 3: Ad Copy Generator — service + offer + audience → headlines + primary text + hooks */
export function buildAdCopyPrompt(data: {
  service: string;
  offer: string;
  audience: string;
  clinicType?: string;
}): string {
  return `You are an elite healthcare advertising strategist. Generate ad copy only (no images) for a clinic.

SERVICE: ${data.service}
OFFER: ${data.offer}
TARGET AUDIENCE: ${data.audience}
${data.clinicType ? `CLINIC TYPE: ${data.clinicType}` : ""}

Generate 5-8 distinct ad concepts. Each has: headline (max 10 words), primary_text (2-3 sentences, pain → solution → CTA, 80-120 words), hook (5-8 words). Vary angles: Pattern Interrupt, Testimonial, Direct Offer, Before/After, Revelation. Write at 5th grade reading level. Use "you" and "your".

Return ONLY valid JSON (no markdown, no code fences):
{
  "creatives": [
    {
      "headline": "string",
      "primary_text": "string",
      "hook": "string",
      "style": "string (e.g. Pattern Interrupt, Direct Offer)"
    }
  ]
}`;
}

/** Phase 3: Ad Editor Improve — suggest better headline, CTA, angle for one creative */
export function buildImproveCreativePrompt(data: {
  headline: string;
  primaryText: string;
  hook: string;
  clinicType?: string;
  service?: string;
  direction?: string;
}): string {
  return `You are an elite healthcare advertising strategist. Improve this ad creative.

CURRENT CREATIVE:
- Headline: "${data.headline}"
- Copy: "${data.primaryText}"
- Hook: "${data.hook}"
${data.service ? `- Service: ${data.service}` : ""}
${data.clinicType ? `- Clinic type: ${data.clinicType}` : ""}
${data.direction ? `- Focus improvement on: ${data.direction}` : ""}

Improve for clarity, emotional pull, and conversion. Keep the same general angle and length. Return one improved version: stronger headline, tighter copy (80-120 words), sharper hook. Preserve 5th grade reading level and "you/your" language.

Return ONLY valid JSON (no markdown, no code fences):
{
  "headline": "string",
  "primary_text": "string",
  "hook": "string",
  "changes_summary": "1-2 sentences on what you improved"
}`;
}

export { AVATAR_PAIRS };
