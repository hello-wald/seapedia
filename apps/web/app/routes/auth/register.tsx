import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export function meta() {
	return [{ title: "Sign up · SEApedia" }];
}

type Role = "BUYER" | "SELLER";

const roles: { value: Role; label: string; description: string }[] = [
	{
		value: "BUYER",
		label: "Buyer",
		description: "Shop products from sellers across Indonesia",
	},
	{
		value: "SELLER",
		label: "Seller",
		description: "Open a store and sell your products",
	},
];

export default function Register() {
	const [selectedRole, setSelectedRole] = useState<Role>("BUYER");

	return (
		<main className="flex items-center justify-center px-4 py-20">
			<div className="w-full max-w-sm">
				<div className="mb-8 text-center">
					<Link
						to="/"
						className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight"
					>
						<img src="/logo.png" className="h-8 w-8" alt="" />
						SEApedia
					</Link>
					<h1 className="mt-4 text-2xl font-semibold text-gray-900">
						Create an account
					</h1>
					<p className="mt-1 text-sm text-muted">
						Join thousands of buyers and sellers
					</p>
				</div>

				<form className="space-y-4">
					<div>
						<label
							htmlFor="name"
							className="mb-1.5 block text-sm font-medium text-gray-700"
						>
							Full name
						</label>
						<Input
							id="name"
							type="text"
							name="name"
							placeholder="Your name"
							autoComplete="name"
							required
						/>
					</div>

					<div>
						<label
							htmlFor="email"
							className="mb-1.5 block text-sm font-medium text-gray-700"
						>
							Email
						</label>
						<Input
							id="email"
							type="email"
							name="email"
							placeholder="you@example.com"
							autoComplete="email"
							required
						/>
					</div>

					<div>
						<label
							htmlFor="password"
							className="mb-1.5 block text-sm font-medium text-gray-700"
						>
							Password
						</label>
						<Input
							id="password"
							type="password"
							name="password"
							placeholder="••••••••"
							autoComplete="new-password"
							required
						/>
					</div>

					<div>
						<p className="mb-2 text-sm font-medium text-gray-700">
							I want to
						</p>
						<div className="grid grid-cols-2 gap-2">
							{roles.map(({ value, label, description }) => (
								<button
									key={value}
									type="button"
									onClick={() => setSelectedRole(value)}
									className={`rounded-lg border p-3 text-left transition-colors ${
										selectedRole === value
											? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20"
											: "border-border bg-surface hover:border-brand-300"
									}`}
								>
									<span className="block text-sm font-medium text-gray-900">
										{label}
									</span>
									<span className="mt-0.5 block text-xs text-muted">
										{description}
									</span>
								</button>
							))}
						</div>
						<input type="hidden" name="role" value={selectedRole} />
					</div>

					<Button type="submit" className="mt-2 w-full" size="lg">
						Create account
					</Button>
				</form>

				<p className="mt-6 text-center text-sm text-muted">
					Already have an account?{" "}
					<Link
						to="/login"
						className="font-medium text-brand-700 hover:underline"
					>
						Log in
					</Link>
				</p>
			</div>
		</main>
	);
}
