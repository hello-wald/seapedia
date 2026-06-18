import { Link, Form } from "react-router";
import { Search, ShoppingCart, ShoppingBag } from "lucide-react";
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
			className={`flex h-9 items-center rounded-md bg-white px-3 ${className}`}
		>
			<Search size={16} className="text-gray-400" aria-hidden="true" />
			<input
				type="search"
				name="q"
				placeholder="Search products from thousands of stores…"
				aria-label="Search products"
				className="ml-2 w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
			/>
		</Form>
	);
}

export function Navbar({ user = null }: NavbarProps) {
	return (
		<header className="fixed top-0 z-20 bg-white w-full">
			<div className="mx-auto max-w-6xl px-4 py-3">
				<div className="flex items-center gap-3">
					<Link
						to="/"
						className="flex shrink-0 items-center gap-2 text-lg font-medium tracking-tight"
					>
						<img src="public/logo.png" className="w-6 h-6" />
						SEApedia
					</Link>

					<SearchForm className="hidden flex-1 md:flex" />

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
								<Button
									variant="outline"
									size="sm"
									className="border-gray-900/60 text-gray-900 hover:bg-gray-900/10"
									// className="border-white/60 text-white hover:bg-white/10"
								>
									Log in
								</Button>
							</Link>
							<Link to="/register">
								<Button variant="accent" size="sm">
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
