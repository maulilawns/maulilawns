# Hostinger: website and API on one domain

Use this for the main domain when Express is the selected framework. It serves the
TanStack Start website, the Express API, and uploaded photos on one listening port.

| Hostinger setting | Value |
|---|---|
| Framework | Express |
| Branch | main |
| Node.js | 24.x |
| Root directory | ./ |
| Package manager | npm |
| Build command | npm run build:hostinger:site |
| Entry file | server.js |
| Start command, if requested | npm start |

The build uses Nitro's node-middleware preset; the runtime mounts this alongside
Express. The regular `npm run build` retains the existing platform-specific target.
The API-only entry remains `server/index.js` for local or separate API deployments.

## Environment

Keep the existing working database, session secret and persistent upload settings.
Use the actual site origin(s) in APP_ORIGINS. Do not hardcode a different API port;
Hostinger's assigned PORT is used when API_PORT is empty.

VITE_API_BASE_URL is intentionally empty in the single-app build, so requests go
to the same domain's /api endpoints. No API subdomain or separate frontend app is required.
The deployment-specific HTTPS proxy setting TRUST_PROXY_HOPS must match the actual
trusted proxy chain for secure admin cookies to work.

For local disk uploads, configure a directory outside hbuilds/versions and preserve it
across redeployments, with STORAGE_PERSISTENT_DISK=true and the public HTTPS
STORAGE_PUBLIC_URL ending in /uploads. A configured S3 bucket is also supported.

Import database/mauli-lawns-hostinger.sql before startup. Create an initial admin with
npm run db:admin using private one-time admin values; remove ADMIN_PASSWORD afterward.
Publish bundled gallery images with npm run db:import-client-gallery. SQL schema import
alone does not upload photographs.

## Verify after redeploy

- / returns the HTML website.
- /venues/mini-lawn and /venues/grand-lawn load directly without prices.
- /assets/... returns JS/CSS assets.
- /health returns {"data":{"ready":true}}.
- /api/public/gallery/categories returns JSON.
- /admin/login loads the website login page; /api/admin/* stays protected by sessions/CSRF.
- Unknown /api and /uploads paths return API errors rather than website HTML.

A clear "Website build missing" response means the build command was omitted.
Set npm run build:hostinger:site and redeploy the latest main branch.
