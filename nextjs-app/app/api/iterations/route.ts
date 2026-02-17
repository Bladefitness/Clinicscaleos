import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { iterations } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const results = await db.select().from(iterations).orderBy(desc(iterations.createdAt));
  return NextResponse.json(results);
}
