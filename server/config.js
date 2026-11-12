import "dotenv/config";
import path from "node:path";
export function getConfig(env = process.env) {
  const production = env.NODE_ENV === "production";
  const config = {
    production,
    port: Number(env.API_PORT || 3001),
    databaseUrl: env.DATABASE_URL,
    sessionSecret: env.SESSION_SECRET,
    origins: (env.APP_ORIGINS || "http://localhost:8080").split(",").map((x) => x.trim()),
    maxUploadBytes: Number(env.MAX_UPLOAD_MB || 10) * 1024 * 1024,
    storageDriver: env.STORAGE_DRIVER || "local",
    storagePath: path.resolve(env.STORAGE_PATH || "./.data/uploads"),
    storageBaseUrl: env.STORAGE_PUBLIC_URL || "http://localhost:3001/uploads",
    persistentDisk: env.STORAGE_PERSISTENT_DISK === "true",
    s3: {
      region: env.S3_REGION || "auto",
      endpoint: env.S3_ENDPOINT || undefined,
      bucket: env.S3_BUCKET,
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
    trustProxy: Number(env.TRUST_PROXY_HOPS || 0),
  };
  if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535)
    throw new Error("API_PORT must be a valid port.");
  if (!Number.isInteger(config.trustProxy) || config.trustProxy < 0)
    throw new Error("TRUST_PROXY_HOPS must be a nonnegative integer.");
  if (
    !Number.isFinite(config.maxUploadBytes) ||
    config.maxUploadBytes <= 0 ||
    config.maxUploadBytes > 50 * 1024 * 1024
  )
    throw new Error("MAX_UPLOAD_MB must be between 0 and 50.");
  if (!config.databaseUrl) throw new Error("DATABASE_URL is required. See .env.example.");
  if (!config.sessionSecret || config.sessionSecret.length < 32)
    throw new Error("SESSION_SECRET must contain at least 32 characters.");
  if (!["local", "s3"].includes(config.storageDriver)) throw new Error("Invalid STORAGE_DRIVER.");
  if (production && config.storageDriver === "local" && !config.persistentDisk)
    throw new Error(
      "Production local storage requires a mounted persistent disk and STORAGE_PERSISTENT_DISK=true.",
    );
  if (config.storageDriver === "s3" && !config.s3.bucket) throw new Error("S3_BUCKET is required.");
  if (
    production &&
    (config.origins.some((x) => !x.startsWith("https://")) ||
      !config.storageBaseUrl.startsWith("https://"))
  )
    throw new Error("Production origins and image URLs must use HTTPS.");
  return config;
}
