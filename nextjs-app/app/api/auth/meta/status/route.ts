import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  const oauthAvailable = !!(process.env.META_APP_ID && process.env.META_APP_SECRET);

  try {
    const session = await getSession();

    if (session.metaAccessToken) {
      return NextResponse.json({
        connected: true,
        oauthAvailable,
        adAccountId: session.metaAdAccountId || null,
      });
    }
  } catch (err) {
    console.error("Session read error:", err);
  }

  return NextResponse.json({
    connected: false,
    oauthAvailable,
  });
}
