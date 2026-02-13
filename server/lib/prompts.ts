import type { GenerateRequest } from "./types";

const AVATAR_PAIRS = [
  '"Busy Professional (35-50, high income, time-poor)" + "Aging Gracefully Seeker (45-65, appearance-conscious)"',
  '"New Mom Reclaiming Herself (28-40, post-pregnancy)" + "Health-Conscious Executive (40-55, proactive wellness)"',
  '"Social Media Savvy Millennial (25-38, appearance-driven)" + "Budget-Conscious Value Seeker (30-50, deal-motivated)"',
];

export function buildPrompt(data: GenerateRequest, batchIndex: number): string {
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

Each object in the array must have exactly these keys:
- "id": number (1-6)
- "avatar": short avatar name (2-4 words)
- "emotion": one of: frustration, hope, envy, fear, empowerment, curiosity, urgency, trust
- "style": one of: Pattern Interrupt, Native Social, Breaking News, Testimonial, Before/After, Educational, Social Proof, Direct Offer
- "headline": compelling ad headline, max 10 words
- "primary_text": 2-3 sentences of ad copy using "you" language, 5th grade reading level, pain → solution → CTA format
- "image_prompt": detailed scene description for AI image generation (subject, environment, lighting, mood, camera angle, style)
- "hook": the opening hook angle in 5-8 words
- "category": one of: Avatar Test A, Avatar Test B, Emotion Test, Style Test

Rules:
- Use different emotion + style combinations across the 6 creatives
- Write at 5th grade reading level
- Use "you" and "your" language (never "we" or "our")
- Be specific to the clinic type and service
- Make headlines scroll-stopping
- Primary text should be 80-120 words max
- Image prompts should be detailed enough for Midjourney/DALL-E (include lighting, mood, composition)`;
}

export { AVATAR_PAIRS };
