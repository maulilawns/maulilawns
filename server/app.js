import express from "express";
import session from "express-session";
import MySQLStoreFactory from "express-mysql-session";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import multer from "multer";
import bcrypt from "bcryptjs";
import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { rows, transaction } from "./db.js";
import { createStorage } from "./storage.js";
const fail = (status, message) => {
  throw Object.assign(new Error(message), { status });
};
const id = z.coerce.number().int().positive();
const text = (max) => z.string().trim().max(max);
const bool = z.preprocess(
  (v) => (v === "true" || v === "1" ? true : v === "false" || v === "0" ? false : v),
  z.boolean(),
);
const categorySchema = z.object({
  name: text(120)
    .min(1)
    .refine((v) => v.toLowerCase() !== "all", "All is an automatic filter."),
  slug: text(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: text(5000).default(""),
  display_order: z.coerce.number().int().min(0).default(0),
  is_active: bool.default(true),
});
const imageSchema = z.object({
  title: text(200).min(1),
  category_id: id,
  caption: text(5000).default(""),
  alt_text: text(500).default(""),
  is_featured: bool.default(false),
  status: z.enum(["draft", "published"]).default("draft"),
  display_order: z.coerce.number().int().min(0).default(0),
});
const safeAdmin = (a) => ({
  id: a.id,
  username: a.username,
  full_name: a.full_name,
  email: a.email,
});
const csrfEqual = (a, b) =>
  typeof a === "string" &&
  typeof b === "string" &&
  Buffer.byteLength(a) === Buffer.byteLength(b) &&
  timingSafeEqual(Buffer.from(a), Buffer.from(b));
export function createApp(config, db, options = {}) {
  const app = express(),
    storage = options.storage || createStorage(config);
  app.disable("x-powered-by");
  app.set("trust proxy", config.trustProxy);
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use((req, res, next) => {
    const origin = req.get("origin");
    if (origin && !config.origins.includes(origin))
      return res.status(403).json({ error: "Origin is not allowed." });
    if (origin) {
      res.set("Access-Control-Allow-Origin", origin);
      res.set("Access-Control-Allow-Credentials", "true");
      res.vary("Origin");
    }
    res.set("Access-Control-Allow-Headers", "Content-Type, X-CSRF-Token");
    res.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
  app.use(express.json({ limit: "128kb" }));
  app.get("/health", async (req, res) => {
    await db.query("SELECT 1");
    res.set("Cache-Control", "no-store").json({ data: { ready: true } });
  });
  if (config.storageDriver === "local")
    app.use(
      "/uploads",
      express.static(config.storagePath, { immutable: true, maxAge: "1y", dotfiles: "deny" }),
    );
  const Store = MySQLStoreFactory(session);
  const sessionStore = options.sessionStore || new Store({ createDatabaseTable: true }, db);
  app.use("/api/admin", async (req, res, next) => {
    await sessionStore.onReady?.();
    next();
  });
  app.use(
    "/api/admin",
    session({
      name: "mauli.sid",
      secret: config.sessionSecret,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: config.production,
        sameSite: "lax",
        maxAge: 8 * 60 * 60 * 1000,
      },
    }),
  );
  app.use("/api/admin", (req, res, next) => {
    res.set("Cache-Control", "no-store");
    if (
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      (!req.get("origin") ||
        !config.origins.includes(req.get("origin")) ||
        !csrfEqual(req.get("x-csrf-token"), req.session.csrf))
    )
      return res.status(403).json({ error: "Your session expired. Refresh and try again." });
    next();
  });
  app.get("/api/admin/auth/csrf", (req, res) => {
    req.session.csrf ||= randomBytes(32).toString("hex");
    res.json({ data: { csrf: req.session.csrf } });
  });
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many sign-in attempts. Try again later." },
  });
  app.post("/api/admin/auth/login", limiter, async (req, res) => {
    const input = z
      .object({ username: text(80).min(1), password: z.string().min(1).max(128) })
      .parse(req.body);
    const bucket = createHash("sha256")
      .update(`${req.ip}:${input.username.toLowerCase()}`)
      .digest("hex");
    const attempts = await rows(
      db,
      "SELECT failures FROM login_attempts WHERE bucket=? AND reset_at>NOW()",
      [bucket],
    );
    if (attempts[0]?.failures >= 8)
      fail(429, "Too many sign-in attempts. Try again in 15 minutes.");
    const [admin] = await rows(db, "SELECT * FROM admins WHERE username=? AND is_active=1", [
      input.username,
    ]);
    const valid = await bcrypt.compare(
      input.password,
      admin?.password_hash || "$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW",
    );
    if (!admin || !valid) {
      await rows(
        db,
        "INSERT INTO login_attempts(bucket,failures,reset_at) VALUES (?,1,DATE_ADD(NOW(),INTERVAL 15 MINUTE)) ON DUPLICATE KEY UPDATE failures=IF(reset_at<NOW(),1,failures+1), reset_at=IF(reset_at<NOW(),DATE_ADD(NOW(),INTERVAL 15 MINUTE),reset_at)",
        [bucket],
      );
      fail(401, "Username or password is incorrect.");
    }
    await new Promise((resolve, reject) =>
      req.session.regenerate((e) => (e ? reject(e) : resolve())),
    );
    req.session.adminId = admin.id;
    req.session.version = admin.session_version;
    req.session.csrf = randomBytes(32).toString("hex");
    await rows(db, "UPDATE admins SET last_login_at=NOW() WHERE id=?", [admin.id]);
    await rows(db, "DELETE FROM login_attempts WHERE bucket=?", [bucket]);
    res.json({ data: { admin: safeAdmin(admin), csrf: req.session.csrf } });
  });
  app.use("/api/admin", async (req, res, next) => {
    const [a] = req.session.adminId
      ? await rows(db, "SELECT * FROM admins WHERE id=? AND is_active=1", [req.session.adminId])
      : [];
    if (!a || a.session_version !== req.session.version)
      return res.status(401).json({ error: "Please sign in to continue." });
    req.admin = a;
    next();
  });
  app.get("/api/admin/auth/me", (req, res) => res.json({ data: safeAdmin(req.admin) }));
  app.post("/api/admin/auth/logout", (req, res, next) =>
    req.session.destroy((e) => {
      if (e) return next(e);
      res.clearCookie("mauli.sid", { httpOnly: true, secure: config.production, sameSite: "lax" });
      res.json({ data: { success: true } });
    }),
  );
  app.put("/api/admin/account", async (req, res) => {
    const v = z.object({ full_name: text(160).min(1), email: text(254).email() }).parse(req.body);
    await rows(db, "UPDATE admins SET full_name=?,email=? WHERE id=?", [
      v.full_name,
      v.email,
      req.admin.id,
    ]);
    res.json({ data: { ...safeAdmin(req.admin), ...v } });
  });
  app.put("/api/admin/account/password", async (req, res) => {
    const v = z
      .object({
        current_password: z.string().max(128),
        new_password: z
          .string()
          .min(12)
          .max(72)
          .regex(/[a-z]/)
          .regex(/[A-Z]/)
          .regex(/[0-9]/)
          .refine((v) => Buffer.byteLength(v) <= 72, "Use at most 72 UTF-8 bytes."),
        confirm_password: z.string(),
      })
      .refine((v) => v.new_password === v.confirm_password, "Passwords do not match.")
      .parse(req.body);
    if (!(await bcrypt.compare(v.current_password, req.admin.password_hash)))
      fail(422, "Current password is incorrect.");
    await rows(
      db,
      "UPDATE admins SET password_hash=?,session_version=session_version+1 WHERE id=?",
      [await bcrypt.hash(v.new_password, 12), req.admin.id],
    );
    req.session.version = req.admin.session_version + 1;
    res.json({ data: { success: true } });
  });
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: config.maxUploadBytes, files: 20, fields: 25, fieldSize: 128 * 1024 },
  });
  const catBase =
    "SELECT c.*, (SELECT COUNT(*) FROM gallery_images i WHERE i.category_id=c.id) AS image_count FROM gallery_categories c";
  app.get("/api/admin/gallery/categories", async (req, res) =>
    res.json({ data: await rows(db, catBase + " ORDER BY display_order,id") }),
  );
  const reorder = (table) => async (req, res) => {
    const v = z.object({ ids: z.array(id).min(1).max(1000) }).parse(req.body);
    if (new Set(v.ids).size !== v.ids.length) fail(422, "Duplicate IDs.");
    await transaction(db, async (conn) => {
      for (const [order, key] of v.ids.entries()) {
        const r = await rows(conn, `UPDATE ${table} SET display_order=? WHERE id=?`, [order, key]);
        if (!r.affectedRows) fail(404, "Entry not found.");
      }
    });
    res.json({ data: { success: true } });
  };
  app.patch("/api/admin/gallery/categories/reorder", reorder("gallery_categories"));
  app.post("/api/admin/gallery/categories", upload.single("thumbnail"), async (req, res) => {
    const v = categorySchema.parse(req.body),
      asset = req.file ? await storage.optimize(req.file) : null;
    try {
      const result = await transaction(db, async (conn) => {
        const inserted = await rows(
          conn,
          "INSERT INTO gallery_categories(name,slug,description,display_order,is_active,thumbnail_url,thumbnail_storage_key) VALUES (?,?,?,?,?,?,?)",
          [
            v.name,
            v.slug,
            v.description,
            v.display_order,
            v.is_active,
            asset?.thumbnail_url || null,
            asset?.thumbnail_storage_key || null,
          ],
        );
        if (asset) await queueCleanup(conn, [asset.image_storage_key]);
        return inserted;
      });
      res.status(201).json({ data: { id: result.insertId, ...v } });
    } catch (e) {
      if (asset)
        await Promise.allSettled([
          storage.remove(asset.image_storage_key),
          storage.remove(asset.thumbnail_storage_key),
        ]);
      throw e;
    }
  });
  async function queueCleanup(conn, keys) {
    for (const key of keys.filter(Boolean))
      await rows(conn, "INSERT IGNORE INTO storage_cleanup(storage_key) VALUES (?)", [key]);
  }
  app.put("/api/admin/gallery/categories/:id", upload.single("thumbnail"), async (req, res) => {
    const key = id.parse(req.params.id),
      v = categorySchema.parse(req.body);
    const asset = req.file ? await storage.optimize(req.file) : null;
    try {
      await transaction(db, async (conn) => {
        const [old] = await rows(conn, "SELECT * FROM gallery_categories WHERE id=? FOR UPDATE", [
          key,
        ]);
        if (!old) fail(404, "Category not found.");
        await rows(
          conn,
          "UPDATE gallery_categories SET name=?,slug=?,description=?,display_order=?,is_active=?,thumbnail_url=?,thumbnail_storage_key=? WHERE id=?",
          [
            v.name,
            v.slug,
            v.description,
            v.display_order,
            v.is_active,
            asset?.thumbnail_url || old.thumbnail_url,
            asset?.thumbnail_storage_key || old.thumbnail_storage_key,
            key,
          ],
        );
        if (asset) await queueCleanup(conn, [old.thumbnail_storage_key, asset.image_storage_key]);
      });
    } catch (e) {
      if (asset)
        await Promise.allSettled([
          storage.remove(asset.image_storage_key),
          storage.remove(asset.thumbnail_storage_key),
        ]);
      throw e;
    }
    res.json({ data: { id: key, ...v } });
  });
  app.delete("/api/admin/gallery/categories/:id", async (req, res) => {
    const key = id.parse(req.params.id),
      target = req.body?.reassign_to ? id.parse(req.body.reassign_to) : null;
    if (target === key) fail(422, "Choose a different category.");
    await transaction(db, async (conn) => {
      const [old] = await rows(conn, "SELECT * FROM gallery_categories WHERE id=? FOR UPDATE", [
        key,
      ]);
      if (!old) fail(404, "Category not found.");
      if (target) {
        if (
          !(await rows(conn, "SELECT id FROM gallery_categories WHERE id=? FOR UPDATE", [target]))
            .length
        )
          fail(422, "Destination category not found.");
        await rows(conn, "UPDATE gallery_images SET category_id=? WHERE category_id=?", [
          target,
          key,
        ]);
      }
      if (
        (await rows(conn, "SELECT id FROM gallery_images WHERE category_id=? LIMIT 1", [key]))
          .length
      )
        fail(409, "Reassign the images before deleting this category.");
      await rows(conn, "DELETE FROM gallery_categories WHERE id=?", [key]);
      await queueCleanup(conn, [old.thumbnail_storage_key]);
    });
    res.json({ data: { success: true } });
  });
  const listQuery = z.object({
    page: z.coerce.number().int().min(1).max(100000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(24),
    category_id: id.optional(),
    search: text(200).optional(),
    status: z.enum(["draft", "published"]).optional(),
    sort: z.enum(["newest", "oldest", "display_order"]).default("display_order"),
  });
  const imageBase = " FROM gallery_images i JOIN gallery_categories c ON c.id=i.category_id";
  async function listImages(req, res, isPublic = false, featured = false) {
    const q = listQuery.parse(req.query),
      where = [],
      params = [];
    if (isPublic) where.push("i.status='published' AND c.is_active=1");
    if (q.category_id) {
      where.push("i.category_id=?");
      params.push(q.category_id);
    }
    if (q.search) {
      where.push("i.title LIKE ?");
      params.push(`%${q.search}%`);
    }
    if (q.status && !isPublic) {
      where.push("i.status=?");
      params.push(q.status);
    }
    const filter = where.length ? " WHERE " + where.join(" AND ") : "";
    const [count] = await rows(db, "SELECT COUNT(*) total" + imageBase + filter, params);
    const order = featured
      ? "i.is_featured DESC,i.display_order ASC,i.id DESC"
      : q.sort === "newest"
        ? "i.created_at DESC,i.id DESC"
        : q.sort === "oldest"
          ? "i.created_at ASC,i.id ASC"
          : "i.display_order ASC,i.id DESC";
    const fields = isPublic
      ? "i.id,i.category_id,i.title,i.caption,i.alt_text,i.image_url,i.thumbnail_url,i.width,i.height,i.is_featured,i.display_order"
      : "i.*";
    const data = await rows(
      db,
      `SELECT ${fields},c.name category${imageBase}${filter} ORDER BY ${order} LIMIT ${q.limit} OFFSET ${(q.page - 1) * q.limit}`,
      params,
    );
    res.json({ data, pagination: { page: q.page, limit: q.limit, total: Number(count.total) } });
  }
  app.get("/api/admin/gallery/images", (req, res) => listImages(req, res));
  app.patch("/api/admin/gallery/images/reorder", reorder("gallery_images"));
  async function ensureCategory(key) {
    if (!(await rows(db, "SELECT id FROM gallery_categories WHERE id=?", [key])).length)
      fail(422, "Choose an existing category.");
  }
  async function insertImage(file, raw, admin) {
    const v = imageSchema.parse(raw);
    await ensureCategory(v.category_id);
    const asset = await storage.optimize(file);
    try {
      const fields = { ...v, ...asset, uploaded_by: admin.id };
      const result = await rows(
        db,
        `INSERT INTO gallery_images (${Object.keys(fields).join(",")}) VALUES (${Object.keys(fields)
          .map(() => "?")
          .join(",")})`,
        Object.values(fields),
      );
      return { id: result.insertId, ...fields };
    } catch (e) {
      await Promise.allSettled([
        storage.remove(asset.image_storage_key),
        storage.remove(asset.thumbnail_storage_key),
      ]);
      throw e;
    }
  }
  app.post("/api/admin/gallery/images", upload.single("image"), async (req, res) =>
    res.status(201).json({ data: await insertImage(req.file, req.body, req.admin) }),
  );
  app.post(
    "/api/admin/gallery/images/bulk-upload",
    upload.array("images", 20),
    async (req, res) => {
      let meta;
      try {
        meta = JSON.parse(req.body.metadata || "[]");
      } catch {
        fail(422, "Invalid image metadata.");
      }
      if (!req.files?.length || !Array.isArray(meta) || meta.length !== req.files.length)
        fail(422, "Provide metadata for each image.");
      const data = [];
      for (const [index, file] of req.files.entries()) {
        try {
          data.push({
            index,
            success: true,
            image: await insertImage(file, meta[index], req.admin),
          });
        } catch (e) {
          data.push({
            index,
            success: false,
            error:
              e.status || e instanceof z.ZodError
                ? "Invalid image or metadata."
                : "Upload failed. Please retry this photograph.",
          });
        }
      }
      res.status(207).json({ data });
    },
  );
  app.put("/api/admin/gallery/images/:id", upload.single("image"), async (req, res) => {
    const key = id.parse(req.params.id),
      v = imageSchema.parse(req.body);
    await ensureCategory(v.category_id);
    const asset = req.file ? await storage.optimize(req.file) : {};
    try {
      await transaction(db, async (conn) => {
        const [old] = await rows(conn, "SELECT * FROM gallery_images WHERE id=? FOR UPDATE", [key]);
        if (!old) fail(404, "Image not found.");
        const fields = { ...v, ...asset };
        await rows(
          conn,
          `UPDATE gallery_images SET ${Object.keys(fields)
            .map((k) => k + "=?")
            .join(",")} WHERE id=?`,
          [...Object.values(fields), key],
        );
        if (req.file) await queueCleanup(conn, [old.image_storage_key, old.thumbnail_storage_key]);
      });
    } catch (e) {
      if (req.file)
        await Promise.allSettled([
          storage.remove(asset.image_storage_key),
          storage.remove(asset.thumbnail_storage_key),
        ]);
      throw e;
    }
    res.json({ data: { id: key, ...v, ...asset } });
  });
  app.patch("/api/admin/gallery/images/:id/status", async (req, res) => {
    const v = z.object({ status: z.enum(["draft", "published"]) }).parse(req.body);
    const result = await rows(db, "UPDATE gallery_images SET status=? WHERE id=?", [
      v.status,
      id.parse(req.params.id),
    ]);
    if (!result.affectedRows) fail(404, "Image not found.");
    res.json({ data: v });
  });
  app.delete("/api/admin/gallery/images/:id", async (req, res) => {
    await transaction(db, async (conn) => {
      const key = id.parse(req.params.id),
        [old] = await rows(conn, "SELECT * FROM gallery_images WHERE id=? FOR UPDATE", [key]);
      if (!old) fail(404, "Image not found.");
      await rows(conn, "DELETE FROM gallery_images WHERE id=?", [key]);
      await queueCleanup(conn, [old.image_storage_key, old.thumbnail_storage_key]);
    });
    res.json({ data: { success: true } });
  });
  app.get("/api/admin/dashboard/stats", async (req, res) => {
    const [counts] = await rows(
      db,
      "SELECT COUNT(*) total_images,COALESCE(SUM(status='published'),0) published_images,COALESCE(SUM(status='draft'),0) draft_images FROM gallery_images",
    );
    const categories = await rows(db, catBase + " ORDER BY display_order,id");
    const recent = await rows(
      db,
      "SELECT i.*,c.name category" + imageBase + " ORDER BY i.created_at DESC,i.id DESC LIMIT 6",
    );
    res.json({ data: { ...counts, total_categories: categories.length, categories, recent } });
  });
  app.use("/api/public", (req, res, next) => {
    res.set("Cache-Control", "public, max-age=0, must-revalidate");
    next();
  });
  app.get("/api/public/gallery/categories", async (req, res) =>
    res.json({
      data: await rows(
        db,
        "SELECT id,name,slug,description,thumbnail_url,display_order FROM gallery_categories WHERE is_active=1 ORDER BY display_order,id",
      ),
    }),
  );
  app.get("/api/public/gallery/images", (req, res) => listImages(req, res, true));
  app.get("/api/public/gallery/featured", (req, res) => listImages(req, res, true, true));
  app.use((req, res) => res.status(404).json({ error: "Endpoint not found." }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error instanceof z.ZodError)
      return res
        .status(422)
        .json({ error: error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(" ") });
    if (error instanceof multer.MulterError)
      return res.status(422).json({
        error:
          error.code === "LIMIT_FILE_SIZE"
            ? `Each image must be under ${config.maxUploadBytes / 1024 / 1024} MB.`
            : "Too many files or invalid upload fields.",
      });
    if (error.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "That slug or username already exists." });
    if (error.code === "ER_ROW_IS_REFERENCED_2")
      return res.status(409).json({ error: "Reassign the images before deleting this category." });
    const status = error.status >= 400 && error.status < 500 ? error.status : 500;
    if (status === 500) console.error("API operation failed", error.code || error.name);
    res.status(status).json({
      error: status === 500 ? "Unable to complete this request. Please try again." : error.message,
    });
  });
  return app;
}
