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

const ROLE_LABEL: Record<Role, string> = {
	ADMIN: "Admin",
	SELLER: "Seller",
	BUYER: "Buyer",
	DRIVER: "Driver",
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
		<div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row">
			<aside className="shrink-0 md:w-56">
				<div className="rounded-xl border bg-surface p-4">
					<p className="text-xs text-muted">Active role</p>
					<p className="mt-1 text-sm font-semibold text-gray-900">
						{user.activeRole
							? ROLE_LABEL[user.activeRole]
							: "None selected"}
					</p>
				</div>

				<nav className="mt-3 flex flex-col gap-1">
					<NavLink
						to="/dashboard"
						className={({ isActive }) =>
							`rounded-md px-3 py-2 text-sm ${
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
								`rounded-md px-3 py-2 text-sm ${
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
							className="mt-2 rounded-md px-3 py-2 text-sm text-brand-700 hover:bg-gray-100"
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
