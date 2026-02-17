import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { offers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [offer] = await db.select().from(offers).where(eq(offers.id, id));
    if (!offer) return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    return NextResponse.json(offer);
  } catch (error) {
    console.error("GET /api/offers/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch offer" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { variationIndex } = body;
    if (typeof variationIndex !== "number" || !Number.isInteger(variationIndex) || variationIndex < 0) {
      return NextResponse.json({ error: "variationIndex must be a non-negative integer" }, { status: 400 });
    }
    const [updated] = await db.update(offers).set({ selectedVariation: variationIndex, status: "accepted" }).where(eq(offers.id, id)).returning();
    if (!updated) return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/offers/[id] error:", error);
    return NextResponse.json({ error: "Failed to update offer" }, { status: 500 });
  }
}
