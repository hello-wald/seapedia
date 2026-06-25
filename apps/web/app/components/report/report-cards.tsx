import { Card } from "~/components/ui/card";

export type ReportStat = {
	label: string;
	value: string;
	caption?: string;
};

export function ReportCards({ stats }: { stats: ReportStat[] }) {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{stats.map((stat) => (
				<Card key={stat.label} className="p-5">
					<p className="text-sm text-muted">{stat.label}</p>
					<p className="mt-2 text-2xl font-bold text-gray-900">
						{stat.value}
					</p>
					{stat.caption && (
						<p className="mt-1 text-xs text-muted">
							{stat.caption}
						</p>
					)}
				</Card>
			))}
		</div>
	);
}
