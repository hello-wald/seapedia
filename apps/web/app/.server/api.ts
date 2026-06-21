const API_URL = process.env.API_URL ?? "http://localhost:3000";

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function parseError(res: Response): Promise<string> {
	try {
		const body = (await res.json()) as { message?: string | string[] };
		if (Array.isArray(body.message)) return body.message.join(", ");
		return body.message ?? res.statusText;
	} catch {
		return res.statusText;
	}
}

async function sendJson<T>(
	method: string,
	path: string,
	body: unknown,
	token?: string,
): Promise<ApiResult<T>> {
	const res = await fetch(`${API_URL}${path}`, {
		method,
		headers: {
			"Content-Type": "application/json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
		body: JSON.stringify(body),
	});
	if (!res.ok) return { ok: false, error: await parseError(res) };
	return { ok: true, data: (await res.json()) as T };
}

export const postJson = <T>(path: string, body: unknown, token?: string) =>
	sendJson<T>("POST", path, body, token);

export const putJson = <T>(path: string, body: unknown, token?: string) =>
	sendJson<T>("PUT", path, body, token);

export async function deleteJson<T>(
	path: string,
	token?: string,
): Promise<ApiResult<T>> {
	const res = await fetch(`${API_URL}${path}`, {
		method: "DELETE",
		headers: token ? { Authorization: `Bearer ${token}` } : {},
	});
	if (!res.ok) return { ok: false, error: await parseError(res) };
	const text = await res.text();
	return { ok: true, data: (text ? JSON.parse(text) : null) as T };
}

export async function getJson<T>(
	path: string,
	token?: string,
): Promise<T | null> {
	const res = await fetch(`${API_URL}${path}`, {
		headers: token ? { Authorization: `Bearer ${token}` } : {},
	});
	if (!res.ok) return null;
	const text = await res.text();
	return text ? (JSON.parse(text) as T) : null;
}
