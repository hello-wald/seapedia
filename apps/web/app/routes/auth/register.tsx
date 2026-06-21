import { useState } from "react";
import { Form, Link, useActionData, useNavigation } from "react-router";
import { registerSchema, type NonAdminRole } from "@seapedia/shared";
import type { Route } from "./+types/register";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { ErrorBanner } from "../../components/ui/form-banner";
import { register } from "~/.server/auth";
import { createUserSession } from "~/.server/session";

export function meta() {
	return [{ title: "Sign up · SEApedia" }];
}

const roleOptions: {
	value: NonAdminRole;
	label: string;
	description: string;
}[] = [
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
	{
		value: "DRIVER",
		label: "Driver",
		description: "Take delivery jobs and earn on the road",
	},
];

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();
	const parsed = registerSchema.safeParse({
		name: formData.get("name"),
		email: formData.get("email"),
		password: formData.get("password"),
		roles: formData.getAll("roles"),
	});

	if (!parsed.success) {
		return {
			formError: parsed.error.issues.map((i) => i.message).join(", "),
		};
	}

	const result = await register(parsed.data);
	if (!result.ok) {
		return { formError: result.error };
	}

	const { user, accessToken } = result.data;
	const redirectTo = user.activeRole ? "/dashboard" : "/select-role";
	return createUserSession(accessToken, redirectTo);
}

export default function Register() {
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const submitting = navigation.state === "submitting";

	const [selected, setSelected] = useState<NonAdminRole[]>(["BUYER"]);
	const toggle = (role: NonAdminRole) =>
		setSelected((prev) =>
			prev.includes(role)
				? prev.filter((r) => r !== role)
				: [...prev, role],
		);

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
						Join thousands of buyers, sellers, and drivers
					</p>
				</div>

				<Form method="post" className="space-y-4">
					{actionData?.formError && (
						<ErrorBanner>{actionData.formError}</ErrorBanner>
					)}

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
							I want to join as
						</p>
						<div className="grid grid-cols-1 gap-2">
							{roleOptions.map(
								({ value, label, description }) => {
									const active = selected.includes(value);
									return (
										<button
											key={value}
											type="button"
											aria-pressed={active}
											onClick={() => toggle(value)}
											className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
												active
													? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20"
													: "border-border bg-surface hover:border-brand-300"
											}`}
										>
											<span
												className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
													active
														? "border-brand-500 bg-brand-500 text-white"
														: "border-gray-300"
												}`}
												aria-hidden="true"
											>
												{active ? "✓" : ""}
											</span>
											<span>
												<span className="block text-sm font-medium text-gray-900">
													{label}
												</span>
												<span className="mt-0.5 block text-xs text-muted">
													{description}
												</span>
											</span>
										</button>
									);
								},
							)}
						</div>
						{selected.map((role) => (
							<input
								key={role}
								type="hidden"
								name="roles"
								value={role}
							/>
						))}
						<p className="mt-2 text-xs text-muted">
							Pick one or more — you can switch your active role
							anytime.
						</p>
					</div>

					<Button
						type="submit"
						className="mt-2 w-full"
						size="lg"
						disabled={submitting || selected.length === 0}
					>
						{submitting ? "Creating account…" : "Create account"}
					</Button>
				</Form>

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
