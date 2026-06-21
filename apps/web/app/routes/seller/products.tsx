import { useEffect, useState } from "react";
import {
	Form,
	Link,
	redirect,
	useActionData,
	useNavigation,
} from "react-router";
import { createProductSchema, type Product } from "@seapedia/shared";
import type { Route } from "./+types/products";
import { Button } from "~/components/ui/button";
import {
	ProductDialog,
	type ProductEditing,
} from "~/components/product/product-dialog";
import { tokenContext } from "~/.server/middleware";
import { getMyStore } from "~/.server/stores";
import {
	createProduct,
	deleteProduct,
	getMyProducts,
	updateProduct,
} from "~/.server/products";
import { ErrorBanner, SuccessBanner } from "~/components/ui/form-banner";
import { formatRupiah } from "~/lib/format";

export function meta() {
	return [{ title: "Products · SEApedia" }];
}

export async function loader({ context }: Route.LoaderArgs) {
	const token = context.get(tokenContext);
	if (!token) return { store: null, products: [] as Product[] };
	const [store, products] = await Promise.all([
		getMyStore(token),
		getMyProducts(token),
	]);
	return { store, products: products ?? [] };
}

export async function action({ request, context }: Route.ActionArgs) {
	const token = context.get(tokenContext);
	if (!token) throw redirect("/login");

	const formData = await request.formData();
	const intent = formData.get("intent");

	if (intent === "delete") {
		const id = String(formData.get("id"));
		const result = await deleteProduct(token, id);
		return result.ok
			? { ok: true, formError: null }
			: { ok: false, formError: result.error };
	}

	const parsed = createProductSchema.safeParse({
		name: formData.get("name"),
		description: formData.get("description"),
		price: formData.get("price"),
		stock: formData.get("stock"),
	});
	if (!parsed.success) {
		return {
			ok: false,
			formError: parsed.error.issues.map((i) => i.message).join(", "),
		};
	}

	const result =
		intent === "update"
			? await updateProduct(
					token,
					String(formData.get("id")),
					parsed.data,
				)
			: await createProduct(token, parsed.data);

	return result.ok
		? { ok: true, formError: null }
		: { ok: false, formError: result.error };
}

export default function SellerProducts({ loaderData }: Route.ComponentProps) {
	const { store, products } = loaderData;
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const submitting = navigation.state === "submitting";

	const [editing, setEditing] = useState<ProductEditing>(null);

	// Close the modal after a successful create/update/delete.
	useEffect(() => {
		if (actionData?.ok) setEditing(null);
	}, [actionData]);

	if (!store) {
		return (
			<div>
				<h1 className="text-xl font-semibold text-gray-900">
					Products
				</h1>
				<div className="mt-6 rounded-lg border border-dashed p-8 text-center">
					<p className="text-gray-700">
						You need a store before you can add products.
					</p>
					<p className="mt-1 text-sm text-muted">
						Set up your store identity first.
					</p>
					<Link to="/seller" className="mt-4 inline-block">
						<Button>Create your store</Button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div>
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-xl font-semibold text-gray-900">
						Products
					</h1>
					<p className="mt-1 text-sm text-muted">
						Manage the {products.length}{" "}
						{products.length === 1 ? "product" : "products"} in{" "}
						{store.name}.
					</p>
				</div>
				<Button onClick={() => setEditing("new")}>Add product</Button>
			</div>

			{actionData?.ok && (
				<SuccessBanner className="mt-4">Saved.</SuccessBanner>
			)}
			{actionData?.formError && (
				<ErrorBanner className="mt-4">
					{actionData.formError}
				</ErrorBanner>
			)}

			<ProductDialog
				editing={editing}
				onOpenChange={(open) => {
					if (!open) setEditing(null);
				}}
			/>

			<div className="mt-6">
				{products.length === 0 ? (
					<div className="rounded-lg border border-dashed p-8 text-center">
						<p className="text-gray-700">No products yet.</p>
						<p className="mt-1 text-sm text-muted">
							Create your first product to get started.
						</p>
					</div>
				) : (
					<div className="overflow-x-auto rounded-lg border">
						<table className="w-full text-sm">
							<thead className="border-b bg-gray-50 text-left text-muted">
								<tr>
									<th className="px-4 py-2.5 font-medium">
										Name
									</th>
									<th className="px-4 py-2.5 font-medium">
										Price
									</th>
									<th className="px-4 py-2.5 font-medium">
										Stock
									</th>
									<th className="px-4 py-2.5" />
								</tr>
							</thead>
							<tbody>
								{products.map((p) => (
									<tr
										key={p.id}
										className="border-b last:border-0"
									>
										<td className="px-4 py-2.5 text-gray-900">
											{p.name}
										</td>
										<td className="px-4 py-2.5 text-gray-700">
											{formatRupiah(p.price)}
										</td>
										<td className="px-4 py-2.5 text-gray-700">
											{p.stock}
										</td>
										<td className="px-4 py-2.5">
											<div className="flex justify-end gap-2">
												<Button
													variant="ghost"
													size="sm"
													onClick={() =>
														setEditing(p)
													}
												>
													Edit
												</Button>
												<Form
													method="post"
													onSubmit={(e) => {
														if (
															!confirm(
																`Delete "${p.name}"?`,
															)
														)
															e.preventDefault();
													}}
												>
													<input
														type="hidden"
														name="intent"
														value="delete"
													/>
													<input
														type="hidden"
														name="id"
														value={p.id}
													/>
													<Button
														type="submit"
														variant="ghost"
														size="sm"
														className="text-destructive"
														disabled={submitting}
													>
														Delete
													</Button>
												</Form>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
