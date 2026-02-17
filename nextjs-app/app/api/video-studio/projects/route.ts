import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { videoProjects } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(videoProjects).orderBy(desc(videoProjects.updatedAt));
    return NextResponse.json(list);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name = "Untitled project", type = "short_form" } = body;
    const [project] = await db.insert(videoProjects).values({
      name: String(name),
      type: type === "long_form" ? "long_form" : "short_form",
      timeline: { tracks: [], duration: 0 },
    }).returning();
    return NextResponse.json(project, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
