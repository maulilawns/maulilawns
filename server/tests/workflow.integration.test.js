// Runs against real MySQL and a temporary image directory, with a real MySQL session store.
import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import bcrypt from "bcryptjs";
import sharp from "sharp";
import request from "supertest";
import { createPool, rows } from "../db.js";
import { getConfig } from "../config.js";
import { createApp } from "../app.js";
import { createStorage } from "../storage.js";
import MySQLStoreFactory from "express-mysql-session";
import session from "express-session";
test(
  "complete authenticated gallery lifecycle on real MySQL",
  { skip: !process.env.TEST_DATABASE_URL },
  async () => {
    const url = new URL(process.env.TEST_DATABASE_URL);
    if (!/test/i.test(url.pathname))
      throw new Error("Use a dedicated database with test in its name.");
    const db = createPool(process.env.TEST_DATABASE_URL),
      dir = await mkdtemp(path.join(os.tmpdir(), "mauli-workflow-"));
    const suffix = randomUUID().slice(0, 8),
      username = "test-" + suffix,
      password = "Test-Only-" + randomUUID();
    let adminId, categoryId, imageId, store;
    const config = {
      ...getConfig({
        DATABASE_URL: process.env.TEST_DATABASE_URL,
        SESSION_SECRET: randomUUID() + randomUUID(),
        APP_ORIGINS: "http://localhost:8080",
      }),
      storagePath: dir,
    };
    try {
      const migration = await readFile(
        new URL("../migrations/001-gallery.sql", import.meta.url),
        "utf8",
      );
      for (const statement of migration
        .split(";")
        .map((x) => x.trim())
        .filter(Boolean))
        await db.query(statement);
      adminId = (
        await rows(
          db,
          "INSERT INTO admins(username,password_hash,full_name,email) VALUES (?,?,?,?)",
          [username, await bcrypt.hash(password, 12), "Test Owner", "test@example.test"],
        )
      ).insertId;
      const Store = MySQLStoreFactory(session);
      store = new Store({ createDatabaseTable: true }, db);
      const storage = createStorage(config),
        app = createApp(config, db, { sessionStore: store, storage }),
        agent = request.agent(app);
      let csrf = (await agent.get("/api/admin/auth/csrf")).body.data.csrf;
      const mutate = (method, url, body) =>
        agent[method](url).set("Origin", config.origins[0]).set("X-CSRF-Token", csrf).send(body);
      assert.equal(
        (await mutate("post", "/api/admin/auth/login", { username, password: "wrong" })).status,
        401,
      );
      const login = await mutate("post", "/api/admin/auth/login", { username, password });
      assert.equal(login.status, 200);
      csrf = login.body.data.csrf;
      assert.equal((await agent.get("/api/admin/auth/me")).body.data.username, username);
      assert.equal((await agent.get("/api/admin/dashboard/stats")).status, 200);
      const category = await mutate("post", "/api/admin/gallery/categories", {
        name: "Birthday " + suffix,
        slug: "birthday-" + suffix,
        description: "Test category",
        is_active: true,
      });
      assert.equal(category.status, 201);
      categoryId = category.body.data.id;
      const buffer = await sharp({
        create: { width: 120, height: 80, channels: 3, background: "#c5a570" },
      })
        .jpeg()
        .toBuffer();
      const metadata = [
        { title: "Birthday detail", category_id: categoryId, status: "draft" },
        { title: "Invalid file", category_id: categoryId, status: "draft" },
      ];
      const bulk = await agent
        .post("/api/admin/gallery/images/bulk-upload")
        .set("Origin", config.origins[0])
        .set("X-CSRF-Token", csrf)
        .field("metadata", JSON.stringify(metadata))
        .attach("images", buffer, "venue.jpg")
        .attach("images", Buffer.from("unsafe"), "invalid.jpg");
      assert.equal(bulk.status, 207);
      assert.equal(bulk.body.data[0].success, true);
      assert.equal(bulk.body.data[1].success, false);
      imageId = bulk.body.data[0].image.id;
      assert.equal(bulk.body.data[0].image.width, 120);
      assert.equal((await readdir(dir)).length, 2);
      const publicImages = () =>
        request(app).get("/api/public/gallery/images?category_id=" + categoryId);
      assert.equal((await publicImages()).body.data.length, 0);
      assert.equal(
        (
          await mutate("patch", `/api/admin/gallery/images/${imageId}/status`, {
            status: "published",
          })
        ).status,
        200,
      );
      assert.equal((await publicImages()).body.data[0].title, "Birthday detail");
      assert.ok(
        (await request(app).get("/api/public/gallery/categories")).body.data.some(
          (c) => c.id === categoryId,
        ),
      );
      assert.equal(
        (
          await mutate("put", `/api/admin/gallery/images/${imageId}`, {
            title: "Updated title",
            category_id: categoryId,
            status: "published",
            is_featured: true,
          })
        ).status,
        200,
      );
      assert.equal((await publicImages()).body.data[0].title, "Updated title");
      assert.ok(
        (
          await request(app).get("/api/public/gallery/featured?category_id=" + categoryId)
        ).body.data.some((i) => i.id === imageId),
      );
      assert.equal(
        (await mutate("delete", `/api/admin/gallery/categories/${categoryId}`, {})).status,
        409,
      );
      assert.equal(
        (
          await mutate("put", `/api/admin/gallery/categories/${categoryId}`, {
            name: "Birthday " + suffix,
            slug: "birthday-" + suffix,
            is_active: false,
          })
        ).status,
        200,
      );
      assert.equal((await publicImages()).body.data.length, 0);
      assert.equal(
        (await mutate("patch", `/api/admin/gallery/images/${imageId}/status`, { status: "draft" }))
          .status,
        200,
      );
      assert.equal(
        (await mutate("delete", `/api/admin/gallery/images/${imageId}`, {})).status,
        200,
      );
      imageId = null;
      for (const item of await rows(db, "SELECT storage_key FROM storage_cleanup"))
        if ((await readdir(dir)).includes(item.storage_key)) {
          await storage.remove(item.storage_key);
          await rows(db, "DELETE FROM storage_cleanup WHERE storage_key=?", [item.storage_key]);
        }
      assert.deepEqual(await readdir(dir), []);
      assert.equal(
        (await mutate("delete", `/api/admin/gallery/categories/${categoryId}`, {})).status,
        200,
      );
      categoryId = null;
      assert.equal((await mutate("post", "/api/admin/auth/logout", {})).status, 200);
      assert.equal((await agent.get("/api/admin/gallery/images")).status, 401);
    } finally {
      if (imageId) await rows(db, "DELETE FROM gallery_images WHERE id=?", [imageId]);
      if (categoryId) await rows(db, "DELETE FROM gallery_categories WHERE id=?", [categoryId]);
      if (adminId) await rows(db, "DELETE FROM admins WHERE id=?", [adminId]);
      if (store) await store.close();
      await db.end().catch(() => {});
      await rm(dir, { recursive: true, force: true });
    }
  },
);
