import { asc } from "drizzle-orm";
import projects from "~/server/drizzle/projects"

export default defineEventHandler(async event => {
	const query = getQuery<{
		limit?: string;
		offset?: string;
	}>(event);

	const limit = query['limit'] ? parseInt(query['limit']) : 10;
	const offset = query['offset'] ? parseInt(query['offset']) : 0;

	const db = useDB();
	const items = await db
		.select()
		.from(projects)
		.orderBy(asc(projects.id))
		.limit(limit)
		.offset(offset)
		.finally();


	const total = await db.$count(projects).finally();

	return { items, total }
})
