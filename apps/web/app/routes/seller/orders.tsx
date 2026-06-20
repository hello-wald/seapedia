export function meta() {
	return [{ title: "Incoming orders · SEApedia" }];
}

export default function SellerOrders() {
	return (
		<div>
			<h1 className="text-xl font-semibold text-gray-900">
				Incoming orders
			</h1>
			<p className="mt-2 text-sm text-muted">
				Orders placed for your products will show up here.
			</p>
		</div>
	);
}
