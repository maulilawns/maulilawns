// Repeat-safe import of the client's three unique Mini Lawn photographs.
import { readFile } from "node:fs/promises";
import { getConfig } from "./config.js";
import { createPool, rows } from "./db.js";
import { createStorage } from "./storage.js";
const config = getConfig(),
  db = createPool(config.databaseUrl),
  storage = createStorage(config);
const photos = [
  [
    "mini-lawn-ceremony",
    "Mini Lawn — pastel celebration and ceremony seating",
    "Pastel balloon backdrop, purple aisle carpet and white seating in the Mini Lawn garden",
  ],
  [
    "mini-lawn-dining",
    "Mini Lawn — garden dining arrangement",
    "Round dining tables with floral centerpieces and pastel balloon stage at Mini Lawn",
  ],
  [
    "mini-lawn-stage",
    "Mini Lawn — birthday stage and garden aisle",
    "Pastel balloon birthday backdrop, white seating and paved garden aisle at Mini Lawn",
  ],
];
try {
  const [admin] = await rows(db, "SELECT id FROM admins WHERE username=? AND is_active=1", [
    process.env.ADMIN_USERNAME || "",
  ]);
  const [category] = await rows(db, "SELECT id FROM gallery_categories WHERE slug='mini-lawn'");
  if (!admin || !category)
    throw new Error(
      "Set ADMIN_USERNAME to an existing admin and run the category migration first.",
    );
  for (const [key, title, alt] of photos) {
    const filename = `${key}-client.jpeg`;
    if (
      (await rows(db, "SELECT id FROM gallery_images WHERE original_filename=?", [filename])).length
    )
      continue;
    const buffer = await readFile(new URL(`../src/assets/${key}.webp`, import.meta.url));
    const asset = await storage.optimize({ buffer, size: buffer.length, originalname: filename });
    const fields = {
      ...asset,
      category_id: category.id,
      title,
      caption: "Mini Lawn at Mauli Lawns",
      alt_text: alt,
      status: "published",
      display_order: 0,
      is_featured: false,
      uploaded_by: admin.id,
    };
    try {
      await rows(
        db,
        `INSERT INTO gallery_images (${Object.keys(fields).join(",")}) VALUES (${Object.keys(fields)
          .map(() => "?")
          .join(",")})`,
        Object.values(fields),
      );
    } catch (error) {
      await Promise.allSettled([
        storage.remove(asset.image_storage_key),
        storage.remove(asset.thumbnail_storage_key),
      ]);
      throw error;
    }
  }
  console.log("Mini Lawn photographs are published; existing content was preserved.");
} finally {
  await db.end();
}
