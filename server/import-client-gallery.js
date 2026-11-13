// Repeat-safe publication of the client photo collection stored with the source.
import { readFile } from 'node:fs/promises';
import { getConfig } from './config.js';
import { createPool, rows } from './db.js';
import { createStorage } from './storage.js';
const config = getConfig();
const db = createPool(config.databaseUrl);
const storage = createStorage(config);
try {
  const photos = JSON.parse(await readFile(new URL('../src/assets/gallery/manifest.json', import.meta.url), 'utf8'));
  const [admin] = await rows(db, 'SELECT id FROM admins WHERE is_active=1 ORDER BY id LIMIT 1');
  if (!admin) throw new Error('Create an admin account before importing photographs.');
  const categories = await rows(db, 'SELECT id,slug FROM gallery_categories');
  let added = 0;
  for (const [index, photo] of photos.entries()) {
    const category = categories.find((c) => c.slug === photo.category);
    if (!category) throw new Error(`Missing gallery category: ${photo.category}`);
    const [existing] = await rows(db, 'SELECT id FROM gallery_images WHERE original_filename=?', [photo.originalFilename]);
    if (existing) {
      await rows(db, 'UPDATE gallery_images SET is_featured=?,display_order=? WHERE id=?', [photo.featured, index, existing.id]);
      continue;
    }
    const buffer = await readFile(new URL(`../src/assets/gallery/${photo.file}`, import.meta.url));
    const asset = await storage.optimize({buffer, size:buffer.length, originalname:photo.originalFilename});
    const fields = {...asset,category_id:category.id,title:photo.title,caption:photo.title,alt_text:photo.title,status:'published',display_order:index,is_featured:photo.featured,uploaded_by:admin.id};
    try {
      await rows(db, `INSERT INTO gallery_images (${Object.keys(fields).join(',')}) VALUES (${Object.keys(fields).map(()=>'?').join(',')})`, Object.values(fields));
      added++;
    } catch (error) {
      await Promise.allSettled([storage.remove(asset.image_storage_key),storage.remove(asset.thumbnail_storage_key)]);
      throw error;
    }
  }
  console.log(`Published ${added} new client photographs; existing gallery content preserved.`);
} finally { await db.end(); }
