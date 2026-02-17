import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function POST() {
  try {
    const session = await getSession();
    session.metaAccessToken = undefined;
    session.metaUserId = undefined;
    session.metaAdAccountId = undefined;
    await session.save();
  } catch (err) {
    console.error("Session clear error:", err);
  }

  return NextResponse.json({ connected: false });
}
