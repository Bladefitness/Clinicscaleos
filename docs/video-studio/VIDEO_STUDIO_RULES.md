# Video Studio — Critical Rules

## Overview

Video Studio is an AI-native editor inside Clinic Growth OS. The Director agent orchestrates FFmpeg, Whisper, and (later) Remotion/Fal. These rules prevent data loss and keep renders reliable.

## CRITICAL RULES

- **NEVER delete files** in project assets or `/public/assets` / media storage without **explicit user confirmation**. Deletion is irreversible.
- **ALWAYS run Remotion/FFmpeg outputs** in isolated temp directories (e.g. `os.tmpdir()`) before attaching to the timeline. Clean up temp files after upload or on error.
- **NEVER exceed 200-frame renders** in a single Remotion job without chunking into segments (to avoid timeouts and memory issues).
- **ALL FFmpeg operations** use the server-side wrapper in `server/ffmpeg.ts`. Do not shell out to `ffmpeg` directly from routes.
- **Test every agent skill** against at least 3 different prompts before marking a feature complete.
- **Persist agent messages** and **timeline versions** on every Director action so history and rollback are available.

## Tech Stack (Video Studio)

- **Backend:** Express, `server/ffmpeg.ts`, `server/whisper.ts` (OpenAI), `server/routes-video-studio.ts`
- **DB:** `video_projects`, `video_assets`, `timeline_versions`, `renders`, `agent_messages`
- **Director:** Single agent that routes to remove_dead_air, add_captions (and later Picasso/DiCaprio)

## Workflow

1. Plan first (plan mode) for any feature > 50 lines.
2. Build skill → test skill → integrate into Director → test with 3+ prompts.
3. After each Director-driven timeline change: save a timeline version and persist the assistant reply.

## Verification

- For "Remove dead air": confirm output duration < input duration and no silent gaps > 0.5s in the middle.
- For "Add captions": confirm word timestamps exist and (when burned in) the output video shows subtitles.
