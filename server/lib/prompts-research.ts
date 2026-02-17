export function buildPainPointResearchPrompt(data: {
  query: string;
  clinicType: string;
  service: string;
}): string {
  const clinicContext = data.clinicType ? `\nClinic Type: ${data.clinicType}` : "";
  const serviceContext = data.service ? `\nService: ${data.service}` : "";

  return `You are a healthcare market research analyst. Search the web for REAL patient complaints, pain points, and frustrations related to the following topic. Focus on Reddit, forums, review sites, blogs, and social media.

RESEARCH TOPIC: "${data.query}"${clinicContext}${serviceContext}

INSTRUCTIONS:
1. Search for real patient discussions, complaints, and reviews about this topic
2. Focus on sources from the last 12 months when possible
3. Look specifically on Reddit (r/dentistry, r/plasticsurgery, r/medical, r/healthcare, etc.), Yelp reviews, RealSelf, Google reviews, health forums, and social media
4. Identify recurring themes, emotional language, and specific frustrations
5. Note the frequency of each pain point (how often it appears across sources)
6. Extract exact quotes when possible

Return ONLY valid JSON (no markdown, no code fences):
{
  "validated_pain_points": [
    {
      "pain_point": "string - the core complaint or frustration",
      "frequency": "high|medium|low",
      "source_count": number,
      "example_quotes": ["string - actual or closely paraphrased quotes from real people"],
      "source_urls": ["string - URLs where these complaints were found"]
    }
  ],
  "emotional_triggers": [
    {
      "trigger": "string - the emotion driving this pain point",
      "intensity": "strong|moderate|mild",
      "context": "string - when and why this emotion surfaces"
    }
  ],
  "messaging_angles": [
    {
      "angle": "string - advertising angle that addresses this pain point",
      "target_emotion": "string - the emotion to tap into",
      "example_hook": "string - a ready-to-use ad hook leveraging this angle"
    }
  ],
  "competitor_claims": ["string - what competitors/providers commonly promise or advertise"],
  "summary": "string - 2-3 paragraph executive summary of the research findings",
  "confidence": "high|medium|low",
  "sources_searched": ["string - list of platforms/sites that were searched"]
}`;
}
