// Validate the production SSR output without sending analytics or form requests.
// Run the built app separately, then TEST_BASE_URL=http://localhost:3002 node scripts/verify-seo.mjs.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
const base = process.env.TEST_BASE_URL || 'http://localhost:3002';
const seo = readFileSync(new URL('../src/lib/seo.ts', import.meta.url), 'utf8');
const pages = JSON.parse(seo.slice(seo.indexOf('= {') + 2, seo.indexOf('\n};') + 2));
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}) });
try {
 const page = await browser.newPage();
 await page.route('https://www.googletagmanager.com/**', r => r.abort());
 const errors = [];
 page.on('pageerror', e => errors.push(e.message));
 const titles = new Set(), descriptions = new Set(), links = new Set();
 for (const [path, expected] of Object.entries(pages)) {
  const response = await page.request.get(base + path);
  assert.equal(response.status(), 200, path);
  const html = await response.text();
  const rendered = await page.evaluate(html => {
   const d = new DOMParser().parseFromString(html, 'text/html');
   const all = selector => [...d.querySelectorAll(selector)];
   return {
    titles: all('title').map(x => x.textContent),
    descriptions: all('meta[name="description"]').map(x => x.content),
    canonical: all('link[rel="canonical"]').map(x => x.href),
    robots: all('meta[name="robots"]').map(x => x.content),
    og: d.querySelector('meta[property="og:url"]')?.content,
    twitter: d.querySelector('meta[name="twitter:title"]')?.content,
    h1: all('h1').map(x => x.textContent),
    json: all('script[type="application/ld+json"]').map(x => JSON.parse(x.textContent)),
    links: all('a[href^="/"]').map(x => x.getAttribute('href')),
    missingAlt: all('img:not([alt])').length,
   };
  }, html);
  assert.deepEqual(rendered.titles, [expected.title], path);
  assert.deepEqual(rendered.descriptions, [expected.description], path);
  assert.deepEqual(rendered.canonical, ['https://maulilawns.com' + path], path);
  assert.deepEqual(rendered.robots, ['index, follow'], path);
  assert.equal(rendered.og, 'https://maulilawns.com' + path);
  assert.equal(rendered.twitter, expected.title);
  assert.equal(rendered.h1.length, 1, path);
  assert.equal(rendered.missingAlt, 0, path);
  assert(!titles.has(expected.title)); titles.add(expected.title);
  assert(!descriptions.has(expected.description)); descriptions.add(expected.description);
  const business = rendered.json.find(x => x['@id']?.endsWith('#business'));
  assert.equal(business.telephone, '+919254245454');
  const graph = rendered.json.flatMap(x => x['@graph'] || []);
  assert(graph.some(x => x['@type'] === (path === '/' ? 'WebSite' : 'BreadcrumbList')), path);
  rendered.links.forEach(x => links.add(x.split('#')[0].split('?')[0]));
  await page.goto(base + path); await page.locator('h1').waitFor();
  assert.equal(await page.title(), expected.title, `hydrated ${path}`);
  console.log(`SEO passed: ${path}`);
 }
 const sitemap = await (await page.request.get(base + '/sitemap.xml')).text();
 const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(x => x[1]);
 assert.deepEqual(urls.sort(), Object.keys(pages).map(x => 'https://maulilawns.com' + x).sort());
 const robots = await (await page.request.get(base + '/robots.txt')).text();
 assert(robots.includes('Disallow: /admin') && robots.includes('Sitemap: https://maulilawns.com/sitemap.xml'));
 for (const path of ['/missing-page', '/venues/missing-venue']) {
  assert.equal((await page.request.get(base + path)).status(), 404, path);
 }
 for(const path of links) { if (!path || path.startsWith('/admin')) continue; assert.equal((await page.request.get(base + path)).status(),200,`internal link ${path}`); }
 const admin = await (await page.request.get(base + '/admin/login')).text();
 assert(/noindex/.test(admin));
 assert.deepEqual(errors, []);
 console.log(`Validated ${titles.size} SSR pages, metadata, structured data, links, sitemap, robots, private indexing and 404s.`);
} finally { await browser.close(); }
