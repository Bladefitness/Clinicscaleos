import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

// Lazy-init: defer the DATABASE_URL check so the process can boot and log
// errors properly instead of crashing during module import.
let _pool: Pool | null = null;
let _db: NodePgDatabase<typeof schema> | null = null;

function ensureDb(): { pool: Pool; db: NodePgDatabase<typeof schema> } {
    if (!_pool) {
          if (!process.env.DATABASE_URL) {
                  throw new Error(
                            "DATABASE_URL must be set. Add it to Railway Variables or your .env file.",
                          );
          }
          _pool = new Pool({ connectionString: process.env.DATABASE_URL });
          _db = drizzle(_pool, { schema });
    }
    return { pool: _pool, db: _db! };
}

/** Pool instance — lazily created on first access */
export const pool = new Proxy({} as Pool, {
    get(_target, prop, receiver) {
          return Reflect.get(ensureDb().pool, prop, receiver);
    },
});

/** Drizzle DB instance — lazily created on first access */
export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
    get(_target, prop, receiver) {
          return Reflect.get(ensureDb().db, prop, receiver);
    },
});
