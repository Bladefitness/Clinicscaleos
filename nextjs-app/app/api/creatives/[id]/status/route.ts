import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { creatives } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const VALID_STATUSES = ["pending", "approved", "rejected", "archived"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await req.json();
    if (typeof status !== "string" || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: `status must be one of: ${VALID_STATUSES.join(", ")}` }, { status: 400 });
    }
    const [updated] = await db.update(creatives).set({ status }).where(eq(creatives.id, id)).returning();
    if (!updated) return NextResponse.json({ error: "Creative not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/creatives/[id]/status error:", error);
    return NextResponse.json({ error: "Failed to update creative status" }, { status: 500 });
  }
}
