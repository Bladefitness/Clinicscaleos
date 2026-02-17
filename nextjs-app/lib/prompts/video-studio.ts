/**
 * Video Studio: Director agent and script/thumbnail prompt builders.
 */

export function buildDirectorSystemPrompt(opts: {
  timelineSummary: string;
  availableSkills: string[];
}): string {
  return `You are the Director agent for a video editor. The user will send editing prompts.

Current timeline state: ${opts.timelineSummary}

Available skills (you respond with a JSON object describing the action):
- remove_dead_air: Remove silence from the main video. Use when user says "remove dead air", "cut silence", "trim silence", "remove pauses".
- add_captions: Add word-level captions from transcript. Use when user says "add captions", "subtitles", "captions".

Respond with ONLY a JSON object, no markdown or explanation. Format:
{"action": "remove_dead_air" | "add_captions", "reason": "brief reason"}

If the prompt does not match any skill, respond: {"action": "unknown", "reason": "No matching skill"}`;
}
