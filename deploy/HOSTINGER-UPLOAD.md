# Mauli Lawns — Hostinger upload guide

He packages Hostinger **Node.js Web App** sathi ahet. ZIP direct `public_html`
madhye static HTML mhanun extract karu naka. Don Node apps create kara.

## Files

- `mauli-frontend.zip`: complete frontend source, assets, locked dependencies, Node build script.
- `mauli-backend.zip`: Express API, schema/migrations, gallery import photos, locked dependencies.
- `mauli-lawns-hostinger.sql`: fresh MySQL schema + five gallery categories.
- `backend.env.example`: private backend configuration template.
- `frontend.env.example`: public API URL used while building the frontend.
- `mauli-hostinger-all-files.zip`: above files ani ha guide ekatra. Deployment sathi tyatun vegvegale ZIPs kadha.

ZIP madhye actual `.env`, passwords, local database data, sessions, node_modules kiwa Mac runtimes nahit.
SQL file initial setup ahe; current private admin credentials/data dump nahi.

## 1. Database

hPanel → Databases → Management → database/user create kara.
phpMyAdmin → database select → Import → `mauli-lawns-hostinger.sql`.
Full prefixed database name ani username note kara.

Hostinger managed Node app-ne tyach hosting madhla MySQL access kartana DB host
`127.0.0.1` vapra (`localhost` nahi). Baherchya server varun connect kartana Hostinger
remote MySQL hostname ani allowlist vegale lagtat.

## 2. Backend app — api.YOUR_DOMAIN

Websites → Create site → Web App → Upload your files → `mauli-backend.zip`.

| Setting | Value |
|---|---|
| Framework | Express (kiwa Other) |
| Node.js | 24.x |
| Package manager | npm |
| Root directory | `/` (package.json aslela ZIP root) |
| Install | `npm ci` |
| Build command, if required | `npm run build` |
| Entry file | `server/index.js` |
| Start command, if shown | `npm start` |

Hostinger config entry file kiwa start command yapeki je field dakhavel te vapra.
Backend build fakta JS syntax verify karto; API start karat nahi.

Environment Variables madhye `backend.env.example` nusar values bhara:

- `DATABASE_URL=mysql://FULL_USER:URL_ENCODED_PASSWORD@127.0.0.1:3306/FULL_DB_NAME`
- `SESSION_SECRET`: privately generate with `openssl rand -hex 48`.
- `APP_ORIGINS=https://YOUR_DOMAIN,https://www.YOUR_DOMAIN` (actual frontend domains only).
- `API_PORT`: blank/omit kara; hosting cha `PORT` automatically use hoto.
- `TRUST_PROXY_HOPS`: verified HTTPS proxy chain count; guessed value use karu naka.
- `STORAGE_DRIVER`, `STORAGE_PUBLIC_URL` ani storage credentials/path bhara.

**Photo storage:** local uploads directory redeploy nantar tikto he hosting madhye
confirm kelyavarach `STORAGE_PERSISTENT_DISK=true` kara. Confirm nasel tar S3-compatible
bucket/CDN vapra; template madhye donhi options ahet. Production startup unconfirmed
local disk reject karte. Node runtime milala mhanje durable uploads automatically miltat asa nahi.

One-time setup project root madhun SSH/terminal madhye kara (production env loaded asatana):

```sh
npm run db:admin
# Admin create zalyavar ADMIN_PASSWORD hosting environment madhun remove kara.
npm run db:import-client-gallery
```

`db:admin` sathi ADMIN_USERNAME, ADMIN_FULL_NAME, real ADMIN_EMAIL ani unique strong
ADMIN_PASSWORD bhara. Existing admin overwrite hot nahi. SQL import aivaji `npm run db:migrate`
pan vaparta yeto. Gallery import 17 bundled photos handle karto ani existing matching records skip karto.

Backend domain la HTTPS enable kara. `https://api.YOUR_DOMAIN/health` var
`{"data":{"ready":true}}` milale pahije.

## 3. Frontend app — YOUR_DOMAIN

Dusra Web App create kara → `mauli-frontend.zip` upload kara.

| Setting | Value |
|---|---|
| Framework | Nitro (kiwa Other); static Vite output select karu naka |
| Node.js | 24.x |
| Package manager | npm |
| Root directory | `/` (package.json aslela ZIP root) |
| Install | `npm ci` |
| Build command | `npm run build` |
| Server entry file | `.output/server/index.mjs` |
| Start command, if shown | `npm start` |

Ha frontend TanStack Start SSR ahe; fakta `dist/` static upload purasa nahi.
ZIP madhla `npm run build` **node-server** target vaparto. Original repo sathi equivalent
commands `npm run build:hostinger` ani `npm run start:hostinger` ahet.

**Build honyapurvi** frontend env set kara:

```dotenv
NODE_ENV=production
VITE_API_BASE_URL=https://api.YOUR_DOMAIN
```

Frontend ani API same site var theva: example.com + api.example.com. Unrelated temporary
domains var secure SameSite cookies mule admin login work honar nahi; final same-site domain
set kara kiwa same-origin reverse proxy configure kara. Public env madhye DB password/secret deu naka.
API URL badallyavar frontend **rebuild/redeploy** kara. API env changes nantar backend restart kara.

## 4. Launch verification

- Home, pages, navigation ani mobile layout.
- Gallery images, category filters ani lightbox.
- `/admin/login`, admin dashboard, upload/publish/unpublish/logout.
- Contact form WhatsApp message preview (sending is a separate action).
- HTTPS cookies ani browser console/CORS errors.
- Backend restart/redeploy nantar gallery photos tikle ka check kara.

Venues, packages, banner ani other original demo content edits ajun browser localStorage madhye
save hotat. MySQL database admin/gallery sathi ahe. Dusrya visitors la browser-local edits
share honar nahit; tyasathi separate content migration lagel.

## Official Hostinger guides

- Node.js ZIP deployment: https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/
- MySQL connection: https://www.hostinger.com/support/connecting-a-hostinger-mysql-database-to-a-node-js-application/

Packages locally build/run verify kele ahet; actual Hostinger credentials, domains ani storage
configure zalyavar live verification karavi lagel.
