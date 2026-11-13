# Hostinger database setup — Mauli Lawns

## 1. Database create kara

Hostinger hPanel madhye website ughada → Databases → Management.
Database name, database username ani strong password deun database create kara.
hPanel madhye dakhavlele **full prefixed database name ani username** vapra.
Database/user hPanel madhun create kara; SQL file tyanchya aat tables tayar karte.

## 2. SQL file import kara

Navin database chya phpMyAdmin madhye ja. Toch database select kara → Import →
`database/mauli-lawns-hostinger.sql` choose kara → Go/Import.

Ya file madhye 6 tables ahet:

- `admins` — admin account ani bcrypt password hash
- `gallery_categories` — gallery filters (5 initial categories)
- `gallery_images` — image metadata ani storage URLs
- `sessions` — signed-in admin sessions
- `login_attempts` — failed login tracking
- `storage_cleanup` — image deletion cleanup queue

Existing tables/data delete hot nahi. File punha import keli tari seed categories duplicate hot nahit.
Ha fresh setup ahe: local admin passwords, sessions ani localhost image URLs export kelele nahit.

## 3. Backend la database connect kara

Project chya `.env.example` varun server-side `.env` / hosting environment configure kara.
Database connection cha format:

```dotenv
DATABASE_URL="mysql://FULL_DB_USERNAME:URL_ENCODED_PASSWORD@DB_HOST:3306/FULL_DB_NAME"
```

`DB_HOST`, full username ani full database name Hostinger chya connection details madhun ghya.
Password madhle special characters URL-encode kara. TLS provider-ne configure kelela asel
ani certificate verify hot asel tar `?ssl=true` vapra.
Frontend `VITE_` variables madhye database password thevu naka.
Backend Hostinger chya baher asel tar database sathi remote access/network allowlist pan configure karavi lagel.

`SESSION_SECRET`, exact HTTPS `APP_ORIGINS`, `NODE_ENV=production`, trusted proxy settings
ani persistent image storage pan configure kara; full details `docs/ADMIN-SETUP.md` madhye ahet.

## 4. Production admin create kara

Backend environment madhye ya values set kara (private values Git madhye commit karu naka):

```dotenv
ADMIN_USERNAME=mauliadmin
ADMIN_FULL_NAME="Mauli Lawns Admin"
ADMIN_EMAIL=YOUR_REAL_EMAIL
ADMIN_PASSWORD=YOUR_UNIQUE_STRONG_PASSWORD
```

Password kiman 12 characters, uppercase/lowercase ani number aslela pahije; maximum 72 UTF-8 bytes.
Project folder madhun, **production database configured asatana**, run kara:

```sh
npm run db:admin
```

Command bcrypt hash save karte. Admin tayar zalyavar environment madhun `ADMIN_PASSWORD` kadha.
Existing username asel tar command tyacha password overwrite karat nahi.

## 5. Gallery photographs publish kara

Production storage settings ani database configured zalyavar run kara:

```sh
npm run db:import-client-gallery
```

Command `src/assets/gallery/manifest.json` madhle 17 photos import karte; existing matching
records skip karte. Production madhye upload storage persistent disk kiwa S3-compatible bucket
asava. `STORAGE_PUBLIC_URL` ha live HTTPS uploads/CDN URL asava, localhost nahi.

Photos SQL file madhye embed kelele nahit. Schema import zalyane photos automatically disat nahit;
varil import command ani working API/storage lagte.

## 6. Live website sathi kay lagte

Ha project React/TanStack Start + Node/Express API vaparto. Database create/import karne
ha ek step ahe; frontend ani Node backend pan deploy karave lagtat. API start command:

```sh
npm run api:start
```

Admin/gallery functionality MySQL vaparte. Venues, packages, event types, banner settings ani
itar original demo edits ajun browser localStorage madhye ahet; tyanchi MySQL migration ya
SQL file madhye nahi. Navin visitor sathi bundled source defaults vaprale jatat.

## Hostinger documentation

- Database create: https://www.hostinger.com/support/1583542-how-to-create-a-new-mysql-database-in-hostinger/
- phpMyAdmin import: https://www.hostinger.com/support/1884149-how-to-import-a-database-with-phpmyadmin-in-hostinger/
