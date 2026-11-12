# Mauli Lawns content studio

This upgrade preserves the public React/TanStack Start application, assets, fonts, animations, URLs and gallery lightbox. New frontend modules use JavaScript/JSX. The separate Node/Express API uses MySQL, server-side MySQL sessions, bcrypt, Multer, Sharp and either S3-compatible storage or a durable backend disk. No gallery data or credentials are stored in browser localStorage. The optional remembered username is stored locally.

## Local setup

Use Node.js 22.12+ or 24 LTS, MySQL 8.0.16+ and the project's Bun package manager. Run `bun install` from the project directory. Scripts also run through npm once dependencies are installed.

1. Copy `.env.example` to `.env`; never commit it. Create a MySQL database using utf8mb4. Set `DATABASE_URL` to `mysql://USER:PASSWORD@HOST:3306/DATABASE` (URL-encode username/password). Add `?ssl=true` for verified database TLS. Use a dedicated least-privilege database account; migration/session-table creation also requires CREATE/INDEX permissions.
2. Generate a unique session secret of at least 32 characters, for example `openssl rand -hex 48`, and set `SESSION_SECRET`. Keep it stable across backend restarts and replicas.
3. Set `APP_ORIGINS=http://localhost:8080`, `API_PORT=3001`, `STORAGE_DRIVER=local`, `STORAGE_PATH=./.data/uploads`, `STORAGE_PUBLIC_URL=http://localhost:3001/uploads`, and `MAX_UPLOAD_MB=10`. Development disk data survives process restarts. Keep `NODE_ENV=development` and `VITE_API_BASE_URL` empty.
4. Run `bun run db:migrate`. This creates tables without deleting data and seeds the five requested categories. `All` is a computed filter and cannot be created as a category.
5. Set `ADMIN_USERNAME`, `ADMIN_FULL_NAME`, `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` (12–72 UTF-8 bytes, uppercase, lowercase, number). Run `bun run db:admin` once. It hashes the password and refuses to overwrite an existing account. Remove `ADMIN_PASSWORD` from the environment immediately afterward.
6. **Before switching the public gallery to this API**, run `bun run db:import-gallery` with `ADMIN_USERNAME` set to the owning account. This imports only the three client-supplied Mini Lawn photographs into persistent storage. It is repeat-safe. The legacy dummy-photo catalogue has been retired and is no longer imported. Back up or export any previous browser-local gallery customizations separately before replacing that legacy browser's demo content; bundled import cannot discover another browser's localStorage.
7. Start `bun run api:dev`, then `bun run dev --port 8080` in a second terminal. Open `/admin/login`. Vite proxies `/api` to port 3001. Start both processes for a functional gallery.

## Production deployment with the existing Vercel frontend

Do not put the Express API or uploads in Vercel's temporary filesystem. Deploy `server/`, `package.json` and its dependencies to a persistent Node service with HTTPS and access to MySQL (for example a container service or VM). Install dependencies and run `npm run api:start`. Use MySQL 8.0.16+ with durable backups and TLS. Run migrations/admin setup/gallery import against that database before directing production traffic to it. There are no production default credentials.

Set backend `NODE_ENV=production`, a stable `SESSION_SECRET`, exact HTTPS `APP_ORIGINS` such as `https://maulilawns.vercel.app`, and the verified database connection. Set `TRUST_PROXY_HOPS` to the exact number of trusted upstream proxies that terminate TLS; do not trust arbitrary forwarded headers. Secure cookies require the Express request to be recognized as HTTPS.

Use one of:

- **S3-compatible object storage:** set `STORAGE_DRIVER=s3`, `S3_REGION`, `S3_BUCKET`, `S3_ENDPOINT` when required, and restricted `S3_ACCESS_KEY_ID`/`S3_SECRET_ACCESS_KEY` (or a service role). Set `STORAGE_PUBLIC_URL` to the bucket/CDN's HTTPS public prefix. Limit write credentials to the gallery bucket. Enable public read or a public CDN for generated image keys only; bucket listings and writes remain private. The API writes only random-named WEBP files, with immutable cache headers.
- **Durable disk on the backend:** mount a persistent volume, set `STORAGE_DRIVER=local`, absolute `STORAGE_PATH`, `STORAGE_PERSISTENT_DISK=true`, and `STORAGE_PUBLIC_URL=https://YOUR_API_HOST/uploads`. Startup refuses ephemeral production disk. Route `/uploads` to that same persistent volume; use a shared volume or S3 for multiple replicas.

