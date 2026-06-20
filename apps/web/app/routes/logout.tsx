import { redirect } from "react-router";
import type { Route } from "./+types/logout";
import { destroyUserSession } from "~/.server/session";

export async function action({ request }: Route.ActionArgs) {
	return destroyUserSession(request, "/");
}

export async function loader() {
	return redirect("/");
}
