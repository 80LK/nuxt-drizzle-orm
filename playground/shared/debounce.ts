const debounce = function <F extends Function, T>(func: F, delay: number = 1000) {
	let inDebounce: NodeJS.Timeout;
	return function (this: T) {
		clearTimeout(inDebounce);
		inDebounce = setTimeout(() => func.apply(this, arguments), delay);
	};
};

export default debounce;
