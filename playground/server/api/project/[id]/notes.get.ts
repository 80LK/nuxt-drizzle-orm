import { asc, eq } from "drizzle-orm";
import notes from "~/server/drizzle/notes";

export default defineEventHandler(async event => {
	const query = getQuery<{
		limit?: string;
		offset?: string;
	}>(event);

	const { id: raw_id } = getRouterParams(event);

	const id = parseInt(raw_id ?? 'NaN');
	if (isNaN(id)) {
		throw createError('Not found');
	}

	const limit = query['limit'] ? parseInt(query['limit']) : 10;
	const offset = query['offset'] ? parseInt(query['offset']) : 0;

	const db = useDB();
	const items = await db
		.select()
		.from(notes)
		.where(eq(notes.projectId, id))
		.orderBy(asc(notes.id))
		.limit(limit)
		.offset(offset)
		.finally();


	const total = await db.$count(notes, eq(notes.projectId, id)).finally();

	return { items, total }
})
