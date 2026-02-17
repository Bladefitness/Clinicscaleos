import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const results = await db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/campaigns error:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}
