// Hostinger's Express preset has no build-command input on some dashboards.
// Opt in to building the website after npm has installed all dependencies.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

if (process.env.MAULI_BUILD_SITE === "true") {
  const build = fileURLToPath(new URL("./build-hostinger.mjs", import.meta.url));
  const result = spawnSync(process.execPath, [build, "--site"], { stdio: "inherit" });
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  process.exit(result.status ?? 1);
}
