import { NavLink } from "react-router";
import type { Role, User } from "@seapedia/shared";

interface NavSection {
	title: string;
	items: NavItem[];
}

interface NavItem {
	to: string;
	label: string;
	end?: boolean;
}

const ROLE_NAV: Record<Role, NavSection[]> = {
	ADMIN: [
		{
			title: "General",
			items: [{ to: "/admin", label: "Overview", end: true }],
		},
		{
			title: "Management",
			items: [
				{ to: "/admin/users", label: "Users" },
				{ to: "/admin/stores", label: "Stores" },
				{ to: "/admin/products", label: "Products" },
			],
		},
		{
			title: "Commerce",
			items: [
				{ to: "/admin/orders", label: "Orders" },
				{ to: "/admin/discounts", label: "Discounts" },
			],
		},
		{
			title: "Logistics",
			items: [
				{ to: "/admin/deliveries", label: "Delivery jobs" },
				{ to: "/admin/overdue", label: "Overdue" },
			],
		},
	],

	SELLER: [
		{
			title: "Store",
			items: [
				{ to: "/seller", label: "Store", end: true },
				{ to: "/seller/products", label: "Products" },
			],
		},
		{
			title: "Sales",
			items: [{ to: "/seller/orders", label: "Orders" }],
		},
	],

	BUYER: [
		{
			title: "Account",
			items: [
				{ to: "/buyer/wallet", label: "Wallet" },
				{ to: "/buyer/addresses", label: "Addresses" },
			],
		},
		{
			title: "Shopping",
			items: [{ to: "/buyer/orders", label: "Orders" }],
		},
	],

	DRIVER: [
		{
			title: "Work",
			items: [
				{ to: "/driver/find", label: "Find jobs" },
				{ to: "/driver/jobs", label: "Jobs" },
			],
		},
	],
};

export function DashboardLayout({
	user,
	children,
}: {
	user: User;
	children: React.ReactNode;
}) {
	const sections = user.activeRole ? ROLE_NAV[user.activeRole] : [];

	return (
		<div className="mx-auto max-w-6xl flex w-full flex-col gap-4 px-4 py-6 md:flex-row md:items-start md:gap-6 md:py-8">
			<aside className="shrink-0 md:w-56 md:sticky md:top-24">
				<nav className="flex gap-1 overflow-x-auto pb-2 md:flex-col md:overflow-visible md:pb-0">
					<NavLink
						to="/dashboard"
						className={({ isActive }) =>
							`whitespace-nowrap rounded-md px-3 py-2 text-sm ${
								isActive
									? "bg-brand-600 font-medium text-surface"
									: "text-gray-700 hover:bg-gray-100"
							}`
						}
					>
						Dashboard
					</NavLink>

					{sections.map((section) => (
						<div
							key={section.title}
							className="space-y-1 flex flex-col"
						>
							<p className="px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
								{section.title}
							</p>
							{section.items.map((item) => (
								<NavLink
									key={item.to}
									to={item.to}
									end={item.end}
									className={({ isActive }) =>
										`whitespace-nowrap rounded-md px-3 py-2 text-sm ${
											isActive
												? "bg-brand-600 font-medium text-surface"
												: "text-gray-700 hover:bg-gray-100"
										}`
									}
								>
									{item.label}
								</NavLink>
							))}
						</div>
					))}
				</nav>
			</aside>

			<section className="min-w-0 flex-1">{children}</section>
		</div>
	);
}
