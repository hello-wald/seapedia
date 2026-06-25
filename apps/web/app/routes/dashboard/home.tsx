import { Link } from "react-router";
import type { Route } from "./+types/home";
import { requireActiveRole } from "~/.server/auth";
import { tokenContext, userContext } from "~/.server/middleware";
import { DashboardLayout } from "~/components/layout/dashboard-layout";
import { ROLE_LABEL } from "~/lib/constants";
import { formatRupiah } from "~/lib/format";
import { Button } from "~/components/ui/button";
import { getBalance } from "~/.server/reports";

export function meta() {
	return [{ title: "Profile · SEApedia" }];
}

export async function loader({ context }: Route.LoaderArgs) {
	const user = requireActiveRole(context.get(userContext));
	const token = context.get(tokenContext);
	const balance = token ? await getBalance(token) : null;
	return { user, balance };
}

export default function Profile({ loaderData }: Route.ComponentProps) {
	const { user, balance } = loaderData;

	const financials = [
		{
			label: "Wallet balance",
			role: "BUYER",
			value:
				balance?.wallet != null
					? formatRupiah(balance.wallet.balance ?? 0)
					: null,
			href: "/buyer/wallet",
			cta: "Top up",
		},
		{
			label: "Seller income",
			role: "SELLER",
			value:
				balance?.sellerIncome != null
					? formatRupiah(balance.sellerIncome.total ?? 0)
					: null,
			href: "/seller/orders",
			cta: "View",
		},
		{
			label: "Driver earnings",
			role: "DRIVER",
			value: null,
			href: null,
			cta: null,
		},
	].filter((f) => user.roles.includes(f.role as (typeof user.roles)[number]));

	return (
		<DashboardLayout user={user}>
			<header className="mb-6">
				<p className="text-sm text-muted">Welcome back,</p>
				<h1 className="text-2xl font-semibold text-gray-900">
					{user.name}
				</h1>
			</header>

			<section className="mb-6 rounded-xl border bg-surface p-5">
				<h2 className="text-sm font-medium text-gray-700">
					Roles you own
				</h2>

				<div className="mt-3 flex flex-wrap gap-2">
					{user.roles.map((role) => (
						<span
							key={role}
							className={`rounded-md px-2.5 py-1 text-xs font-medium ${
								role === user.activeRole
									? "bg-brand-100 text-brand-900"
									: "bg-gray-100 text-gray-700"
							}`}
						>
							{ROLE_LABEL[role] ?? role}
						</span>
					))}
				</div>
			</section>

			<section className="rounded-xl border bg-surface p-5">
				<h2 className="text-sm font-medium text-gray-700">
					Balance &amp; earnings
				</h2>
				<p className="mt-1 text-xs text-muted">
					Financial summaries across your roles.
				</p>
				<div className="mt-4 grid gap-3 sm:grid-cols-3">
					{financials.map((f) => (
						<div
							key={f.label}
							className={`rounded-lg border p-4 ${
								f.value == null ? "border-dashed" : ""
							}`}
						>
							<p className="text-xs text-muted">{f.label}</p>
							{f.value != null ? (
								<div className="flex justify-between items-end">
									<p className="mt-1 text-lg font-semibold text-gray-900">
										{f.value}
									</p>
									{f.href && f.cta && (
										<Link to={f.href}>
											<Button variant="accent" size="xs">
												{f.cta}
											</Button>
										</Link>
									)}
								</div>
							) : (
								<p className="mt-1 text-lg font-semibold text-gray-400">
									Coming soon
								</p>
							)}
						</div>
					))}
				</div>
			</section>
		</DashboardLayout>
	);
}
