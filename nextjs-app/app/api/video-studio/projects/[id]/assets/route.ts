import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { videoAssets, videoProjects } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const assets = await db.select().from(videoAssets).where(eq(videoAssets.projectId, id)).orderBy(desc(videoAssets.createdAt));
    return NextResponse.json(assets);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  try {
    const body = await req.json();
    const { kind = "video", url, storagePath } = body;

    if (!url && !storagePath) return NextResponse.json({ error: "url or storagePath required" }, { status: 400 });

    const [project] = await db.select().from(videoProjects).where(eq(videoProjects.id, projectId));
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const [asset] = await db.insert(videoAssets).values({
      projectId,
      kind: String(kind),
      url: url || null,
      storagePath: storagePath || null,
      metadata: {},
    }).returning();

    // Update timeline with new clip
    const timeline = (project.timeline as { tracks?: any[]; duration?: number }) || { tracks: [], duration: 0 };
    const newClip = {
      id: `clip_${asset.id}`,
      start: 0,
      end: 60,
      url: url || storagePath,
      assetId: asset.id,
    };
    const tracks: any[] = Array.isArray(timeline.tracks) ? timeline.tracks : [];
    const mainTrack = tracks.find((t) => t.id === "main") || { id: "main", type: "video", clips: [] };
    const clips = Array.isArray(mainTrack.clips) ? [...mainTrack.clips, newClip] : [newClip];
    const newTracks = tracks.filter((t) => t.id !== "main");
    newTracks.push({ ...mainTrack, clips });
    const newDuration = Math.max(timeline.duration || 0, newClip.end);

    await db.update(videoProjects).set({
      timeline: { ...timeline, tracks: newTracks, duration: newDuration },
      updatedAt: new Date(),
    }).where(eq(videoProjects.id, projectId));

    return NextResponse.json({ asset, timeline: { ...timeline, tracks: newTracks, duration: newDuration } }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
