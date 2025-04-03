export type Result<T> = Ok<T> | Err;

export type Ok<T> = {
	ok: true;
	value: T;
};

export type Err = {
	ok: false;
	error: string;
	httpCode?: number;
};

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });

export const err = (error: string, httpCode?: number): Result<never> => ({
	ok: false,
	error,
	httpCode,
});

export const isOk = <T>(result: Result<T>): result is Ok<T> => result.ok;

export const isErr = <T>(result: Result<T>): result is Err => !result.ok;

export const unwrap = <T>(result: Result<T>): T => {
	if (isOk(result)) {
		return result.value;
	}
	throw new Error(result.error);
};

export const unwrapPromise = async <T>(
	fn: (() => Promise<Result<T>>) | Promise<Result<T>>,
): Promise<T> => {
	const result = await (typeof fn === "function" ? fn() : fn);
	return unwrap(result);
};
