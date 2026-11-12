import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
export function imageSignature(buffer) {
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpeg";
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "png";
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP")
    return "webp";
  return null;
}
export function createStorage(config) {
  const s3 =
    config.storageDriver === "s3"
      ? new S3Client({
          region: config.s3.region,
          endpoint: config.s3.endpoint,
          credentials: config.s3.accessKeyId
            ? { accessKeyId: config.s3.accessKeyId, secretAccessKey: config.s3.secretAccessKey }
            : undefined,
        })
      : null;
  function safe(key) {
    if (!/^[a-zA-Z0-9-]+\.webp$/.test(key)) throw new Error("Invalid storage key");
    return key;
  }
  async function put(key, body) {
    safe(key);
    if (s3)
      await s3.send(
        new PutObjectCommand({
          Bucket: config.s3.bucket,
          Key: key,
          Body: body,
          ContentType: "image/webp",
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );
    else {
      await mkdir(config.storagePath, { recursive: true });
      await writeFile(path.join(config.storagePath, key), body, { flag: "wx" });
    }
  }
  async function remove(key) {
    safe(key);
    if (s3) await s3.send(new DeleteObjectCommand({ Bucket: config.s3.bucket, Key: key }));
    else
      await unlink(path.join(config.storagePath, key)).catch((e) => {
        if (e.code !== "ENOENT") throw e;
      });
  }
  async function optimize(file) {
    if (!file || file.size > config.maxUploadBytes || !imageSignature(file.buffer))
      throw Object.assign(new Error("Choose a JPG, PNG or WEBP image within the size limit."), {
        status: 422,
      });
    let full, thumb;
    try {
      const input = sharp(file.buffer, {
        limitInputPixels: 40000000,
        failOn: "warning",
        animated: false,
      });
      const meta = await input.metadata();
      if (!["jpeg", "png", "webp"].includes(meta.format) || (meta.pages || 1) > 1)
        throw new Error("Unsupported image");
      full = await input
        .clone()
        .rotate()
        .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 84 })
        .toBuffer({ resolveWithObject: true });
      thumb = await input
        .clone()
        .rotate()
        .resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 78 })
        .toBuffer();
    } catch {
      throw Object.assign(
        new Error("Invalid or unsupported image. Use a non-animated JPG, PNG or WEBP."),
        { status: 422 },
      );
    }
    const id = randomUUID(),
      imageKey = `${id}.webp`,
      thumbKey = `${id}-thumb.webp`;
    try {
      await put(imageKey, full.data);
      await put(thumbKey, thumb);
    } catch (error) {
      await Promise.allSettled([remove(imageKey), remove(thumbKey)]);
      throw error;
    }
    return {
      image_url: `${config.storageBaseUrl}/${imageKey}`,
      image_storage_key: imageKey,
      thumbnail_url: `${config.storageBaseUrl}/${thumbKey}`,
      thumbnail_storage_key: thumbKey,
      mime_type: "image/webp",
      file_size: full.data.length,
      width: full.info.width,
      height: full.info.height,
      original_filename: path.basename(file.originalname).slice(0, 255),
    };
  }
  return { optimize, remove };
}
