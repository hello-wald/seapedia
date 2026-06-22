import { NavLink } from "react-router";
import type { Role, User } from "@seapedia/shared";

interface NavItem {
	to: string;
	label: string;
	end?: boolean;
}

const ROLE_NAV: Record<Role, NavItem[]> = {
	BUYER: [
		{ to: "/buyer", label: "Overview", end: true },
		{ to: "/buyer/wallet", label: "Wallet" },
		{ to: "/buyer/addresses", label: "Addresses" },
		{ to: "/buyer/cart", label: "Cart" },
		{ to: "/buyer/orders", label: "Orders" },
	],
	SELLER: [
		{ to: "/seller", label: "Store", end: true },
		{ to: "/seller/products", label: "Products" },
		{ to: "/seller/orders", label: "Orders" },
	],
	DRIVER: [
		{ to: "/driver", label: "Overview", end: true },
		{ to: "/driver/jobs", label: "Jobs" },
	],
	ADMIN: [{ to: "/admin", label: "Overview", end: true }],
};

export function DashboardLayout({
	user,
	children,
}: {
	user: User;
	children: React.ReactNode;
}) {
	const items = user.activeRole ? ROLE_NAV[user.activeRole] : [];

	return (
		<div className="mx-auto max-w-6xl flex w-full flex-col gap-4 px-4 py-6 md:flex-row md:gap-6 md:py-8">
			<aside className="shrink-0 md:w-56">
				<nav className="flex gap-1 overflow-x-auto pb-2 md:flex-col md:overflow-visible md:pb-0">
					<NavLink
						to="/dashboard"
						className={({ isActive }) =>
							`whitespace-nowrap rounded-md px-3 py-2 text-sm ${
								isActive
									? "bg-brand-100 font-medium text-brand-900"
									: "text-gray-700 hover:bg-gray-100"
							}`
						}
					>
						Dashboard
					</NavLink>
					{items.map((item) => (
						<NavLink
							key={item.to}
							to={item.to}
							end={item.end}
							className={({ isActive }) =>
								`whitespace-nowrap rounded-md px-3 py-2 text-sm ${
									isActive
										? "bg-brand-100 font-medium text-brand-900"
										: "text-gray-700 hover:bg-gray-100"
								}`
							}
						>
							{item.label}
						</NavLink>
					))}

					{user.roles.filter((r) => r !== "ADMIN").length > 1 && (
						<NavLink
							to="/select-role"
							className="whitespace-nowrap rounded-md px-3 py-2 text-sm text-brand-700 hover:bg-gray-100 md:mt-2"
						>
							Switch role
						</NavLink>
					)}
				</nav>
			</aside>

			<section className="min-w-0 flex-1">{children}</section>
		</div>
	);
}
