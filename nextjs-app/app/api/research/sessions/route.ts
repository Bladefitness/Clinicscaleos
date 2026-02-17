import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { researchSessions } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicType = searchParams.get("clinicType");
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const sessions = clinicType
      ? await db.select().from(researchSessions).where(eq(researchSessions.clinicType, clinicType)).orderBy(desc(researchSessions.createdAt)).limit(limit)
      : await db.select().from(researchSessions).orderBy(desc(researchSessions.createdAt)).limit(limit);

    return NextResponse.json(sessions);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
