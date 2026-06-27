import type { ReactNode } from "react";
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";

export function AdminTable({
	columns,
	isEmpty,
	children,
}: {
	columns: string[];
	isEmpty: boolean;
	children: ReactNode;
}) {
	if (isEmpty) {
		return (
			<div className="mt-6 rounded-lg border border-dashed p-10 text-center text-sm text-muted">
				No records yet.
			</div>
		);
	}
	return (
		<div className="mt-6 rounded-lg border overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow className="bg-surface">
						{columns.map((c) => (
							<TableHead key={c}>{c}</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>{children}</TableBody>
			</Table>
		</div>
	);
}
