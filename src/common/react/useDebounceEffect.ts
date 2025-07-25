import { type DependencyList, useEffect } from "react";

export function useDebounceEffect(fn: () => void, waitTime: number, deps?: DependencyList) {
	useEffect(() => {
		const t = setTimeout(() => {
			// fn.apply(undefined, deps)
			// @ts-ignore
			fn.apply(undefined, deps);
		}, waitTime);

		return () => {
			clearTimeout(t);
		};
	}, deps);
}
