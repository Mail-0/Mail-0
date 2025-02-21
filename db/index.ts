import { PrismaClient } from "@prisma/client";
import { env } from "@/lib/env";
import postgres from "postgres";
const prisma = new PrismaClient();
/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn = globalForDb.conn ?? postgres(env.DATABASE_URL!);
if (env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = prisma;
