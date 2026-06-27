import type { Route } from "./+types/home";
import { tokenContext } from "~/.server/middleware";
import { getAdminOverview } from "~/.server/admin";
import { ReportCards } from "~/components/report/report-cards";
import { formatRupiah } from "~/lib/format";

export function meta() {
	return [{ title: "Admin · SEApedia" }];
}

export async function loader({ context }: Route.LoaderArgs) {
	const token = context.get(tokenContext);
	const overview = token ? await getAdminOverview(token) : null;
	return { overview };
}

export default function AdminHome({ loaderData }: Route.ComponentProps) {
	const { overview } = loaderData;

	if (!overview) {
		return (
			<div>
				<h1 className="text-xl font-semibold text-gray-900">
					Admin overview
				</h1>
				<p className="mt-2 text-sm text-muted">
					Monitoring data is unavailable right now.
				</p>
			</div>
		);
	}

	const { users, stores, products, orders, deliveries, discounts } = overview;

	const stats = [
		{
			label: "Users",
			value: String(users.total),
			caption: `${users.buyers} buyers · ${users.sellers} sellers · ${users.drivers} drivers`,
		},
		{ label: "Stores", value: String(stores.total) },
		{
			label: "Products",
			value: String(products.total),
			caption: `${products.outOfStock} out of stock`,
		},
		{
			label: "Orders",
			value: String(orders.total),
			caption: `${orders.selesai} completed · ${orders.dikembalikan} refunded`,
		},
		{
			label: "Completed sales",
			value: formatRupiah(orders.gmv),
			caption: "GMV from delivered orders",
		},
		{
			label: "Delivery jobs",
			value: String(deliveries.available),
			caption: `${deliveries.inTransit} in transit · ${deliveries.delivered} delivered`,
		},
		{
			label: "Active vouchers",
			value: String(discounts.activeVouchers),
		},
		{
			label: "Active promos",
			value: String(discounts.activePromos),
		},
	];

	return (
		<div>
			<h1 className="text-xl font-semibold text-gray-900">
				Admin overview
			</h1>
			<p className="mt-1 text-sm text-muted">
				Marketplace monitoring at a glance. Use the sidebar for detailed
				lists.
			</p>

			<div className="mt-6">
				<ReportCards stats={stats} />
			</div>
		</div>
	);
}
