export function buildOfferScoringPrompt(data: {
  service: string;
  price: string;
  clinicType: string;
  location: string;
  currentOffer: string;
  differentiator: string;
  targetMarket: string;
}): string {
  return `You are an elite healthcare advertising strategist. Score this clinic offer and suggest improvements.

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

For competitor insights, analyze what competing ${data.clinicType}s in ${data.location} likely offer for ${data.service} and identify differentiation opportunities.

Return ONLY valid JSON (no markdown, no code fences):
{
  "overall_score": number,
  "breakdown": { "clarity": number, "urgency": number, "risk_reversal": number, "specificity": number, "value_perception": number },
  "weaknesses": ["string"],
  "strengths": ["string"],
  "verdict": "string (2-3 sentence summary)",
  "variations": [{ "offer_text": "string", "projected_score": number, "reasoning": "string", "risk_level": "low|medium|high" }],
  "competitor_insights": {
    "market_temperature": "red_ocean|blue_ocean|mixed",
    "common_competitor_offers": ["string"],
    "differentiation_opportunities": ["string"],
    "recommended_angles": ["string"]
  }
}`;
}

export function buildAvatarGenerationPrompt(data: {
  clinicType: string;
  service: string;
  targetMarket: string;
  offer: string;
}): string {
  return `You are an elite healthcare advertising psychologist specializing in patient avatar creation for Facebook Ads.

CLINIC INFO:
- Type: ${data.clinicType}
- Service: ${data.service}
- Target Market: ${data.targetMarket || "General local audience"}
- Offer: ${data.offer || "Contact us for specials"}

Generate 5-8 detailed patient avatars for this clinic. Each avatar represents a distinct segment of people who would buy this service.

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

export function buildCreativePrompt(data: {
  clinicType: string;
  service: string;
  location: string;
  targetAudience: string;
  offerDetails: string;
  goal: string;
}, batchIndex: number): string {
  const avatarPair = AVATAR_PAIRS[batchIndex] || AVATAR_PAIRS[0];
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

Rules:
- Use different emotion + style + copy formula combinations across the 6 creatives
- Write at 5th grade reading level
- Use "you" and "your" language (never "we" or "our")
- Be specific to the clinic type and service
- Make headlines scroll-stopping
- Image prompts should be detailed enough for Midjourney/DALL-E`;
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
  return `You are a Facebook Ads campaign architect specializing in healthcare advertising. Create a complete campaign blueprint.

CLINIC INFO:
- Type: ${data.clinicType}
- Service: ${data.service}
- Location: ${data.location}
- Monthly Budget: ${data.budget}
- Goal: ${data.goal}
- Audience: ${data.audienceInfo || "General local audience"}
- Number of Creatives Available: ${data.creativeCount}

Create a structured 3-phase testing campaign:
- Phase 1 (Days 1-5): Avatar Testing — test different patient avatars
- Phase 2 (Days 6-10): Emotion Testing — test emotions within winning avatar
- Phase 3 (Days 11-14): Scale — scale winners with increased budget

Return ONLY valid JSON (no markdown, no code fences):
{
  "campaign_name": "string",
  "objective": "Lead Generation|Conversions|Traffic",
  "total_budget": "string",
  "phases": [
    {
      "phase_name": "string",
      "duration": "string",
      "budget_allocation": "string",
      "ad_sets": [
        {
          "name": "string",
          "budget": "string",
          "targeting": {
            "age_range": "string",
            "gender": "string",
            "interests": ["string"],
            "locations": "string",
            "exclusions": ["string"]
          },
          "creative_ids": [1, 2, 3],
          "kill_criteria": "string",
          "scale_criteria": "string"
        }
      ]
    }
  ],
  "deployment_steps": [
    {
      "step_number": number,
      "screen": "Campaign Level|Ad Set Level|Ad Level",
      "action": "string",
      "details": "string",
      "common_mistakes": "string"
    }
  ],
  "naming_convention": "string",
  "tracking_setup": ["string"]
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

export { AVATAR_PAIRS };
