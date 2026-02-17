import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { timelineVersions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const versions = await db.select().from(timelineVersions).where(eq(timelineVersions.projectId, id)).orderBy(desc(timelineVersions.createdAt)).limit(20);
    return NextResponse.json(versions);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
