
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL_UNPOOLED;

if (!databaseUrl) {
  throw new Error("DATABASE_URL_UNPOOLED is missing.");
}

const globalForPersonnelDb = globalThis as typeof globalThis & {
  personnelAdminPool?: Pool;
};

export const personnelAdminPool =
  globalForPersonnelDb.personnelAdminPool ??
  new Pool({
    connectionString: databaseUrl,
    max: 5,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPersonnelDb.personnelAdminPool = personnelAdminPool;
}
