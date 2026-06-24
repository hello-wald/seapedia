import { useState } from "react";
import { Form, useActionData, useNavigation } from "react-router";
import { topUpSchema, type WalletTransactionType } from "@seapedia/shared";
import type { Route } from "./+types/wallet";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { ErrorBanner } from "~/components/ui/form-banner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { requireToken, tokenContext } from "~/.server/middleware";
import { getWallet, topUpWallet } from "~/.server/wallet";
import { formatRupiah } from "~/lib/format";
import { useActionFeedback } from "~/lib/hooks/use-action-feedback";

export function meta() {
	return [{ title: "Wallet · SEApedia" }];
}

const PRESET_AMOUNTS = [50000, 100000, 250000];

const TYPE_LABEL: Record<WalletTransactionType, string> = {
	TOPUP: "Top-up",
	PURCHASE: "Purchase",
	REFUND: "Refund",
};

export async function loader({ context }: Route.LoaderArgs) {
	const token = context.get(tokenContext);
	if (!token) return { summary: { balance: 0, transactions: [] } };
	const summary = await getWallet(token);
	return { summary: summary ?? { balance: 0, transactions: [] } };
}

export async function action({ request, context }: Route.ActionArgs) {
	const token = requireToken(context);

	const formData = await request.formData();
	const parsed = topUpSchema.safeParse({ amount: formData.get("amount") });
	if (!parsed.success) {
		return {
			ok: false,
			formError: parsed.error.issues.map((i) => i.message).join(", "),
		};
	}

	const result = await topUpWallet(token, parsed.data.amount);
	return result.ok
		? { ok: true, message: "Top-up successful", formError: null }
		: { ok: false, formError: result.error };
}

export default function BuyerWallet({ loaderData }: Route.ComponentProps) {
	const { summary } = loaderData;
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const submitting = navigation.state === "submitting";

	const [amount, setAmount] = useState("");
	const [formError, setFormError] = useState<string | null>(null);

	useActionFeedback(actionData, {
		onSuccess: () => {
			setFormError(null);
			setAmount("");
		},
		onError: (data) =>
			setFormError(data.formError ?? "Something went wrong."),
	});

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-xl font-semibold text-gray-900">Wallet</h1>
				<p className="mt-1 text-sm text-muted">
					Top up your balance and review your transaction history.
				</p>
			</div>

			<Card className="p-5">
				<p className="text-sm text-muted">Current balance</p>
				<p className="mt-1 text-3xl font-semibold text-gray-900">
					{formatRupiah(summary.balance)}
				</p>
			</Card>

			<Card className="p-5">
				<h2 className="text-sm font-medium text-gray-700">Top up</h2>
				<p className="mt-1 text-xs text-muted">
					This is a dummy top-up — no real payment is processed.
				</p>
				{formError && (
					<div className="mt-3">
						<ErrorBanner>{formError}</ErrorBanner>
					</div>
				)}
				<Form method="post" className="mt-4 space-y-4">
					<div className="flex flex-wrap gap-2">
						{PRESET_AMOUNTS.map((preset) => (
							<Button
								key={preset}
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setAmount(String(preset))}
							>
								{formatRupiah(preset)}
							</Button>
						))}
					</div>
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
						<Input
							name="amount"
							type="number"
							min={10000}
							step={1000}
							placeholder="Enter amount (Rp)"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							className="sm:max-w-xs"
							required
						/>
						<Button type="submit" disabled={submitting}>
							{submitting ? "Topping up…" : "Top up"}
						</Button>
					</div>
				</Form>
			</Card>

			<div>
				<h2 className="mb-3 text-sm font-medium text-gray-700">
					Transaction history
				</h2>
				{summary.transactions.length === 0 ? (
					<div className="rounded-lg border border-dashed p-8 text-center">
						<p className="font-medium text-gray-700">
							No transactions yet.
						</p>
						<p className="mt-1 text-sm text-muted">
							Your top-ups and purchases will appear here.
						</p>
					</div>
				) : (
					<div className="rounded-lg border overflow-hidden">
						<Table>
							<TableHeader className="bg-surface">
								<TableRow>
									<TableHead>Date</TableHead>
									<TableHead>Type</TableHead>
									<TableHead className="text-right">
										Amount
									</TableHead>
									<TableHead className="text-right">
										Balance
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{summary.transactions.map((t) => (
									<TableRow key={t.id}>
										<TableCell className="text-gray-700">
											{new Date(
												t.createdAt,
											).toLocaleString("id-ID")}
										</TableCell>
										<TableCell>
											<span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
												{TYPE_LABEL[t.type]}
											</span>
										</TableCell>
										<TableCell
											className={`text-right font-medium ${
												t.amount >= 0
													? "text-emerald-700"
													: "text-destructive"
											}`}
										>
											{t.amount >= 0 ? "+" : "−"}
											{formatRupiah(Math.abs(t.amount))}
										</TableCell>
										<TableCell className="text-right text-gray-700">
											{formatRupiah(t.balanceAfter)}
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
