import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import session from "express-session";
import { createSiteHandler } from "../request-handler.js";
import { createApp } from "../app.js";
import { getConfig } from "../config.js";

const config = getConfig({
  DATABASE_URL: "mysql://test:test@localhost/test",
  SESSION_SECRET: "test-only-secret-that-is-at-least-32-characters",
  APP_ORIGINS: "http://localhost:8080",
});
const db = {
  execute: async () => {
    throw new Error("Unexpected database access");
  },
};
const api = createApp(config, db, { sessionStore: new session.MemoryStore() });
const site = createSiteHandler(api, (_req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end("<h1>Mauli website</h1>");
});

test("website routes use the frontend, including direct venue/admin page loads", async () => {
  for (const path of ["/", "/venues/mini-lawn", "/admin/login", "/assets/site.js", "/apiculture"])
    assert.match((await request(site).get(path).expect(200)).text, /Mauli website/);
});
test("API authentication and CSRF checks remain in Express", async () => {
  await request(site).get("/api/admin/dashboard/stats").expect(401);
  await request(site).post("/api/admin/auth/login").send({}).expect(403);
});
test("unknown API and upload URLs keep API 404 responses instead of HTML", async () => {
  for (const path of ["/api", "/api/missing?x=1", "/uploads/missing.webp"])
    assert.equal((await request(site).get(path).expect(404)).body.error, "Endpoint not found.");
});

test("live public URLs serve the website by default and can opt into Coming Soon", async () => {
  for (const host of ["maulilawns.com", "www.maulilawns.com"]) {
    for (const path of ["/", "/about", "/venues/grand-lawn", "/gallery", "/sitemap.xml"]) {
      const response = await request(site).get(path).set("Host", host).expect(200);
      assert.match(response.text, /Mauli website/);
    }
    for (const path of ["/admin/login", "/assets/site.js", "/coming-soon-logo.png", "/favicon.ico", "/favicon.png", "/favicon-32x32.png", "/apple-touch-icon.png"]) {
      await request(site).get(path).set("Host", host).expect(200);
    }
    await request(site).get("/api/admin/dashboard/stats").set("Host", host).expect(401);
  }
  await request(site).get("/about").set("Host", "localhost:8080").expect(200);
  const comingSoon = createSiteHandler(api, (_req, res) => res.end("Launched"), { comingSoon: true });
  assert.match((await request(comingSoon).get("/").set("Host", "maulilawns.com").expect(503)).text, /Coming Soon/);
  const launched = createSiteHandler(api, (_req, res) => res.end("Launched"), { comingSoon: false });
  assert.equal((await request(launched).get("/").set("Host", "maulilawns.com").expect(200)).text, "Launched");
});
