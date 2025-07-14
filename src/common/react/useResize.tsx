"use client";
import { useEffect, useRef, useState } from "react";

const useReSize = () => {
	const [width, setWidth] = useState(0);
	const [height, setHeight] = useState(0);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const ro = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const cr = entry.contentRect;

				setWidth(cr.width);
				setHeight(cr.height);
			}
		});

		if (ref.current !== null) {
			ro.observe(ref.current);
		}
	}, [ref]);

	return { height, ref, width };
};

export default useReSize;
