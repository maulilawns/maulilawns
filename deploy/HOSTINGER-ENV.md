# Hostinger environment — Mauli Lawns

`hostinger.env.example` ha template ahe. Live credentials bharun backend var private
`.env` mhanun vapra, kiwa hosting chya Environment Variables madhye values taka.
Existing local `.env` overwrite karu naka.

## Values tumhala bharavya lagtil

- `API_PORT`: blank theva; API Hostinger-ne set kelela `PORT` automatically vaparte. Explicit override lagat asel tarch bhara.
- `DATABASE_URL`: Hostinger cha full DB username, encoded password, DB host ani full database name.
- `SESSION_SECRET`: terminal madhye `openssl rand -hex 48` run karun milaleli private value.
- `APP_ORIGINS`: actual frontend HTTPS domain; trailing slash nahi. Don domains astil tar comma-ne separate kara.
- `TRUST_PROXY_HOPS`: hosting reverse proxy chain madhla verified count. Chukichi value asel tar secure admin session/login work honar nahi.
- `STORAGE_PATH`: redeployment nantar pan tiknara absolute uploads directory. Verify kelyavar `STORAGE_PERSISTENT_DISK=true` kara.
- `STORAGE_PUBLIC_URL`: backend var `/uploads` serve hot asel tar tyacha live HTTPS URL. S3 vaprat asel tar public bucket/CDN URL.
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`: tumcha initial production admin account.
- `VITE_API_BASE_URL`: frontend build environment madhye API cha HTTPS URL. Udaharan: frontend `https://example.com` ani API `https://api.example.com`. Same-origin `/api` reverse proxy configure kela asel tarch blank theva.

`.env` file madhle database password, session secret, S3 secret ani admin password private theva.
`VITE_` variables browser madhye visible astat; tyat secrets taku naka.

## Deploy order

1. Database create karun `database/mauli-lawns-hostinger.sql` import kara.
2. Backend env, HTTPS routing ani persistent storage configure kara. Local disk durable nasel tar S3 option vapra.
3. Production env load honarya project folder madhye `npm run db:admin` run kara.
4. Admin create zalyavar `ADMIN_PASSWORD` environment madhun remove kara.
5. `npm run db:import-client-gallery` run kara.
6. API `npm run api:start` ne start kara.
7. Frontend la `VITE_API_BASE_URL` build veli deun `npm run build:hostinger` run kara. Start command `npm run start:hostinger` ahe (entry `.output/server/index.mjs`). Ha build Node server target vaparto; original Lovable build unchanged ahe. Backend start command frontend serve karat nahi.
8. `/health`, public gallery, admin login, upload ani logout actual HTTPS domain var test kara.

Hostinger plan, domains, proxy chain ani persistent disk details confirm zalyashivay ya
placeholder template la ready-to-run production configuration samju naka.
