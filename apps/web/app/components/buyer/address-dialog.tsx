import { Form, useNavigation } from "react-router";
import type { Address } from "@seapedia/shared";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { ErrorBanner } from "~/components/ui/form-banner";

// Address = editing, new = creating, null = closed
export type AddressEditing = Address | "new" | null;

export function AddressDialog({
	editing,
	formError,
	onOpenChange,
}: {
	editing: AddressEditing;
	formError?: string | null;
	onOpenChange: (open: boolean) => void;
}) {
	const navigation = useNavigation();
	const submitting = navigation.state === "submitting";
	const address = editing && editing !== "new" ? editing : null;

	return (
		<Dialog open={editing !== null} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{address ? "Edit address" : "New address"}
					</DialogTitle>
					<DialogDescription>
						{address
							? "Update the details for this delivery address."
							: "Add a new delivery address."}
					</DialogDescription>
				</DialogHeader>
				{formError && <ErrorBanner>{formError}</ErrorBanner>}
				<AddressForm
					key={address ? address.id : "new"}
					address={address}
					submitting={submitting}
					onCancel={() => onOpenChange(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}

function Field({
	id,
	label,
	defaultValue,
	...rest
}: {
	id: string;
	label: string;
	defaultValue?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
	return (
		<div>
			<label
				htmlFor={id}
				className="mb-1.5 block text-sm font-medium text-gray-700"
			>
				{label}
			</label>
			<Input id={id} name={id} defaultValue={defaultValue} {...rest} />
		</div>
	);
}

function AddressForm({
	address,
	submitting,
	onCancel,
}: {
	address: Address | null;
	submitting: boolean;
	onCancel: () => void;
}) {
	return (
		<Form method="post" className="space-y-4">
			<input
				type="hidden"
				name="intent"
				value={address ? "update" : "create"}
			/>
			{address && <input type="hidden" name="id" value={address.id} />}

			<div className="flex gap-4">
				<div className="flex-1">
					<Field
						id="label"
						label="Label"
						placeholder="e.g. Home"
						defaultValue={address?.label}
						required
					/>
				</div>
				<div className="flex-1">
					<Field
						id="recipientName"
						label="Recipient"
						placeholder="Full name"
						defaultValue={address?.recipientName}
						required
					/>
				</div>
			</div>

			<Field
				id="phone"
				label="Phone"
				placeholder="08xxxxxxxxxx"
				defaultValue={address?.phone}
				required
			/>

			<Field
				id="line1"
				label="Address"
				placeholder="Street, building, unit"
				defaultValue={address?.line1}
				required
			/>

			<div className="flex gap-4">
				<div className="flex-1">
					<Field
						id="city"
						label="City"
						defaultValue={address?.city}
						required
					/>
				</div>
				<div className="flex-1">
					<Field
						id="province"
						label="Province"
						defaultValue={address?.province}
						required
					/>
				</div>
				<div className="flex-1">
					<Field
						id="postalCode"
						label="Postal code"
						defaultValue={address?.postalCode}
						required
					/>
				</div>
			</div>

			<label className="flex items-center gap-2 text-sm text-gray-700">
				<input
					type="checkbox"
					name="isDefault"
					value="true"
					defaultChecked={address?.isDefault ?? false}
					className="size-4 rounded border-gray-300"
				/>
				Set as default address
			</label>

			<DialogFooter>
				<Button type="submit" disabled={submitting}>
					{submitting
						? "Saving…"
						: address
							? "Save changes"
							: "Add address"}
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
