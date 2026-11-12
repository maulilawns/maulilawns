# Local admin access

The local MySQL instance, Node runtime, database and image uploads are configured for this checkout. They are separate from the public Vercel website.

Start or resume the local services from this project folder:

```bash
./scripts/local-start.sh
```

Open **http://localhost:8080/admin/login**. Use the local account supplied in the conversation. Its username is `mauliadmin`. Change its password through **Account Settings** when desired. Keep credentials private; no password is included in source control or this document.

The command reuses services already running and starts any missing service. Services continue running after the terminal command exits. After restarting your Mac, run the command again. Logs are under `.data/mysql.log`, `.data/api.log` and `.data/frontend.log` (a frontend started separately may have a different log destination).

- Frontend: `http://localhost:8080`
- API health: `http://localhost:3001/health`
- MySQL: `127.0.0.1:3307`, bound to local loopback only.
- Main database: `mauli_lawns`; isolated integration-test database: `mauli_lawns_test`.
- The three real client-supplied Mini Lawn photographs are published. All 14 legacy sample gallery photographs have been removed.
- Database files: `.data/mysql/`; optimized photographs: `.data/uploads/`.
- Project-local binaries: `.data/runtime/`. These do not change your Mac's system installation.

`.env` and `.data/local-credentials.json` contain private local configuration and have owner-only file permissions. Both are excluded by `.gitignore`. The initial admin password was removed from `.env` after seeding; only its bcrypt hash is in MySQL. The private local credentials file is the initial account handoff record, not an authentication source; changing the password in Account Settings does not update that record.

Do not delete `.data/` unless you intend to remove the local database, uploaded photographs and runtimes. These local services and credentials do not configure or publish the Vercel website. Production still requires the separate hosting setup described in `ADMIN-SETUP.md`.

Run the configured database integration test with the project-local Node executable:

```bash
.data/runtime/node-v24.22.3-darwin-arm64/bin/node --test server/tests/security.test.js server/tests/workflow.integration.test.js
```

The test reads the dedicated `TEST_DATABASE_URL` from `.env`. Do not point it at the main database.
