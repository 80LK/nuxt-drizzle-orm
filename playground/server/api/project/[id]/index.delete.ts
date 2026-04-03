import { eq } from "drizzle-orm";
import projects from "~/server/drizzle/projects"

export default defineEventHandler(async event => {
	const { id: raw_id } = getRouterParams(event);

	const id = parseInt(raw_id ?? 'NaN');
	if (isNaN(id)) {
		throw createError('Not found');
	}

	const db = useDB();

	try {
		const res = await db.delete(projects).where(eq(projects.id, id)).finally();
		return { success: res.rowCount ? res.rowCount > 0 : false }
	} catch {
		return { success: false }
	}
})
