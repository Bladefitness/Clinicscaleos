# Dead Air Removal Skill

## When to Use

User asks to: remove silence, remove dead air, tighten the edit, remove pauses, clean up audio gaps.

## Steps

1. Get the current project's main video (first video asset with a URL).
2. Fetch the video to a temp file (or use existing path if local).
3. Run FFmpeg silence detection (`silencedetect` filter) to find segments where audio is below threshold.
4. Build "speech segments" = everything that is *not* silence (with optional padding, e.g. 0.2s before/after speech).
5. Use `concatSegments()` to stitch speech segments into one output video.
6. Save output as a new video asset; update project timeline (main track) with the new clip.
7. Save a timeline version with description "Removed dead air".
8. Return: trimmed video URL, original duration, new duration, segments removed count.

## FFmpeg

- Silence detection: `-af silencedetect=noise=-35dB:d=0.5`
- Trimming: extract segments with `-ss` / `-to`, then concat via concat demuxer.
- Implemented in `server/ffmpeg.ts`: `detectSilence()`, `concatSegments()`, `removeSilence()`.

## Parameters

- **silence_threshold (noise dB):** default -35. Lower = more sensitive (more cuts). Range typically -40 to -30.
- **min_silence_duration:** default 0.5s. Gaps shorter than this are not removed.
- **padding:** default 0.2s. Kept around each speech segment to avoid cutting words.

## Error Handling

- If the video has no audio track, FFmpeg may still succeed; probe first and warn if `hasAudio: false`.
- If > 80% of duration is flagged as dead air: likely a detection error (e.g. very quiet audio). Consider reducing sensitivity or prompting user to check levels.
- If output has sync issues: try re-running with padding increased (e.g. 0.3s).

## Director Integration

Director action: `remove_dead_air`. No extra payload; uses current project's main video.
