import type { Route } from "./+types/home";
import { requireActiveRole, getBalance } from "~/.server/auth";
import { tokenContext, userContext } from "~/.server/middleware";
import { ProfileLayout } from "../../components/layout/profile-layout";
import { ROLE_LABEL } from "~/lib/constants";

export function meta() {
	return [{ title: "Dashboard · SEApedia" }];
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
			available: Boolean(balance?.wallet),
		},
		{
			label: "Seller income",
			role: "SELLER",
			available: Boolean(balance?.sellerIncome),
		},
		{
			label: "Driver earnings",
			role: "DRIVER",
			available: Boolean(balance?.driverEarnings),
		},
	].filter((f) => user.roles.includes(f.role as (typeof user.roles)[number]));

	return (
		<ProfileLayout user={user}>
			<header className="mb-6">
				<p className="text-sm text-muted">Welcome back,</p>
				<h1 className="text-2xl font-semibold text-gray-900">
					{user.name}
				</h1>
			</header>

			<section className="mb-6 rounded-xl border bg-surface p-5">
				<div className="flex items-center justify-between">
					<h2 className="text-sm font-medium text-gray-700">
						Roles you own
					</h2>
					{user.activeRole && (
						<div className="flex items-center gap-1.5 md:hidden">
							<span className="text-xs text-muted">Active:</span>
							<span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-900">
								{ROLE_LABEL[user.activeRole]}
							</span>
						</div>
					)}
				</div>
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
					Financial summaries across your roles. Real figures arrive
					in a later level.
				</p>
				<div className="mt-4 grid gap-3 sm:grid-cols-3">
					{financials.map((f) => (
						<div
							key={f.label}
							className="rounded-lg border border-dashed p-4"
						>
							<p className="text-xs text-muted">{f.label}</p>
							<p className="mt-1 text-lg font-semibold text-gray-400">
								Coming soon
							</p>
						</div>
					))}
				</div>
			</section>
		</ProfileLayout>
	);
}
