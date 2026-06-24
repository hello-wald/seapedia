import { Link, useNavigate } from "react-router";
import type { Role } from "@seapedia/shared";
import type { Route } from "./+types/no-access";
import { requireUser, safeNext } from "~/.server/auth";
import { userContext } from "~/.server/middleware";
import { Button } from "~/components/ui/button";
import { ROLE_LABEL } from "~/lib/constants";

export function meta() {
	return [{ title: "No access · SEApedia" }];
}

export function loader({ request, context }: Route.LoaderArgs) {
	const user = requireUser(context.get(userContext));
	const params = new URL(request.url).searchParams;

	const next = safeNext(params.get("next"));
	const required = (params.get("roles") ?? "")
		.split(",")
		.filter(Boolean) as Role[];

	const canSwitch = required.some((r) => user.roles.includes(r));

	return {
		activeRole: user.activeRole,
		required,
		canSwitch,
		next,
	};
}

export default function NoAccess({ loaderData }: Route.ComponentProps) {
	const { activeRole, required, canSwitch, next } = loaderData;
	const navigate = useNavigate();

	const requiredLabels = required.map((r) => ROLE_LABEL[r] ?? r).join(" or ");

	return (
		<main className="flex items-center justify-center px-4 py-20">
			<div className="w-full max-w-md text-center">
				<div className="mx-auto my-6 text-9xl flex w-full max-w-xs items-center justify-center">
					🔒
				</div>

				<h1 className="text-2xl font-semibold text-gray-900">
					Oops! You don&apos;t have access to this page
				</h1>
				<p className="mt-2 text-sm text-muted">
					{requiredLabels
						? `This page is for the ${requiredLabels} role.`
						: "This page isn't available for your current role."}{" "}
					{activeRole
						? `You're currently using SEApedia as ${
								ROLE_LABEL[activeRole] ?? activeRole
							}.`
						: null}
				</p>

				<div className="mt-8 flex items-center gap-3">
					<Button
						variant="outline"
						className="w-full bg-white"
						onClick={() => navigate(-1)}
					>
						Go back
					</Button>

					{canSwitch && (
						<Link
							to={`/select-role?next=${encodeURIComponent(next)}`}
							className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-brand-gradient px-4 text-sm font-medium text-surface transition-colors hover:opacity-90"
						>
							Change role
						</Link>
					)}
				</div>
			</div>
		</main>
	);
}
