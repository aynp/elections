import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

console.log(Bun.env.DB_URI)

export const migrationClient = postgres(process.env.DB_URI, { max: 1 });
export const migrate_db = drizzle(migrationClient);

export const queryClient = postgres(process.env.DB_URI, { max: 10 });
export const db = drizzle(queryClient);
