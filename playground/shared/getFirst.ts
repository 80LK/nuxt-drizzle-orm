export default function getFirst<T>(arg: T | [T, ...T[]]): T {
	if (Array.isArray(arg))
		return arg[0];
	return arg;
}
