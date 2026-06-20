export function meta() {
	return [{ title: "Orders · SEApedia" }];
}

export default function BuyerOrders() {
	return (
		<div>
			<h1 className="text-xl font-semibold text-gray-900">Your orders</h1>
			<p className="mt-2 text-sm text-muted">
				Order history will appear here once checkout is implemented.
			</p>
		</div>
	);
}
