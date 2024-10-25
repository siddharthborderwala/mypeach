import { useEffect, useState } from "react";

export const useDebounce = <T>(value: T, delay: number) => {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);
	}, [value, delay]);

	return debouncedValue;
};
