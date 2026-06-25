import { Link } from "react-router";
import type { DeliverySummary } from "@seapedia/shared";
import type { Route } from "./+types/jobs";
import { tokenContext } from "~/.server/middleware";
import { getAvailableJobs, getMyJobs } from "~/.server/delivery";
import { DeliveryJobCard } from "~/components/delivery/delivery-job-card";

export function meta() {
	return [{ title: "Jobs · SEApedia" }];
}

export async function loader({ context }: Route.LoaderArgs) {
	const token = context.get(tokenContext);
	if (!token) {
		return {
			available: [] as DeliverySummary[],
			active: [] as DeliverySummary[],
		};
	}
	const [available, active] = await Promise.all([
		getAvailableJobs(token),
		getMyJobs(token),
	]);
	return { available: available ?? [], active: active ?? [] };
}

function JobGrid({ jobs }: { jobs: DeliverySummary[] }) {
	return (
		<div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{jobs.map((job) => (
				<Link key={job.id} to={`/driver/jobs/${job.id}`}>
					<DeliveryJobCard job={job} />
				</Link>
			))}
		</div>
	);
}

export default function DriverJobs({ loaderData }: Route.ComponentProps) {
	const { available, active } = loaderData;

	return (
		<div className="space-y-10">
			{active.length > 0 && (
				<section>
					<h1 className="text-xl font-semibold text-gray-900">
						Active jobs
					</h1>
					<p className="mt-1 text-sm text-muted">
						Jobs you're delivering. Open one to confirm it's
						complete.
					</p>
					<JobGrid jobs={active} />
				</section>
			)}

			<section>
				<h1 className="text-xl font-semibold text-gray-900">
					Available jobs
				</h1>
				<p className="mt-1 text-sm text-muted">
					Processed orders waiting for a driver. Take one to start
					delivering.
				</p>

				{available.length === 0 ? (
					<div className="mt-6 rounded-lg border border-dashed p-10 text-center">
						<p className="font-medium text-gray-700">
							No available jobs right now.
						</p>
						<p className="mt-1 text-sm text-muted">
							Orders waiting for a driver will appear here.
						</p>
					</div>
				) : (
					<JobGrid jobs={available} />
				)}
			</section>
		</div>
	);
}
