import {
	Link,
	Form,
	NavLink,
	useRouteLoaderData,
	useNavigate,
	useSubmit,
} from "react-router";
import {
	Search,
	ShoppingCart,
	ChevronDown,
	User,
	ArrowLeftRight,
	LogOut,
	LayoutDashboard,
} from "lucide-react";
import { Button } from "./button";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuGroup,
} from "./dropdown-menu";
import type { loader as rootLoader } from "~/root";
import { ROLE_LABEL } from "~/lib/constants";

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
				className="ml-2 w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
			/>
		</Form>
	);
}

function UserAvatar({ name }: { name: string }) {
	const initials = name
		.split(" ")
		.slice(0, 2)
		.map((w) => w[0])
		.join("")
		.toUpperCase();
	return (
		<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-xs font-semibold text-white border">
			{initials}
		</div>
	);
}

export function Navbar() {
	const data = useRouteLoaderData<typeof rootLoader>("root");
	const user = data?.user ?? null;
	const navigate = useNavigate();
	const submit = useSubmit();

	return (
		<header className="fixed top-0 z-20 w-full bg-surface border-b">
			<div className="mx-auto max-w-6xl px-4 py-3">
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
					</nav>

					<SearchForm className="hidden flex-1 md:flex md:max-w-md" />

					{user ? (
						<div className="ml-auto flex items-center gap-3">
							<Link
								to="/buyer/cart"
								aria-label="Cart"
								className="p-1"
							>
								<ShoppingCart size={20} aria-hidden="true" />
							</Link>

							<DropdownMenu>
								<DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-gray-100 focus:outline-none cursor-pointer">
									<UserAvatar name={user.name} />
									<span className="hidden sm:inline font-medium">
										{user.name}
									</span>
									<ChevronDown
										size={14}
										className="text-gray-400"
									/>
								</DropdownMenuTrigger>

								<DropdownMenuContent
									align="end"
									className="w-auto! min-w-52"
								>
									{/* User info header */}
									<div className="px-3 py-2">
										<div className="flex items-center gap-2">
											<p className="font-semibold text-gray-900 text-sm">
												{user.name}
											</p>
											{user.activeRole ? (
												<span className="rounded-md bg-brand-100 px-2 py-0.5 text-xs text-brand-900 font-medium">
													{ROLE_LABEL[
														user.activeRole
													] ?? user.activeRole}
												</span>
											) : (
												<span className="rounded-md border border-brand-500 px-2 py-0.5 text-xs text-brand-700">
													No role
												</span>
											)}
										</div>
										<p className="text-xs text-muted mt-0.5">
											{user.email}
										</p>
									</div>

									<DropdownMenuSeparator />

									<DropdownMenuGroup>
										<DropdownMenuItem
											className=""
											onClick={() =>
												navigate("/dashboard")
											}
										>
											<LayoutDashboard size={12} />
											Dashboard
										</DropdownMenuItem>

										{user.roles.length > 1 && (
											<DropdownMenuItem
												className=""
												onClick={() =>
													navigate("/select-role")
												}
											>
												<ArrowLeftRight size={12} />
												Switch role
											</DropdownMenuItem>
										)}
									</DropdownMenuGroup>

									<DropdownMenuSeparator />

									<DropdownMenuItem
										className="text-red-500 focus:bg-red-50 focus:text-red-500!"
										onClick={() =>
											submit(null, {
												method: "post",
												action: "/logout",
											})
										}
									>
										<LogOut size={12} color="#fb2c36" />
										Log out
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
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
