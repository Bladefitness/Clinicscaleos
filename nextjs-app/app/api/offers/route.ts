import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { offers } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const results = await db.select().from(offers).orderBy(desc(offers.createdAt));
    return NextResponse.json(results);
  } catch (error: any) {
    console.error("GET /api/offers error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
