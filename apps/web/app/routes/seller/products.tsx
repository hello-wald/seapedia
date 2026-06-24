import { useState } from "react";
import { Link, redirect, useActionData, useSubmit } from "react-router";
import { createProductSchema, type Product } from "@seapedia/shared";
import type { Route } from "./+types/products";
import { Button } from "~/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import {
	ProductDialog,
	type ProductEditing,
} from "~/components/product/product-dialog";
import { ProductActions } from "~/components/product/product-actions";
import { tokenContext } from "~/.server/middleware";
import { getMyStore } from "~/.server/stores";
import {
	createProduct,
	deleteProduct,
	getMyProducts,
	updateProduct,
} from "~/.server/products";
import { uploadImage } from "~/.server/uploads";
import { formatRupiah } from "~/lib/format";
import { useActionFeedback } from "~/lib/hooks/use-action-feedback";
import { toast } from "sonner";

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
			? {
					ok: true,
					intent,
					message: "Product deleted successfully",
					formError: null,
				}
			: { ok: false, intent, formError: result.error };
	}

	let imageUrl = String(formData.get("currentImageUrl") ?? "");
	const file = formData.get("image");
	if (file instanceof File && file.size > 0) {
		const upload = await uploadImage(token, file);
		if (!upload.ok) {
			return { ok: false, intent, formError: upload.error };
		}
		imageUrl = upload.data.url;
	}

	const parsed = createProductSchema.safeParse({
		name: formData.get("name"),
		description: formData.get("description"),
		price: formData.get("price"),
		stock: formData.get("stock"),
		imageUrl: imageUrl || undefined,
	});
	if (!parsed.success) {
		return {
			ok: false,
			intent,
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
		? {
				ok: true,
				intent,
				message:
					intent === "create"
						? "Product saved successfully"
						: "Changes saved successfully",
				formError: null,
			}
		: { ok: false, intent, formError: result.error };
}

export default function SellerProducts({ loaderData }: Route.ComponentProps) {
	const { store, products } = loaderData;
	const actionData = useActionData<typeof action>();
	const submit = useSubmit();

	const [editing, setEditing] = useState<ProductEditing>(null);
	const [formError, setFormError] = useState<string | null>(null);

	const openEditing = (value: ProductEditing) => {
		setFormError(null);
		setEditing(value);
	};

	useActionFeedback(actionData, {
		onSuccess: () => {
			setFormError(null);
			setEditing(null);
		},
		onError: (data) => {
			const message = data.formError ?? "Something went wrong.";
			if (data.intent === "delete") toast.error(message);
			else setFormError(message);
		},
	});

	const handleDelete = (product: Product) => {
		if (confirm(`Delete "${product.name}"?`)) {
			void submit(
				{ intent: "delete", id: product.id },
				{ method: "post" },
			);
		}
	};

	if (!store) {
		return (
			<div>
				<h1 className="text-xl font-semibold text-gray-900">
					Products
				</h1>
				<div className="mt-6 rounded-lg border border-dashed p-8 text-center">
					<p className="text-gray-700 font-medium">
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
				<Button onClick={() => openEditing("new")}>Add product</Button>
			</div>

			<ProductDialog
				editing={editing}
				formError={formError}
				onOpenChange={(open) => {
					if (!open) openEditing(null);
				}}
			/>

			<div className="mt-6 rounded-lg">
				{products.length === 0 ? (
					<div className="rounded-lg border border-dashed p-8 text-center">
						<p className="text-gray-700 font-medium">
							No products yet.
						</p>
						<p className="mt-1 text-sm text-muted">
							Create your first product to get started.
						</p>
					</div>
				) : (
					<div className="rounded-lg border overflow-hidden">
						<Table>
							<TableHeader className="bg-surface">
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Description</TableHead>
									<TableHead>Price</TableHead>
									<TableHead>Stock</TableHead>
									<TableHead className="w-12" />
								</TableRow>
							</TableHeader>
							<TableBody>
								{products.map((p) => (
									<TableRow key={p.id}>
										<TableCell className="font-medium text-gray-900">
											{p.name}
										</TableCell>
										<TableCell className="text-gray-700">
											{p.description ? (
												<span
													className="block max-w-[28ch] truncate"
													title={p.description}
												>
													{p.description}
												</span>
											) : (
												<span className="text-muted">
													—
												</span>
											)}
										</TableCell>
										<TableCell className="text-gray-700">
											{formatRupiah(p.price)}
										</TableCell>
										<TableCell className="text-gray-700">
											{p.stock}
										</TableCell>
										<TableCell className="text-right">
											<ProductActions
												product={p}
												onEdit={openEditing}
												onDelete={handleDelete}
											/>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</div>
		</div>
	);
}
