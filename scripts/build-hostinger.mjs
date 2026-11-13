// Build the existing TanStack Start frontend for a Node.js server on Hostinger.
// Keep the normal Lovable/Cloudflare build unchanged.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const vite = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url));
const result = spawnSync(process.execPath, [vite, 'build'], {
  stdio: 'inherit',
  env: { ...process.env, NITRO_PRESET: 'node-server' },
});
if (result.error) { console.error(result.error.message); process.exit(1); }
process.exit(result.status ?? 1);
