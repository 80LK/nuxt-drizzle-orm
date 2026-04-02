export default defineEventHandler(event => {
	const db = useDB();

	console.log(db);

	return "Hello, World!";
})
