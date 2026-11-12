import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import session from "express-session";
import sharp from "sharp";
import { getConfig } from "../config.js";
import { imageSignature, createStorage } from "../storage.js";
import { createApp } from "../app.js";
const env = {
  DATABASE_URL: "mysql://test:test@localhost/test",
  SESSION_SECRET: "test-only-secret-that-is-at-least-32-characters",
  APP_ORIGINS: "http://localhost:8080",
};
test("production refuses ephemeral upload storage and HTTP origins", () => {
  assert.throws(() => getConfig({ ...env, NODE_ENV: "production" }), /persistent disk/);
  assert.throws(
    () => getConfig({ ...env, NODE_ENV: "production", STORAGE_PERSISTENT_DISK: "true" }),
    /HTTPS/,
  );
  assert.throws(() => getConfig({ ...env, SESSION_SECRET: "short" }), /32/);
});
test("admin endpoints reject anonymous access, forged CSRF and disallowed origins", async () => {
  const config = getConfig(env);
  const db = {
    execute: async () => {
      throw new Error("Anonymous requests must not query the database");
    },
  };
  const app = createApp(config, db, { sessionStore: new session.MemoryStore() });
  const agent = request.agent(app);
  assert.equal((await agent.get("/api/admin/gallery/images")).status, 401);
  assert.equal((await agent.get("/api/admin/dashboard/stats")).status, 401);
  assert.equal(
    (await agent.post("/api/admin/auth/login").set("Origin", config.origins[0]).send({})).status,
    403,
  );
  assert.equal(
    (await agent.get("/api/admin/auth/csrf").set("Origin", "https://untrusted.example")).status,
    403,
  );
  const csrf = await agent.get("/api/admin/auth/csrf");
  assert.equal(csrf.status, 200);
  assert.match(csrf.headers["set-cookie"][0], /HttpOnly/);
  assert.match(csrf.headers["set-cookie"][0], /SameSite=Lax/);
  const invalid = await agent
    .post("/api/admin/auth/login")
    .set("Origin", config.origins[0])
    .set("X-CSRF-Token", csrf.body.data.csrf)
    .send({ username: "", password: "" });
  assert.equal(invalid.status, 422);
  const forged = await agent
    .post("/api/admin/auth/login")
    .set("Origin", config.origins[0])
    .set("X-CSRF-Token", "é".repeat(64))
    .send({});
  assert.equal(forged.status, 403);
});
test("image pipeline validates bytes, optimizes, strips metadata and cleans files", async () => {
  const storagePath = await mkdtemp(path.join(os.tmpdir(), "mauli-test-"));
  try {
    const config = { ...getConfig(env), storagePath, maxUploadBytes: 1024 * 1024 };
    const storage = createStorage(config);
    assert.equal(imageSignature(Buffer.from("<svg>unsafe</svg>")), null);
    await assert.rejects(
      () =>
        storage.optimize({
          buffer: Buffer.from("not an image"),
          size: 12,
          originalname: "fake.jpg",
        }),
      /Choose a JPG/,
    );
    const buffer = await sharp({
      create: { width: 2200, height: 1400, channels: 3, background: "#f1ece2" },
    })
      .jpeg()
      .toBuffer();
    const result = await storage.optimize({
      buffer,
      size: buffer.length,
      originalname: "../../venue.jpg",
    });
    assert.equal(result.width, 1920);
    assert.equal(result.mime_type, "image/webp");
    assert.equal(result.original_filename, "venue.jpg");
    const files = await readdir(storagePath);
    assert.equal(files.length, 2);
    const meta = await sharp(path.join(storagePath, result.thumbnail_storage_key)).metadata();
    assert.equal(meta.width, 640);
    assert.equal(meta.exif, undefined);
    await assert.rejects(() => storage.remove("../outside.webp"), /Invalid storage key/);
    await storage.remove(result.image_storage_key);
    await storage.remove(result.thumbnail_storage_key);
    assert.deepEqual(await readdir(storagePath), []);
  } finally {
    await rm(storagePath, { recursive: true, force: true });
  }
});
