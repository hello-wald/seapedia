import { Link } from "react-router";
import type { DeliverySummary, DriverEarningsReport } from "@seapedia/shared";
import type { Route } from "./+types/jobs";
import { tokenContext } from "~/.server/middleware";
import {
	getCompletedJobs,
	getDriverReport,
	getMyJobs,
} from "~/.server/delivery";
import { DeliveryJobCard } from "~/components/delivery/delivery-job-card";
import { ReportCards } from "~/components/report/report-cards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { formatRupiah } from "~/lib/format";

export function meta() {
	return [{ title: "My jobs · SEApedia" }];
}

export async function loader({ context }: Route.LoaderArgs) {
	const token = context.get(tokenContext);
	if (!token) {
		return {
			report: null,
			active: [] as DeliverySummary[],
			history: [] as DeliverySummary[],
		};
	}
	const [report, active, history] = await Promise.all([
		getDriverReport(token),
		getMyJobs(token),
		getCompletedJobs(token),
	]);
	return { report, active: active ?? [], history: history ?? [] };
}

function JobGrid({
	jobs,
	emptyText,
}: {
	jobs: DeliverySummary[];
	emptyText: string;
}) {
	if (jobs.length === 0) {
		return (
			<div className="rounded-lg border border-dashed p-10 text-center">
				<p className="text-sm text-muted">{emptyText}</p>
			</div>
		);
	}
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{jobs.map((job) => (
				<Link key={job.id} to={`/driver/jobs/${job.id}`}>
					<DeliveryJobCard job={job} />
				</Link>
			))}
		</div>
	);
}

export default function DriverJobs({ loaderData }: Route.ComponentProps) {
	const { report, active, history } = loaderData;

	const stats: DriverEarningsReport = report ?? {
		totalEarnings: 0,
		completedJobs: 0,
		activeJobs: 0,
		itemsDelivered: 0,
	};

	const cards = [
		{
			label: "Total earnings",
			value: formatRupiah(stats.totalEarnings),
			caption: "100% of delivery fees",
		},
		{
			label: "Completed jobs",
			value: String(stats.completedJobs),
			caption: "Delivered & confirmed",
		},
		{
			label: "Active jobs",
			value: String(stats.activeJobs),
			caption: "In delivery now",
		},
		{
			label: "Items delivered",
			value: String(stats.itemsDelivered),
			caption: "Total units delivered",
		},
	];

	return (
		<div>
			<h1 className="text-xl font-semibold text-gray-900">My jobs</h1>
			<p className="mt-1 text-sm text-muted">
				Your delivery earnings and history. You earn 100% of each
				order's delivery fee.
			</p>

			<div className="mt-6">
				<ReportCards stats={cards} />
			</div>

			<Tabs defaultValue="active" className="mt-8">
				<TabsList>
					<TabsTrigger value="active">
						Active ({active.length})
					</TabsTrigger>
					<TabsTrigger value="history">
						History ({history.length})
					</TabsTrigger>
				</TabsList>

				<TabsContent value="active">
					<JobGrid
						jobs={active}
						emptyText="No active jobs. Take a job from Find jobs to start delivering."
					/>
				</TabsContent>

				<TabsContent value="history">
					<JobGrid
						jobs={history}
						emptyText="No completed jobs yet. Your delivered jobs will appear here."
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
