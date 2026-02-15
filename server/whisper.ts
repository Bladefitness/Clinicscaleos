/**
 * OpenAI Whisper API: transcription with word-level timestamps for captions and dead-air detection.
 * Requires OPENAI_API_KEY in env.
 */

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

export interface WhisperSegment {
  start: number;
  end: number;
  text: string;
}

export interface TranscribeResult {
  text: string;
  language?: string;
  duration?: number;
  segments: WhisperSegment[];
  words?: WordTimestamp[];
}

const OPENAI_TRANSCRIPTIONS = "https://api.openai.com/v1/audio/transcriptions";

function getApiKey(): string | null {
  return process.env.OPENAI_API_KEY || null;
}

/**
 * Transcribe audio/video file. For word-level timestamps we use verbose_json.
 * Input: buffer (audio/video file content) and mimeType, or a public URL we fetch.
 */
export async function transcribe(opts: {
  buffer?: Buffer;
  mimeType?: string;
  audioUrl?: string;
}): Promise<TranscribeResult> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("OPENAI_API_KEY not set. Required for transcription.");

  let body: FormData | undefined;
  let contentType: string | undefined;

  if (opts.buffer && opts.buffer.length > 0) {
    const form = new FormData();
    const ext = opts.mimeType?.includes("video") ? "mp4" : "mp3";
    form.append("file", new Blob([opts.buffer]), `audio.${ext}`);
    form.append("model", "whisper-1");
    form.append("response_format", "verbose_json");
    form.append("timestamp_granularities[]", "word");
    body = form;
  } else if (opts.audioUrl) {
    const res = await fetch(opts.audioUrl);
    if (!res.ok) throw new Error(`Failed to fetch audio: ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const form = new FormData();
    form.append("file", new Blob([buffer]), "audio.mp4");
    form.append("model", "whisper-1");
    form.append("response_format", "verbose_json");
    form.append("timestamp_granularities[]", "word");
    body = form;
  } else {
    throw new Error("Provide buffer or audioUrl for transcription.");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
  };
  if (!contentType) {
    // FormData sets its own Content-Type with boundary
    delete headers["Content-Type"];
  }

  const res = await fetch(OPENAI_TRANSCRIPTIONS, {
    method: "POST",
    headers,
    body: body as unknown as BodyInit,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Whisper API error ${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    text?: string;
    language?: string;
    duration?: number;
    segments?: Array<{ start: number; end: number; text: string; words?: Array<{ word: string; start: number; end: number }> }>;
    words?: Array<{ word: string; start: number; end: number }>;
  };

  const segments: WhisperSegment[] = (data.segments || []).map((s) => ({
    start: s.start,
    end: s.end,
    text: s.text || "",
  }));

  let words: WordTimestamp[] | undefined;
  if (data.words && data.words.length > 0) {
    words = data.words.map((w) => ({ word: w.word, start: w.start, end: w.end }));
  } else if (segments.length > 0 && (segments[0] as unknown as { words?: WordTimestamp[] }).words) {
    const flat: WordTimestamp[] = [];
    for (const seg of data.segments || []) {
      for (const w of seg.words || []) {
        flat.push({ word: w.word, start: w.start, end: w.end });
      }
    }
    if (flat.length > 0) words = flat;
  }

  return {
    text: data.text || "",
    language: data.language,
    duration: data.duration,
    segments,
    words,
  };
}
