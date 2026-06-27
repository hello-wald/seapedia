import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
	createPromoSchema,
	createVoucherSchema,
	type Promo,
	type Voucher,
} from "@seapedia/shared";
import type { Route } from "./+types/discounts";
import { requireToken, tokenContext } from "~/.server/middleware";
import {
	createPromo,
	createVoucher,
	getAdminPromos,
	getAdminVouchers,
} from "~/.server/discounts";
import { AdminTable } from "~/components/admin/admin-table";
import { TableCell, TableRow } from "~/components/ui/table";
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

export function meta() {
	return [{ title: "Discounts · Admin · SEApedia" }];
}

export async function loader({ context }: Route.LoaderArgs) {
	const token = context.get(tokenContext);
	if (!token) {
		return { vouchers: [] as Voucher[], promos: [] as Promo[] };
	}
	const [vouchers, promos] = await Promise.all([
		getAdminVouchers(token),
		getAdminPromos(token),
	]);
	return { vouchers: vouchers ?? [], promos: promos ?? [] };
}

export async function action({ context, request }: Route.ActionArgs) {
	const token = requireToken(context);
	const form = await request.formData();
	const intent = form.get("intent");

	if (intent === "voucher") {
		const parsed = createVoucherSchema.safeParse({
			code: form.get("code"),
			percent: form.get("percent"),
			expiresAt: form.get("expiresAt"),
			usageLimit: form.get("usageLimit"),
		});
		if (!parsed.success) {
			return {
				ok: false as const,
				error: parsed.error.issues.map((i) => i.message).join(", "),
			};
		}
		const res = await createVoucher(token, parsed.data);
		return res.ok
			? { ok: true as const, kind: "voucher" as const }
			: { ok: false as const, error: res.error };
	}

	if (intent === "promo") {
		const parsed = createPromoSchema.safeParse({
			code: form.get("code"),
			percent: form.get("percent"),
			expiresAt: form.get("expiresAt"),
		});
		if (!parsed.success) {
			return {
				ok: false as const,
				error: parsed.error.issues.map((i) => i.message).join(", "),
			};
		}
		const res = await createPromo(token, parsed.data);
		return res.ok
			? { ok: true as const, kind: "promo" as const }
			: { ok: false as const, error: res.error };
	}

	return { ok: false as const, error: "Unknown action" };
}

function StatusLabel({
	isActive,
	expiresAt,
}: {
	isActive: boolean;
	expiresAt: string;
}) {
	const expired = new Date(expiresAt).getTime() < Date.now();
	if (!isActive) return <span className="text-gray-500">Inactive</span>;
	if (expired) return <span className="text-destructive">Expired</span>;
	return <span className="text-success">Active</span>;
}