Recommended Vercel routing: merge this rewrite into the existing deployment's configuration (preserve any existing framework/SSR routing):

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://YOUR_NODE_API_HOST/api/:path*" }
  ]
}
```

Leave `VITE_API_BASE_URL` empty for this same-origin proxy. Preserve Set-Cookie and Origin headers; do not cache `/api/admin/*`, strip its cookies, or allow all origins. Test cookie behavior through the actual deployed proxy. A custom same-site API subdomain can also use `VITE_API_BASE_URL=https://api.YOUR_DOMAIN`; configure its exact frontend origin and credentialed CORS. An unrelated cross-site API domain with direct browser fetch is incompatible with the deliberate SameSite=Lax cookies: use the frontend proxy instead.

Frontend Vite variables are build-time; backend variables remain private runtime values. Never put secrets in a `VITE_` variable. Configure request timeout/body limits to allow single 10 MB uploads with multipart overhead; the UI uploads up to 20 photographs individually, preserving successes on partial failures. The REST bulk endpoint also accepts up to 20 files (up to 200 MB plus overhead) and reports individual outcomes. Use the individual upload route where ingress limits are lower. The UI intentionally caps files at 10 MB; if changing the server limit, update the upload UI's limit and instructions too.

The public API returns only published photographs from active categories. Homepage previews prioritize featured images and then display order. API responses revalidate on each request; Express supplies ETags and public responses use `max-age=0, must-revalidate`. Published changes appear on a new page visit/refresh without a deployment. Already-open gallery pages fetch on mount and filter changes. Images use immutable URLs and 640px thumbnail/1920px full-size WEBP variants without upscaling. Public pages remain client-fetched; gallery records are not currently embedded in SSR HTML.

## Storage consistency and operations

Deletes and replacements remove database references transactionally and enqueue old file keys in `storage_cleanup`. The backend drains this durable queue on startup and every 30 seconds, retries storage errors, and never deletes newly referenced files merely because an older deletion failed. File deletion is therefore eventually consistent (normally within 30 seconds). Monitor backend logs and the cleanup queue. Upload errors attempt to remove newly written assets; an abrupt process termination between storage writes and database insert may leave unreferenced objects, so include periodic bucket inventory reconciliation in operations. Back up MySQL and object storage together.

Account password changes require the current password and invalidate other sessions using an account session version. Existing current session remains valid. Session cookies are HTTP-only, SameSite=Lax, Secure in production, with an eight-hour expiry. All mutation requests require an allowlisted Origin and a session-bound CSRF token, including login. Login throttling includes per-process IP limiting plus persistent MySQL failed-attempt buckets. Delete expired `login_attempts` periodically as database housekeeping. Avoid logging request bodies or environment values.

Other original admin modules remain available under **Other Website Content**, behind login. They are explicitly labeled browser-local demos; this task does not migrate venues, packages, event categories, decor themes, banners, testimonials or website settings into the gallery database. Public venue/package behavior remains unchanged.

## Verification

- `bun run build`
- `bun run typecheck`
- `bun run test` — original frontend tests and new admin route coverage.
- `bun run test:browser` — anonymous UI smoke checks at four widths; start the frontend first and install Playwright Chromium. Set `PLAYWRIGHT_EXECUTABLE_PATH` only if using an existing compatible browser. This does not test authenticated uploads.
- `bun run test:server` — security, image signatures, optimization and disk cleanup tests.
- Set `TEST_DATABASE_URL` to a **dedicated test database whose name includes `test`**, then `bun run test:integration`. The integration test creates randomly named test records, uses real MySQL-backed sessions and temporary disk storage, and cleans its own records. Never use production data. It skips if the variable is absent.

Before launch, verify the full browser workflow using your configured backend: wrong-password error; valid login; dashboard; category create/edit/order/thumbnail; multi-image upload including a rejected file; thumbnail dimensions; publication; new public filter; category filtering; title edit; homepage featured preview; unpublish; image deletion and cleanup; category reassignment/deletion; account/password changes; logout and protected route redirect; persistence after server restart; mobile sidebar and dialogs at 375/768/1024/1440px. Also test storage/network failures and production proxy cookies.

See `TEST-RESULTS.md` for what was actually run in the implementation workspace. Do not interpret an unconfigured or skipped integration test as successful integration.

## Client Mini Lawn photographs

The Mini Lawn page and venue previews use three optimized bundled client photos. Two of the four supplied files were identical, so the duplicate is omitted. For another configured database/storage environment, run `bun run db:import-mini-photos` with `ADMIN_USERNAME` set to the owning admin. This repeat-safe import publishes the three photos in the Mini Lawn category and preserves existing gallery content. The local database has already been updated.

## Gallery-only sample-photo removal

The 14 legacy imported sample gallery records were removed from the local gallery database and serving storage. The three client Mini Lawn photographs remain published. At the owner's clarification, original imagery on all other pages has been restored; the Mini Lawn page retains its supplied client photographs. The legacy `db:import-gallery` command imports only the actual Mini Lawn images, so it cannot repopulate the gallery with sample photos. Private recovery copies of the removed gallery data are in `.data/retired-demo-images/` and are not served.
