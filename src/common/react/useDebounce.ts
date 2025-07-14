import { useCallback, useEffect, useRef } from "react";

const useDebounce = (callback: Function, delay: number) => {
	const timeoutRef = useRef(setTimeout(() => {}));

	const debouncedCallback = useCallback(
		(...args: any) => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			timeoutRef.current = setTimeout(() => {
				callback(...args);
			}, delay);
		},
		[callback, delay],
	);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	return debouncedCallback;
};