function CreateDiscountDialog({
	intent,
	withUsageLimit,
}: {
	intent: "voucher" | "promo";
	withUsageLimit: boolean;
}) {
	const [open, setOpen] = useState(false);
	const [formKey, setFormKey] = useState(0);
	const fetcher = useFetcher<typeof action>({
		key: `discount-${intent}-${formKey}`,
	});
	const submitting = fetcher.state !== "idle";
	const label = intent === "voucher" ? "voucher" : "promo";

	useEffect(() => {
		if (fetcher.state === "idle" && fetcher.data?.ok) {
			setOpen(false);
			toast.success(`Created ${label}`);
		}
	}, [fetcher.state, fetcher.data, label]);

	// Reset the fetcher
	function handleOpenChange(next: boolean) {
		setOpen(next);
		if (!next) setFormKey((k) => k + 1);
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<Button size="sm" onClick={() => setOpen(true)}>
				<Plus size={16} aria-hidden="true" />
				New {label}
			</Button>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create {label}</DialogTitle>
					<DialogDescription>
						Codes are stored uppercase and must be unique.
					</DialogDescription>
				</DialogHeader>
				<fetcher.Form method="post" className="space-y-4">
					<input type="hidden" name="intent" value={intent} />
					<div>
						<label
							htmlFor={`${intent}-code`}
							className="mb-1.5 block text-sm font-medium text-gray-700"
						>
							Code
						</label>
						<Input
							id={`${intent}-code`}
							name="code"
							placeholder="e.g. HEMAT15"
							required
						/>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div>
							<label
								htmlFor={`${intent}-percent`}
								className="mb-1.5 block text-sm font-medium text-gray-700"
							>
								Percent
							</label>
							<Input
								id={`${intent}-percent`}
								name="percent"
								type="number"
								min={1}
								max={100}
								placeholder="10"
								required
							/>
						</div>
						<div>
							<label
								htmlFor={`${intent}-expiresAt`}
								className="mb-1.5 block text-sm font-medium text-gray-700"
							>
								Expires
							</label>
							<Input
								id={`${intent}-expiresAt`}
								name="expiresAt"
								type="date"
								required
							/>
						</div>
					</div>
					{withUsageLimit && (
						<div>
							<label
								htmlFor="voucher-usageLimit"
								className="mb-1.5 block text-sm font-medium text-gray-700"
							>
								Usage limit
							</label>
							<Input
								id="voucher-usageLimit"
								name="usageLimit"
								type="number"
								min={1}
								placeholder="5"
								required
							/>
						</div>
					)}
					{fetcher.data && !fetcher.data.ok && (
						<p className="text-sm text-destructive">
							{fetcher.data.error}
						</p>
					)}
					<DialogFooter>
						<Button type="submit" disabled={submitting}>
							{submitting ? "Creating…" : `Create ${label}`}
						</Button>
					</DialogFooter>
				</fetcher.Form>
			</DialogContent>
		</Dialog>
	);
}

export default function AdminDiscounts({ loaderData }: Route.ComponentProps) {
	const { vouchers, promos } = loaderData;
	return (
		<div className="space-y-10">
			<section>
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-xl font-semibold text-gray-900">
							Vouchers
						</h1>
						<p className="mt-1 text-sm text-muted">
							{vouchers.length} vouchers
						</p>
					</div>
					<CreateDiscountDialog intent="voucher" withUsageLimit />
				</div>
				<AdminTable
					columns={[
						"Code",
						"Percent",
						"Used / Limit",
						"Expires",
						"Status",
					]}
					isEmpty={vouchers.length === 0}
				>
					{vouchers.map((v) => (
						<TableRow key={v.id}>
							<TableCell className="font-medium text-gray-900">
								{v.code}
							</TableCell>
							<TableCell className="text-gray-700">
								{v.percent}%
							</TableCell>
							<TableCell className="text-gray-700">
								{v.usedCount} / {v.usageLimit}
							</TableCell>
							<TableCell className="text-gray-700">
								{new Date(v.expiresAt).toLocaleDateString(
									"id-ID",
								)}
							</TableCell>
							<TableCell>
								<StatusLabel
									isActive={v.isActive}
									expiresAt={v.expiresAt}
								/>
							</TableCell>
						</TableRow>
					))}
				</AdminTable>
			</section>

			<section>
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-xl font-semibold text-gray-900">
							Promos
						</h2>
						<p className="mt-1 text-sm text-muted">
							{promos.length} promos
						</p>
					</div>
					<CreateDiscountDialog
						intent="promo"
						withUsageLimit={false}
					/>
				</div>
				<AdminTable
					columns={["Code", "Percent", "Expires", "Status"]}
					isEmpty={promos.length === 0}
				>
					{promos.map((p) => (
						<TableRow key={p.id}>
							<TableCell className="font-medium text-gray-900">
								{p.code}
							</TableCell>
							<TableCell className="text-gray-700">
								{p.percent}%
							</TableCell>
							<TableCell className="text-gray-700">
								{new Date(p.expiresAt).toLocaleDateString(
									"id-ID",
								)}
							</TableCell>
							<TableCell>
								<StatusLabel
									isActive={p.isActive}
									expiresAt={p.expiresAt}
								/>
							</TableCell>
						</TableRow>
					))}
				</AdminTable>
			</section>
		</div>
	);
}
