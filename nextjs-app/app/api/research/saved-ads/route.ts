import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { savedAds } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicType = searchParams.get("clinicType");

    const ads = clinicType
      ? await db.select().from(savedAds).where(eq(savedAds.clinicType, clinicType)).orderBy(desc(savedAds.createdAt))
      : await db.select().from(savedAds).orderBy(desc(savedAds.createdAt));

    return NextResponse.json(ads);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const [ad] = await db.insert(savedAds).values(body).returning();
    return NextResponse.json(ad);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
