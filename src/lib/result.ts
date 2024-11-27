export type Result<T> = Ok<T> | Err;

export type Ok<T> = {
	ok: true;
	value: T;
};

export type Err = {
	ok: false;
	error: string;
};

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });

export const err = (error: string): Result<never> => ({ ok: false, error });

export const isOk = <T>(result: Result<T>): result is Ok<T> => result.ok;

export const isErr = <T>(result: Result<T>): result is Err => !result.ok;
