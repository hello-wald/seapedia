import { useEffect, useState } from "react";
import { Form, redirect, useActionData, useNavigation } from "react-router";
import { createStoreSchema } from "@seapedia/shared";
import type { Route } from "./+types/home";
import { Button } from "~/components/ui/button";
import { Input, Textarea } from "~/components/ui/input";
import { tokenContext } from "~/.server/middleware";
import { getMyStore, saveStore } from "~/.server/stores";
import { ErrorBanner, SuccessBanner } from "~/components/ui/form-banner";

export function meta() {
	return [{ title: "Store · SEApedia" }];
}

export async function loader({ context }: Route.LoaderArgs) {
	const token = context.get(tokenContext);
	const store = token ? await getMyStore(token) : null;
	return { store };
}

export async function action({ request, context }: Route.ActionArgs) {
	const token = context.get(tokenContext);
	if (!token) throw redirect("/login");

	const formData = await request.formData();
	const parsed = createStoreSchema.safeParse({
		name: formData.get("name"),
		description: formData.get("description"),
	});
	if (!parsed.success) {
		return {
			formError: parsed.error.issues.map((i) => i.message).join(", "),
			ok: false,
		};
	}

	const result = await saveStore(token, parsed.data);
	if (!result.ok) {
		return { formError: result.error, ok: false };
	}

	return { formError: null, ok: true };
}

export default function SellerHome({ loaderData }: Route.ComponentProps) {
	const { store } = loaderData;
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const submitting = navigation.state === "submitting";

	const [name, setName] = useState(store?.name ?? "");
	const [description, setDescription] = useState(store?.description ?? "");
	useEffect(() => {
		setName(store?.name ?? "");
		setDescription(store?.description ?? "");
	}, [store?.name, store?.description, actionData]);

	const isUnchanged =
		name.trim() === (store?.name ?? "") &&
		description.trim() === (store?.description ?? "");
	const canSubmit = name.trim().length > 0 && !isUnchanged;

	return (
		<div>
			<h1 className="text-xl font-semibold text-gray-900">
				Store profile
			</h1>
			<p className="mt-2 text-sm text-muted">
				Your store is your public identity on SEApedia. Product
				management, incoming orders, and seller income arrive in later
				levels.
			</p>

			<Form method="post" className="mt-6 max-w-md space-y-4">
				{actionData?.ok && <SuccessBanner>Store saved.</SuccessBanner>}
				{actionData?.formError && (
					<ErrorBanner>{actionData.formError}</ErrorBanner>
				)}

				<div>
					<label
						htmlFor="name"
						className="mb-1.5 block text-sm font-medium text-gray-700"
					>
						Store name
					</label>
					<Input
						id="name"
						name="name"
						placeholder="e.g. Nusantara Goods"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
					/>
					<p className="mt-1 text-xs text-muted">
						Store names must be unique across SEApedia.
					</p>
				</div>

				<div>
					<label
						htmlFor="description"
						className="mb-1.5 block text-sm font-medium text-gray-700"
					>
						Description{" "}
						<span className="font-normal text-muted">
							(optional)
						</span>
					</label>
					<Textarea
						id="description"
						name="description"
						rows={3}
						maxLength={280}
						placeholder="Tell buyers what your store sells…"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>
					<p className="mt-1 text-right text-xs text-muted">
						{description.length}/280
					</p>
				</div>

				<Button type="submit" disabled={submitting || !canSubmit}>
					{submitting
						? "Saving…"
						: store
							? "Save changes"
							: "Create store"}
				</Button>
			</Form>
		</div>
	);
}
