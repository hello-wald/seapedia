import { postForm } from "./api";

export function uploadImage(token: string, file: File) {
	const form = new FormData();
	form.append("image", file);
	return postForm<{ url: string }>("/api/uploads/image", form, token);
}
