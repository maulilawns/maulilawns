import session from "express-session";
import MySQLStoreFactory from "express-mysql-session";
import { getConfig } from "./config.js";
import { createPool, rows } from "./db.js";
import { createStorage } from "./storage.js";
import { createApp } from "./app.js";
const config = getConfig(),
  db = createPool(config.databaseUrl),
  storage = createStorage(config);
await db.query("SELECT 1");
const SessionStore = MySQLStoreFactory(session);
const sessionStore = new SessionStore({ createDatabaseTable: true }, db);
await sessionStore.onReady();
async function cleanup() {
  for (const item of await rows(db, "SELECT storage_key FROM storage_cleanup LIMIT 100")) {
    try {
      await storage.remove(item.storage_key);
      await rows(db, "DELETE FROM storage_cleanup WHERE storage_key=?", [item.storage_key]);
    } catch {
      console.error("Storage cleanup will retry.");
    }
  }
}
const timer = setInterval(
  () => cleanup().catch(() => console.error("Cleanup database unavailable.")),
  30000,
);
timer.unref();
await cleanup();
const server = createApp(config, db, { storage, sessionStore }).listen(config.port, () =>
  console.log(`Mauli API listening on ${config.port}`),
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => {
    clearInterval(timer);
    server.close(() =>
      sessionStore
        .close()
        .then(() => db.end())
        .then(() => process.exit(0)),
    );
  });
