// Root entry for Hostinger's Express preset (entry file: server.js).
// The existing API startup and configuration live in server/index.js.
import("./server/index.js").catch((error) => {
  console.error("Mauli API startup failed:", error);
  process.exitCode = 1;
});
