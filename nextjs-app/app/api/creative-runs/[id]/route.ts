import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { creativeRuns } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const [run] = await db.select().from(creativeRuns).where(eq(creativeRuns.id, id));
    if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });
    return NextResponse.json(run);
  } catch (err) {
    console.error("Get creative run error:", err);
    return NextResponse.json({ error: "Failed to load run" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, visibility } = await req.json();
  try {
    const [run] = await db.update(creativeRuns).set({ ...(name !== undefined && { name }), ...(visibility !== undefined && { visibility }) }).where(eq(creativeRuns.id, id)).returning();
    if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });
    return NextResponse.json(run);
  } catch (err) {
    console.error("Update creative run error:", err);
    return NextResponse.json({ error: "Failed to update run" }, { status: 500 });
  }
}
