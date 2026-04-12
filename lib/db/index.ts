import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Fall back to a placeholder URL during Next.js build — actual queries will fail at
// runtime if DATABASE_URL is missing, but module-level initialisation won't throw.
const sql = neon(process.env.DATABASE_URL ?? "postgresql://build:build@build/build");
export const db = drizzle(sql, { schema });

export type DB = typeof db;
