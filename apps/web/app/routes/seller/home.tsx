export function meta() {
	return [{ title: "Store · SEApedia" }];
}

export default function SellerHome() {
	return (
		<div>
			<h1 className="text-xl font-semibold text-gray-900">
				Store overview
			</h1>
			<p className="mt-2 text-sm text-muted">
				Manage your store here. Product management, incoming orders, and
				seller income arrive in later levels.
			</p>
		</div>
	);
}
