export function meta() {
	return [{ title: "Buyer · SEApedia" }];
}

export default function BuyerHome() {
	return (
		<div>
			<h1 className="text-xl font-semibold text-gray-900">
				Buyer overview
			</h1>
			<p className="mt-2 text-sm text-muted">
				Your shopping hub. Cart, orders, delivery addresses, and wallet
				balance will live here in later levels.
			</p>
		</div>
	);
}
