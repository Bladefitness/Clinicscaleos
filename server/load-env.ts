/**
 * Load .env BEFORE any other modules that read process.env.
 * Must be the first import in server/index.ts.
 */
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// In CJS production bundle, import.meta.url is undefined; use process.cwd() (project root)
const projectRoot =
  typeof import.meta !== "undefined" && import.meta.url
    ? resolve(dirname(fileURLToPath(import.meta.url)), "..")
    : process.cwd();
const envPath = resolve(projectRoot, ".env");

// Load from project root; override: true so .env wins (keys must be saved to disk)
const result = config({ path: envPath, override: true });
if (process.env.NODE_ENV === "development" && result.parsed) {
  const keys = Object.keys(result.parsed);
  console.log(`[load-env] Loaded ${keys.length} vars: ${keys.join(", ")}`);
}
