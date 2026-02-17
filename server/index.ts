import "./load-env";
console.log("[Clinic Growth OS] Server process starting...");
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { setupPassport } from "./auth";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// Health check for platform probes (must respond before sessions/DB)
app.get("/health", (_req, res) => res.sendStatus(200));

// Session for Facebook OAuth (token stored in session)
const sessionSecret = process.env.SESSION_SECRET || "clinic-growth-dev-secret-change-in-production";
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production", maxAge: 7 * 24 * 60 * 60 * 1000 },
  })
);
app.use(passport.initialize());
app.use(passport.session());
setupPassport();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        const s = JSON.stringify(capturedJsonResponse);
        logLine += ` :: ${s.length > 500 ? s.slice(0, 200) + "...[truncated]" : s}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    console.log("[Clinic Growth OS] Registering routes...");
    await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    console.log("[Clinic Growth OS] Serving static files...");
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Default 5001 to avoid macOS AirPlay/Control Center on 5000; use PORT=5000 to override.
  // Bind to 0.0.0.0 in production so Vercel/Docker can reach the server.
  const port = parseInt(process.env.PORT || "5001", 10);
  const host = process.env.HOST || (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");
  httpServer.listen(
    {
      port,
      host,
      ...(host === "0.0.0.0" && { reusePort: true }),
    },
    () => {
      log(`serving on http://${host}:${port}`);
    },
  );
  } catch (err) {
    console.error("[Clinic Growth OS] Startup failed:", err);
    process.exit(1);
  }
})();
