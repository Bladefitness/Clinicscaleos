import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface MetaSession {
  metaAccessToken?: string;
  metaUserId?: string;
  metaAdAccountId?: string;
  csrfState?: string;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || "fallback-dev-secret-must-be-at-least-32-chars-long",
  cookieName: "clinicscaleos_session",
  ttl: 60 * 60 * 24 * 7, // 7 days
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<MetaSession>(cookieStore, sessionOptions);
}
