// UI smoke checks only. Run both dev servers for real authentication; see docs for full acceptance.
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
    ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
    : {}),
});
const base = process.env.TEST_BASE_URL || "http://localhost:8080";
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base + "/admin/login");
    await page.getByRole("heading", { name: "Welcome Back" }).waitFor();
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
      `No overflow at ${width}px`,
    );
  }
  await page.getByLabel("Username", { exact: true }).fill("ui-smoke-check");
  await page.getByLabel("Password", { exact: true }).fill("test-value");
  await page.getByRole("button", { name: "Show password" }).click();
  assert.equal(await page.getByLabel("Password", { exact: true }).getAttribute("type"), "text");
  await page.getByRole("button", { name: "Hide password" }).click();
  await page.goto(base + "/admin/gallery");
  await page.getByRole("heading", { name: "Welcome Back" }).waitFor();
  await page.goto(base + "/gallery");
  await page.getByRole("heading", { name: "Moments, beautifully framed." }).waitFor();
  assert.deepEqual(errors, []);
  console.log(
    "UI smoke checks passed at 375, 768, 1024 and 1440px. Authenticated workflow is a separate check.",
  );
} finally {
  await browser.close();
}
