import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();

  const state = crypto.randomUUID();
  session.csrfState = state;
  await session.save();

  const appId = process.env.META_APP_ID;
  if (!appId) {
    return NextResponse.json({ error: "META_APP_ID not configured" }, { status: 500 });
  }

  const baseUrl = process.env.BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/auth/meta/callback`;

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: "ads_read,ads_management",
    state,
    response_type: "code",
  });

  return NextResponse.redirect(`https://www.facebook.com/v21.0/dialog/oauth?${params}`);
}
