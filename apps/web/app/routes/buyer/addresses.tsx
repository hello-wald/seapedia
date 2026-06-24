import { useState } from "react";
import { useActionData, useSubmit } from "react-router";
import { saveAddressSchema, type Address } from "@seapedia/shared";
import type { Route } from "./+types/addresses";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { MoreHorizontal } from "lucide-react";
import {
	AddressDialog,
	type AddressEditing,
} from "~/components/buyer/address-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { requireToken, tokenContext } from "~/.server/middleware";
import {
	createAddress,
	deleteAddress,
	getAddresses,
	updateAddress,
} from "~/.server/addresses";
import { useActionFeedback } from "~/lib/hooks/use-action-feedback";
import { toast } from "sonner";

export function meta() {
	return [{ title: "Addresses · SEApedia" }];
}

export async function loader({ context }: Route.LoaderArgs) {
	const token = context.get(tokenContext);
	if (!token) return { addresses: [] as Address[] };
	const addresses = await getAddresses(token);
	return { addresses: addresses ?? [] };
}

export async function action({ request, context }: Route.ActionArgs) {
	const token = requireToken(context);

	const formData = await request.formData();
	const intent = formData.get("intent");

	if (intent === "delete") {
		const id = String(formData.get("id"));
		const result = await deleteAddress(token, id);
		return result.ok
			? { ok: true, intent, message: "Address deleted", formError: null }
			: { ok: false, intent, formError: result.error };
	}

	const parsed = saveAddressSchema.safeParse({
		label: formData.get("label"),
		recipientName: formData.get("recipientName"),
		phone: formData.get("phone"),
		line1: formData.get("line1"),
		city: formData.get("city"),
		province: formData.get("province"),
		postalCode: formData.get("postalCode"),
		isDefault: formData.get("isDefault") ?? undefined,
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
			? await updateAddress(token, String(formData.get("id")), parsed.data)
			: await createAddress(token, parsed.data);

	return result.ok
		? {
				ok: true,
				intent,
				message:
					intent === "update" ? "Changes saved" : "Address added",
				formError: null,
			}
		: { ok: false, intent, formError: result.error };
}

export default function BuyerAddresses({ loaderData }: Route.ComponentProps) {
	const { addresses } = loaderData;
	const actionData = useActionData<typeof action>();
	const submit = useSubmit();

	const [editing, setEditing] = useState<AddressEditing>(null);
	const [formError, setFormError] = useState<string | null>(null);

	const openEditing = (value: AddressEditing) => {
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

	const handleDelete = (address: Address) => {
		if (confirm(`Delete "${address.label}"?`)) {
			void submit(
				{ intent: "delete", id: address.id },
				{ method: "post" },
			);
		}
	};

	return (
		<div>
			<div className="flex items-center justify-between gap-4">
				<div>
					<h1 className="text-xl font-semibold text-gray-900">
						Delivery addresses
					</h1>
					<p className="mt-1 text-sm text-muted">
						Manage where your orders are delivered.
					</p>
				</div>
				<Button onClick={() => openEditing("new")}>Add address</Button>
			</div>

			<AddressDialog
				editing={editing}
				formError={formError}
				onOpenChange={(open) => {
					if (!open) openEditing(null);
				}}
			/>

			<div className="mt-6">
				{addresses.length === 0 ? (
					<div className="rounded-lg border border-dashed p-8 text-center">
						<p className="font-medium text-gray-700">
							No addresses yet.
						</p>
						<p className="mt-1 text-sm text-muted">
							Add your first delivery address to get started.
						</p>
					</div>
				) : (
					<div className="grid gap-3 sm:grid-cols-2">
						{addresses.map((address) => (
							<Card key={address.id} className="p-4">
								<div className="flex items-start justify-between gap-2">
									<div className="flex items-center gap-2">
										<h3 className="font-medium text-gray-900">
											{address.label}
										</h3>
										{address.isDefault && (
											<span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-900">
												Default
											</span>
										)}
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none cursor-pointer">
											<MoreHorizontal className="size-4" />
											<span className="sr-only">
												Open menu for {address.label}
											</span>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											align="end"
											className="min-w-32"
										>
											<DropdownMenuItem
												onClick={() =>
													openEditing(address)
												}
											>
												Edit
											</DropdownMenuItem>
											<DropdownMenuItem
												variant="destructive"
												onClick={() =>
													handleDelete(address)
												}
											>
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
								<p className="mt-2 text-sm text-gray-700">
									{address.recipientName} · {address.phone}
								</p>
								<p className="mt-1 text-sm text-muted">
									{address.line1}, {address.city},{" "}
									{address.province} {address.postalCode}
								</p>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
