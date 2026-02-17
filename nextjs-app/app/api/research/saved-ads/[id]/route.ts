import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { savedAds } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { notes, tags } = await request.json();
    const [ad] = await db.update(savedAds)
      .set({ notes, tags })
      .where(eq(savedAds.id, id))
      .returning();
    if (!ad) return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    return NextResponse.json(ad);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(savedAds).where(eq(savedAds.id, id));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
