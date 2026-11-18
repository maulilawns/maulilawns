// Hostinger may invoke `npm run build` automatically without exposing a build
// command setting. Keep normal platform builds unchanged, but honor the
// Hostinger opt-in so its Express entry receives the middleware bundle.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const hostingerSite = process.env.MAULI_BUILD_SITE === "true";
const script = hostingerSite
  ? fileURLToPath(new URL("./build-hostinger.mjs", import.meta.url))
  : fileURLToPath(new URL("../node_modules/vite/bin/vite.js", import.meta.url));
const args = hostingerSite ? ["--site"] : ["build"];
const result = spawnSync(process.execPath, [script, ...args], {
  stdio: "inherit",
  env: process.env,
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
