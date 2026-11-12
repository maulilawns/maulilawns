import { readFile } from "node:fs/promises";
import bcrypt from "bcryptjs";
import { getConfig } from "./config.js";
import { createPool, rows } from "./db.js";
const config = getConfig(),
  db = createPool(config.databaseUrl);
try {
  const sql = await readFile(new URL("./migrations/001-gallery.sql", import.meta.url), "utf8");
  for (const statement of sql
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean))
    await db.query(statement);
  for (const [index, name] of [
    "Mini Lawn",
    "Grand Lawn",
    "Wedding Decorations",
    "Stage Setup",
    "Events",
  ].entries())
    await rows(
      db,
      "INSERT IGNORE INTO gallery_categories(name,slug,description,display_order) VALUES (?,?,?,?)",
      [name, name.toLowerCase().replaceAll(" ", "-"), "", index],
    );
  if (process.argv.includes("--admin")) {
    const {
      ADMIN_USERNAME: username,
      ADMIN_PASSWORD: password,
      ADMIN_EMAIL: email,
      ADMIN_FULL_NAME: fullName,
    } = process.env;
    if (
      !username ||
      !email ||
      !fullName ||
      !password ||
      Buffer.byteLength(password) > 72 ||
      password.length < 12 ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    )
      throw new Error(
        "Set ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_FULL_NAME and a strong ADMIN_PASSWORD (12–72 bytes, upper/lowercase and a number).",
      );
    if ((await rows(db, "SELECT id FROM admins WHERE username=?", [username])).length)
      throw new Error("Admin already exists. Setup will not overwrite credentials.");
    await rows(db, "INSERT INTO admins(username,password_hash,full_name,email) VALUES (?,?,?,?)", [
      username,
      await bcrypt.hash(password, 12),
      fullName,
      email,
    ]);
    console.log("Initial admin created. Remove ADMIN_PASSWORD from your environment.");
  }
  console.log("Database migration and category seed complete.");
} finally {
  await db.end();
}
