export function meta() {
	return [{ title: "Cart · SEApedia" }];
}

export default function BuyerCart() {
	return (
		<div>
			<h1 className="text-xl font-semibold text-gray-900">Your cart</h1>
			<p className="mt-2 text-sm text-muted">
				Items you add will appear here. Checkout arrives in a later
				level.
			</p>
		</div>
	);
}
