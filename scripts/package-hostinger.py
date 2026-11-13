"""Prepare separate, secret-free Node.js upload packages for Hostinger."""
import argparse
import hashlib
import json
import shutil
import subprocess
import tempfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
output = args.output.resolve()
output.mkdir(parents=True, exist_ok=True)

def copy(relative, destination):
    source = ROOT / relative
    target = destination / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    if source.is_dir():
        shutil.copytree(source, target)
    else:
        shutil.copy2(source, target)

def archive(source, target):
    with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED) as z:
        for file in sorted(source.rglob('*')):
            if not file.is_file():
                continue
            relative = file.relative_to(source)
            if any(part in {'.git', '.data', 'node_modules', '.output', '.env'} for part in relative.parts):
                raise RuntimeError(f'Unexpected private/build path in package: {relative}')
            z.write(file, relative)

with tempfile.TemporaryDirectory(prefix='mauli-hostinger-') as temp:
    work = Path(temp)
    frontend, backend = work / 'frontend', work / 'backend'
    frontend.mkdir(); backend.mkdir()
    package = json.loads((ROOT / 'package.json').read_text())
    for item in ['src', 'public', 'vite.config.ts', 'tsconfig.json', 'package-lock.json']:
        copy(item, frontend)
    (frontend / 'scripts').mkdir()
    shutil.copy2(ROOT / 'scripts/build-hostinger.mjs', frontend / 'scripts/build-hostinger.mjs')
    package['scripts'] = {
        'build': 'node scripts/build-hostinger.mjs',
        'start': 'node .output/server/index.mjs',
        'dev': 'vite dev',
    }
    package['engines'] = {'node': '24.x'}
    (frontend / 'package.json').write_text(json.dumps(package, indent=2) + '\n')
    shutil.copy2(ROOT / 'deploy/frontend.env.example', frontend / '.env.example')
    shutil.copy2(ROOT / 'deploy/HOSTINGER-UPLOAD.md', frontend / 'README.md')

    for item in ['server', 'database', 'src/assets/gallery']:
        copy(item, backend)
    shutil.rmtree(backend / 'server/tests')
    for key in ['mini-lawn-ceremony', 'mini-lawn-dining', 'mini-lawn-stage']:
        copy(f'src/assets/{key}.webp', backend)
    lock = json.loads((ROOT / 'package-lock.json').read_text())
    deps = ['@aws-sdk/client-s3', 'bcryptjs', 'dotenv', 'express', 'express-mysql-session',
            'express-rate-limit', 'express-session', 'helmet', 'multer', 'mysql2', 'sharp', 'zod']
    api_package = {
        'name': 'mauli-lawns-api', 'version': '1.0.0', 'private': True, 'type': 'module',
        'engines': {'node': '24.x'},
        'scripts': {
            'build': 'node --check server/index.js', 'start': 'node server/index.js',
            'db:migrate': 'node server/setup.js', 'db:admin': 'node server/setup.js --admin',
            'db:import-client-gallery': 'node server/import-client-gallery.js',
            'db:import-mini-photos': 'node server/import-mini-photos.js',
        },
        'dependencies': {key: lock['packages']['node_modules/' + key]['version'] for key in deps},
    }
    (backend / 'package.json').write_text(json.dumps(api_package, indent=2) + '\n')
    shutil.copy2(ROOT / 'deploy/hostinger.env.example', backend / '.env.example')
    shutil.copy2(ROOT / 'deploy/HOSTINGER-UPLOAD.md', backend / 'README.md')
    subprocess.run(['npm', 'install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund'], cwd=backend, check=True)
    archive(frontend, output / 'mauli-frontend.zip')
    archive(backend, output / 'mauli-backend.zip')

for source, filename in [
    ('database/mauli-lawns-hostinger.sql', 'mauli-lawns-hostinger.sql'),
    ('deploy/hostinger.env.example', 'backend.env.example'),
    ('deploy/frontend.env.example', 'frontend.env.example'),
    ('deploy/HOSTINGER-UPLOAD.md', 'START-HERE.md'),
]:
    shutil.copy2(ROOT / source, output / filename)

files = ['mauli-frontend.zip', 'mauli-backend.zip', 'mauli-lawns-hostinger.sql',
         'backend.env.example', 'frontend.env.example', 'START-HERE.md']
(output / 'SHA256SUMS.txt').write_text(''.join(hashlib.sha256((output / f).read_bytes()).hexdigest() + '  ' + f + '\n' for f in files))
with zipfile.ZipFile(output / 'mauli-hostinger-all-files.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    for filename in [*files, 'SHA256SUMS.txt']:
        z.write(output / filename, filename)
print('Upload files prepared in: ' + str(output))
