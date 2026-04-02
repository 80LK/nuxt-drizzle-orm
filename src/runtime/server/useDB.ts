import { drizzle } from 'drizzle-orm/node-postgres';
import { type H3Event, useRuntimeConfig } from '#imports';

let db: ReturnType<typeof drizzle> | null = null;

export function useDB() {
	if (!db) {
		db = drizzle(useRuntimeConfig().drizzle.url!);
	}
	return db;
}
