/**
 * Bundle api/index.ts into api/index.mjs so Vercel can run it
 * without needing to resolve ../server/* imports at runtime.
 */
import { build } from "esbuild";
import { readFile } from "fs/promises";

const pkg = JSON.parse(await readFile("package.json", "utf-8"));
const allDeps = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
];

// Bundle these deps into the function (ESM-only or cold-start sensitive)
const bundled = [
  "@anthropic-ai/sdk",
  "@google/generative-ai",
  "@google/genai",
  "dotenv",
  "drizzle-orm",
  "drizzle-zod",
  "p-limit",
  "p-retry",
  "zod",
  "zod-validation-error",
];

const external = allDeps.filter((dep) => !bundled.includes(dep));

await build({
  entryPoints: ["api/_entry.ts"],
  platform: "node",
  bundle: true,
  format: "esm",
  outfile: "api/index.mjs",
  banner: { js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);" },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  minify: false,
  external,
  logLevel: "info",
  tsconfig: "tsconfig.json",
});

console.log("✅ api/index.mjs bundled");
