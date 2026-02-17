import { NextResponse } from "next/server";
import { adLibrarySearchRequestSchema } from "@/lib/db/schema";
import { searchAdLibrary, isApifyConfigured } from "@/lib/services/apify-ad-library";

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!isApifyConfigured()) {
      return NextResponse.json({
        ads: [],
        source: "unavailable",
        fallbackUrl: `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&q=${encodeURIComponent(body.searchTerms || "")}`,
        message: "Apify not configured. Add APIFY_API_TOKEN to your environment variables.",
      });
    }

    const parsed = adLibrarySearchRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const ads = await searchAdLibrary(parsed.data);
    return NextResponse.json({ ads, source: "apify" });
  } catch (err: any) {
    console.error("Ad library search error:", err);
    const body = await request.clone().json().catch(() => ({}));
    return NextResponse.json({
      ads: [],
      source: "error",
      fallbackUrl: `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&q=${encodeURIComponent(body.searchTerms || "")}`,
      message: err.message || "Ad library search failed",
    });
  }
}
