import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

const projects = pgTable("projects", {
	id: serial().primaryKey(),
	name: varchar({ length: 32 }).notNull(),
});

export default projects;
