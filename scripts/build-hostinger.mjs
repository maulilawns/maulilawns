// Build the existing TanStack Start frontend for a Node.js server on Hostinger.
// Keep the normal Lovable/Cloudflare build unchanged.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const vite = fileURLToPath(new URL("../node_modules/vite/bin/vite.js", import.meta.url));
const site = process.argv.includes("--site");
const result = spawnSync(process.execPath, [vite, "build"], {
  stdio: "inherit",
  env: {
    ...process.env,
    // Nitro v3 preset names use underscores. The old hyphenated name falls
    // back to a standalone server output, which server.js cannot mount.
    NITRO_PRESET: site ? "node_middleware" : "node_server",
    ...(site ? { VITE_API_BASE_URL: "" } : {}),
  },
});
if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
