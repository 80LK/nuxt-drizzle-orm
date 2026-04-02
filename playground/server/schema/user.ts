import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

const users = pgTable('users', {
	id: serial().primaryKey(),
	name: varchar({ length: 32 }).notNull()
});

export default users;
