// Hostinger Express entry: one port serves the website, API and uploads.
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import express from "express";

async function main() {
  const { startServer } = await import("./server/start.js");
  const entry = new URL("./.output/server/index.mjs", import.meta.url);
  let frontend;
  if (existsSync(entry)) {
    const built = await import(entry.href);
    if (typeof built.middleware !== "function") {
      throw new Error("Use npm run build:hostinger:site to build the website for this entry.");
    }
    const website = express();
    website.disable("x-powered-by");
    website.use(
      express.static(fileURLToPath(new URL("./.output/public", import.meta.url)), { index: false }),
    );
    website.use(built.middleware);
    frontend = website;
  } else {
    // Keep the API available while showing the missing build configuration clearly.
    console.error(
      "Website build missing: set the Hostinger build command to npm run build:hostinger:site.",
    );
    frontend = (_req, res) => {
      res.writeHead(503, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(
        "Website build missing. Set build command to npm run build:hostinger:site and redeploy.",
      );
    };
  }
  await startServer({ frontend });
}
main().catch((error) => {
  console.error("Mauli startup failed:", error);
  process.exitCode = 1;
});
