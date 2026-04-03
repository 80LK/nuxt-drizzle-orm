import { integer, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import projects from "./projects";

const notes = pgTable('notes', {
	id: serial().primaryKey(),
	title: varchar({ length: 32 }).notNull(),
	text: text().notNull(),
	projectId: integer().notNull().references(() => projects.id, { onDelete: 'cascade' })
});

export default notes;
