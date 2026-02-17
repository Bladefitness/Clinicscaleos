import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

const GRAPH_API = "https://graph.facebook.com/v21.0";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = process.env.BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";

  if (error) {
    console.error("Meta OAuth error:", searchParams.get("error_description"));
    return NextResponse.redirect(`${baseUrl}/?meta_error=${error}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/?meta_error=missing_params`);
  }

  const session = await getSession();

  // Validate CSRF state
  if (state !== session.csrfState) {
    return NextResponse.redirect(`${baseUrl}/?meta_error=invalid_state`);
  }
  delete session.csrfState;

  const appId = process.env.META_APP_ID!;
  const appSecret = process.env.META_APP_SECRET!;
  const redirectUri = `${baseUrl}/api/auth/meta/callback`;

  try {
    // Exchange code for short-lived token
    const tokenParams = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code,
    });

    const tokenRes = await fetch(`${GRAPH_API}/oauth/access_token?${tokenParams}`);
    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      console.error("Token exchange failed:", text);
      return NextResponse.redirect(`${baseUrl}/?meta_error=token_exchange_failed`);
    }
    const { access_token: shortToken } = await tokenRes.json();

    // Exchange for long-lived token (60 days)
    const longParams = new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: shortToken,
    });

    const longRes = await fetch(`${GRAPH_API}/oauth/access_token?${longParams}`);
    if (!longRes.ok) {
      const text = await longRes.text();
      console.error("Long-lived token exchange failed:", text);
      return NextResponse.redirect(`${baseUrl}/?meta_error=long_token_failed`);
    }
    const { access_token: longToken } = await longRes.json();

    // Fetch user ID and ad accounts
    const meRes = await fetch(`${GRAPH_API}/me?fields=id&access_token=${longToken}`);
    const me = await meRes.json();

    const adAccountsRes = await fetch(
      `${GRAPH_API}/me/adaccounts?fields=account_id,name,account_status&access_token=${longToken}`
    );
    const adAccounts = await adAccountsRes.json();

    // Pick first active ad account (account_status === 1)
    const activeAccount = adAccounts.data?.find((a: any) => a.account_status === 1)
      || adAccounts.data?.[0];

    session.metaAccessToken = longToken;
    session.metaUserId = me.id;
    session.metaAdAccountId = activeAccount?.account_id || undefined;
    await session.save();

    return NextResponse.redirect(baseUrl);
  } catch (err) {
    console.error("Meta OAuth callback error:", err);
    return NextResponse.redirect(`${baseUrl}/?meta_error=callback_failed`);
  }
}
