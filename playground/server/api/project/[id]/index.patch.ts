import { eq } from "drizzle-orm";
import projects from "~/server/drizzle/projects"

export default defineEventHandler(async event => {
	const { id: raw_id } = getRouterParams(event);
	const body = await readBody(event);
	console.log("Body:", body)

	const id = parseInt(raw_id ?? 'NaN');
	if (isNaN(id)) {
		throw createError('Not found');
	}

	const db = useDB();

	const result = await db.update(projects)
		.set(body as any)
		.where(eq(projects.id, id))
		.returning()
		.finally();

	return result[0];
})
