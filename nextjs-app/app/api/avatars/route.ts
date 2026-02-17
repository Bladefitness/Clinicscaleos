import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { avatars } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const clinicType = req.nextUrl.searchParams.get("clinicType");
    if (clinicType) {
      const results = await db.select().from(avatars).where(eq(avatars.clinicType, clinicType)).orderBy(desc(avatars.createdAt));
      return NextResponse.json(results);
    }
    const results = await db.select().from(avatars).orderBy(desc(avatars.createdAt));
    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/avatars error:", error);
    return NextResponse.json({ error: "Failed to fetch avatars" }, { status: 500 });
  }
}
