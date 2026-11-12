import { spawn } from "node:child_process";
import { openSync, closeSync, existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import "dotenv/config";
const root = process.cwd();
if (!existsSync(".env")) throw new Error("Local .env configuration is missing.");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function start(name, command, args) {
  const log = openSync(`.data/${name}.log`, "a");
  const child = spawn(command, args, {
    cwd: root,
    detached: true,
    stdio: ["ignore", log, log],
    env: process.env,
  });
  child.unref();
  closeSync(log);
  child.on("error", (error) => console.error(`${name} failed: ${error.message}`));
  writeFileSync(`.data/${name}-process.pid`, String(child.pid));
}
async function databaseReady() {
  let db;
  try {
    db = await mysql.createConnection(process.env.DATABASE_URL);
    await db.query("SELECT 1");
    return true;
  } catch {
    return false;
  } finally {
    if (db) await db.end();
  }
}
async function webReady(url) {
  try {
    return (await fetch(url, { signal: AbortSignal.timeout(1500) })).ok;
  } catch {
    return false;
  }
}
async function wait(check, label) {
  for (let i = 0; i < 40; i++) {
    if (await check()) return;
    await delay(500);
  }
  throw new Error(`${label} did not start. Check .data/ log files.`);
}
if (!(await databaseReady())) {
  const dir = readdirSync(".data/runtime").find((name) => /^mysql-.*-arm64$/.test(name));
  if (!dir) throw new Error("Project-local MySQL runtime is missing.");
  const base = path.join(root, ".data/runtime", dir);
  start("mysql", path.join(base, "bin/mysqld"), [
    "--no-defaults",
    `--basedir=${base}`,
    `--datadir=${path.join(root, ".data/mysql")}`,
    "--bind-address=127.0.0.1",
    "--port=3307",
    "--mysqlx=0",
    "--socket=/tmp/mauli-lawns-mysql.sock",
    `--pid-file=${path.join(root, ".data/mysql.pid")}`,
  ]);
  await wait(databaseReady, "MySQL");
}
if (!(await webReady("http://127.0.0.1:3001/health"))) {
  start("api", process.execPath, ["server/index.js"]);
  await wait(() => webReady("http://127.0.0.1:3001/health"), "Backend");
}
if (!(await webReady("http://127.0.0.1:8080/admin/login"))) {
  start("frontend", process.execPath, [
    "node_modules/vite/bin/vite.js",
    "--host",
    "127.0.0.1",
    "--port",
    "8080",
    "--strictPort",
  ]);
  await wait(() => webReady("http://127.0.0.1:8080/admin/login"), "Frontend");
}
console.log("Mauli Lawns is ready: http://localhost:8080/admin/login");
console.log(
  "Database and uploads persist in .data/. Services keep running after this command exits.",
);
