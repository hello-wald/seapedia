import { Link } from "react-router";
import type { DeliverySummary } from "@seapedia/shared";
import type { Route } from "./+types/find";
import { tokenContext } from "~/.server/middleware";
import { getAvailableJobs } from "~/.server/delivery";
import { DeliveryJobCard } from "~/components/delivery/delivery-job-card";

export function meta() {
	return [{ title: "Find jobs · SEApedia" }];
}

export async function loader({ context }: Route.LoaderArgs) {
	const token = context.get(tokenContext);
	if (!token) return { jobs: [] as DeliverySummary[] };
	const jobs = await getAvailableJobs(token);
	return { jobs: jobs ?? [] };
}

export default function DriverFindJobs({ loaderData }: Route.ComponentProps) {
	const { jobs } = loaderData;

	return (
		<div>
			<h1 className="text-xl font-semibold text-gray-900">Find jobs</h1>
			<p className="mt-1 text-sm text-muted">
				Processed orders waiting for a driver. Take one to start
				delivering.
			</p>

			{jobs.length === 0 ? (
				<div className="mt-6 rounded-lg border border-dashed p-10 text-center">
					<p className="font-medium text-gray-700">
						No available jobs right now.
					</p>
					<p className="mt-1 text-sm text-muted">
						Orders waiting for a driver will appear here.
					</p>
				</div>
			) : (
				<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{jobs.map((job) => (
						<Link key={job.id} to={`/driver/jobs/${job.id}`}>
							<DeliveryJobCard job={job} />
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
