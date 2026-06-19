import { Link, Form, NavLink } from "react-router";
import { Search, ShoppingCart } from "lucide-react";
import { Button } from "./button";

export interface NavUser {
	name: string;
	activeRole: string;
}

interface NavbarProps {
	user?: NavUser | null;
}

function SearchForm({ className = "" }: { className?: string }) {
	return (
		<Form
			method="get"
			action="/products"
			className={`flex h-9 items-center rounded-md bg-surface px-3 border ${className}`}
		>
			<Search size={16} className="text-gray-400" aria-hidden="true" />
			<input
				type="search"
				name="q"
				placeholder="Search products…"
				aria-label="Search products"
				className="ml-2 w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 "
			/>
		</Form>
	);
}

export function Navbar({ user = null }: NavbarProps) {
	return (
		<header className="fixed top-0 z-20 w-full bg-surface border-b">
			<div className="mx-auto container px-4 py-3">
				<div className="flex items-center gap-3">
					<Link
						to="/"
						className="flex shrink-0 items-center gap-2 text-lg font-medium tracking-tight"
					>
						<img src="/logo.png" className="w-6 h-6" />
						SEApedia
					</Link>

					<nav className="flex gap-4 px-4">
						<NavLink to="/products" end className="text-sm">
							Products
						</NavLink>
						{/* <NavLink to="/trending" end className="text-sm">
							Trending Concerts
						</NavLink>
						<NavLink to="/concerts" className="text-sm">
							All Concerts
						</NavLink>
						<NavLink to="/account" className="text-sm">
							Account
						</NavLink> */}
					</nav>

					<SearchForm className="hidden flex-1 md:flex md:max-w-md " />

					{user ? (
						<div className="ml-auto flex items-center gap-3">
							<Link
								to="/buyer/cart"
								aria-label="Cart"
								className="p-1"
							>
								<ShoppingCart size={20} aria-hidden="true" />
							</Link>
							<span className="hidden rounded-md bg-brand-700 px-2 py-1 text-xs sm:inline">
								{user.activeRole}
							</span>
							<span className="hidden text-sm sm:inline">
								{user.name}
							</span>
						</div>
					) : (
						<div className="ml-auto flex shrink-0 items-center gap-2">
							<Link to="/login">
								<Button variant="outline" size="sm">
									Log in
								</Button>
							</Link>
							<Link to="/register">
								<Button variant="primary" size="sm">
									Sign up
								</Button>
							</Link>
						</div>
					)}
				</div>

				<SearchForm className="mt-3 w-full md:hidden" />
			</div>
		</header>
	);
}
