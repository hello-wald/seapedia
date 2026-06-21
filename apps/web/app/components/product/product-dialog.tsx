import { Form, useNavigation } from "react-router";
import type { Product } from "@seapedia/shared";
import { Button } from "~/components/ui/button";
import { Input, Textarea } from "~/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";

// Product = editing, new = creating, null = closed
export type ProductEditing = Product | "new" | null;

export function ProductDialog({
	editing,
	onOpenChange,
}: {
	editing: ProductEditing;
	onOpenChange: (open: boolean) => void;
}) {
	const navigation = useNavigation();
	const submitting = navigation.state === "submitting";
	const product = editing && editing !== "new" ? editing : null;

	return (
		<Dialog open={editing !== null} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{product ? "Edit product" : "New product"}
					</DialogTitle>
					<DialogDescription>
						{product
							? "Update the details for this product."
							: "Add a new product to your store."}
					</DialogDescription>
				</DialogHeader>
				<ProductForm
					key={product ? product.id : "new"}
					product={product}
					submitting={submitting}
					onCancel={() => onOpenChange(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}

function ProductForm({
	product,
	submitting,
	onCancel,
}: {
	product: Product | null;
	submitting: boolean;
	onCancel: () => void;
}) {
	return (
		<Form method="post" className="space-y-4">
			<input
				type="hidden"
				name="intent"
				value={product ? "update" : "create"}
			/>
			{product && <input type="hidden" name="id" value={product.id} />}

			<div>
				<label
					htmlFor="name"
					className="mb-1.5 block text-sm font-medium text-gray-700"
				>
					Product name
				</label>
				<Input
					id="name"
					name="name"
					placeholder="e.g. Wireless Earbuds"
					defaultValue={product?.name ?? ""}
					required
				/>
			</div>

			<div>
				<label
					htmlFor="description"
					className="mb-1.5 block text-sm font-medium text-gray-700"
				>
					Description{" "}
					<span className="font-normal text-muted">(optional)</span>
				</label>
				<Textarea
					id="description"
					name="description"
					rows={3}
					maxLength={2000}
					placeholder="Describe your product…"
					defaultValue={product?.description ?? ""}
				/>
			</div>

			<div className="flex gap-4">
				<div className="flex-1">
					<label
						htmlFor="price"
						className="mb-1.5 block text-sm font-medium text-gray-700"
					>
						Price (Rp)
					</label>
					<Input
						id="price"
						name="price"
						type="number"
						min={1}
						step={1}
						placeholder="0"
						defaultValue={product?.price ?? ""}
						required
					/>
				</div>
				<div className="flex-1">
					<label
						htmlFor="stock"
						className="mb-1.5 block text-sm font-medium text-gray-700"
					>
						Stock
					</label>
					<Input
						id="stock"
						name="stock"
						type="number"
						min={0}
						step={1}
						placeholder="0"
						defaultValue={product?.stock ?? ""}
						required
					/>
				</div>
			</div>

			<DialogFooter>
				<Button type="submit" disabled={submitting}>
					{submitting
						? "Saving…"
						: product
							? "Save changes"
							: "Create product"}
				</Button>
				<Button
					type="button"
					variant="ghost"
					onClick={onCancel}
					disabled={submitting}
				>
					Cancel
				</Button>
			</DialogFooter>
		</Form>
	);
}
