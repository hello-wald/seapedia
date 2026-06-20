export function meta() {
	return [{ title: "Admin · SEApedia" }];
}

export default function AdminHome() {
	return (
		<div>
			<h1 className="text-xl font-semibold text-gray-900">
				Admin overview
			</h1>
			<p className="mt-2 text-sm text-muted">
				Marketplace monitoring, discount management, and operational
				actions will live here. Admin access is separate from the
				non-admin multi-role flow.
			</p>
		</div>
	);
}
