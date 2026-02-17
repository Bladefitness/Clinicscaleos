import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { creatives } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const results = await db.select().from(creatives).orderBy(desc(creatives.createdAt));
    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/creatives error:", error);
    return NextResponse.json({ error: "Failed to fetch creatives" }, { status: 500 });
  }
}
