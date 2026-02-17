import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { videoProjects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const [project] = await db.select().from(videoProjects).where(eq(videoProjects.id, id));
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    return NextResponse.json(project);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { name, type, timeline } = body;
    const [project] = await db.update(videoProjects).set({
      ...(name !== undefined && { name: String(name) }),
      ...(type !== undefined && { type }),
      ...(timeline !== undefined && { timeline }),
      updatedAt: new Date(),
    }).where(eq(videoProjects.id, id)).returning();
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    return NextResponse.json(project);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
