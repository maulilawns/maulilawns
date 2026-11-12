# Verification results — 12 November 2026

## Passed

- Production frontend build and TypeScript checks; existing React/TanStack Start/Vite framework retained.
- Frontend suite: 20 tests passed, including the existing public routes and the new admin routes.
- Backend suite on Node.js 24.22.3: **4 tests passed, none skipped**, including the complete lifecycle against real local MySQL 8.4.11 with MySQL-backed sessions and temporary disk storage.
- Backend coverage includes anonymous API protection, CSRF/origin rejection, cookie flags, validation, incorrect/correct login, dashboard statistics, category creation, mixed valid/invalid bulk upload, image optimization/metadata, draft visibility, publication, public filters, featured images, title edits, safe category deletion, inactive category visibility, unpublishing, image/storage cleanup, deletion, logout and authentication invalidation.
- Chromium browser workflow through the actual local frontend/API: incorrect password feedback; successful login; dashboard; category creation; two-file upload/publication; dynamic public category filtering; featured homepage photographs; title editing; unpublishing; image deletion; category deletion; logout; protected route redirect. Temporary test images/categories were removed afterward.
- Authenticated admin gallery checked at 375, 768, 1024 and 1440px: no horizontal page overflow. Mobile sidebar opens and closes. No uncaught page errors in the browser workflow.
- Backend and MySQL restart check: all 14 imported photographs remain available through the public API. Original bundled assets were preserved. Six categories remain, including the existing Lighting photographs.
- Targeted lint on changed implementation code passes. Dependency audit reports zero known vulnerabilities after the dependency updates in the initial upgrade.

The first real MySQL test caught a first-start session-table initialization race. Session readiness is now awaited before processing admin requests, the migration explicitly creates the session table, and backend startup waits for the session store before listening.

## Local runtime

Run `./scripts/local-start.sh` and open `http://localhost:8080/admin/login`. MySQL runs on loopback port 3307; the API runs on port 3001. `.env` points to the local main and isolated test databases. Runtime data, credentials and uploaded files are private and excluded from source control. See `LOCAL-TESTING.md`.

## Remaining deployment checks

- Production hosting, S3-compatible storage, production HTTPS/proxy cookies and the live Vercel website remain unverified. No production deployment was performed.
- The browser workflow used persistent local disk; it does not validate an external object-storage account.
- Account password changes and category reassignment/thumbnail replacement were not included in the browser workflow and should be checked before production launch.
- Full-project lint still includes existing formatting errors in untouched `src/components/site/reveal.tsx`, `src/data/catalog.ts` and `src/data/store.tsx`, plus existing Fast Refresh warnings. Unrelated source formatting was not rewritten.

See `ADMIN-SETUP.md` for production deployment and the remaining acceptance checklist.

## Facilities page addition

Added `/facilities` with the reference garden image stored locally, matching hero/card content and scoped styling. Existing site header, footer and contact links are retained. Production build, type checks and targeted lint pass. Chromium checks confirm nine cards, a loaded local hero image, no horizontal overflow at 375/768/1024/1280/1440px, and working desktop/mobile Facilities navigation. No production deployment was performed.

## Dummy-image removal

Removed all stock JPEG source files from the website bundle and all 14 known demo gallery records/storage files, preserving the three actual Mini Lawn images and branding. Build and type checks pass. Chromium checked every public route plus admin login for broken images and uncaught errors, with mobile overflow checks on the affected pages. The public gallery API contains exactly three Mini Lawn photographs. Older browser image keys are safely ignored; legacy imports no longer restore demo images. Production remains undeployed.

## Owner clarification: remove gallery photos only

Restored all original non-gallery source imagery and layouts, including homepage banners, Grand Lawn, events, decor and login. Mini Lawn retains its three supplied client images. The public gallery still contains only the three genuine Mini Lawn photographs. Build and type checks pass; browser checks verify homepage/Grand Lawn/events/decor restoration and the retained Mini Lawn images, and confirm the gallery API has three records. This supersedes the broader dummy-image removal described above.
