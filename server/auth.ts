/**
 * Facebook OAuth for Meta Ads API access.
 * Users connect their ad account; token stored in session.
 */
import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import type { Request } from "express";

declare global {
  namespace Express {
    interface User {
      id: string;
      displayName?: string;
      accessToken: string;
      adAccountId?: string;
    }
    interface SessionData {
      metaAccessToken?: string;
      metaAdAccountId?: string;
      metaUserId?: string;
    }
  }
}

const META_APP_ID = process.env.META_APP_ID;
const META_APP_SECRET = process.env.META_APP_SECRET;
const BASE_URL = process.env.BASE_URL || "http://localhost:5001";

export function isMetaOAuthConfigured(): boolean {
  return !!(META_APP_ID && META_APP_SECRET && META_APP_ID.length > 5 && META_APP_SECRET.length > 10);
}

export function setupPassport() {
  if (!isMetaOAuthConfigured()) return;

  passport.use(
    new FacebookStrategy(
      {
        clientID: META_APP_ID!,
        clientSecret: META_APP_SECRET!,
        callbackURL: `${BASE_URL}/auth/facebook/callback`,
        profileFields: ["id", "displayName"],
        scope: ["ads_read", "ads_management"],
        passReqToCallback: true,
      },
      (req: Request, accessToken: string, _refreshToken: string, profile: { id: string; displayName?: string }, done: (err: unknown, user?: Express.User) => void) => {
        // Store token in session for API use (session survives; serialized user used for auth)
        if (req.session) {
          const s = req.session as unknown as Record<string, unknown>;
          s.metaAccessToken = accessToken;
          s.metaUserId = profile.id;
        }
        const user: Express.User = {
          id: profile.id,
          displayName: profile.displayName,
          accessToken,
        };
        return done(null, user);
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj: Express.User, done) => {
    done(null, obj);
  });
}
