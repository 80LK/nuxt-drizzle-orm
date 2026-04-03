import { drizzle } from "drizzle-orm/node-postgres";
import { useRuntimeConfig } from "#imports";
let db = null;
export function useDB() {
  if (!db) {
    db = drizzle(useRuntimeConfig().drizzle.url);
  }
  return db;
}
