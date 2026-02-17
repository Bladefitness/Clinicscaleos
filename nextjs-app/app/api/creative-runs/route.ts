import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { creativeRuns } from "@/lib/db/schema";
import { createCreativeRunRequestSchema } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createCreativeRunRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  try {
    const [run] = await db.insert(creativeRuns).values({
      name: parsed.data.name,
      payload: parsed.data.payload as any,
      visibility: parsed.data.visibility ?? "private",
    }).returning();
    return NextResponse.json(run, { status: 201 });
  } catch (err) {
    console.error("Create creative run error:", err);
    return NextResponse.json({ error: "Failed to save run" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const visibility = req.nextUrl.searchParams.get("visibility");
    if (visibility) {
      const runs = await db.select().from(creativeRuns).where(eq(creativeRuns.visibility, visibility)).orderBy(desc(creativeRuns.createdAt));
      return NextResponse.json(runs);
    }
    const runs = await db.select().from(creativeRuns).orderBy(desc(creativeRuns.createdAt));
    return NextResponse.json(runs);
  } catch (err) {
    console.error("List creative runs error:", err);
    return NextResponse.json({ error: "Failed to list runs" }, { status: 500 });
  }
}
