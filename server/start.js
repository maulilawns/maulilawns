import { createServer } from "node:http";
import session from "express-session";
import MySQLStoreFactory from "express-mysql-session";
import { getConfig } from "./config.js";
import { createPool, rows } from "./db.js";
import { createStorage } from "./storage.js";
import { createApp } from "./app.js";
import { createSiteHandler } from "./request-handler.js";

export async function startServer({ frontend } = {}) {
  const config = getConfig();
  const db = createPool(config.databaseUrl);
  const storage = createStorage(config);
  let sessionStore;
  let timer;
  try {
    await db.query("SELECT 1");
    const SessionStore = MySQLStoreFactory(session);
    sessionStore = new SessionStore({ createDatabaseTable: true }, db);
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
    await cleanup();
    timer = setInterval(
      () => cleanup().catch(() => console.error("Cleanup database unavailable.")),
      30000,
    );
    timer.unref();
    const api = createApp(config, db, { storage, sessionStore });
    const server = createServer(createSiteHandler(api, frontend));
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(config.port, () => {
        server.off("error", reject);
        console.log(`Mauli ${frontend ? "website and API" : "API"} listening on ${config.port}`);
        resolve();
      });
    });
    for (const signal of ["SIGTERM", "SIGINT"])
      process.once(signal, () => {
        clearInterval(timer);
        server.close(() =>
          sessionStore
            .close()
            .then(() => db.end())
            .then(() => process.exit(0)),
        );
      });
    return server;
  } catch (error) {
    clearInterval(timer);
    await sessionStore?.close().catch(() => {});
    await db.end().catch(() => {});
    throw error;
  }
}
