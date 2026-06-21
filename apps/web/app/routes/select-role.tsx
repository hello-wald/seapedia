import { Form, redirect, useActionData, useNavigation } from "react-router";
import type { Role } from "@seapedia/shared";
import type { Route } from "./+types/select-role";
import { requireUser, setActiveRole } from "~/.server/auth";
import { createUserSession } from "~/.server/session";
import { tokenContext, userContext } from "~/.server/middleware";
import { ErrorBanner } from "../components/ui/form-banner";

const ROLE_COPY: Record<string, { label: string; description: string }> = {
	BUYER: { label: "Buyer", description: "Shop, manage your cart and orders" },
	SELLER: { label: "Seller", description: "Manage your store and products" },
	DRIVER: { label: "Driver", description: "Find and take delivery jobs" },
	ADMIN: { label: "Admin", description: "Monitor the marketplace" },
};

// Only allow redirecting to in-app paths after switching.
function safeNext(value: FormDataEntryValue | string | null): string {
	const next = typeof value === "string" ? value : "";
	return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export function meta() {
	return [{ title: "Choose role · SEApedia" }];
}

export function loader({ request, context }: Route.LoaderArgs) {
	const user = requireUser(context.get(userContext));
	const selectable = user.roles.filter((r) => r !== "ADMIN");
	if (user.roles.includes("ADMIN") || selectable.length <= 1) {
		throw redirect("/dashboard");
	}
	const next = safeNext(new URL(request.url).searchParams.get("next"));
	return { roles: selectable, activeRole: user.activeRole, next };
}

export async function action({ request, context }: Route.ActionArgs) {
	const token = context.get(tokenContext);
	if (!token) throw redirect("/login");

	const formData = await request.formData();
	const role = String(formData.get("role")) as Role;
	const next = safeNext(formData.get("next"));

	const result = await setActiveRole(token, role);
	if (!result.ok) {
		return { error: result.error };
	}
	return createUserSession(result.data.accessToken, next);
}

export default function SelectRole({ loaderData }: Route.ComponentProps) {
	const { roles, activeRole, next } = loaderData;
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const pendingRole = navigation.formData?.get("role");

	return (
		<main className="flex items-center justify-center px-4 py-20">
			<div className="w-full max-w-md">
				<div className="mb-8 text-center">
					<h1 className="text-2xl font-semibold text-gray-900">
						Choose your active role
					</h1>
					<p className="mt-1 text-sm text-muted">
						You own multiple roles. Pick the one to use right now —
						you can switch later.
					</p>
				</div>

				{actionData?.error && (
					<ErrorBanner className="mb-4">
						{actionData.error}
					</ErrorBanner>
				)}

				<div className="space-y-3">
					{roles.map((role) => {
						const copy = ROLE_COPY[role] ?? {
							label: role,
							description: "",
						};
						const isActive = role === activeRole;
						const isPending = pendingRole === role;
						return (
							<Form method="post" key={role}>
								<input type="hidden" name="role" value={role} />
								<input type="hidden" name="next" value={next} />
								<button
									type="submit"
									disabled={isPending || isActive}
									className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors ${
										isActive
											? "border-brand-500 bg-brand-50"
											: "border-border bg-surface hover:border-brand-300 hover:shadow-card"
									} disabled:opacity-60`}
								>
									<span>
										<span className="block font-medium text-gray-900">
											{copy.label}
										</span>
										<span className="mt-0.5 block text-sm text-muted">
											{copy.description}
										</span>
									</span>
									<span className="text-sm font-medium text-brand-600">
										{isPending
											? "Switching…"
											: isActive
												? "Active"
												: "Use"}
									</span>
								</button>
							</Form>
						);
					})}
				</div>
			</div>
		</main>
	);
}
