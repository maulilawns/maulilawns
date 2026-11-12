import mysql from "mysql2/promise";
export function createPool(url) {
  let parsed;
  try {
    parsed = new URL(url);
    if (parsed.protocol !== "mysql:" || !parsed.hostname || !parsed.pathname.slice(1))
      throw new Error();
  } catch {
    throw new Error("DATABASE_URL must be a valid MySQL connection URL.");
  }
  return mysql.createPool({
    host: parsed.hostname,
    port: Number(parsed.port || 3306),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.slice(1),
    connectionLimit: 10,
    timezone: "Z",
    charset: "utf8mb4",
    ssl: parsed.searchParams.get("ssl") === "true" ? { rejectUnauthorized: true } : undefined,
  });
}
export async function rows(db, sql, values = []) {
  const [result] = await db.execute(sql, values);
  return result;
}
export async function transaction(pool, work) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}
